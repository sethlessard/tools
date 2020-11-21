import * as vscode from "vscode";
import * as _ from "lodash";

import Git, { GitMode } from "@t00ls/git/Git";
import { showErrorMessage } from "@t00ls/vscode/util/WindowUtils";

/**
 * Delete a tag.
 * @param context the t00ls extension context.
 * @param outputChannel the t00ls output channel.
 */
const deleteTag = (context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) => {
  return async () => {
    if (!vscode.workspace.workspaceFolders) {
      showErrorMessage(outputChannel, "A Git repository is not open.");
      return;
    }
    const gitRepo = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const git = new Git(gitRepo, (context.workspaceState.get("t00ls.mode") as GitMode));
    await git.initialize();

    // fetch the latest updates from remote
    try {
      await git.fetch();
    } catch (e) {
      showErrorMessage(outputChannel, `There was an error fetching the latest updates from remote: ${e}`);
    }

    // get the tags
    let tags = [];
    try {
      tags = await git.getAllTags();
    } catch (e) {
      showErrorMessage(outputChannel, `There was an error fetching the tags: ${e}`);
      return;
    }
    if (!tags || tags.length === 0) {
      showErrorMessage(outputChannel, `There was an error fetching the tags: No return value.`);
      return;
    }

    // select the tags to delete
    const selectedTags = await vscode.window.showQuickPick(tags, { canPickMany: true, placeHolder: "Which tag(s) would you like to delete? (This deletes the remote tag as well)", ignoreFocusOut: true });
    if (!selectedTags || selectedTags.length === 0) { return; }

    try {
      await git.deleteTags(selectedTags);
    } catch (e) {
      showErrorMessage(outputChannel, `There was an error deleting the tags (${selectedTags.join(", ")}): ${e}`);
    }

    vscode.window.showInformationMessage("Done.");
  };
};

export default deleteTag;
