import Branch from "../../../../../../t00ls.common/domain/entities/Branch";
import BranchRelationshipRepository from "../../../../../../t00ls.common/domain/respositories/BranchRelationshipRepository";
import GitRepository from "../../../../../../t00ls.common/domain/respositories/GitRepository";

const deleteAProductionReleaseBranch = async (productionReleaseBranch: Branch, force: boolean, git: GitRepository, relationshipRepository: BranchRelationshipRepository): Promise<void> => {
  // get the main branch name
  // get the current branch
  // get the production release branches
  return Promise.all([git.getMainBranchName(), git.getCurrentBranch()])
    .then(async ([mainBranchName, currentBranch]) => {
      // Before deleting a production release branch, check to see if 
      // the branch has been merged into the main branch or a production release branch.
      let isMergedIntoMain = (await git.getNumberOfCommitsAheadOfBranch(mainBranchName, productionReleaseBranch.name)) === 0;
      if (!isMergedIntoMain && !force) {
        throw new Error(`There is code in '${productionReleaseBranch.name}' that hasn't been staged for release. If you want to delete it, specify 'Yes' for the force option.`);
      }
      if (productionReleaseBranch.name === currentBranch) {
        // switch to the main branch
        return git.checkoutBranch(mainBranchName);
      }
    })
    // delete the production release branch
    .then(() => {
      if (productionReleaseBranch.remote) {
        // this production release branch only exists in the remote repository
        return git.deleteRemoteBranchForce(productionReleaseBranch.name);
      } else {
        return git.deleteBranchForce(productionReleaseBranch.name)
          // there may also be a remote repository
          .then(() => git.deleteRemoteBranchForce(productionReleaseBranch.name));
      }
    })
    // clear branch relationships
    .then(() => relationshipRepository.clearRelationshipsForProductionReleaseBranch(productionReleaseBranch.name));
};

export default deleteAProductionReleaseBranch;
