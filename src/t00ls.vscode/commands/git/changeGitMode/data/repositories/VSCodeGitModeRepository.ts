import { GitMode } from "../../../../../../t00ls.git/Git";
import { ExtensionContext } from "vscode";
import GitModeRepository from "../../domain/repositories/GitModeRepository";

class VSCodeGitModeRepository implements GitModeRepository {

  private readonly _context: ExtensionContext;

  /**
   * Create a new GitModeRepository.
   * @param context the t00ls extension context.
   */
  constructor(context: ExtensionContext) {
    this._context = context;
  }

  /**
 * Set the Git mode.
 * @param gitMode the Git mode.
 */
  setGitMode(gitMode: GitMode): Thenable<void> {
    return this._context.workspaceState.update("t00ls.mode", gitMode.valueOf());
  }
}

export default VSCodeGitModeRepository;
