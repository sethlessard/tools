import GitMode from "../entities/GitMode";

interface GitModeRepository {

  /**
   * Get the current GitMode.
   */
  getGitMode(): GitMode;

  /**
   * Set the Git mode.
   * @param gitMode the Git mode.
   */
  setGitMode(gitMode: GitMode): Thenable<void>;
}

export default GitModeRepository;
