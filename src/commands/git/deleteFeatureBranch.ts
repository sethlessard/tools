import * as vscode from "vscode";
import * as _ from "lodash";
import Git, { Branch } from "../../util/Git";
import { promptYesNo, showErrorMessage } from "../../util/WindowUtils";
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
      showErrorMessage(outputChannel, error);
      outputChannel.appendLine(error);
    }

    // get the current branch
    let currentBranch = '';
    try {
      currentBranch = await git.getCurrentBranch();
    } catch (e) {
      const error = `There was an error fetching the current branch: ${e}`;
      showErrorMessage(outputChannel, error);
      return;
    }
    if (!currentBranch) {
      showErrorMessage(outputChannel, `There was an error fetching the current branch: No value returned.`);
      return;
    }

    // get the local feature branches in the repository
    let featureBranches: Branch[] = [];
    try {
      featureBranches = await git.getAllLocalFeatureBranches();
    } catch (e) {
      showErrorMessage(outputChannel, `There was an error gathering the local feature branches: ${e}`);
      return;
    }
    if (featureBranches.length === 0) {
      showErrorMessage(outputChannel, "There are no feature branches to delete.");
      return;
    }

    let productionReleaseBranches: Branch[] = [];
    try {
      productionReleaseBranches = await git.getAllLocalProductionReleaseBranches();
    } catch (e) {
      showErrorMessage(outputChannel, `There was an error gathering the local production release branches: ${e}`);
      return;
    }

    // map to a VS Code-friendly form
    const mappedFeatureBrances = featureBranches.map(branch => ({ label: branch.name, description: (branch.remote) ? branch.origin : "local" }));

    // select the to delete
    const selected = await vscode.window.showQuickPick(mappedFeatureBrances, { canPickMany: true, placeHolder: "Which feature branch would you like to delete?", ignoreFocusOut: true });
    if (!selected) { return; }

    for (const b of selected) {
      const branch = _.find(featureBranches, { name: b.label });
      if (!branch) { throw new Error("Error...."); }

      // Before deleting a feature branch, check to see if 
      // the branch has been merged into master or a production release branch.
      let isMergedIntoProductionReleaseOrMaster = (await git.getNumberOfCommitsAheadOfBranch("master", branch.name)) === 0;
      if (!isMergedIntoProductionReleaseOrMaster) {
        for (const p of productionReleaseBranches) {
          isMergedIntoProductionReleaseOrMaster = (await git.getNumberOfCommitsAheadOfBranch(p.name, branch.name)) === 0;
          if (isMergedIntoProductionReleaseOrMaster) { break; }
        }
      }
      if (!isMergedIntoProductionReleaseOrMaster && !(await promptYesNo({ question: `'${branch.name}' hasn't been staged for release. Delete anyways?`, noIsDefault: true, ignoreFocusOut: true }))) { return; }

      if (b.label === currentBranch) {
        // switch to the base branch or master
        const branch = context.workspaceState.get<string>(`${b.label}.baseBranch`) || "master";
        try {
          await git.checkoutBranch(branch);
        } catch (e) {
          showErrorMessage(outputChannel, `There was an error switching to '${branch}': ${e}`);
          return;
        }
      }

      // TODO: [TLS-44] clear branch relationship

      if (branch.remote) {
        // this feature branch only exists in the remote repository
        try {
          await git.deleteRemoteBranchForce(branch.name);
        } catch (e) {
          showErrorMessage(outputChannel, `There was an error deleting the remote feature branch '${branch.name}': ${e}`);
          return;
        }
      } else {
        try {
          await git.deleteBranchForce(branch.name);
        } catch (e) {
          showErrorMessage(outputChannel, `There was an error deleting the feature branch '${branch.name}': ${e}`);
          return;
        }
        // there may also be a remote repository
        try {
          await git.deleteRemoteBranchForce(branch.name);
        } catch (e) {
          showErrorMessage(outputChannel, `There was an error deleting the remote feature branch '${branch.name}': ${e}`);
          return;
        }
      }

      vscode.window.showInformationMessage(`Deleted feature branch '${(branch.remote) ? `${branch.origin}/${branch.name}` : branch.name}'.`);
    }

    vscode.window.showInformationMessage("Done.");
  };
};

export default deleteFeatureBranch;
