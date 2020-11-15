import * as path from "path";
import * as vscode from "vscode";
import Git from "../../util/Git";
import { t00lsMode } from "../../util/StatusBarManager";

import { promptInput, promptVersion, promptYesNo, showErrorMessage } from "../../util/WindowUtils";

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
      showErrorMessage(outputChannel, `Error gathering current Git branch: ${e}`);
      return;
    }
    if (!currentBranch) {
      showErrorMessage(outputChannel, `Error gathering current Git branch: No value returned.`);
      return;
    }

    // switch to the main branch
    const mainBranchName = await git.getMainBranchName();
    if (currentBranch !== mainBranchName) {
      try {
        await git.checkoutBranch(mainBranchName);
      } catch (e) {
        showErrorMessage(outputChannel, `Error switching to '${mainBranchName}': ${e}`);
        return;
      }
    }

    // pull
    try {
      await git.pull();
    } catch (e) {
      showErrorMessage(outputChannel, `There was an error pulling '${mainBranchName}': ${e}`);
      // don't return here... it's fine that the main branch may be out-of-date. Sync Repo will clear that up when it is run. 
    }

    // create the production release branch
    try {
      await git.checkoutNewBranch(branch);
    } catch (e) {
      showErrorMessage(outputChannel, `There was an error creating '${branch}': ${e}`);
      return;
    }
    vscode.window.showInformationMessage(`Created new production release branch '${branch}'.`);
  };
};

export default newProductionReleaseBranch;
