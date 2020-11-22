import GitRepository from "../../../../../../t00ls.common/domain/respositories/GitRepository";

/**
 * Create a new production release branch.
 * @param version the version.
 * @param projectName the name of the project. Will be added as a branch prefix.
 * @param git the GitRepository.
 */
const createProductionReleaseBranch = (version: string, projectName: string | undefined, git: GitRepository): Promise<string> => {
  const branch = `${(projectName) ? `${projectName}-` : ""}v${version}-prep`;

  // switch to the main branch.
  return Promise.all([git.getCurrentBranch(), git.getMainBranchName()])
    .then(([currentBranch, mainBranchName]) => {
      if (currentBranch !== mainBranchName) {
        return git.checkoutBranch(mainBranchName);
      }
    })
    // pull the main branch
    .then(() => git.pull())
    // create the new production release branch
    .then(() => git.checkoutNewBranch(branch))
    .then(() => branch);
};

export default createProductionReleaseBranch;
