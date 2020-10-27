import * as vscode from "vscode";
import * as _ from "lodash";
import Git, { Branch } from "../../util/Git";

/**
 * Release the next production version of the current project.
 * 
 * Completes a production release branch by:
 * 1. Creating a tag for the new version.
 * 2. Merging into master
 * 
 * Or CI handles the merge with a Release Candidate tag.
 * @param context the t00ls extension context.
 */
const release = (context: vscode.ExtensionContext) => {
  return async () => {
    // TODO: [TLS-9] verify that a Git repo is open.
    const gitRepo = vscode.workspace.workspaceFolders!![0].uri.fsPath;
    const git = new Git(gitRepo);

    // fetch the latest updates from remote
    try {
      await git.fetch();
    } catch (e) {
      await vscode.window.showErrorMessage(`There was an error fetching the latest updates from remote: ${e}`);
    }

    // get the local production release branches in the repository
    let productionReleaseBranches = [];
    try {
      productionReleaseBranches = await git.getAllLocalProductionReleaseBranches();
    } catch (e) {
      await vscode.window.showErrorMessage(`There was an error gathering the production release branches: ${e}`);
      return;
    }
    if (productionReleaseBranches.length === 0) {
      await vscode.window.showErrorMessage("There are no production release branches.");
      return;
    }

    // map to a VS Code-friendly form
    const mappedProdReleaseBranches = productionReleaseBranches.map(branch => ({ label: branch.name, description: (branch.remote) ? branch.origin : "local" }));

    // select the branch to complete.
    const selected = await vscode.window.showQuickPick(mappedProdReleaseBranches, { canPickMany: false, placeHolder: "Which production release branch would you like to complete?" });
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
    const action = await vscode.window.showQuickPick(completeActions, { canPickMany: false, placeHolder: `How would you like to complete '${branch}'` });
    if (!action) {
      await vscode.window.showInformationMessage("No action selected.");
      return;
    }

    if (_.indexOf(completeActions, action) === 0) {
      // create the release candidate tag and let CI handle the merge.
      try {
        await git.checkoutBranch(branch.name)
          .then(() => git.createReleaseCandidateTag())
          .then(() => git.pushTags());
      } catch (e) {
        await vscode.window.showErrorMessage(`Error creating the Release Candidate tag: ${e}`);
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
        await vscode.window.showErrorMessage(`Error creating releasing the next version: ${e}`);
        return;
      }
    } else {
      await vscode.window.showErrorMessage("No action selected.");
      return;
    }

    await vscode.window.showInformationMessage("Done. Running 't00ls: Sync Repo'!");
  };
};

export default release;
