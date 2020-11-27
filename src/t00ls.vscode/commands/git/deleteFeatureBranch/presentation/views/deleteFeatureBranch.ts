import * as vscode from "vscode";
import * as _ from "lodash";

import { promptYesNo, showErrorMessage } from "../../../../../../t00ls.vscode/util/WindowUtils";
import VSCodeBranchRelationshipRepository from "../../../../../../t00ls.common/data/repositories/VSCodeBranchRelationshipRepository";
import t00lsGitRepository from "../../../../../../t00ls.common/data/repositories/t00lsGitRepository";
import GitMode from "../../../../../../t00ls.common/presentation/models/GitMode";
import Branch from "../../../../../../t00ls.common/presentation/models/Branch";
import deleteAFeatureBranch from "../../domain/usecases/deleteAFeatureBranch";

/**
 * Delete a feature branch.
 * @param context the t00ls extension context.
 * @param outputChannel the t00ls output channel.
 */
const deleteFeatureBranch = (context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) => {
  return async () => {
    if (!vscode.workspace.workspaceFolders) {
      showErrorMessage(outputChannel, "A Git repository is not open.");
      return;
    }

    const gitRepo = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const git = new t00lsGitRepository(gitRepo, (context.workspaceState.get("t00ls.mode") as GitMode));
    await git.initialize();
    const relationshipRepository = new VSCodeBranchRelationshipRepository(context);

    // get the local feature branches in the repository
    let featureBranches: Branch[] = [];
    try {
      featureBranches = await git.getAllLocalFeatureBranches();
    } catch (e) {
      showErrorMessage(outputChannel, `There was an error gathering the local feature branches: ${e}`);
      return;
    }
    if (featureBranches.length === 0) {
      showErrorMessage(outputChannel, "There are no feature branches to delete.");
      return;
    }

    // map to a VS Code-friendly form
    const mappedFeatureBrances = featureBranches.map(branch => ({ label: branch.name, description: (branch.remote) ? branch.origin : "local" }));

    // select the to delete
    const selected = await vscode.window.showQuickPick(mappedFeatureBrances, { canPickMany: true, placeHolder: "Which feature branch would you like to delete?", ignoreFocusOut: true });
    if (!selected) { return; }

    for (const b of selected) {
      const branch = _.find(featureBranches, { name: b.label });
      if (!branch) { throw new Error("Error...."); }

      try {
        deleteAFeatureBranch(branch, (await promptYesNo({ question: `Force delete '${branch.name}'?`, noIsDefault: true })), git, relationshipRepository)
          .then(() => vscode.window.showInformationMessage(`Deleted feature branch '${branch.name}'.`));
      } catch (error) {
        vscode.window.showErrorMessage(`Error deleting '${branch.name}': ${error}`);
      }
    }

    vscode.window.showInformationMessage("Done.");
  };
};

export default deleteFeatureBranch;
