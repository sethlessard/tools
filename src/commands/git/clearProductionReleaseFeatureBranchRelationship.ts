import * as vscode from "vscode";
import Git from "../../util/Git";
import Logger from "../../util/Logger";

import { showErrorMessage } from "../../util/WindowUtils";

/**
 * Create a new production release branch
 * @param context the t00ls extension context.
 * @param outputChannel the t00ls output channel.
 */
const clearProductionReleaseFeatureBranchRelationship = (context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) => {
  return async () => {
    if (!vscode.workspace.workspaceFolders) {
      showErrorMessage(outputChannel, "A Git repository is not open.");
      return;
    }
    const gitRepo = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const git = new Git(gitRepo);
    const logger = Logger.getInstance();

    // get the feature branches
    let featureBranches = [];
    try {
      featureBranches = await git.getAllLocalFeatureBranches();
    } catch (e) {
      await vscode.window.showErrorMessage(`Unable to gather the local feature branches: ${e}`);
      return;
    }
    if (!featureBranches || featureBranches.length === 0) {
      await vscode.window.showErrorMessage("There are no local feature branches.");
      return;
    }

    // get the feature branches that have a saved production release branch/feature branch relationship.
    const filteredFeatureBranches = featureBranches.filter(f => context.workspaceState.get(`${f.name}.baseBranch`) !== undefined).map(b => ({ label: b.name, description: `Base Branch: (${context.workspaceState.get(`${b.name}.baseBranch`)})` }));
    if (!filteredFeatureBranches || filteredFeatureBranches.length === 0) {
      await vscode.window.showInformationMessage("No feature branches currently have a defined production release branch/feature branch relationship.");
      return;
    }

    const toClear = await vscode.window.showQuickPick(filteredFeatureBranches, { canPickMany: true, ignoreFocusOut: true, placeHolder: "Which relationships would you like to clear?" });
    if (!toClear || toClear.length === 0) { return; }

    await Promise.all(toClear.map(b => {
      logger.writeLn(`Clearing relationship of feature branch '${b.label}' with ${b.description.replace("(", "'").replace(")", "'").toLowerCase()}.`);
      return context.workspaceState.update(`${b.label}.baseBranch`, undefined);
    }));

    await vscode.window.showInformationMessage("Done.");
  };
};

export default clearProductionReleaseFeatureBranchRelationship;
