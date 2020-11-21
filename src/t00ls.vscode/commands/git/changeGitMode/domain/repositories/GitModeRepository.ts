import { GitMode } from "../../../../../../t00ls.git/Git";

interface GitModeRepository {

  /**
   * Set the Git mode.
   * @param gitMode the Git mode.
   */
  setGitMode(gitMode: GitMode): Thenable<void>;
}

export default GitModeRepository;
