import * as vscode from "vscode";
import Git, { Branch } from "../../util/Git";

import { promptInput, promptVersion } from "../../util/WindowUtils";

/**
 * Create a new production release branch
 * @param context the t00ls extension context.
 */
const newFeatureBranch = (context: vscode.ExtensionContext) => {
  return async () => {
    // TODO: [TLS-9] verify that a Git repo is open.
    const gitRepo = vscode.workspace.workspaceFolders!![0].uri.fsPath;
    const git = new Git(gitRepo);

    // get the new production release version
    const featureBranch = await promptInput({ prompt: "What would you like to name the feature branch?", requireValue: true, placeHolder: "feature..." });
    if (!featureBranch) { return; }

    let baseBranches = ["master"];
    
    // get the local production release branches
    let productionReleaseBranches: Branch[] = [];
    try {
      productionReleaseBranches = await git.getAllLocalProductionReleaseBranches();
    } catch (e) {
      await vscode.window.showErrorMessage(`There was an error gathering the local production release branches: ${e}`);
    }
    if (productionReleaseBranches.length > 0) {
      baseBranches = baseBranches.concat(productionReleaseBranches.map(p => p.name));
    }

    // get the base branch to create the feature branch from.
    const baseBranch = await vscode.window.showQuickPick(baseBranches, { canPickMany: false, placeHolder: "What is the base branch for this feature branch?" });
    if (!baseBranch) { return; }
    
    // get the current branch
    let currentBranch = '';
    try {
      currentBranch = await git.getCurrentBranch();
    } catch (e) {
      await vscode.window.showErrorMessage(`Error gathering current Git branch: ${e}`);
      return;
    }
    if (!currentBranch) {
      await vscode.window.showErrorMessage(`Error gathering current Git branch: No value returned.`);
      return;
    }

    // switch to the base branch
    if (currentBranch !== baseBranch) {
      try {
        await git.checkoutBranch(baseBranch);
      } catch (e) {
        await vscode.window.showErrorMessage(`There was an error switching to '${e}'`);
        return;
      }
    }

    // pull the base branch
    try {
      await git.pull();
    } catch (e) {
      await vscode.window.showErrorMessage(`There was an error pulling '${baseBranch}': ${e}`);
      // don't return here... it's fine that master may be out-of-date. Sync Repo will clear that up when it is run. 
    }

    // create the feature branch
    try {
      await git.checkoutNewBranch(featureBranch);
    } catch (e) {
      await vscode.window.showErrorMessage(`There was an error creating '${featureBranch}': ${e}`);
      return;
    }
    await vscode.window.showInformationMessage(`Created new production release branch '${featureBranch}'.`);
  };
};

export default newFeatureBranch;
