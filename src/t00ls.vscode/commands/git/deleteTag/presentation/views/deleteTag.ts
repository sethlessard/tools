import * as vscode from "vscode";
import * as _ from "lodash";

import { showErrorMessage } from "../../../../../util/WindowUtils";
import t00lsGitRepository from "../../../../../../t00ls.common/data/repositories/t00lsGitRepository";
import GitMode from "../../../../../../t00ls.common/presentation/models/GitMode";
import deleteATag from "../../domain/usecases/deleteATag";
import deleteTags from "../../domain/usecases/deleteTags";

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
    const git = new t00lsGitRepository(gitRepo, (context.workspaceState.get<GitMode>("t00ls.mode", GitMode.Normal)));
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
      vscode.window.showInformationMessage("There are no tags.");
      return;
    }

    // select the tags to delete
    const selectedTags = await vscode.window.showQuickPick(tags, { canPickMany: true, placeHolder: "Which tag(s) would you like to delete? (This deletes the remote tag as well)", ignoreFocusOut: true });
    if (!selectedTags || selectedTags.length === 0) { return; }

    if (selectedTags.length === 1) {
      try {
        await deleteATag(selectedTags[0], git);
      } catch (e) {
        showErrorMessage(outputChannel, `There was an error deleting the tag '${selectedTags[0]}': ${e}`);
      }
    } else {
      try {
        await deleteTags(selectedTags, git);
      } catch (e) {
        showErrorMessage(outputChannel, `There was an error deleting the tags (${selectedTags.join(", ")}): ${e}`);
      }
    }
    
    vscode.window.showInformationMessage("Done.");
  };
};

export default deleteTag;
