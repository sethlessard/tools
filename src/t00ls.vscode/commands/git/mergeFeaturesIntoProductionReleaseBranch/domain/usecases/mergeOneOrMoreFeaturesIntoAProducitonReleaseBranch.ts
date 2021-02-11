import Branch from "../../../../../../t00ls.common/domain/entities/git/Branch";
import GitRepository from "../../../../../../t00ls.common/domain/respositories/GitRepository";

/**
 * Merge one or more feature branches into a production release branch.
 * @param productionReleaseBranch the production release branch.
 * @param featureBranches the feature branches to merge.
 * @param git the GitRepository.
 */
const mergeOneOrMoreFeatureBranchesIntoAProducitonReleaseBranch = (productionReleaseBranch: string, featureBranches: Branch[], git: GitRepository): Promise<void> => {
  // switch to the production release branch
  return git.checkoutBranch(productionReleaseBranch)
    // merge the feature branches
    .then(() => Promise.all(featureBranches.map(f => git.mergeBranch(f.name))))
    .then();
};

export default mergeOneOrMoreFeatureBranchesIntoAProducitonReleaseBranch;
