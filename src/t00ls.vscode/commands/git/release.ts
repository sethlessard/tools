import * as vscode from "vscode";
import * as _ from "lodash";

import { showErrorMessage } from "../../../t00ls.vscode/util/WindowUtils";
import VSCodeBranchRelationshipRepository from "../../../t00ls.common/data/repositories/VSCodeBranchRelationshipRepository";
import t00lsGitRepository from "../../../t00ls.common/data/repositories/t00lsGitRepository";
import GitMode from "../../../t00ls.common/presentation/models/GitMode";
import Branch from "../../../t00ls.common/presentation/models/Branch";

/**
 * Release the next production version of the current project.
 * 
 * Completes a production release branch by:
 * 1. Creating a tag for the new version.
 * 2. Merging into the main branch
 * 
 * Or CI handles the merge with a Release Candidate tag.
 * @param context the t00ls extension context.
 * @param outputChannel the t00ls output channel.
 */
const release = (context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) => {
  return async () => {
    if (!vscode.workspace.workspaceFolders) {
      showErrorMessage(outputChannel, "A Git repository is not open.");
      return;
    }
    const gitRepo = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const git = new t00lsGitRepository(gitRepo, (context.workspaceState.get("t00ls.mode") as GitMode));
    await git.initialize();

    // fetch the latest updates from remote
    try {
      await git.fetch();
    } catch (e) {
      showErrorMessage(outputChannel, `There was an error fetching the latest updates from remote: ${e}`);
    }

    // get the local production release branches in the repository
    let productionReleaseBranches = [];
    try {
      productionReleaseBranches = await git.getAllLocalProductionReleaseBranches();
    } catch (e) {
      showErrorMessage(outputChannel, `There was an error gathering the production release branches: ${e}`);
      return;
    }
    if (productionReleaseBranches.length === 0) {
      showErrorMessage(outputChannel, "There are no production release branches.");
      return;
    }

    // map to a VS Code-friendly form
    const mappedProdReleaseBranches = productionReleaseBranches.map(branch => ({ label: branch.name, description: (branch.remote) ? branch.origin : "local" }));

    // select the branch to complete.
    const selected = await vscode.window.showQuickPick(mappedProdReleaseBranches, { canPickMany: false, placeHolder: "Which production release branch would you like to complete?", ignoreFocusOut: true });
    if (!selected) { return; }

    const branch = _.find<Branch>(productionReleaseBranches, { name: selected.label });
    if (!branch) { throw new Error("Error selecting production release branch..."); }

    try {
      // create the production tag and merge into the main branch.
      await git.checkoutBranch(branch.name)
        .then(() => git.createProductionTag())
        .then(() => git.getMainBranchName())
        .then(mainBranchName => git.checkoutBranch(mainBranchName))
        .then(() => git.mergeBranch(branch.name))
        .then(() => git.push())
        .then(() => git.pushTags())
        .then(() => git.deleteBranchForce(branch.name))
        .then(() => git.deleteRemoteBranchForce(branch.name))
        .then(() => VSCodeBranchRelationshipRepository.getInstance().clearRelationshipsForProductionReleaseBranch(branch.name));
    } catch (e) {
      showErrorMessage(outputChannel, `Error creating releasing the next version: ${e}`);
      return;
    }

    vscode.window.showInformationMessage("Done.");
  };
};

export default release;
