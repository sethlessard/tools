import * as vscode from "vscode";
import * as _ from "lodash";
import Git, { Branch } from "../../util/Git";
import { showErrorMessage } from "../../util/WindowUtils";
import { t00lsMode } from "../../util/StatusBarManager";

/**
 * Release the next production version of the current project.
 * 
 * Completes a production release branch by:
 * 1. Creating a tag for the new version.
 * 2. Merging into master
 * 
 * Or CI handles the merge with a Release Candidate tag.
 * @param context the t00ls extension context.
 * @param outputChannel the t00ls output channel.
 */
const release = (context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) => {
  return async () => {
    if (!vscode.workspace.workspaceFolders) {
      showErrorMessage(outputChannel, "A Git repository is not open.");
      return;
    }
    const gitRepo = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const git = new Git(gitRepo, (context.workspaceState.get("t00ls.mode") as t00lsMode));

    // fetch the latest updates from remote
    try {
      await git.fetch();
    } catch (e) {
      await showErrorMessage(outputChannel, `There was an error fetching the latest updates from remote: ${e}`);
    }

    // get the local production release branches in the repository
    let productionReleaseBranches = [];
    try {
      productionReleaseBranches = await git.getAllLocalProductionReleaseBranches();
    } catch (e) {
      await showErrorMessage(outputChannel, `There was an error gathering the production release branches: ${e}`);
      return;
    }
    if (productionReleaseBranches.length === 0) {
      await showErrorMessage(outputChannel, "There are no production release branches.");
      return;
    }

    // map to a VS Code-friendly form
    const mappedProdReleaseBranches = productionReleaseBranches.map(branch => ({ label: branch.name, description: (branch.remote) ? branch.origin : "local" }));

    // select the branch to complete.
    const selected = await vscode.window.showQuickPick(mappedProdReleaseBranches, { canPickMany: false, placeHolder: "Which production release branch would you like to complete?", ignoreFocusOut: true });
    if (!selected) { return; }

    const branch = _.find<Branch>(productionReleaseBranches, { name: selected.label });
    if (!branch) { throw new Error("Error selecting production release branch..."); }

    // ask how the production release branch should be completed
    const completeActions = [
      {
        label: "Complete with CI",
        description: "Creates a release candidate tag and expects CI to complete/merge the production release branch."
      },
      {
        label: "Merge into master",
        description: "Creates a production release tag and merges directly into 'master'."
      }
    ];
    const action = await vscode.window.showQuickPick(completeActions, { canPickMany: false, placeHolder: `How would you like to complete '${branch}'`, ignoreFocusOut: true });
    if (!action) {
      vscode.window.showInformationMessage("No action selected.");
      return;
    }

    if (_.indexOf(completeActions, action) === 0) {
      // create the release candidate tag and let CI handle the merge.
      try {
        await git.checkoutBranch(branch.name)
          .then(() => git.createReleaseCandidateTag())
          .then(() => git.pushTags());
      } catch (e) {
        await showErrorMessage(outputChannel, `Error creating the Release Candidate tag: ${e}`);
        return;
      }
    } else if (_.indexOf(completeActions, action) === 1) {
      try {
        // create the production tag and merge into master.
        await git.checkoutBranch(branch.name)
          .then(() => git.createProductionTag())
          .then(() => git.pushTags())
          .then(() => git.checkoutBranch("master"))
          .then(() => git.mergeBranch(branch.name));
      } catch (e) {
        await showErrorMessage(outputChannel, `Error creating releasing the next version: ${e}`);
        return;
      }
    } else {
      await showErrorMessage(outputChannel, "No action selected.");
      return;
    }

    vscode.window.showInformationMessage("Done. Don't forget to run 't00ls: Sync Repo'!");
  };
};

export default release;
