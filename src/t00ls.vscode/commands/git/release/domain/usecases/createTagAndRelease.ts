import BranchRelationshipRepository from "../../../../../../t00ls.common/domain/respositories/BranchRelationshipRepository";
import GitRepository from "../../../../../../t00ls.common/domain/respositories/GitRepository";

/**
 * Create a production tag and release the production release branch.
 * @param productionReleaseBranch the production release branch.
 * @param git the GitRepository.
 * @param relationshipRepository the BranchRelationshipRepository.
 */
const createTagAndRelease = (productionReleaseBranch: string, git: GitRepository, relationshipRepository: BranchRelationshipRepository) => {
  // switch to the proudction release branch
  return git.checkoutBranch(productionReleaseBranch)
    // create the production release tag
    .then(() => git.createProductionTag())
    // switch to the main branch
    .then(() => git.getMainBranchName())
    .then(mainBranchName => git.checkoutBranch(mainBranchName))
    // merge the production release branch into the main branch
    .then(() => git.mergeBranch(productionReleaseBranch))
    // push the main branch
    .then(() => git.push())
    // push the tags
    .then(() => git.pushTags())
    // delete the production release branch
    .then(() => git.deleteBranchForce(productionReleaseBranch))
    .then(() => git.deleteRemoteBranchForce(productionReleaseBranch))
    // clear any relationships
    .finally(() => relationshipRepository.clearRelationshipsForProductionReleaseBranch(productionReleaseBranch));
};

export default createTagAndRelease;
