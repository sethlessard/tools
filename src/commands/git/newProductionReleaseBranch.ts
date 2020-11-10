import * as vscode from "vscode";
import Git from "../../util/Git";
import { t00lsMode } from "../../util/StatusBarManager";

import { promptInput, promptVersion, showErrorMessage } from "../../util/WindowUtils";

/**
 * Create a new production release branch
 * @param context the t00ls extension context.
 * @param outputChannel the t00ls output channel.
 */
const newProductionReleaseBranch = (context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) => {
  return async () => {
    if (!vscode.workspace.workspaceFolders) {
      showErrorMessage(outputChannel, "A Git repository is not open.");
      return;
    }
    const gitRepo = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const git = new Git(gitRepo, (context.workspaceState.get("t00ls.mode") as t00lsMode));

    // get the new production release version
    const version = await promptVersion("Which version are you preparing for?");
    if (!version) { return; }

    // get a prefix, if any
    const prefix = await promptInput({ prompt: "Is there a Branch prefix you'd like to specify?", placeHolder: "project" });

    // calculate the branch name
    const branch = `${(prefix) ? `${prefix}-` : ""}v${version}-prep`;

    // get the current branch
    let currentBranch = '';
    try {
      currentBranch = await git.getCurrentBranch();
    } catch (e) {
      await showErrorMessage(outputChannel, `Error gathering current Git branch: ${e}`);
      return;
    }
    if (!currentBranch) {
      await showErrorMessage(outputChannel, `Error gathering current Git branch: No value returned.`);
      return;
    }

    // switch to master
    if (currentBranch !== "master") {
      try {
        await git.checkoutBranch("master");
      } catch (e) {
        await showErrorMessage(outputChannel, `Error switching to 'master': ${e}`);
        return;
      }
    }

    // pull master
    try {
      await git.pull();
    } catch (e) {
      await showErrorMessage(outputChannel, `There was an error pulling 'master': ${e}`);
      // don't return here... it's fine that master may be out-of-date. Sync Repo will clear that up when it is run. 
    }

    // create the production release branch
    try {
      await git.checkoutNewBranch(branch);
    } catch (e) {
      await showErrorMessage(outputChannel, `There was an error creating '${branch}': ${e}`);
      return;
    }
    await vscode.window.showInformationMessage(`Created new production release branch '${branch}'.`);
  };
};

export default newProductionReleaseBranch;
