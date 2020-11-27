import GitRepository from "../../../../../../t00ls.common/domain/respositories/GitRepository";
import { promptYesNo } from "../../../../../util/WindowUtils";
import BranchWithActions from "../entities/BranchWithActions";

/**
 * Sync the Git repository.
 * @param git the GitRepostory.
 * @param stashCreated whether or not a stash was created before the sync started.
 * @param localProductionReleaseBranches the local production release branches.
 * @param localFeatureBranches the local feature branches.
 * @param mainBranchName the name of the main branch.
 */
const syncRepository = (git: GitRepository, stashCreated: boolean, localProductionReleaseBranches: BranchWithActions[], localFeatureBranches: BranchWithActions[], mainBranchName: string): Promise<void> => {
  return git.getCurrentBranch()
    .then(currentBranch => {
      let onOriginal = true;
      // update the main branch first
      return _updateTheMainBranch(git, currentBranch, mainBranchName)
        .then(() => _delay(50))
        // then, update the production release branches
        .then(() => Promise.all(localProductionReleaseBranches.map(p => _updateProductionReleaseBranch(git, p, mainBranchName).then(() => _delay(500)))))
        // finally, update the feature branches
        .then(() => Promise.all(localFeatureBranches.map(f => _updateFeatureBranch(git, f).then(() => _delay(500)))))
        // switch back to the original branch, or the main branch.
        .then(() => git.checkoutBranch(currentBranch).catch(() => {
          onOriginal = false;
          git.checkoutBranch(mainBranchName);
        }))
        // pop the stash, if any
        .then(async () => {
          // if there is a stash and we've switched back to the original branch, pop the stash
          // or
          // if there is a stash but the original branch has been deleted.
          if ((onOriginal && stashCreated) || (stashCreated && !onOriginal && (await promptYesNo({ question: `'${currentBranch}' was deleted. Do you want to pop the stash that was created anyways?` })))) {
            return git.popStash();
          }
        });
    })
    .then();
};

/**
 * Async delay.
 * @param ms the number of milliseconds to delay by.
 */
const _delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Update the main branch.
 * @param git the GitRepository.
 * @param currentBranch the current branch
 * @param mainBranchName the name of the main branch.
 */
const _updateTheMainBranch = (git: GitRepository, currentBranch: string, mainBranchName: string): Promise<void> => {
  return Promise.resolve()
    // switch to the main branch.
    .then(() => {
      if (currentBranch !== mainBranchName) {
        return git.checkoutBranch(mainBranchName);
      }
    })
    .then(() => _delay(50))
    // pull the main branch
    .then(() => git.pull())
    // push the main branch
    .then(() => git.push());
};

/**
 * Update a feature branch.
 * @param git the GitRepository.
 * @param featureBranch the feature branch.
 * @param mainBranchName the main branch.
 */
const _updateFeatureBranch = (git: GitRepository, featureBranch: BranchWithActions): Promise<void> => {
  return Promise.resolve()
    // switch to the feature branch.
    .then(() => git.checkoutBranch(featureBranch.name))
    .then(() => _delay(50))
    // check to see if the branch is published
    .then(() => git.hasRemoteBranch(featureBranch.name))
    // If a remote copy of the feature branch exists, pull the branch.
    // Otherwise, if the feature branch is flagged for publishing,
    // publish the feature branch
    .then(hasRemoteBranch => {
      if (hasRemoteBranch) {
        // pull the remote feature branch
        return git.pull();
      } else if (featureBranch.publish) {
        // publish the feature branch
        return git.setupTrackingAndPush();
      }
    })
    // merge the base branch into the feature branch
    .then(() => {
      if (featureBranch.mergeBaseBranch) {
        return git.mergeBranch(featureBranch.baseBranch!!);
      }
    })
    .then(() => _delay(50))
    // push the feature branch
    .then(() => git.push());
};

/**
 * Update a production release branch.
 * @param git the GitRepository.
 * @param productionReleaseBranch the production release branch.
 * @param mainBranchName the main branch.
 */
const _updateProductionReleaseBranch = (git: GitRepository, productionReleaseBranch: BranchWithActions, mainBranchName: string): Promise<void> => {
  return Promise.resolve()
    // switch to the production release branch.
    .then(() => git.checkoutBranch(productionReleaseBranch.name))
    .then(() => _delay(50))
    // check to see if the branch is published
    .then(() => git.hasRemoteBranch(productionReleaseBranch.name))
    // If a remote copy of the production release branch exists, pull the branch.
    // Otherwise, if the production release branch is flagged for publishing,
    // publish the production release branch
    .then(hasRemoteBranch => {
      if (hasRemoteBranch) {
        // pull the remote production release branch
        return git.pull();
      } else if (productionReleaseBranch.publish) {
        // publish the production release branch
        return git.setupTrackingAndPush();
      }
    })
    .then(() => _delay(50))
    // merge the main branch into the production release branch
    .then(() => git.mergeBranch(mainBranchName))
    // push the production release branch
    .then(() => git.push());
};

export default syncRepository;
