import * as vscode from "vscode";
import * as path from "path";

import { promptInput, promptYesNo, showErrorMessage } from "../../../../../util/WindowUtils";
import VSCodeBranchRelationshipRepository from "../../../../../../t00ls.common/data/repositories/VSCodeBranchRelationshipRepository";
import GitMode from "../../../../../../t00ls.common/presentation/models/GitMode";
import t00lsGitRepository from "../../../../../../t00ls.common/data/repositories/t00lsGitRepository";
import Branch from "../../../../../../t00ls.common/presentation/models/Branch";
import createNewFeatureBranch from "../../domain/usecases/createNewFeatureBranch";

/**
 * Create a new feature branch.
 * @param context the t00ls extension context.
 * @param outputChannel the t00ls output channel.
 */
const newFeatureBranch = (context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) => {
  return async () => {
    if (!vscode.workspace.workspaceFolders) {
      showErrorMessage(outputChannel, "A Git repository is not open.");
      return;
    }
    const gitRepo = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const git = new t00lsGitRepository(gitRepo, (context.workspaceState.get("t00ls.mode") as GitMode));
    await git.initialize();

    // check to see if there are working changes in the directory.
    try {
      if ((await git.hasWorkingChanges()) && (await promptYesNo({ question: `There are working changes. Do you want to stash them?`, ignoreFocusOut: true }))) {
        const stashMessage = await promptInput({ prompt: "Enter the stash message.", placeHolder: "blah blah blah..." });
        if (!stashMessage) { return; };
        await git.stage(path.join(gitRepo, "."))
          .then(() => git.stash(stashMessage));
      }
    } catch (e) {
      showErrorMessage(outputChannel, `There was an error stashing the current working changes: ${e}`);
      return;
    }

    // get the new production release version
    const featureBranch = await promptInput({ prompt: "What would you like to name the feature branch?", requireValue: true, placeHolder: "feature..." });
    if (!featureBranch) { return; }

    const mainBranchName = await git.getMainBranchName();
    let baseBranches = [mainBranchName];

    // get the local production release branches
    let productionReleaseBranches: Branch[] = [];
    try {
      productionReleaseBranches = await git.getAllLocalProductionReleaseBranches();
    } catch (e) {
      showErrorMessage(outputChannel, `There was an error gathering the local production release branches: ${e}`);
    }
    if (productionReleaseBranches.length > 0) {
      baseBranches = baseBranches.concat(productionReleaseBranches.map(p => p.name));
    }

    // get the base branch to create the feature branch from.
    let baseBranch: string | undefined = baseBranches[0];
    if (baseBranches.length > 1) {
      baseBranch = await vscode.window.showQuickPick(baseBranches, { canPickMany: false, placeHolder: `What is the base branch for feature branch '${featureBranch}'?`, ignoreFocusOut: true });
      if (!baseBranch) { return; }
    }

    try {
      await createNewFeatureBranch({ name: featureBranch, baseBranch }, git, VSCodeBranchRelationshipRepository.getInstance())
        .then(() => vscode.window.showInformationMessage(`Created new feature branch '${featureBranch}'.`));
    } catch (error) {
      vscode.window.showErrorMessage(`An error occurred while creating the feature branch '${featureBranch}': ${error}`);
    }
  };
};

export default newFeatureBranch;
