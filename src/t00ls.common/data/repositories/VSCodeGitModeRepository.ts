import { ExtensionContext } from "vscode";
import GitMode from "../models/GitMode";
import GitModeRepository from "../../domain/respositories/GitModeRepository";

const t00ls_MODE_KEY = "t00ls.mode";
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
   * Get the current GitMode.
   */
  getGitMode(): GitMode {
    return this._context.workspaceState.get<GitMode>(t00ls_MODE_KEY, GitMode.Normal);
  }

  /**
 * Set the Git mode.
 * @param gitMode the Git mode.
 */
  setGitMode(gitMode: GitMode): Thenable<void> {
    return this._context.workspaceState.update(t00ls_MODE_KEY, gitMode.valueOf());
  }
}

export default VSCodeGitModeRepository;
