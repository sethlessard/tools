import GitMode from "../../../../../../t00ls.common/domain/entities/GitMode";
import StatusBarManager from "../../../../../../t00ls.vscode/util/StatusBarManager";
import GitModeRepository from "../../../../../../t00ls.common/domain/respositories/GitModeRepository";

/**
 * Set the Git mode.
 * @param mode the GitMode
 * @param context the ExtensionContext.
 */
const setGitMode = (mode: GitMode, gitModeRepository: GitModeRepository) => {
  return gitModeRepository.setGitMode(mode)
    // update the status bar item
    .then(() => StatusBarManager.getInstance().setMode(mode));
};

export default setGitMode;
