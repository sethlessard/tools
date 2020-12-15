import { assert, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { execSync } from "child_process";
import { existsSync, mkdirp, writeFileSync } from "fs-extra";
import { beforeEach, describe, test } from "mocha";
import * as path from "path";
import * as _ from "lodash";

import GitMode from "../../../../t00ls.common/data/models/GitMode";
import t00lsGitRepository from "../../../../t00ls.common/data/repositories/t00lsGitRepository";
import TestHelper from "../../../TestHelper";

// chai should use the 'chai-as-promised' library
use(chaiAsPromised);

const MODE_LOCAL_NOTHING_HAPPENS = "Nothing should happen and no errors should be thrown when the mode is set to 'Local'.";

const testHelper = TestHelper.getInstance();

const createAndStage = (fileName: string, fileContents: string) => {
  writeFileSync(fileName, fileContents, { encoding: "utf-8" });
  execSync(`git add ${fileName}`, { cwd: path.dirname(fileName) });
};

describe("t00ls.common/data/repositories/t00lsGitRepository", function () {
  this.timeout("15s");

  describe("checkoutBranch", () => {
    let repoPath = "";
    let git: t00lsGitRepository;
    beforeEach(async () => {
      repoPath = await testHelper.newTestRepository();
      git = new t00lsGitRepository(repoPath, GitMode.Normal);
      await git.initialize();
    });

    test("It should be able to switch branches.", async () => {
      execSync("git checkout -b branch-1", { cwd: repoPath });
      await assert.becomes(git.getCurrentBranch(), "branch-1");

      await assert.isFulfilled(git.checkoutBranch("main"));
      await assert.becomes(git.getCurrentBranch(), "main");

      await assert.isFulfilled(git.checkoutBranch("branch-1"));
      await assert.becomes(git.getCurrentBranch(), "branch-1");
    });

    test("It should be able to switch to a remote branch.", async () => {
      execSync("git checkout -b branch-1", { cwd: repoPath });
      execSync("git push -f -u origin branch-1", { cwd: repoPath });
      execSync("git checkout main", { cwd: repoPath });
      execSync("git branch -D branch-1", { cwd: repoPath });

      await assert.becomes(git.getCurrentBranch(), "main");
      await assert.isFulfilled(git.checkoutBranch("branch-1"));
      await assert.becomes(git.getCurrentBranch(), "branch-1");
    });

    test("It should throw an error if the branch does not exist.", async () => {
      await assert.isRejected(git.checkoutBranch("this-branch-does-not-exist"));
    });

    test("Nothing should happen when switching to the current branch.", async () => {
      execSync("git checkout main", { cwd: repoPath });
      await assert.isFulfilled(git.checkoutBranch("main"));
    });
  });

  describe("checkoutNewBranch", () => {
    let repoPath = "";
    let git: t00lsGitRepository;
    beforeEach(async () => {
      repoPath = await testHelper.newTestRepository();
      git = new t00lsGitRepository(repoPath, GitMode.Normal);
      await git.initialize();
    });

    test("It should be able to create a new local branch.", async () => {
      await assert.becomes(git.hasLocalBranch("branch-1"), false);
      await assert.isFulfilled(git.checkoutNewBranch("branch-1"));
      await assert.becomes(git.hasLocalBranch("branch-1"), true);
    });
    test("It should throw an error if the branch already exists.", async () => {
      execSync("git checkout -b branch-1", { cwd: repoPath });
      execSync("git checkout main", { cwd: repoPath });
      await assert.isRejected(git.checkoutNewBranch("branch-1"));
    });
  });

  describe("createProductionTag", () => {
    let repoPath = "";
    let git: t00lsGitRepository;
    beforeEach(async () => {
      repoPath = await testHelper.newTestRepository();
      git = new t00lsGitRepository(repoPath, GitMode.Normal);
      await git.initialize();
    });

    test("It should be able to create a production release tag.", async () => {
      execSync("git checkout -b v1.1.0-prep", { cwd: repoPath });

      let tags = await git.getAllTags();
      assert.strictEqual(tags.indexOf("v1.1.0"), -1);

      await assert.isFulfilled(git.createProductionTag());
      tags = await git.getAllTags();
      assert.notStrictEqual(tags.indexOf("v1.1.0"), -1);
    });

    test("It should throw an error if the current branch is not a production release branch", async () => {
      await assert.isRejected(git.createProductionTag());
    });

    test("It should throw an error if the tag has already been created.", async () => {
      execSync("git checkout -b v1.1.0-prep", { cwd: repoPath });
      execSync("git tag -a v1.1.0 -m 'v1.1.0'", { cwd: repoPath });

      await assert.isRejected(git.createProductionTag());
    });
  });

  describe("deleteBranch", () => {
    let repoPath = "";
    let git: t00lsGitRepository;
    beforeEach(async () => {
      repoPath = await testHelper.newTestRepository();
      git = new t00lsGitRepository(repoPath, GitMode.Normal);
      await git.initialize();
    });

    test("It should be able to delete a local branch.", async () => {
      execSync("git checkout -b branch-1", { cwd: repoPath });
      execSync("git checkout -b branch-2", { cwd: repoPath });
      execSync("git checkout main", { cwd: repoPath });

      await assert.becomes(git.hasLocalBranch("branch-1"), true);
      await assert.becomes(git.hasLocalBranch("branch-2"), true);
      await assert.isFulfilled(git.deleteBranch("branch-1"));
      await assert.isFulfilled(git.deleteBranch("branch-2"));
      await assert.becomes(git.hasLocalBranch("branch-1"), false);
      await assert.becomes(git.hasLocalBranch("branch-2"), false);
    });

    test("It should throw an error if the branch has not been merged into main.", async () => {
      execSync("git checkout -b branch-1", { cwd: repoPath });
      createAndStage(path.join(repoPath, "fileToCommit.txt"), "This file will be committed");
      execSync(`git commit -m "Changes..."`, { cwd: repoPath });
      execSync("git checkout main", { cwd: repoPath });

      await assert.isRejected(git.deleteBranch("branch-1"));
      // and the branch should still exist
      await assert.doesNotBecome(git.getAllLocalBranches().then(branches => _.find(branches, { name: "branch-1" })), undefined);
    });

    test("It should throw an error if the branch does not exist.", async () => {
      await assert.isRejected(git.deleteBranch("branch-1"));
      await assert.isRejected(git.deleteBranch("branch-2"));
      await assert.isRejected(git.deleteBranch("branch-3"));
      await assert.isRejected(git.deleteBranch("branch-4"));
    });
  });

  describe("deleteBranchForce", () => {
    let repoPath = "";
    let git: t00lsGitRepository;
    beforeEach(async () => {
      repoPath = await testHelper.newTestRepository();
      git = new t00lsGitRepository(repoPath, GitMode.Normal);
      await git.initialize();
    });

    test("It should be able to delete a local branch.", async () => {
      execSync("git checkout -b branch-1", { cwd: repoPath });
      execSync("git checkout -b branch-2", { cwd: repoPath });
      execSync("git checkout main", { cwd: repoPath });

      await assert.becomes(git.hasLocalBranch("branch-1"), true);
      await assert.becomes(git.hasLocalBranch("branch-2"), true);
      await assert.isFulfilled(git.deleteBranchForce("branch-1"));
      await assert.isFulfilled(git.deleteBranchForce("branch-2"));
      await assert.becomes(git.hasLocalBranch("branch-1"), false);
      await assert.becomes(git.hasLocalBranch("branch-2"), false);
    });

    test("It should be able to delete a local branch if the branch has not been merged into main.", async () => {
      execSync("git checkout -b branch-1", { cwd: repoPath });
      createAndStage(path.join(repoPath, "fileToCommit.txt"), "This file will be committed");
      execSync(`git commit -m "Changes..."`, { cwd: repoPath });
      execSync("git checkout main", { cwd: repoPath });

      await assert.isFulfilled(git.deleteBranchForce("branch-1"));
      // and the branch should be deleted
      await assert.becomes(git.getAllLocalBranches().then(branches => _.find(branches, { name: "branch-1" })), undefined);
    });

    test("It should throw an error if the branch does not exist.", async () => {
      await assert.isRejected(git.deleteBranchForce("branch-1"));
      await assert.isRejected(git.deleteBranchForce("branch-2"));
      await assert.isRejected(git.deleteBranchForce("branch-3"));
      await assert.isRejected(git.deleteBranchForce("branch-4"));
    });
  });

  describe("deleteRemoteBranch", () => {
    let repoPath = "";
    let git: t00lsGitRepository;
    let localGit: t00lsGitRepository;
    beforeEach(async () => {
      repoPath = await testHelper.newTestRepository();
      git = new t00lsGitRepository(repoPath, GitMode.Normal);
      await git.initialize();
      localGit = new t00lsGitRepository(repoPath, GitMode.Local);
      await localGit.initialize();
    });

    test("It should be able to delete a remote branch.", async () => {
      execSync("git checkout -b branch-1", { cwd: repoPath });
      execSync("git push -u origin branch-1", { cwd: repoPath });

      let remoteBranches = await git.getAllRemoteBranches();
      assert.isDefined(_.find(remoteBranches, { name: "branch-1" }));

      await assert.isFulfilled(git.deleteRemoteBranch("branch-1"));
      remoteBranches = await git.getAllRemoteBranches();
      assert.isUndefined(_.find(remoteBranches, { name: "branch-1" }));
    });

    test("It should throw an error if the branch does not exist.", async () => {
      await assert.isRejected(git.deleteRemoteBranch("branch-1"));
    });

    test(MODE_LOCAL_NOTHING_HAPPENS, async () => {
      execSync("git checkout -b branch-1", { cwd: repoPath });
      execSync("git push -u origin branch-1", { cwd: repoPath });

      let remoteBranches = await git.getAllRemoteBranches();
      assert.isDefined(_.find(remoteBranches, { name: "branch-1" }));

      await assert.isFulfilled(localGit.deleteRemoteBranch("branch-1"));
      remoteBranches = await git.getAllRemoteBranches();
      assert.isDefined(_.find(remoteBranches, { name: "branch-1" }));
    });
  });

  describe("deleteRemoteBranchForce", () => {
    let repoPath = "";
    let git: t00lsGitRepository;
    let localGit: t00lsGitRepository;
    beforeEach(async () => {
      repoPath = await testHelper.newTestRepository();
      git = new t00lsGitRepository(repoPath, GitMode.Normal);
      await git.initialize();
      localGit = new t00lsGitRepository(repoPath, GitMode.Local);
      await localGit.initialize();
    });

    test("It should be able to delete a remote branch.", async () => {
      execSync("git checkout -b branch-1", { cwd: repoPath });
      execSync("git push -u origin branch-1", { cwd: repoPath });

      let remoteBranches = await git.getAllRemoteBranches();
      assert.isDefined(_.find(remoteBranches, { name: "branch-1" }));

      await assert.isFulfilled(git.deleteRemoteBranchForce("branch-1"));
      remoteBranches = await git.getAllRemoteBranches();
      assert.isUndefined(_.find(remoteBranches, { name: "branch-1" }));
    });

    test("It should throw an error if the branch does not exist.", async () => {
      await assert.isRejected(git.deleteRemoteBranchForce("branch-1"));
    });

    test(MODE_LOCAL_NOTHING_HAPPENS, async () => {
      execSync("git checkout -b branch-1", { cwd: repoPath });
      execSync("git push -u origin branch-1", { cwd: repoPath });

      let remoteBranches = await git.getAllRemoteBranches();
      assert.isDefined(_.find(remoteBranches, { name: "branch-1" }));

      await assert.isFulfilled(localGit.deleteRemoteBranch("branch-1"));
      remoteBranches = await git.getAllRemoteBranches();
      assert.isDefined(_.find(remoteBranches, { name: "branch-1" }));
    });
  });

  describe("deleteTag", () => {
    let repoPath = "";
    let git: t00lsGitRepository;
    let localGit: t00lsGitRepository;
    beforeEach(async () => {
      repoPath = await testHelper.newTestRepository();
      git = new t00lsGitRepository(repoPath, GitMode.Normal);
      await git.initialize();
      localGit = new t00lsGitRepository(repoPath, GitMode.Local);
      await localGit.initialize();
    });

    test("It should be able to delete a tag both locally and remotely", async () => {
      execSync(`git tag -a tag1 -m "tag1"`, { cwd: repoPath });
      execSync("git push --tags", { cwd: repoPath });
      await assert.doesNotBecome(git.getAllTags().then(tags => tags.indexOf("tag1")), -1);

      await assert.isFulfilled(git.deleteTag("tag1"));
      await assert.becomes(git.getAllTags().then(tags => tags.indexOf("tag1")), -1);

      // do a fetch to make sure...
      execSync("git fetch -p", { cwd: repoPath });
      await assert.becomes(git.getAllTags().then(tags => tags.indexOf("tag1")), -1);
    });

    test("It should throw an error if the tag doesn't exist.", async () => {
      await assert.isRejected(git.deleteTag("tag-that-does-not-exist"));
    });

    test("It should not delete the remote tag when the mode is set to 'Local'.", async () => {
      execSync(`git tag -a tag1 -m "tag1"`, { cwd: repoPath });
      execSync("git push --tags", { cwd: repoPath });
      await assert.doesNotBecome(localGit.getAllTags().then(tags => tags.indexOf("tag1")), -1);

      await assert.isFulfilled(localGit.deleteTag("tag1"));
      await assert.becomes(localGit.getAllTags().then(tags => tags.indexOf("tag1")), -1);

      // but if we fetch the remote, we'll see the remote tag should still exist
      execSync("git fetch -p", { cwd: repoPath });
      await assert.doesNotBecome(localGit.getAllTags().then(tags => tags.indexOf("tag1")), -1);
    });
  });

  describe("deleteTags", () => {
    let repoPath = "";
    let git: t00lsGitRepository;
    let localGit: t00lsGitRepository;
    beforeEach(async () => {
      repoPath = await testHelper.newTestRepository();
      git = new t00lsGitRepository(repoPath, GitMode.Normal);
      await git.initialize();
      localGit = new t00lsGitRepository(repoPath, GitMode.Local);
      await localGit.initialize();
    });

    test("It should be able to delete tags both locally and remotely", async () => {
      execSync(`git tag -a tag1 -m "tag1"`, { cwd: repoPath });
      execSync(`git tag -a tag2 -m "tag2"`, { cwd: repoPath });
      execSync("git push --tags", { cwd: repoPath });
      await assert.doesNotBecome(git.getAllTags().then(tags => tags.indexOf("tag1")), -1);
      await assert.doesNotBecome(git.getAllTags().then(tags => tags.indexOf("tag2")), -1);

      await assert.isFulfilled(git.deleteTags(["tag1", "tag2"]));
      await assert.becomes(git.getAllTags().then(tags => tags.indexOf("tag1")), -1);
      await assert.becomes(git.getAllTags().then(tags => tags.indexOf("tag2")), -1);

      // do a fetch to make sure...
      execSync("git fetch -p", { cwd: repoPath });
      await assert.becomes(git.getAllTags().then(tags => tags.indexOf("tag1")), -1);
      await assert.becomes(git.getAllTags().then(tags => tags.indexOf("tag2")), -1);
    });

    test("It should throw an error if the tag doesn't exist.", async () => {
      await assert.isRejected(git.deleteTags(["tag-that-does-not-exist", "another-one"]));
    });

    test("It should not delete the remote tags when the mode is set to 'Local'.", async () => {
      execSync(`git tag -a tag1 -m "tag1"`, { cwd: repoPath });
      execSync(`git tag -a tag2 -m "tag2"`, { cwd: repoPath });
      execSync("git push --tags", { cwd: repoPath });
      await assert.doesNotBecome(localGit.getAllTags().then(tags => tags.indexOf("tag1")), -1);
      await assert.doesNotBecome(localGit.getAllTags().then(tags => tags.indexOf("tag2")), -1);

      await assert.isFulfilled(localGit.deleteTags(["tag1", "tag2"]));
      await assert.becomes(localGit.getAllTags().then(tags => tags.indexOf("tag1")), -1);
      await assert.becomes(localGit.getAllTags().then(tags => tags.indexOf("tag2")), -1);

      // but if we fetch the remote, we'll see the remote tag should still exist
      execSync("git fetch -p", { cwd: repoPath });
      await assert.doesNotBecome(localGit.getAllTags().then(tags => tags.indexOf("tag1")), -1);
      await assert.doesNotBecome(localGit.getAllTags().then(tags => tags.indexOf("tag2")), -1);
    });
  });

  describe("getAllBranches", () => {
    let repoPath = "";
    let git: t00lsGitRepository;
    let localGit: t00lsGitRepository;
    beforeEach(async () => {
      repoPath = await testHelper.newTestRepository();
      git = new t00lsGitRepository(repoPath, GitMode.Normal);
      await git.initialize();
      localGit = new t00lsGitRepository(repoPath, GitMode.Local);
      await localGit.initialize();
    });

    test("It should return an array of all branches in the repository, both local and remote.", async () => {
      execSync("git checkout -b branch-1", { cwd: repoPath });
      execSync("git push -u origin branch-1", { cwd: repoPath });
      execSync("git checkout -b branch-2", { cwd: repoPath });

      const branches = await git.getAllBranches();
      assert.isDefined(_.find(branches, { name: "main", remote: false }));
      assert.isDefined(_.find(branches, { name: "main", remote: true }));
      assert.isDefined(_.find(branches, { name: "branch-1", remote: false }));
      assert.isDefined(_.find(branches, { name: "branch-1", remote: true }));
      assert.isDefined(_.find(branches, { name: "branch-2", remote: false }));
      assert.isUndefined(_.find(branches, { name: "branch-2", remote: true }));
    });

    test("It should return an array of all local branches in the repository when the mode is set to 'Local'.", async () => {
      execSync("git checkout -b branch-1", { cwd: repoPath });
      execSync("git push -u origin branch-1", { cwd: repoPath });
      execSync("git checkout -b branch-2", { cwd: repoPath });

      const branches = await localGit.getAllBranches();
      assert.isDefined(_.find(branches, { name: "main", remote: false }));
      assert.isUndefined(_.find(branches, { name: "main", remote: true }));
      assert.isDefined(_.find(branches, { name: "branch-1", remote: false }));
      assert.isUndefined(_.find(branches, { name: "branch-1", remote: true }));
      assert.isDefined(_.find(branches, { name: "branch-2", remote: false }));
      assert.isUndefined(_.find(branches, { name: "branch-2", remote: true }));
    });
  });

  describe("getAllBranchesFavorLocal", () => {
    let repoPath = "";
    let git: t00lsGitRepository;
    let localGit: t00lsGitRepository;
    beforeEach(async () => {
      repoPath = await testHelper.newTestRepository();
      git = new t00lsGitRepository(repoPath, GitMode.Normal);
      await git.initialize();
      localGit = new t00lsGitRepository(repoPath, GitMode.Local);
      await localGit.initialize();
    });

    test("It should return an array of all branches in the repository, only returning an entry for the local branch if both a local and remote branch exist.", async () => {
      execSync("git checkout -b branch-1", { cwd: repoPath });
      execSync("git push -u origin branch-1", { cwd: repoPath });
      execSync("git checkout -b branch-2", { cwd: repoPath });
      execSync("git push -u origin branch-2", { cwd: repoPath });
      execSync("git checkout -b branch-3", { cwd: repoPath });
      execSync("git push -u origin branch-3", { cwd: repoPath });
      execSync("git checkout main", { cwd: repoPath });
      execSync("git branch -d branch-3", { cwd: repoPath });

      const branches = await git.getAllBranchesFavorLocal();
      assert.isNotEmpty(branches);

      // local 'main', 'branch-1', 'branch-2' should exist
      assert.isDefined(_.find(branches, { name: "main", remote: false }));
      assert.isDefined(_.find(branches, { name: "branch-1", remote: false }));
      assert.isDefined(_.find(branches, { name: "branch-2", remote: false }));

      // remote 'branch-3' should exist
      assert.isDefined(_.find(branches, { name: "branch-3", remote: true }));

      //remote conterparts should not exist
      assert.isUndefined(_.find(branches, { name: "main", remote: true }));
      assert.isUndefined(_.find(branches, { name: "branch-1", remote: true }));
      assert.isUndefined(_.find(branches, { name: "branch-2", remote: true }));
      assert.isUndefined(_.find(branches, { name: "branch-3", remote: false }));
    });

    test("It should return an array of all local branches in the repository when the mode is set to 'Local'.", async () => {
      execSync("git checkout -b branch-1", { cwd: repoPath });
      execSync("git push -u origin branch-1", { cwd: repoPath });
      execSync("git checkout -b branch-2", { cwd: repoPath });
      execSync("git push -u origin branch-2", { cwd: repoPath });
      execSync("git checkout -b branch-3", { cwd: repoPath });
      execSync("git push -u origin branch-3", { cwd: repoPath });
      execSync("git checkout main", { cwd: repoPath });

      const branches = await localGit.getAllBranchesFavorLocal();
      assert.isNotEmpty(branches);

      // local 'main', 'branch-1', 'branch-2', and 'branch-3' should exist
      assert.isDefined(_.find(branches, { name: "main", remote: false }));
      assert.isDefined(_.find(branches, { name: "branch-1", remote: false }));
      assert.isDefined(_.find(branches, { name: "branch-2", remote: false }));
      assert.isDefined(_.find(branches, { name: "branch-3", remote: false }));

      // but no remote branches should be returned
      assert.isUndefined(_.find(branches, { remote: true }));
    });
  });

  describe("getAllFeatureBranches", () => {
    let repoPath = "";
    let git: t00lsGitRepository;
    let localGit: t00lsGitRepository;
    beforeEach(async () => {
      repoPath = await testHelper.newTestRepository();
      git = new t00lsGitRepository(repoPath, GitMode.Normal);
      await git.initialize();
      localGit = new t00lsGitRepository(repoPath, GitMode.Local);
      await localGit.initialize();
    });

    test("It should return an array of all feature branches in the repository, both local and remote.", async () => {
      execSync("git checkout -b feature-1", { cwd: repoPath });
      execSync("git push -u origin feature-1", { cwd: repoPath });
      execSync("git checkout -b feature-2", { cwd: repoPath });
      execSync("git push -u origin feature-2", { cwd: repoPath });
      execSync("git checkout -b feature-3", { cwd: repoPath });

      const branches = await git.getAllFeatureBranches();
      assert.isDefined(_.find(branches, { name: "feature-1", remote: false }));
      assert.isDefined(_.find(branches, { name: "feature-1", remote: true }));
      assert.isDefined(_.find(branches, { name: "feature-2", remote: false }));
      assert.isDefined(_.find(branches, { name: "feature-2", remote: true }));
      assert.isDefined(_.find(branches, { name: "feature-3", remote: false }));

      // 'feature-3' shouldn't have a remote counterpart
      assert.isUndefined(_.find(branches, { name: "feature-3", remote: true }));
    });

    test("It should return an empty array when there are no feature branches in the repository.", async () => {
      await assert.becomes(git.getAllFeatureBranches(), []);
    });

    test("It should return an array of all local feature branches in the repository when the mode is set to 'Local'.", async () => {
      execSync("git checkout -b feature-1", { cwd: repoPath });
      execSync("git push -u origin feature-1", { cwd: repoPath });
      execSync("git checkout -b feature-2", { cwd: repoPath });
      execSync("git push -u origin feature-2", { cwd: repoPath });
      execSync("git checkout -b feature-3", { cwd: repoPath });

      const branches = await localGit.getAllFeatureBranches();
      assert.isDefined(_.find(branches, { name: "feature-1", remote: false }));
      assert.isDefined(_.find(branches, { name: "feature-2", remote: false }));
      assert.isDefined(_.find(branches, { name: "feature-3", remote: false }));

      // there should be no remote branches
      assert.isUndefined(_.find(branches, { remote: true }));
    });
  });

  describe("getAllFeatureBranchesFavorLocal", () => {
    let repoPath = "";
    let git: t00lsGitRepository;
    let localGit: t00lsGitRepository;
    beforeEach(async () => {
      repoPath = await testHelper.newTestRepository();
      git = new t00lsGitRepository(repoPath, GitMode.Normal);
      await git.initialize();
      localGit = new t00lsGitRepository(repoPath, GitMode.Local);
      await localGit.initialize();
    });

    test("It should return an array of all feature branches in the repository, only returning an entry for the local branch if both a local and remote branch exist.", async () => {
      execSync("git checkout -b feature-1", { cwd: repoPath });
      execSync("git push -u origin feature-1", { cwd: repoPath });
      execSync("git checkout -b feature-2", { cwd: repoPath });
      execSync("git push -u origin feature-2", { cwd: repoPath });
      execSync("git checkout -b feature-3", { cwd: repoPath });
      execSync("git push -u origin feature-3", { cwd: repoPath });
      execSync("git checkout main", { cwd: repoPath });
      execSync("git branch -d feature-3", { cwd: repoPath });

      const branches = await git.getAllFeatureBranchesFavorLocal();
      assert.isNotEmpty(branches);

      // local 'feature-1' and 'feature-2' should exist
      assert.isDefined(_.find(branches, { name: "feature-1", remote: false }));
      assert.isDefined(_.find(branches, { name: "feature-2", remote: false }));

      // local 'feature-3' should not exist
      assert.isUndefined(_.find(branches, { name: "feature-3", remote: false }));

      // remote 'feature-3' should exist
      assert.isDefined(_.find(branches, { name: "feature-3", remote: true }));

      //remote 'feature-1' and 'feature-2' should not exist
      assert.isUndefined(_.find(branches, { name: "feature-1", remote: true }));
      assert.isUndefined(_.find(branches, { name: "feature-2", remote: true }));
    });

    test("It should return an empty array when there are no feature branches in the repository.", async () => {
      await assert.becomes(git.getAllLocalFeatureBranches(), []);
    });

    test("It should return an array of all local feature branches in the repository when the mode is set to 'Local'.", async () => {
      execSync("git checkout -b feature-1", { cwd: repoPath });
      execSync("git push -u origin feature-1", { cwd: repoPath });
      execSync("git checkout -b feature-2", { cwd: repoPath });
      execSync("git push -u origin feature-2", { cwd: repoPath });
      execSync("git checkout -b feature-3", { cwd: repoPath });
      execSync("git push -u origin feature-3", { cwd: repoPath });

      const branches = await localGit.getAllFeatureBranchesFavorLocal();
      assert.isNotEmpty(branches);

      // local 'feature-1', 'feature-2', and 'feature-3' should exist
      assert.isDefined(_.find(branches, { name: "feature-1", remote: false }));
      assert.isDefined(_.find(branches, { name: "feature-2", remote: false }));
      assert.isDefined(_.find(branches, { name: "feature-3", remote: false }));

      // remote feature branches should not exist
      assert.isUndefined(_.find(branches, { remote: true }));
    });
  });

  describe("getAllLocalBranches", () => {
    let repoPath = "";
    let git: t00lsGitRepository;
    beforeEach(async () => {
      repoPath = await testHelper.newTestRepository();
      git = new t00lsGitRepository(repoPath, GitMode.Normal);
      await git.initialize();
    });

    test("It should return an array of all local branches in the repository.", async () => {
      execSync("git checkout -b branch-1", { cwd: repoPath });
      execSync("git checkout -b branch-2", { cwd: repoPath });
      execSync("git checkout -b branch-3", { cwd: repoPath });

      const branches = await git.getAllLocalBranches();
      assert.isDefined(_.find(branches, { name: "branch-1", remote: false }));
      assert.isDefined(_.find(branches, { name: "branch-2", remote: false }));
      assert.isDefined(_.find(branches, { name: "branch-3", remote: false }));

      // no remote branches should be returned
      assert.isUndefined(_.find(branches, { remote: true }));
    });
  });

  describe("getAllLocalFeatureBranches", () => {
    let repoPath = "";
    let git: t00lsGitRepository;
    beforeEach(async () => {
      repoPath = await testHelper.newTestRepository();
      git = new t00lsGitRepository(repoPath, GitMode.Normal);
      await git.initialize();
    });

    test("It should return an array of all local feature branches in the repository.", async () => {
      execSync("git checkout -b feature-1", { cwd: repoPath });
      execSync("git checkout -b feature-2", { cwd: repoPath });
      execSync("git checkout -b feature-3", { cwd: repoPath });

      const branches = await git.getAllLocalFeatureBranches();
      assert.isDefined(_.find(branches, { name: "feature-1" }));
      assert.isDefined(_.find(branches, { name: "feature-2" }));
      assert.isDefined(_.find(branches, { name: "feature-3" }));

      // no remote entries should exist
      assert.isUndefined(_.find(branches, { remote: true }));
    });

    test("It should return an empty array if the repository doesn't contain local feature branches.", async () => {
      await assert.becomes(git.getAllLocalFeatureBranches(), []);
    });
  });

  describe("getAllLocalProductionReleaseBranches", () => {
    let repoPath = "";
    let git: t00lsGitRepository;
    beforeEach(async () => {
      repoPath = await testHelper.newTestRepository();
      git = new t00lsGitRepository(repoPath, GitMode.Normal);
      await git.initialize();
    });

    test("It should return an array of all local production release branches in the repository.", async () => {
      execSync("git checkout -b v1.0.0-prep", { cwd: repoPath });
      execSync("git push -u origin v1.0.0-prep", { cwd: repoPath });
      execSync("git checkout -b test-project-v1.2.3-prep", { cwd: repoPath });
      execSync("git push -u origin test-project-v1.2.3-prep", { cwd: repoPath });
      execSync("git checkout -b v1.1.1-prep", { cwd: repoPath });
      execSync("git push -u origin v1.1.1-prep", { cwd: repoPath });

      const branches = await git.getAllLocalProductionReleaseBranches();
      assert.isDefined(_.find(branches, { name: "v1.0.0-prep" }));
      assert.isDefined(_.find(branches, { name: "test-project-v1.2.3-prep" }));
      assert.isDefined(_.find(branches, { name: "v1.1.1-prep" }));

      // no remote entries should exist
      assert.isUndefined(_.find(branches, { remote: true }));
    });

    test("It should return an empty array if the repository doesn't contain local production release branches.", async () => {
      await assert.becomes(git.getAllLocalProductionReleaseBranches(), []);
    });
  });

  describe("getAllProductionReleaseBranches", () => {
    let repoPath = "";
    let git: t00lsGitRepository;
    let localGit: t00lsGitRepository;
    beforeEach(async () => {
      repoPath = await testHelper.newTestRepository();
      git = new t00lsGitRepository(repoPath, GitMode.Normal);
      await git.initialize();
      localGit = new t00lsGitRepository(repoPath, GitMode.Local);
      await localGit.initialize();
    });

    test("It should return an array of all production release branches in the repository, both local and remote.", async () => {
      execSync("git checkout -b v1.0.0-prep", { cwd: repoPath });
      execSync("git push -u origin v1.0.0-prep", { cwd: repoPath });
      execSync("git checkout -b test-project-v1.2.3-prep", { cwd: repoPath });
      execSync("git push -u origin test-project-v1.2.3-prep", { cwd: repoPath });
      execSync("git checkout -b v1.1.1-prep", { cwd: repoPath });

      const branches = await git.getAllProductionReleaseBranches();
      assert.isDefined(_.find(branches, { name: "v1.0.0-prep", remote: false }));
      assert.isDefined(_.find(branches, { name: "v1.0.0-prep", remote: true }));
      assert.isDefined(_.find(branches, { name: "test-project-v1.2.3-prep", remote: false }));
      assert.isDefined(_.find(branches, { name: "test-project-v1.2.3-prep", remote: true }));
      assert.isDefined(_.find(branches, { name: "v1.1.1-prep", remote: false }));
      assert.isUndefined(_.find(branches, { name: "v1.1.1-prep", remote: true }));
    });

    test("It should return an empty array if the repository doesn't contain production release branches.", async () => {
      await assert.becomes(git.getAllProductionReleaseBranches(), []);
    });

    test("It should return an array of all local production release branches in the repository when the mode is set to 'Local'.", async () => {
      execSync("git checkout -b v1.0.0-prep", { cwd: repoPath });
      execSync("git push -u origin v1.0.0-prep", { cwd: repoPath });
      execSync("git checkout -b test-project-v1.2.3-prep", { cwd: repoPath });
      execSync("git push -u origin test-project-v1.2.3-prep", { cwd: repoPath });
      execSync("git checkout -b v1.1.1-prep", { cwd: repoPath });

      const branches = await localGit.getAllProductionReleaseBranches();
      assert.isDefined(_.find(branches, { name: "v1.0.0-prep", remote: false }));
      assert.isDefined(_.find(branches, { name: "test-project-v1.2.3-prep", remote: false }));
      assert.isDefined(_.find(branches, { name: "v1.1.1-prep", remote: false }));

      // there should be no remote branches
      assert.isUndefined(_.find(branches, { remote: true }));
    });
  });

  describe("getAllProductionReleaseBranchesFavorLocal", () => {
    let repoPath = "";
    let git: t00lsGitRepository;
    beforeEach(async () => {
      repoPath = await testHelper.newTestRepository();
      git = new t00lsGitRepository(repoPath, GitMode.Normal);
      await git.initialize();
    });

    test("It should return an array of all production release branches in the repository, only returning an entry for the local branch if both a local and remote branch exist.");

    test("It should return an empty array when there are no production release branches in the repository.", async () => {
      await assert.becomes(git.getAllProductionReleaseBranchesFavorLocal(), []);
    });

    test("It should return an array of all local production release branches in the repository when the mode is set to 'Local'.");
  });

  describe("getAllRemoteBranches", () => {
    let repoPath = "";
    let git: t00lsGitRepository;
    let localGit: t00lsGitRepository;
    beforeEach(async () => {
      repoPath = await testHelper.newTestRepository();
      git = new t00lsGitRepository(repoPath, GitMode.Normal);
      await git.initialize();
      localGit = new t00lsGitRepository(repoPath, GitMode.Local);
      await localGit.initialize();
    });

    test("It should return an array of all remote branches in the repository.");

    test("It should return an empty array when there are no remote branches in the repository.", async () => {
      execSync("git push origin --delete main", { cwd: repoPath });
      await assert.becomes(git.getAllRemoteBranches(), []);
    });

    test("It should return an empty array when the mode is set to 'Local'.", async () => {
      execSync("git checkout -b branch-1", { cwd: repoPath });
      execSync("git push -u origin branch-1", { cwd: repoPath });
      execSync("git checkout -b branch-2", { cwd: repoPath });
      execSync("git push -u origin branch-2", { cwd: repoPath });
      await assert.becomes(localGit.getAllRemoteBranches(), []);
    });
  });

  describe("getAllRemoteFeatureBranches", () => {
    let repoPath = "";
    let git: t00lsGitRepository;
    let localGit: t00lsGitRepository;
    beforeEach(async () => {
      repoPath = await testHelper.newTestRepository();
      git = new t00lsGitRepository(repoPath, GitMode.Normal);
      await git.initialize();
      localGit = new t00lsGitRepository(repoPath, GitMode.Local);
      await localGit.initialize();
    });

    test("It should return an array of all remote feature branches in the repository.");

    test("It should return an empty array when there are no remote feature branches in the repository.", async () => {
      await assert.becomes(git.getAllRemoteFeatureBranches(), []);
    });

    test("It should return an empty array when the mode is set to 'Local'.", async () => {
      execSync("git checkout -b feature-1", { cwd: repoPath });
      execSync("git push -u origin feature-1", { cwd: repoPath });
      execSync("git checkout -b feature-2", { cwd: repoPath });
      execSync("git push -u origin feature-2", { cwd: repoPath });
      await assert.becomes(localGit.getAllRemoteFeatureBranches(), []);
    });
  });

  describe("getAllRemoteProductionReleaseBranches", () => {
    let repoPath = "";
    let git: t00lsGitRepository;
    let localGit: t00lsGitRepository;
    beforeEach(async () => {
      repoPath = await testHelper.newTestRepository();
      git = new t00lsGitRepository(repoPath, GitMode.Normal);
      await git.initialize();
      localGit = new t00lsGitRepository(repoPath, GitMode.Local);
      await localGit.initialize();
    });

    test("It should return an array of all remote production release branches in the repository.", async () => {
      execSync("git checkout -b v1.1.1-prep", { cwd: repoPath });
      execSync("git push -u origin v1.1.1-prep", { cwd: repoPath });
      execSync("git checkout -b test-project-v1.2.3-prep", { cwd: repoPath });
      execSync("git push -u origin test-project-v1.2.3-prep", { cwd: repoPath });
      const branches = await git.getAllRemoteProductionReleaseBranches();
      assert.isDefined(_.find(branches, { name: "v1.1.1-prep" }));
      assert.isDefined(_.find(branches, { name: "test-project-v1.2.3-prep" }));
      
      // there should be no local entries
      assert.isUndefined(_.find(branches, { remote: false }));
    });

    test("It should return an empty array when there are no remote feature branches in the repository.", async () => {
      await assert.becomes(git.getAllRemoteProductionReleaseBranches(), []);
    });

    test("It should return an empty array when the mode is set to 'Local'.", async () => {
      execSync("git checkout -b v1.1.1-prep", { cwd: repoPath });
      execSync("git push -u origin v1.1.1-prep", { cwd: repoPath });
      execSync("git checkout -b test-project-v1.2.3", { cwd: repoPath });
      execSync("git push -u origin test-project-v1.2.3", { cwd: repoPath });
      await assert.becomes(localGit.getAllRemoteProductionReleaseBranches(), []);
    });
  });

  describe("getAllRemotes", () => {
    let repoPath = "";
    let git: t00lsGitRepository;
    let localGit: t00lsGitRepository;
    beforeEach(async () => {
      repoPath = await testHelper.newTestRepository();
      git = new t00lsGitRepository(repoPath, GitMode.Normal);
      await git.initialize();
      localGit = new t00lsGitRepository(repoPath, GitMode.Local);
      await localGit.initialize();
    });

    test("It should return an array of all remotes in the repository.", async () => {
      await assert.becomes(git.getAllRemotes(), ["origin"]);

      execSync("git remote add upstream http://localhost:3000/anotherrepo", { cwd: repoPath });
      const remotes = await git.getAllRemotes();
      assert.notStrictEqual(remotes.indexOf("origin"), -1);
      assert.notStrictEqual(remotes.indexOf("upstream"), -1);
    });

    test("It should return an empty array if a remote has not yet been configured.", async () => {
      execSync("git remote remove origin", { cwd: repoPath });
      await assert.becomes(git.getAllRemotes(), []);
    });

    test("It should return an empty array when the mode is set to 'Local'.", async () => {
      await assert.becomes(localGit.getAllRemotes(), []);
    });
  });

  describe("getAllTags", () => {
    let repoPath = "";
    let git: t00lsGitRepository;
    beforeEach(async () => {
      repoPath = await testHelper.newTestRepository();
      git = new t00lsGitRepository(repoPath, GitMode.Normal);
      await git.initialize();
    });

    test("It should return an array of all the tags in the local repository.", async () => {
      execSync(`git tag -a tag1 -m "tag1"`, { cwd: repoPath });
      execSync(`git tag -a tag2 -m "tag2"`, { cwd: repoPath });
      execSync(`git tag -a tag3 -m "tag3"`, { cwd: repoPath });

      const tags = await git.getAllTags();
      assert.notStrictEqual(tags.indexOf("tag1"), -1);
      assert.notStrictEqual(tags.indexOf("tag2"), -1);
      assert.notStrictEqual(tags.indexOf("tag3"), -1);
    });

    test("It should return an empty array if there are no tags.", async () => {
      await assert.becomes(git.getAllTags(), []);
    });
  });

  describe("getCurrentBranch", () => {
    let repoPath = "";
    let git: t00lsGitRepository;
    beforeEach(async () => {
      repoPath = await testHelper.newTestRepository();
      git = new t00lsGitRepository(repoPath, GitMode.Normal);
      await git.initialize();
    });

    test("It should return the name of the current branch.", async () => {
      assert.strictEqual(await git.getCurrentBranch(), "main");

      execSync("git checkout -b branch-1", { cwd: repoPath });
      assert.strictEqual(await git.getCurrentBranch(), "branch-1");

      execSync("git checkout -b branch-2", { cwd: repoPath });
      assert.strictEqual(await git.getCurrentBranch(), "branch-2");

      execSync("git checkout -b branch-3", { cwd: repoPath });
      assert.strictEqual(await git.getCurrentBranch(), "branch-3");
    });
  });

  describe("getNumberOfCommitsAheadOfBranch", () => {
    // TODO
  });

  describe("getRepositoryDirectory", () => {
    let repoPath = "";
    let git: t00lsGitRepository;
    beforeEach(async () => {
      repoPath = await testHelper.newTestRepository();
      git = new t00lsGitRepository(repoPath, GitMode.Normal);
      await git.initialize();
    });

    test("It should return the root directory of the Git repository on the local disk.", async () => {
      await assert.becomes(git.getRepositoryDirectory(), repoPath);
    });

    test("It should always return the root directory of the Git repository.", async () => {
      // it should return the base directory even if the PWD is a subdirectory of the repository
      mkdirp(path.join(repoPath, "subdirectory"));
      assert.isTrue(existsSync(path.join(repoPath, "subdirectory")));
      git = new t00lsGitRepository(path.join(repoPath, "subdirectory"), GitMode.Local);
      await git.initialize();
      await assert.becomes(git.getRepositoryDirectory(), repoPath);
    });
  });

  describe("hasLocalBranch", () => {
    let repoPath = "";
    let git: t00lsGitRepository;
    beforeEach(async () => {
      repoPath = await testHelper.newTestRepository();
      git = new t00lsGitRepository(repoPath, GitMode.Normal);
      await git.initialize();
    });

    test("It should return 'true' when a branch exists locally.", async () => {
      execSync("git checkout -b branch-1", { cwd: repoPath });
      execSync("git checkout -b branch-2", { cwd: repoPath });
      execSync("git checkout -b branch-3", { cwd: repoPath });
      execSync("git checkout -b branch-4", { cwd: repoPath });

      await assert.becomes(git.hasLocalBranch("main"), true);
      await assert.becomes(git.hasLocalBranch("branch-1"), true);
      await assert.becomes(git.hasLocalBranch("branch-2"), true);
      await assert.becomes(git.hasLocalBranch("branch-3"), true);
      await assert.becomes(git.hasLocalBranch("branch-4"), true);
    });

    test("It should return 'false' when a branch does not exist locally.", async () => {
      await assert.becomes(git.hasLocalBranch("branch-1"), false);
      await assert.becomes(git.hasLocalBranch("branch-2"), false);
      await assert.becomes(git.hasLocalBranch("branch-3"), false);
      await assert.becomes(git.hasLocalBranch("branch-4"), false);
    });
  });

  describe("hasRemote", () => {
    let repoPath = "";
    let git: t00lsGitRepository;
    let localGit: t00lsGitRepository;
    beforeEach(async () => {
      repoPath = await testHelper.newTestRepository();
      git = new t00lsGitRepository(repoPath, GitMode.Normal);
      await git.initialize();
      localGit = new t00lsGitRepository(repoPath, GitMode.Local);
      await localGit.initialize();
    });

    test("It should return 'true' if a remote has been configured.", async () => {
      await assert.becomes(git.hasRemote(), true);
    });

    test("It should return 'false' if a remote has not been configured.", async () => {
      execSync("git remote remove origin", { cwd: repoPath });
      await assert.becomes(git.hasRemote(), false);
    });

    test("It should return 'false' when the mode is set to 'Local'.", async () => {
      await assert.becomes(localGit.hasRemote(), false);
    });
  });

  describe("hasRemoteBranch", () => {
    let repoPath = "";
    let git: t00lsGitRepository;
    let localGit: t00lsGitRepository;
    beforeEach(async () => {
      repoPath = await testHelper.newTestRepository();
      git = new t00lsGitRepository(repoPath, GitMode.Normal);
      await git.initialize();
      localGit = new t00lsGitRepository(repoPath, GitMode.Local);
      await localGit.initialize();
    });

    test("It should return 'true' when a branch exists remotely.", async () => {
      execSync("git checkout -b branch-1", { cwd: repoPath });
      execSync("git push -u origin branch-1", { cwd: repoPath });
      execSync("git checkout -b branch-2", { cwd: repoPath });
      execSync("git push -u origin branch-2", { cwd: repoPath });

      await assert.becomes(git.hasRemoteBranch("main"), true);
      await assert.becomes(git.hasRemoteBranch("branch-1"), true);
      await assert.becomes(git.hasRemoteBranch("branch-1"), true);
    });
    test("It should return 'false' when a branch does not exist remotely.", async () => {
      await assert.becomes(git.hasRemoteBranch("branch-1"), false);
      await assert.becomes(git.hasRemoteBranch("branch-1"), false);
    });

    test("It should return 'false' when the mode is set to 'Local'.", async () => {
      execSync("git checkout -b branch-1", { cwd: repoPath });
      execSync("git push -u origin branch-1", { cwd: repoPath });
      execSync("git checkout -b branch-2", { cwd: repoPath });
      execSync("git push -u origin branch-2", { cwd: repoPath });

      await assert.becomes(localGit.hasRemoteBranch("main"), false);
      await assert.becomes(localGit.hasRemoteBranch("branch-1"), false);
      await assert.becomes(localGit.hasRemoteBranch("branch-1"), false);
    });
  });

  describe("hasWorkingChanges", () => {
    let repoPath = "";
    let git: t00lsGitRepository;
    beforeEach(async () => {
      repoPath = await testHelper.newTestRepository();
      git = new t00lsGitRepository(repoPath, GitMode.Normal);
      await git.initialize();
    });

    test("It should return 'true' when there are untracked working changes.", async () => {
      writeFileSync(path.join(repoPath, "untrackedChanges.txt"), "This is an untracked change", { encoding: "utf-8" });

      await assert.becomes(git.hasWorkingChanges(), true);
    });

    test("It should return 'true' when there are tracked working changes.", async () => {
      createAndStage(path.join(repoPath, "trackedChanges.txt"), "This is a tracked change");

      await assert.becomes(git.hasWorkingChanges(), true);
    });

    test("It should return 'false' when there are no tracked or untracked working changes.", async () => {
      await assert.becomes(git.hasWorkingChanges(), false);
    });
  });

  describe("initialize", () => {
    let repoPath = "";
    let git: t00lsGitRepository;
    beforeEach(async () => {
      repoPath = await testHelper.newTestRepository();
      git = new t00lsGitRepository(repoPath, GitMode.Normal);
      await git.initialize();
    });

    test("It should initialize without error.", async () => {
      await assert.isFulfilled(git.initialize());
    });
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
