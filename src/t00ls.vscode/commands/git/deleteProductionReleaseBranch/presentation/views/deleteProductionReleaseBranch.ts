import * as vscode from "vscode";
import * as _ from "lodash";
import { promptYesNo, showErrorMessage } from "../../../../../util/WindowUtils";
import VSCodeBranchRelationshipRepository from "../../../../../../t00ls.common/data/repositories/VSCodeBranchRelationshipRepository";
import t00lsGitRepository from "../../../../../../t00ls.common/data/repositories/t00lsGitRepository";
import GitMode from "../../../../../../t00ls.common/presentation/models/GitMode";
import Branch from "../../../../../../t00ls.common/presentation/models/Branch";
import deleteAProductionReleaseBranch from "../../domain/usecases/deleteAProductionReleaseBranch";

/**
 * Delete a production release branch
 * @param context the t00ls extension context.
 * @param outputChannel the t00ls output channel.
 */
const deleteProductionReleaseBranch = (context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) => {
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

    // get the current branch
    let currentBranch = '';
    try {
      currentBranch = await git.getCurrentBranch();
    } catch (e) {
      showErrorMessage(outputChannel, `There was an error fetching the current branch: ${e}`);
      return;
    }
    if (!currentBranch) {
      showErrorMessage(outputChannel, `There was an error fetching the current branch: No value returned.`);
      return;
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
      showErrorMessage(outputChannel, "There are no production release branches to delete.");
      return;
    }

    // map to a VS Code-friendly form
    const mappedProdReleaseBranches = productionReleaseBranches.map(branch => ({ label: branch.name, description: (branch.remote) ? branch.origin : "local", detail: `Last Commit: ${branch.lastCommitMessage}` }));

    // select the to delete
    const selected = await vscode.window.showQuickPick(mappedProdReleaseBranches, { canPickMany: false, placeHolder: "Which production release branch would you like to delete?", ignoreFocusOut: true });
    if (!selected) { return; }

    const branch = _.find<Branch>(productionReleaseBranches, { name: selected.label });
    if (!branch) { throw new Error("Error selecting production release branch..."); }

    try {
      await deleteAProductionReleaseBranch(branch, (await promptYesNo({ question: `Force delete '${branch.name}'?` })), git, VSCodeBranchRelationshipRepository.getInstance())
        .then(() => vscode.window.showInformationMessage(`Deleted production release branch '${(branch.remote) ? `${branch.origin}/${branch.name}` : branch.name}'.`));
    } catch (error) {
      vscode.window.showErrorMessage(`An error occurred when deleting '${branch.name}': ${error}`);
    }
  };
};

export default deleteProductionReleaseBranch;
