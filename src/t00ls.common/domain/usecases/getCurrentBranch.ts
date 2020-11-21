import GitRepository from "../respositories/GitRepository";

/**
 * Get the current branch.
 * @param git the GitRepository instance.
 */
const getCurrentBranch = (git: GitRepository): Promise<string> => {
  return git.getCurrentBranch();
};

export default getCurrentBranch;
