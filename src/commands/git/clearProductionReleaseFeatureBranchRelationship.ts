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
    const logger = Logger.getInstance();
    const relationshipCache = BranchRelationshipCache.getInstance();

    const relationships = relationshipCache.getAllRelationships();
    if (relationships.length === 0) {
      vscode.window.showInformationMessage("No feature branches currently have a defined production release branch/feature branch relationship.");
      return;
    }
    const mappedRelationships = relationships.map<vscode.QuickPickItem>(r => ({ label: r.featureBranch, description: `(${r.productionReleaseBranch})` }));

    const toClear = await vscode.window.showQuickPick(mappedRelationships, { canPickMany: true, ignoreFocusOut: true, placeHolder: "Which relationships would you like to clear?" });
    if (!toClear || toClear.length === 0) { return; }

    await Promise.all(toClear.map(b => {
      logger.writeLn(`Clearing relationship of feature branch '${b.label}' with ${b.description!!.replace("(", "'").replace(")", "'").toLowerCase()}.`);
      return relationshipCache.clearRelationshipForFeatureBranch(b.label);
    }));

    vscode.window.showInformationMessage("Done.");
  };
};

export default clearProductionReleaseFeatureBranchRelationship;
