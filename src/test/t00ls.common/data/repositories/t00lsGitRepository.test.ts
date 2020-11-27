import { describe, test } from "mocha";

const MODE_LOCAL_NOTHING_HAPPENS = "Nothing should happen when the mode is set to 'Local'.";

describe("t00ls.common/data/repositories/t00lsGitRepository", () => {

  describe("checkoutBranch", () => {
    test("It should be able to switch branches.");
    test("It should throw an error if the branch does not exist.");
    test("Nothing should happen when switching to the current branch.");
  });

  describe("checkoutNewBranch", () => {
    test("It should be able to create a new local branch.");
    test("It should throw an error if the branch already exists.");
  });

  describe("createProductionTag", () => {
    test("It should be able to create a production release tag.");
    test("It should throw an error if the current branch is not a production release branch");
    test("It should throw an error if the tag has already been created.");
  });

  describe("deleteBranch", () => {
    test("It should be able to delete a local branch.");
    test("It should throw an error if the branch has not been merged into main.");
    test("It should throw an error if the branch does not exist.");
  });

  describe("deleteBranchForce", () => {
    test("It should be able to delete a local branch.");
    test("It should be able to delete a local branch if the branch has not been merged into main.");
    test("It should throw an error if the branch does not exist.");
  });

  describe("deleteRemoteBranch", () => {
    test("It should be able to delete a remote branch.");
    test("It should throw an error if the branch has not been merged into main.");
    test("It should throw an error if the branch does not exist.");
    test(MODE_LOCAL_NOTHING_HAPPENS);
  });

  describe("deleteRemoteBranchForce", () => {
    test("It should be able to delete a remote branch.");
    test("It should be able to delete a remote branch if the branch has not been merged into main.");
    test("It should throw an error if the branch does not exist.");
    test(MODE_LOCAL_NOTHING_HAPPENS);
  });

  describe("deleteTag", () => {
    test("It should be able to delete a tag both locally and remotely");
    test("It should throw an error if the tag doesn't exist.");
    test("It should not delete the remote tag when the mode is set to 'Local'.");
  });

  describe("deleteTags", () => {
    test("It should be able to delete tags both locally and remotely");
    test("It should throw an error if a tag doesn't exist.");
    test("It should not delete the remote tags when the mode is set to 'Local'.");
  });

  describe("getAllBranches", () => {
    test("It should return an array of all branches in the repository, both local and remote.");
    test("It should return an empty array if the repository doesn't contain a commit.");
    test("It should return an array of all local branches in the repository when the mode is set to 'Local'.");
  });

  describe("getAllBranchesFavorLocal", () => {
    test("It should return an array of all branches in the repository, only returning an entry for the local branch if both a local and remote branch exist.");
    test("It should return an empty array if the repository doesn't contain a commit.");
  });
  
  describe("getAllFeatureBranches", () => {
    test("It should return an array of all feature branches in the repository, both local and remote.");
    test("It should return an empty array when there are no feature branches in the repository.");
    test("It should return an array of all local feature branches in the repository when the mode is set to 'Local'.");
  });

  describe("getAllFeatureBranchesFavorLocal", () => {
    test("It should return an array of all feature branches in the repository, only returning an entry for the local branch if both a local and remote branch exist.");
    test("It should return an empty array when there are no feature branches in the repository.");
    test("It should return an array of all local feature branches in the repository when the mode is set to 'Local'.");
  });

  describe("getAllLocalBranches", () => {
    test("It should return an array of all local branches in the repository.");
    test("It should return an empty array if the repository doesn't contain a commit.");
  });

  describe("getAllLocalFeatureBranches", () => {
    test("It should return an array of all local feature branches in the repository.");
    test("It should return an empty array if the repository doesn't contain local feature branches."); 
  });

  describe("getAllLocalProductionReleaseBranches", () => {
    test("It should return an array of all local production release branches in the repository.");
    test("It should return an empty array if the repository doesn't contain local production release branches."); 
  });

  describe("getAllProductionReleaseBranches", () => {
    test("It should return an array of all production release branches in the repository, both local and remote.");
    test("It should return an empty array if the repository doesn't contain production release branches."); 
    test("It should return an array of all local production release branches in the repository when the mode is set to 'Local'.");
  });

  describe("getAllProductionReleaseBranchesFavorLocal", () => {
    test("It should return an array of all production release branches in the repository, only returning an entry for the local branch if both a local and remote branch exist.");
    test("It should return an empty array when there are no production release branches in the repository.");
    test("It should return an array of all local production release branches in the repository when the mode is set to 'Local'.");
  });

  describe("getAllRemoteBranches", () => {
    test("It should return an array of all remote branches in the repository.");
    test("It should return an empty array when there are no remote branches in the repository.");
    test("It should return an empty array when the mode is set to 'Local'.");
  });

  describe("getAllRemoteFeatureBranches", () => {
    test("It should return an array of all remote feature branches in the repository.");
    test("It should return an empty array when there are no remote feature branches in the repository.");
    test("It should return an empty array when the mode is set to 'Local'.");
  });

  describe("getAllRemoteProductionReleaseBranches", () => {
    test("It should return an array of all remote production release branches in the repository.");
    test("It should return an empty array when there are no remote production release branches in the repository.");
    test("It should return an empty array when the mode is set to 'Local'.");
  });

  describe("getAllRemotes", () => {
    test("It should return an array of all remotes in the repository.");
    test("It should return an empty array if a remote has not yet been configured.");
    test("It should return an empty array when the mode is set to 'Local'.");
  });

  describe("getAllTags", () => {
    test("It should return an array of all the tags in the local repository.");
    test("It should return an empty array if there are no tags.");
  });

  describe("getCurrentBranch", () => {
    test("It should return the name of the current branch.");
  });

  describe("getNumberOfCommitsAheadOfBranch", () => {
    // TODO
  });

  describe("getRepositoryDirectory", () => {
    test("It should return the root directory of the Git repository on the local disk.");
  });

  describe("hasLocalBranch", () => {
    test("It should return 'true' when a branch exists locally.");
    test("It should return 'false' when a branch does not exist locally.");
  });

  describe("hasRemote", () => {
    test("It should return 'true' if a remote has been configured.");
    test("It should return 'false' if a remote has not been configured.");
    test("It should return 'false' when the mode is set to 'Local'.");
  });

  describe("hasRemoteBranch", () => {
    test("It should return 'true' when a branch exists remotely.");
    test("It should return 'false' when a branch does not exist remotely.");
    test("It should return 'false' when the mode is set to 'Local'.");
  });

  describe("hasWorkingChanges", () => {
    test("It should return 'true' when there are untracked working changes.");
    test("It should return 'true' when there are tracked working changes.");
    test("It should return 'false' when there are no tracked or untracked working changes.");
  });

  describe("initialize", () => {
    test("It should initialize the value of _mainBranchName to the name of the main branch in the Git repository.");
  });

  describe("mergeBranch", () => {
    test("It should merge a branch into another.");
    test("It should throw an error if there is a merge conflict.");
  });

  describe("popStash", () => {
    test("It should be able to pop the latest stash.");
    test("It should throw an error if there is a merge conflict.");
    test("It should throw an error if there is no stash to pop.");
  });

  describe("pull", () => {
    test("It should be able to pull a branch.");
    test(MODE_LOCAL_NOTHING_HAPPENS);
    test("It should throw an error if tracking has not been configured.");
  });

  describe("push", () => {
    test("It should be able to push a branch.");
    test(MODE_LOCAL_NOTHING_HAPPENS);
    test("It should throw an error if tracking has not been configured.");
  });

  describe("pushTags", () => {
    test("It should be able to push all the local tags to the remote repository.");
    test(MODE_LOCAL_NOTHING_HAPPENS);
    test("Nothing should happen when a remote has not yet been configured.");
  });

  describe("setupTrackingAndPush", () => {
    test("It should be able to setup tracking and push a branch to the remote repository.");
    test("It should throw an error if there is no remote.");
    test(MODE_LOCAL_NOTHING_HAPPENS);
  });

  describe("stage", () => {
    test("It should be able to stage a file.");
    test("It should be able to stage a directory.");
  });

  describe("stash", () => {
    test("It should be able to stash the staged files in the Git repository.");
  });
});
