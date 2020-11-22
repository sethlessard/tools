import * as path from "path";
import * as vscode from "vscode";
import t00lsGitRepository from "../../../../../../t00ls.common/data/repositories/t00lsGitRepository";
import GitMode from "../../../../../../t00ls.common/presentation/models/GitMode";

import { promptInput, promptVersion, promptYesNo, showErrorMessage } from "../../../../../util/WindowUtils";
import createProductionReleaseBranch from "../../domain/usecases/createProductionReleaseBranch";

/**
 * Create a new production release branch
 * @param context the t00ls extension context.
 * @param outputChannel the t00ls output channel.
 */
const newProductionReleaseBranch = (context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) => {
  return async () => {
    if (!vscode.workspace.workspaceFolders) {
      showErrorMessage(outputChannel, "A Git repository is not open.");
      return;
    }
    const gitRepo = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const git = new t00lsGitRepository(gitRepo, (context.workspaceState.get("t00ls.mode") as GitMode));
    await git.initialize();

    // check to see if there are working changes in the directory.
    try {
      if ((await git.hasWorkingChanges()) && (await promptYesNo({ question: `There are working changes. Do you want to stash them?`, ignoreFocusOut: true }))) {
        const stashMessage = await promptInput({ prompt: "Enter the stash message.", placeHolder: "blah blah blah..." });
        if (!stashMessage) { return; };
        await git.stage(path.join(gitRepo, "."))
          .then(() => git.stash(stashMessage));
      }
    } catch (e) {
      showErrorMessage(outputChannel, `There was an error stashing the current working changes: ${e}`);
      return;
    }

    // get the new production release version
    const version = await promptVersion("Which version are you preparing for?");
    if (!version) { return; }

    // get a prefix, if any
    const projectNamePrefix = await promptInput({ prompt: "Is there a Branch prefix you'd like to specify?", placeHolder: "project" });

    try {
      await createProductionReleaseBranch(version, projectNamePrefix, git)
        .then(productionReleaseBranch => vscode.window.showInformationMessage(`Created new production release branch '${productionReleaseBranch}'.`));
    } catch (e) {
      showErrorMessage(outputChannel, `There was an error creating the production release branch: ${e}`);
      return;
    }
  };
};

export default newProductionReleaseBranch;
