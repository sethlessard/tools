import { promises } from "dns";
import Branch from "../../../../../../t00ls.common/domain/entities/Branch";
import BranchRelationshipRepository from "../../../../../../t00ls.common/domain/respositories/BranchRelationshipRepository";
import GitRepository from "../../../../../../t00ls.common/domain/respositories/GitRepository";

const deleteAFeatureBranch = async (featureBranch: Branch, force: boolean, git: GitRepository, relationshipRepository: BranchRelationshipRepository): Promise<void> => {
  // get the main branch name
  // get the current branch
  // get the production release branches
  return Promise.all([git.getMainBranchName(), git.getCurrentBranch(), git.getAllLocalProductionReleaseBranches()])
    .then(async ([mainBranchName, currentBranch, productionReleaseBranches]) => {
      // Before deleting a feature branch, check to see if 
      // the branch has been merged into the main branch or a production release branch.
      let isMergedIntoProductionReleaseOrMain = (await git.getNumberOfCommitsAheadOfBranch(mainBranchName, featureBranch.name)) === 0;
      if (!isMergedIntoProductionReleaseOrMain) {
        for (const p of productionReleaseBranches) {
          isMergedIntoProductionReleaseOrMain = (await git.getNumberOfCommitsAheadOfBranch(p.name, featureBranch.name)) === 0;
          if (isMergedIntoProductionReleaseOrMain) { break; }
        }
      }
      if (!isMergedIntoProductionReleaseOrMain && !force) {
        throw new Error(`There is code in '${featureBranch.name}' that hasn't been staged for release. If you want to delete it, specify 'Yes' for the force option.`);
      }

      if (featureBranch.name === currentBranch) {
        // switch to the base branch or the main branch
        const branch = relationshipRepository.getRelationship(featureBranch.name)?.productionReleaseBranch || mainBranchName;
        return git.checkoutBranch(branch);
      }
    })
    // delete the feature branch
    .then(() => {
      if (featureBranch.remote) {
        // this feature branch only exists in the remote repository
        return git.deleteRemoteBranchForce(featureBranch.name);
      } else {
        return git.deleteBranchForce(featureBranch.name)
          // there may also be a remote repository
          .then(() => git.deleteRemoteBranchForce(featureBranch.name));
      }
    })
    // clear branch relationship
    .then(() => relationshipRepository.clearRelationshipForFeatureBranch(featureBranch.name));
};

export default deleteAFeatureBranch;
