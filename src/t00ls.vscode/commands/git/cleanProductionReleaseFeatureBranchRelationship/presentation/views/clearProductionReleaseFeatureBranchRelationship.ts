import * as vscode from "vscode";
import * as _ from "lodash";

import VSCodeBranchRelationshipRepository from "../../../../../../t00ls.common/data/repositories/VSCodeBranchRelationshipRepository";
import BranchRelationship from "../../../../../../t00ls.common/presentation/models/BranchRelationship";
import Logger from "../../../../../util/Logger";
import deleteFeatureBranchRelationship from "../../domain/usecases/deleteFeatureBranchRelationship";
import getAllBranchRelationships from "../../domain/usecases/getAllBranchRelationships";

/**
 * Create a new production release branch
 * @param context the t00ls extension context.
 * @param outputChannel the t00ls output channel.
 */
const clearProductionReleaseFeatureBranchRelationship = (context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) => {
  return async () => {
    const relationshipRepository = VSCodeBranchRelationshipRepository.getInstance();

    // get the relationships
    const relationships: BranchRelationship[] = getAllBranchRelationships(relationshipRepository);
    if (relationships.length === 0) {
      vscode.window.showInformationMessage("No feature branches currently have a defined production release branch/feature branch relationship.");
      return;
    }
    const mappedRelationships = relationships.map<vscode.QuickPickItem>(r => ({ label: r.featureBranch, detail: `Targets: '${r.productionReleaseBranch}'` }));

    // select the relationships to clear
    const selected = await vscode.window.showQuickPick(mappedRelationships, { canPickMany: true, ignoreFocusOut: true, placeHolder: "Which relationships would you like to clear?" });
    if (!selected || selected.length === 0) { return; }
    const toClear: BranchRelationship[] = selected.filter(s => _.find(relationships, { featureBranch: s.label }) !== undefined).map(s => _.find(relationships, { featureBranch: s.label })!!);
    

    await Promise.all(toClear.map(b => deleteFeatureBranchRelationship(b, relationshipRepository)));

    vscode.window.showInformationMessage("Done.");
  };
};

export default clearProductionReleaseFeatureBranchRelationship;
