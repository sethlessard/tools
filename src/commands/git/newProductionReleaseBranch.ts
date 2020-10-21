import * as vscode from "vscode";
import Git from "../../util/Git";

import { promptInput, promptVersion } from "../../util/WindowUtils";

/**
 * Create a new production release branch
 * @param context the t00ls extension context.
 */
const newProductionReleaseBranch = (context: vscode.ExtensionContext) => {
  return async () => {
    try {
      // TODO: [TLS-9] verify that a Git repo is open.
      const gitRepo = vscode.workspace.workspaceFolders!![0].uri.fsPath;
      const git = new Git(gitRepo);

      // get the new production release version
      const version = await promptVersion("Which version are you preparing for?");
      if (!version) { return; }

      // get a prefix, if any
      const prefix = await promptInput({ prompt: "Is there a Branch prefix you'd like to specify?", placeHolder: "project" });

      // calculate the branch name
      const branch = `${(prefix) ? `${prefix}-` : ""}v${version}-prep`;

      // get the current branch name
      const currentBranch = await git.getCurrentBranch();

      // switch to the master branch
      if (currentBranch.stdout !== "master") {
        await git.checkoutBranch("master");
      }

      // create the production release branch
      await git.checkoutNewBranch(branch);

      await vscode.window.showInformationMessage(`Created new production release branch '${branch}'.`);
    } catch (e) {
      await vscode.window.showErrorMessage(`Error: ${e}`);
    }
  };
};

export default newProductionReleaseBranch;
