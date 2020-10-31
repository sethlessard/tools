import * as vscode from "vscode";
import * as _ from "lodash";
import Git, { Branch } from "../../util/Git";
import { showErrorMessage } from "../../util/WindowUtils";

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
    const git = new Git(gitRepo);

    // fetch the latest updates from remote
    try {
      await git.fetch();
    } catch (e) {
      await showErrorMessage(outputChannel, `There was an error fetching the latest updates from remote: ${e}`);
    }

    // get the current branch
    let currentBranch = '';
    try {
      currentBranch = await git.getCurrentBranch();
    } catch (e) {
      await showErrorMessage(outputChannel, `There was an error fetching the current branch: ${e}`);
      return;
    }
    if (!currentBranch) {
      await showErrorMessage(outputChannel, `There was an error fetching the current branch: No value returned.`);
      return;
    }

    // get the local production release branches in the repository
    let productionReleaseBranches = [];
    try {
      productionReleaseBranches = await git.getAllLocalProductionReleaseBranches();
    } catch (e) {
      await showErrorMessage(outputChannel, `There was an error gathering the production release branches: ${e}`);
      return;
    }
    if (productionReleaseBranches.length === 0) {
      await showErrorMessage(outputChannel, "There are no production release branches to delete.");
      return;
    }

    // map to a VS Code-friendly form
    const mappedProdReleaseBranches = productionReleaseBranches.map(branch => ({ label: branch.name, description: (branch.remote) ? branch.origin : "local" }));

    // select the to delete
    const selected = await vscode.window.showQuickPick(mappedProdReleaseBranches, { canPickMany: false, placeHolder: "Which production release branch would you like to delete?" });
    if (!selected) { return; }

    const branch = _.find<Branch>(productionReleaseBranches, { name: selected.label });
    if (!branch) { throw new Error("Error selecting production release branch..."); }

    if (branch.name === currentBranch) {
      // switch to master
      try {
        await git.checkoutBranch("master");
      } catch (e) {
        await showErrorMessage(outputChannel, `There was an error switching to 'master': ${e}`);
        return;
      }
    }

    // TODO: [TLS-18] Before deleting a production release branch, check to see if 
    // the branch has been merged into master.

    if (branch.remote) {
      // this production release branch only exists in the remote repository
      try {
        await git.deleteRemoteBranchForce(branch.name);
      } catch (e) {
        await showErrorMessage(outputChannel, `There was an error deleting the remote production release branch '${branch.name}': ${e}`);
        return;
      }
    } else {
      try {
        await git.deleteBranchForce(branch.name);
      } catch (e) {
        await showErrorMessage(outputChannel, `There was an error deleting the production release branch '${branch.name}': ${e}`);
        return;
      }
      // there may also be a remote repository
      try {
        await git.deleteRemoteBranchForce(branch.name);
      } catch (e) {
        await showErrorMessage(outputChannel, `There was an error deleting the remote production release branch '${branch.name}': ${e}`);
        return;
      }
    }

    await vscode.window.showInformationMessage(`Deleted production release branch '${(branch.remote) ? `${branch.origin}/${branch.name}` : branch.name}`);
  };
};

export default deleteProductionReleaseBranch;
