import * as vscode from "vscode";
import * as path from "path";
import Git, { Branch } from "../../util/Git";
import { t00lsMode } from "../../util/StatusBarManager";

import { promptInput, promptVersion, promptYesNo, showErrorMessage } from "../../util/WindowUtils";

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
    const git = new Git(gitRepo, (context.workspaceState.get("t00ls.mode") as t00lsMode));

    // check to see if there are working changes in the directory.
    let stashCreated = false;
    try {
      if ((await git.hasWorkingChanges()) && (await promptYesNo({ question: `There are working changes. Do you want to stash them?`, ignoreFocusOut: true }))) {
        const stashMessage = await promptInput({ prompt: "Enter the stash message.", placeHolder: "blah blah blah..." });
        if (!stashMessage) { return; };

        await git.stage(path.join((await git.getRepositoryDirectory()), "*"))
          .then(() => git.stash(stashMessage));
        stashCreated = true;
      }
    } catch (e) {
      await showErrorMessage(outputChannel, `There was an error stashing the current working changes: ${e}`);
      return;
    }

    // get the new production release version
    const featureBranch = await promptInput({ prompt: "What would you like to name the feature branch?", requireValue: true, placeHolder: "feature..." });
    if (!featureBranch) { return; }

    let baseBranches = ["master"];
    
    // get the local production release branches
    let productionReleaseBranches: Branch[] = [];
    try {
      productionReleaseBranches = await git.getAllLocalProductionReleaseBranches();
    } catch (e) {
      await showErrorMessage(outputChannel, `There was an error gathering the local production release branches: ${e}`);
    }
    if (productionReleaseBranches.length > 0) {
      baseBranches = baseBranches.concat(productionReleaseBranches.map(p => p.name));
    }

    // get the base branch to create the feature branch from.
    const baseBranch = await vscode.window.showQuickPick(baseBranches, { canPickMany: false, placeHolder: `What is the base branch for feature branch '${featureBranch}'?` });
    if (!baseBranch) { return; }
    
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

    // switch to the base branch
    if (currentBranch !== baseBranch) {
      try {
        await git.checkoutBranch(baseBranch);
      } catch (e) {
        await showErrorMessage(outputChannel, `There was an error switching to '${e}'`);
        return;
      }
    }

    // pull the base branch
    try {
      await git.pull();
    } catch (e) {
      await showErrorMessage(outputChannel, `There was an error pulling '${baseBranch}': ${e}`);
      // don't return here... it's fine that master may be out-of-date. Sync Repo will clear that up when it is run. 
    }

    // create the feature branch
    try {
      await git.checkoutNewBranch(featureBranch);
    } catch (e) {
      await showErrorMessage(outputChannel, `There was an error creating '${featureBranch}': ${e}`);
      return;
    }
    await vscode.window.showInformationMessage(`Created new feature branch '${featureBranch}'.`);
  };
};

export default newFeatureBranch;
