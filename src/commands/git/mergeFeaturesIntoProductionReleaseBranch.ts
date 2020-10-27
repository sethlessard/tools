import * as vscode from "vscode";
import * as _ from "lodash";
import Git, { Branch } from "../../util/Git";

/**
 * Merge one or more feature branches into a production release branch.
 * @param context the t00ls extension context.
 */
const mergeFeaturesIntoProductionReleaseBranch = (context: vscode.ExtensionContext) => {
  return async () => {
    // TODO: [TLS-9] verify that a Git repo is open.
    const gitRepo = vscode.workspace.workspaceFolders!![0].uri.fsPath;
    const git = new Git(gitRepo);

    // get the local production release branches in the repository
    let productionReleaseBranches = [];
    try {
      productionReleaseBranches = await git.getAllLocalProductionReleaseBranches();
    } catch (e) {
      await vscode.window.showErrorMessage(`There was an error gathering the production release branches: ${e}`);
      return;
    }
    if (productionReleaseBranches.length === 0) {
      await vscode.window.showErrorMessage("There are no production release branches to update.");
      return;
    }

    // map to a VS Code-friendly form
    const mappedProdReleaseBranches = productionReleaseBranches.map(branch => ({ label: branch.name, description: (branch.remote) ? branch.origin : "local" }));

    // select the to production release branch to update.
    const selectedProductionRelease = await vscode.window.showQuickPick(mappedProdReleaseBranches, { canPickMany: false, placeHolder: "Which production release branch would you like to update?" });
    if (!selectedProductionRelease) { return; }

    const branch = _.find<Branch>(productionReleaseBranches, { name: selectedProductionRelease.label });
    if (!branch) { throw new Error("Error selecting production release branch..."); }

    // get the local feature branches in the repository
    let featureBranches = [];
    try {
      featureBranches = await git.getAllLocalFeatureBranches();
    } catch (e) {
      await vscode.window.showErrorMessage(`There was an error gathering the local feature branches: ${e}`);
      return;
    }
    if (featureBranches.length === 0) {
      await vscode.window.showErrorMessage("There are no feature branches.");
      return;
    }

    // map to a VS Code-friendly form
    const mappedFeatureBrances = featureBranches.map(branch => ({ label: branch.name, description: branch.lastCommitMessage }));

    // select the feature branches to merge into the production release branch.
    const selectedFeatureBranches = await vscode.window.showQuickPick(mappedFeatureBrances, { canPickMany: true, placeHolder: "Which feature branches would you like to merge into the production release branch?" });
    if (!selectedFeatureBranches || selectedFeatureBranches.length === 0) { 
      await vscode.window.showErrorMessage("No feature branches selected.");
      return;
    };
    
    // switch to the production release branch
    try {
      await git.checkoutBranch(selectedProductionRelease.label);
    } catch (e) {
      await vscode.window.showErrorMessage(`Error switching to production release branch '${selectedProductionRelease.label}': ${e}`);
      return;
    }

    for (const branch of selectedFeatureBranches) {
      try {
        await git.mergeBranch(branch.label);
      } catch (e) {
        await vscode.window.showErrorMessage(`Error merging '${branch.label}' into '${selectedProductionRelease.label}': ${e}`);
      }
    }

    await vscode.window.showInformationMessage("Done.");
  };
};

export default mergeFeaturesIntoProductionReleaseBranch;