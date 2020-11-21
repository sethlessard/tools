import Branch from "../entities/Branch";

interface GitRepository {

  /**
   * Checkout a branch.
   * @param branch the branch to checkout.
   */
  checkoutBranch(branch: string): Promise<void>;

  /**
   * Create a new branch.
   * @param branch the new branch to checkout.
   */
  checkoutNewBranch(branch: string): Promise<void>;

  /**
   * Create a production tag for the current version.
   * @param message the message to use when creating the tag.
   */
  createProductionTag(message?: string): Promise<void>;

  /**
   * Create a production tag for the current version.
   * @param message the message to use when creating the tag.
   */
  createProductionTag(message?: string): Promise<void>;

  /**
   * Delete a local branch -d
   * @param branch the branch to delete.
   */
  deleteBranch(branch: string): Promise<void>;

  /**
   * Delete a local branch -D
   * @param branch the branch to delete.
   */
  deleteBranchForce(branch: string): Promise<void>;

  /**
   * Delete a remote branch.
   * @param branch the branch to delete.
   */
  deleteRemoteBranch(branch: string, origin: string): Promise<void>;

    /**
   * Delete a remote branch with force.
   * @param branch the branch to delete.
   */
  deleteRemoteBranchForce(branch: string, origin?: string): Promise<void>;

  /**
   * Delete a tag locally and remotely.
   * @param tag the tag.
   * @param remote the remote to delete the tag from.
   */
  deleteTag(tag: string, remote: string): Promise<void>


  /**
   * Delete a set of tags locally and remotely.
   * @param tags the tags to delete.
   * @param remote the remote to use. Default is "origin"
   */
  deleteTags(tags: string[], remote: string): Promise<void>;

  /**
   * Fetch a remote, pruning branches and tags
   * @param remote the remote to fetch.
   */
  fetch(remote: string): Promise<void>;

  /**
   * Get all branches.
   */
  getAllBranches(): Promise<Branch[]>;

  /**
   * Get all branches branches in the repository.
   * Returns a unique list of branches, where local 
   * branches are favored over their remote counterparts.
   */
  getAllBranchesFavorLocal(): Promise<Branch[]>;

  /**
   * Get all feature branches in the repository.
   */
  getAllFeatureBranches(): Promise<Branch[]>;

  /**
   * Get all feature branches branches in the repository.
   * Returns a unique list of feature branches, where local 
   * branches are favored over their remote counterparts.
   */
  getAllFeatureBranchesFavorLocal(): Promise<Branch[]>;

  /**
   * Get all local branches.
   */
  getAllLocalBranches(): Promise<Branch[]>;

  /**
   * Get all local feature branches.
   */
  getAllLocalFeatureBranches(): Promise<Branch[]>;

  /**
   * Get all local production release branches.
   */
  getAllLocalProductionReleaseBranches(): Promise<Branch[]>;

  /**
   * Get all production release branches in the repository.
   */
  getAllProductionReleaseBranches(): Promise<Branch[]>;

  /**
   * Get all production release branches in the repository.
   * Returns a unique list of production release branches, where local 
   * branches are favored over their remote counterparts.
   */
  getAllProductionReleaseBranchesFavorLocal(): Promise<Branch[]>;

  /**
   * Get all remote branches
   */
  getAllRemoteBranches(): Promise<Branch[]>;

  /**
   * Get all remote feature branches.
   */
  getAllRemoteFeatureBranches(): Promise<Branch[]>;

  /**
  * Get all remote production release branches.
  */
  getAllRemoteProductionReleaseBranches(): Promise<Branch[]>;

  /**
   * Get all remotes in the Git repository.
   */
  getAllRemotes(): Promise<string[]>;

  /**
   * Get all tags in the Git repository.
   */
  getAllTags(): Promise<string[]>;

  /**
   * Get the current branch in the local Git repository.
   */
  getCurrentBranch(): Promise<string>;

  /**
   * Get the main branch name. 'main' or 'master'
   */
  getMainBranchName(): Promise<string>;

  /**
   * Get the number of commits one branch is ahead from another.
   * @param baseBranch the base branch to compare from.
   * @param branchToCompareAgainst the branch to compare against.
   * @returns the number of commits that branchToCompareAgainst is ahead of baseBranch.
   */
  getNumberOfCommitsAheadOfBranch(baseBranch: string, branchToCompareAgainst: string): Promise<number>;

  /**
   * Get the root directory of the Git repository.
   */
  getRepositoryDirectory(): Promise<string>;

  /**
   * Check to see if a branch exists locally in the Git repository.
   * @param branch the branch.
   */
  hasLocalBranch(branch: string): Promise<boolean>;

  /**
   * Check to see if a remote has been configured the repository.
   */
  hasRemote(): Promise<boolean>;

  /**
   * Check to see if a remote branch exists in the repository.
   * @param branch the branch.
   * @param origin the remote to use. default is 'origin'.
   */
  hasRemoteBranch(branch: string, origin: string): Promise<boolean>;

  /**
   * Check to see if there are working changes (tracked and untracked) in the current Git repository.
   */
  hasWorkingChanges(): Promise<boolean>;

  /**
   * Merge a branch into the current Git branch.
   * @param branch the branch to merge.
   */
  mergeBranch(branch: string): Promise<void>;

  /**
   * Pop the latest stash.
   */
  popStash(): Promise<void>;

  /**
   * Pull the current branch.
   */
  pull(): Promise<void>;

  /**
   * Push the current branch.
   */
  push(): Promise<void>;

  /**
   * Push all the tags in the local repository to the remote repository.
   */
  pushTags(): Promise<void>;

  /**
   * Setup remote tracking and push the current branch.
   * @param remote the remote repository to setup tracking against.
   */
  setupTrackingAndPush(remote: string): Promise<void>;

  /**
   * Stage a file or a directory.
   * @param path the path to stage.
   */
  stage(path: string): Promise<void>;

  /**
   * Stash the currently staged files.
   * @param message the stash message.
   */
  stash(message: string): Promise<void>;
};

export default GitRepository;
