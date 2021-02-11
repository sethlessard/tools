import * as vscode from "vscode";
import * as path from "path";
import * as _ from "lodash";

import { promptInput, promptYesNo, showErrorMessage } from "../../../../../util/WindowUtils";
import VSCodeBranchRelationshipRepository from "../../../../../../t00ls.common/data/repositories/VSCodeBranchRelationshipRepository";
import t00lsGitRepository from "../../../../../../t00ls.common/data/repositories/t00lsGitRepository";
import VSCodeGitModeRepository from "../../../../../../t00ls.common/data/repositories/VSCodeGitModeRepository";
import GitMode from "../../../../../../t00ls.common/data/models/GitMode";
import BranchWithActions from "../models/BranchWithActions";
import syncRepository from "../../domain/usecases/syncRepository";

/**
 * Create a new feature branch
 * @param context the t00ls extension context.
 * @param outputChannel the t00ls output channel.
 */
const syncRepo = (context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) => {
  return async () => {
    if (!vscode.workspace.workspaceFolders) {
      showErrorMessage(outputChannel, "A Git repository is not open.");
      return;
    }
    const gitRepo = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const mode = new VSCodeGitModeRepository(context).getGitMode();
    const git = new t00lsGitRepository(gitRepo, mode);
    await git.initialize();
    const relationshipRepository = new VSCodeBranchRelationshipRepository(context);

    // fetch the latest updates from remote
    // and the rest of the Git stuff we need
    let featureBranches: BranchWithActions[] = [];
    let productionReleaseBranches: BranchWithActions[] = [];
    let mainBranchName: string = '';
    try {
      await git.fetch();
      // gather the feature branches
      featureBranches = await git.getAllLocalFeatureBranches();

      // gather the production release branches
      productionReleaseBranches = await git.getAllLocalProductionReleaseBranches();

      // get the main branch name
      mainBranchName = await git.getMainBranchName();
    } catch (e) {
      showErrorMessage(outputChannel, `There was an error gathering the Git repository details: ${e}`);
      return;
    }

    // check to see if there are working changes in the directory.
    let stashCreated = false;
    try {
      if ((await git.hasWorkingChanges()) && (await promptYesNo({ question: `There are working changes. Do you want to stash them (recommended)?`, ignoreFocusOut: true }))) {
        const stashMessage = await promptInput({ prompt: "Enter the stash message.", placeHolder: "blah blah blah..." });
        if (!stashMessage) { return; };
        await git.stage(path.join(gitRepo, "."))
          .then(() => git.stash(stashMessage));
        stashCreated = true;
      }
    } catch (e) {
      showErrorMessage(outputChannel, `There was an error stashing the current working changes: ${e}`);
      return;
    }

    if (mode === GitMode.Normal) {
      // determine if any produciton release branches need to be published
      const productionReleaseBranchesToPublish = productionReleaseBranches.filter(async p => !(await git.hasRemoteBranch(p.name)));
      for (const p of productionReleaseBranchesToPublish) {
        if (!(await git.hasRemoteBranch(p.name))) {
          _.find(productionReleaseBranches, { name: p.name })!!.publish = await promptYesNo({ question: `Publish '${p.name}'?` });
        }
      }

      // determine if any feature branches need to be published
      const featureBranchesToPublish = featureBranches.filter(async f => !(await git.hasRemoteBranch(f.name)));
      for (const f of featureBranchesToPublish) {
        if (!(await git.hasRemoteBranch(f.name))) {
          _.find(featureBranches, { name: f.name })!!.publish = await promptYesNo({ question: `Publish '${f.name}'?` });
        }
      }
    }

    // determine the base branches for the feature branches
    for (const f of featureBranches) {
      f.baseBranch = relationshipRepository.getRelationship(f.name)?.productionReleaseBranch;
      if (!f.baseBranch) {
        // select a base branch
        if (productionReleaseBranches.length > 0) {
          let mappedProductionReleaseBranches: vscode.QuickPickItem[] = productionReleaseBranches.map(p => ({
            label: p.name,
            detail: `Last Commit: ${p.lastCommitMessage}`
          }));
          mappedProductionReleaseBranches = [{ label: mainBranchName, detail: "TODO: implement..." }, ...mappedProductionReleaseBranches];
          const selected = await vscode.window.showQuickPick(mappedProductionReleaseBranches, { canPickMany: false, placeHolder: `What is the base branch for '${f.name}'?` });
          if (selected) {
            f.baseBranch = selected.label;
            if (selected.label !== mainBranchName && (await promptYesNo({ question: "Remember relationship for future syncs?" }))) {
              // save the relationship
              await relationshipRepository.setRelationship(f.name, selected.label);
            }
          }
        }
        if (!f.baseBranch) {
          // use the main branch as the default base branch
          f.baseBranch = mainBranchName;
        }
      }
    }

    // determine if we should merge the base branch into the feature branches
    for (const f of featureBranches) {
      f.mergeBaseBranch = await promptYesNo({ question: `Merge '${f.baseBranch}' into '${f.name}'?` });
    }

    // sync the repository
    try {
      await syncRepository(git, stashCreated, productionReleaseBranches, featureBranches, mainBranchName)
        .then(() => vscode.window.showInformationMessage("Done."));
    } catch (error) {
      vscode.window.showErrorMessage(`Error syncing the repository: ${error}`);
    }
  };
};

export default syncRepo;
