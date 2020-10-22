import * as vscode from "vscode";
import * as _ from "lodash";
import Git, { Branch } from "../../util/Git";

import { promptInput, promptVersion } from "../../util/WindowUtils";
import { uniq } from "lodash";


/**
 * Create a new production release branch
 * @param context the t00ls extension context.
 */
const deleteProductionReleaseBranch = (context: vscode.ExtensionContext) => {
  return async () => {
    try {
      // TODO: [TLS-9] verify that a Git repo is open.
      const gitRepo = vscode.workspace.workspaceFolders!![0].uri.fsPath;
      const git = new Git(gitRepo);

      await git.fetch();
      const [currentBranch, productionReleaseBranches] = await Promise.all([git.getCurrentBranch(), git.getAllProductionReleaseBranchesFavorLocal()]);
      
      // map to a VS Code-friendly form
      const mappedProdReleaseBranches = productionReleaseBranches.map(branch => ({ label: branch.name, description: (branch.remote) ? branch.origin : "local" }));
      
      // select the to delete
      const selected = await vscode.window.showQuickPick(mappedProdReleaseBranches, { canPickMany: false, placeHolder: "Which production release branch would you like to delete?" });
      if (!selected) { return; }
      
      const branch = _.find<Branch>(productionReleaseBranches, { name: selected.label });
      if (!branch) { throw new Error("Error selecting production release branch..."); }

      if (branch.name === currentBranch) {
        // switch to master
        await git.checkoutBranch("master");
      }

      // TODO: [TLS-18] Before deleting a production release branch, check to see if 
      // the branch has been merged into master.

      // delete the production release branch
      if (branch.remote) {
        await git.deleteRemoteBranchForce(branch.name);
      } else {
        await git.deleteBranchForce(branch.name);
      }
    } catch (e) {
      await vscode.window.showErrorMessage(`Error: ${e}`);
    }
  };
};

export default deleteProductionReleaseBranch;
