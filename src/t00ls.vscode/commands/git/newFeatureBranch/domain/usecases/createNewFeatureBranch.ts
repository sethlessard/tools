import BranchRelationshipRepository from "../../../../../../t00ls.common/domain/respositories/BranchRelationshipRepository";
import GitRepository from "../../../../../../t00ls.common/domain/respositories/GitRepository";
import NewFeatureBranch from "../../domain/entities/NewFeatureBranch";

/**
 * Create a enw feature branch.
 * @param newBranch the new feature branch to create.
 * @param git the GitRepository.
 */
const createNewFeatureBranch = (newBranch: NewFeatureBranch, git: GitRepository, relationshipRepository: BranchRelationshipRepository): Promise<void> => {
  // switch to the base branch
  return git.getCurrentBranch()
    .then(currentBranch => {
      if (currentBranch !== newBranch.baseBranch) {
        return git.checkoutBranch(newBranch.baseBranch);
      }
    })
    // pull the base branch
    .then(() => git.pull())
    // create the new feature branch
    .then(() => git.checkoutNewBranch(newBranch.name))
    // save the relationship if the base branch is a production release branch
    .then(() => git.getMainBranchName())
    .then(mainBranchName => {
      if (newBranch.baseBranch !== mainBranchName) {
        return relationshipRepository.setRelationship(newBranch.name, newBranch.baseBranch);
      }
    });
};

export default createNewFeatureBranch;
