import * as vscode from "vscode";
import * as _ from "lodash";
import Git, { Branch } from "../../util/Git";
import { showErrorMessage } from "../../util/WindowUtils";
import { t00lsMode } from "../../util/StatusBarManager";

/**
 * Delete a feature branch.
 * @param context the t00ls extension context.
 * @param outputChannel the t00ls output channel.
 */
const deleteFeatureBranch = (context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) => {
  return async () => {
    if (!vscode.workspace.workspaceFolders) {
      showErrorMessage(outputChannel, "A Git repository is not open.");
      return;
    }

    const gitRepo = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const git = new Git(gitRepo, (context.workspaceState.get("t00ls.mode") as t00lsMode));

    // fetch the latest updates from remote
    try {
      await git.fetch();
    } catch (e) {
      const error = `There was an error fetching the latest updates from remote: ${e}`;
      await showErrorMessage(outputChannel, error);
      outputChannel.appendLine(error);
    }

    // get the current branch
    let currentBranch = '';
    try {
      currentBranch = await git.getCurrentBranch();
    } catch (e) {
      const error = `There was an error fetching the current branch: ${e}`;
      await showErrorMessage(outputChannel, error);
      return;
    }
    if (!currentBranch) {
      await showErrorMessage(outputChannel, `There was an error fetching the current branch: No value returned.`);
      return;
    }

    // get the local feature branches in the repository
    let featureBranches: Branch[] = [];
    try {
      featureBranches = await git.getAllLocalFeatureBranches();
    } catch (e) {
      await showErrorMessage(outputChannel, `There was an error gathering the local feature branches: ${e}`);
      return;
    }
    if (featureBranches.length === 0) {
      await showErrorMessage(outputChannel, "There are no feature branches to delete.");
      return;
    }

    // map to a VS Code-friendly form
    const mappedFeatureBrances = featureBranches.map(branch => ({ label: branch.name, description: (branch.remote) ? branch.origin : "local" }));

    // select the to delete
    const selected = await vscode.window.showQuickPick(mappedFeatureBrances, { canPickMany: true, placeHolder: "Which feature branch would you like to delete?" });
    if (!selected) { return; }

    for (const b of selected) {
      const branch = _.find(featureBranches, { name: b.label });
      if (!branch) { throw new Error("Error...."); }
      if (b.label === currentBranch) {
        // switch to the base branch or master
        const branch = context.workspaceState.get<string>(`${b.label}.baseBranch`) || "master";
        try {
          await git.checkoutBranch(branch);
        } catch (e) {
          await showErrorMessage(outputChannel, `There was an error switching to '${branch}': ${e}`);
          return;
        }
      }
      
      if (branch.remote) {
        // this feature branch only exists in the remote repository
        try {
          await git.deleteRemoteBranchForce(branch.name);
        } catch (e) {
          await showErrorMessage(outputChannel, `There was an error deleting the remote feature branch '${branch.name}': ${e}`);
          return;
        }
      } else {
        try {
          await git.deleteBranchForce(branch.name);
        } catch (e) {
          await showErrorMessage(outputChannel, `There was an error deleting the feature branch '${branch.name}': ${e}`);
          return;
        }
        // there may also be a remote repository
        try {
          await git.deleteRemoteBranchForce(branch.name);
        } catch (e) {
          await showErrorMessage(outputChannel, `There was an error deleting the remote feature branch '${branch.name}': ${e}`);
          return;
        }
      }

      vscode.window.showInformationMessage(`Deleted feature branch '${(branch.remote) ? `${branch.origin}/${branch.name}` : branch.name}'.`);
    }

    // TODO: [TLS-19] Before deleting a feature branch, check to see if 
    // the branch has been merged into master or a feature branch.
    await vscode.window.showInformationMessage("Done.");
  };
};

export default deleteFeatureBranch;
