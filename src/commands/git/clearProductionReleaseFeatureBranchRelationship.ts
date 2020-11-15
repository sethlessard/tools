import * as vscode from "vscode";
import BranchRelationshipCache from "../../cache/BranchRelationshipCache";
import Git from "../../util/Git";
import Logger from "../../util/Logger";
import { t00lsMode } from "../../util/StatusBarManager";

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
    const git = new Git(gitRepo, (context.workspaceState.get("t00ls.mode") as t00lsMode));
    const logger = Logger.getInstance();
    const relationshipCache = BranchRelationshipCache.getInstance();

    // get the feature branches
    let featureBranches = [];
    try {
      featureBranches = await git.getAllLocalFeatureBranches();
    } catch (e) {
      vscode.window.showErrorMessage(`Unable to gather the local feature branches: ${e}`);
      return;
    }
    if (!featureBranches || featureBranches.length === 0) {
      vscode.window.showInformationMessage("There are no local feature branches.");
      return;
    }

    // get the feature branches that have a saved production release branch/feature branch relationship.
    const filteredFeatureBranches = featureBranches.filter(f => relationshipCache.getRelationship(f.name) !== undefined).map(b => ({ label: b.name, description: `Base Branch: (${relationshipCache.getRelationship(b.name)})` }));
    if (!filteredFeatureBranches || filteredFeatureBranches.length === 0) {
      vscode.window.showInformationMessage("No feature branches currently have a defined production release branch/feature branch relationship.");
      return;
    }

    const toClear = await vscode.window.showQuickPick(filteredFeatureBranches, { canPickMany: true, ignoreFocusOut: true, placeHolder: "Which relationships would you like to clear?" });
    if (!toClear || toClear.length === 0) { return; }

    await Promise.all(toClear.map(b => {
      logger.writeLn(`Clearing relationship of feature branch '${b.label}' with ${b.description.replace("(", "'").replace(")", "'").toLowerCase()}.`);
      return relationshipCache.clearRelationshipForFeatureBranch(b.label);
    }));

    vscode.window.showInformationMessage("Done.");
  };
};

export default clearProductionReleaseFeatureBranchRelationship;
