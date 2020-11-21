import * as vscode from "vscode";
import * as _ from "lodash";
import * as path from "path";

import Git, { Branch, GitMode } from "@t00ls/git/Git";
import { promptInput, promptYesNo, showErrorMessage } from "@t00ls/vscode/util/WindowUtils";

/**
 * Merge one or more feature branches into a production release branch.
 * @param context the t00ls extension context.
 * @param outputChannel the t00ls output channel.
 */
const mergeFeaturesIntoProductionReleaseBranch = (context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) => {
  return async () => {
    if (!vscode.workspace.workspaceFolders) {
      showErrorMessage(outputChannel, "A Git repository is not open.");
      return;
    }
    const gitRepo = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const git = new Git(gitRepo, (context.workspaceState.get("t00ls.mode") as GitMode));
    await git.initialize();

    // get the local production release branches in the repository
    let productionReleaseBranches = [];
    try {
      productionReleaseBranches = await git.getAllLocalProductionReleaseBranches();
    } catch (e) {
      showErrorMessage(outputChannel, `There was an error gathering the production release branches: ${e}`);
      return;
    }
    if (productionReleaseBranches.length === 0) {
      showErrorMessage(outputChannel, "There are no production release branches to update.");
      return;
    }

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

    // map to a VS Code-friendly form
    const mappedProdReleaseBranches = productionReleaseBranches.map(branch => ({ label: branch.name, description: (branch.remote) ? branch.origin : "local" }));

    // select the to production release branch to update.
    const selectedProductionRelease = await vscode.window.showQuickPick(mappedProdReleaseBranches, { canPickMany: false, placeHolder: "Which production release branch would you like to update?", ignoreFocusOut: true });
    if (!selectedProductionRelease) { return; }

    const branch = _.find<Branch>(productionReleaseBranches, { name: selectedProductionRelease.label });
    if (!branch) { throw new Error("Error selecting production release branch..."); }

    // get the local feature branches in the repository
    let featureBranches = [];
    try {
      featureBranches = await git.getAllLocalFeatureBranches();
    } catch (e) {
      showErrorMessage(outputChannel, `There was an error gathering the local feature branches: ${e}`);
      return;
    }
    if (featureBranches.length === 0) {
      showErrorMessage(outputChannel, "There are no feature branches.");
      return;
    }

    // map to a VS Code-friendly form
    const mappedFeatureBrances = featureBranches.map(branch => ({ label: branch.name, description: branch.lastCommitMessage }));

    // select the feature branches to merge into the production release branch.
    const selectedFeatureBranches = await vscode.window.showQuickPick(mappedFeatureBrances, { canPickMany: true, placeHolder: "Which feature branches would you like to merge into the production release branch?", ignoreFocusOut: true });
    if (!selectedFeatureBranches || selectedFeatureBranches.length === 0) {
      showErrorMessage(outputChannel, "No feature branches selected.");
      return;
    };

    // switch to the production release branch
    try {
      await git.checkoutBranch(selectedProductionRelease.label);
    } catch (e) {
      showErrorMessage(outputChannel, `Error switching to production release branch '${selectedProductionRelease.label}': ${e}`);
      return;
    }

    for (const branch of selectedFeatureBranches) {
      try {
        await git.mergeBranch(branch.label);
      } catch (e) {
        showErrorMessage(outputChannel, `Error merging '${branch.label}' into '${selectedProductionRelease.label}': ${e}`);
      }
    }

    vscode.window.showInformationMessage("Done.");
  };
};

export default mergeFeaturesIntoProductionReleaseBranch;
