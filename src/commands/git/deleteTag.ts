import * as vscode from "vscode";
import * as _ from "lodash";
import Git from "../../util/Git";
import { showErrorMessage } from "../../util/WindowUtils";

/**
 * Delete a tag.
 * @param context the t00ls extension context.
 * @param outputChannel the t00ls output channel.
 */
const deleteTag = (context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) => {
  return async () => {
    // TODO: [TLS-9] verify that a Git repo is open.
    const gitRepo = vscode.workspace.workspaceFolders!![0].uri.fsPath;
    const git = new Git(gitRepo);

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
    const selectedTags = await vscode.window.showQuickPick(tags, { canPickMany: true, placeHolder: "Which tag(s) would you like to delete? (This deletes the remote tag as well)" });
    if (!selectedTags || selectedTags.length === 0) { return; }

    for (const tag of selectedTags) {
      try {
        await git.deleteTag(tag);
      } catch (e) {
        await showErrorMessage(outputChannel, `There was an error deleting tag '${tag}': ${e}`);
      }
    }

    await vscode.window.showInformationMessage("Done.");
  };
};

export default deleteTag;
