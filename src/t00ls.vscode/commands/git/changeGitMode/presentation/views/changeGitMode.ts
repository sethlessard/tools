import * as vscode from "vscode";
import * as _ from "lodash";

import { showErrorMessage } from "../../../../../../t00ls.vscode/util/WindowUtils";
import setGitMode from "../../domain/usecases/setGitMode";
import VSCodeGitModeRepository from "../../../../../../t00ls.common/data/repositories/VSCodeGitModeRepository";
import GitMode, { mapToDomainGitMode } from "../../../../../../t00ls.common/presentation/models/GitMode";

const MODES = [
  {
    label: GitMode.Normal,
    description: "Git commands operate in a normal fashion."
  },
  {
    label: GitMode.Local,
    description: "Git commands only operate locally."
  }
];

const LOCAL_ONLY_MODE_MESSAGE = "Set t00ls Git mode to 'Local'. All Git commands will only operate in a local fashion. Remotes will not be updated.";
const NORMAL_MODE_MESSAGE = "Set t00ls Git mode to 'Normal'. All Git commands will operate normally.";

/**
 * Change the git mode.
 * @param context the t00ls extension context.
 * @param outputChannel the t00ls output channel.
 */
const changeGitMode = (context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) => {
  return async () => {
    if (!vscode.workspace.workspaceFolders) {
      showErrorMessage(outputChannel, "A Git repository is not open.");
      return;
    }
    
    const mode = await vscode.window.showQuickPick(MODES, { canPickMany: false, placeHolder: "Select the mode", ignoreFocusOut: true });
    if (!mode) { return; };

    try {
      await setGitMode(mapToDomainGitMode(mode.label), new VSCodeGitModeRepository(context))
        .then(() => vscode.window.showInformationMessage((mode.label === "Local") ? LOCAL_ONLY_MODE_MESSAGE : NORMAL_MODE_MESSAGE));
    } catch (error) {
      vscode.window.showErrorMessage(`An error occurred changing the Git mode: ${error}`);
    }
  };
};

export default changeGitMode;
