import * as vscode from "vscode";
import * as _ from "lodash";
import Git from "../../util/Git";
import { showErrorMessage } from "../../util/WindowUtils";
import { t00lsMode } from "../../util/StatusBarManager";

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
    const git = new Git(gitRepo, (context.workspaceState.get("t00ls.mode") as t00lsMode));

    // fetch the latest updates from remote
    try {
      await git.fetch();
    } catch (e) {
      await showErrorMessage(outputChannel, `There was an error fetching the latest updates from remote: ${e}`);
    }

    // get the tags
    let tags = [];
    try {
      tags = await git.getAllTags();
    } catch (e) {
      await showErrorMessage(outputChannel, `There was an error fetching the tags: ${e}`);
      return;
    }
    if (!tags || tags.length === 0) {
      await showErrorMessage(outputChannel, `There was an error fetching the tags: No return value.`);
      return;
    }

    // select the tags to delete
    const selectedTags = await vscode.window.showQuickPick(tags, { canPickMany: true, placeHolder: "Which tag(s) would you like to delete? (This deletes the remote tag as well)", ignoreFocusOut: true });
    if (!selectedTags || selectedTags.length === 0) { return; }

    try {
      await git.deleteTags(selectedTags);
    } catch (e) {
      await showErrorMessage(outputChannel, `There was an error deleting the tags (${selectedTags.join(", ")}): ${e}`);
    }

    await vscode.window.showInformationMessage("Done.");
  };
};

export default deleteTag;
