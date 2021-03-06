import { exec, execSync } from "child_process";
import { promisify } from "util";
import * as _ from "lodash";
import { t00lsMode } from "./StatusBarManager";
import NeedsAsyncInitialization from "../types/NeedsAsyncInitialization";
const pExec = promisify(exec);

const REGEX_SHOW_BRANCH = /\*?\s*\[(.*)\]\s+(.*)/;
const REGEX_PRODUCTION_RELEASE = /((.*)-)?v(\d+\.\d+\.\d+)-prep/;

export type Branch = {
  name: string,
  lastCommitMessage: string,
  remote: boolean,
  origin?: string
};

export interface ExecOutput {
  stdout: string;
  stderr: string;
};

const EMPTY_EXEC_OUT: ExecOutput = { stdout: "", stderr: "" };


class Git implements NeedsAsyncInitialization {

  private readonly _path: string;
  private readonly _mode: t00lsMode;
  private _mainBranchName?: string;

  /**
   * Create a new Git instance.
   * @param repoPath the path to the Git repository.
   * @param mode the Git mode to use. Local or Normal.
   */
  constructor(repoPath: string, mode: t00lsMode) {
    if (!repoPath) { throw new Error("repoPath must be specified."); }
    this._path = repoPath;
    this._mode = mode;
    this._testRepo();
  }

  /**
   * Checkout a branch.
   * @param branch the branch to checkout.
   */
  checkoutBranch(branch: string): Promise<ExecOutput> {
    return this._inDir(`git checkout ${branch}`);
  }

  /**
   * Create a new branch.
   * @param branch the new branch to checkout.
   */
  checkoutNewBranch(branch: string): Promise<ExecOutput> {
    return this._inDir(`git checkout -b ${branch}`);
  }

  /**
   * Create a production tag for the current version.
   * @param message the message to use when creating the tag.
   */
  createProductionTag(message?: string): Promise<ExecOutput> {
    return this.getCurrentBranch()
      .then(branch => {
        if (!REGEX_PRODUCTION_RELEASE.test(branch)) {
          throw new Error(`'${branch}' is not a production release branch.`);
        }
        const matches = branch.match(REGEX_PRODUCTION_RELEASE);
        const projectPrefix = matches!![2];
        const version = matches!![3];
        const prodTag = (projectPrefix) ? `${projectPrefix}-v${version}` : `v${version}`;
        if (!message) {
          message = (projectPrefix) ? `${projectPrefix} v${version}` : `v${version}`;
        }
        return this.getAllTags()
          .then(tags => {
            if (tags.indexOf(prodTag) !== -1) {
              throw new Error(`'${prodTag}' has already been created.`);
            }
            return this._inDir(`git tag -a ${prodTag} -m "${message}"`);
          });
      });
  }

  /**
   * Create a release candidate tag for the current version.
   * @param message the message to use when creating the tag.
   */
  createReleaseCandidateTag(message?: string): Promise<ExecOutput> {
    return this.getCurrentBranch()
      .then(branch => {
        if (!REGEX_PRODUCTION_RELEASE.test(branch)) {
          throw new Error(`'${branch}' is not a production release branch.`);
        }
        const matches = branch.match(REGEX_PRODUCTION_RELEASE);
        const projectPrefix = matches!![2];
        const version = matches!![3];
        const rcTag = (projectPrefix) ? `${projectPrefix}-v${version}-rc` : `v${version}-rc`;
        if (!message) {
          message = (projectPrefix) ? `${projectPrefix} v${version}` : `v${version}`;
        }
        return this.getAllTags()
          .then(tags => {
            if (tags.indexOf(rcTag) !== -1) {
              throw new Error(`'${rcTag}' has already been created.`);
            }
            return this._inDir(`git tag -a ${rcTag} -m "${message}"`);
          });
      });
  }

  /**
   * Delete a local branch -d
   * @param branch the branch to delete.
   */
  deleteBranch(branch: string): Promise<ExecOutput> {
    return this._inDir(`git branch -d ${branch}`);
  }

  /**
   * Delete a local branch -D
   * @param branch the branch to delete.
   */
  deleteBranchForce(branch: string): Promise<ExecOutput> {
    return this._inDir(`git branch -D ${branch}`);
  }

  /**
   * Delete a remote branch.
   * @param branch the branch to delete.
   */
  deleteRemoteBranch(branch: string, origin: string = "origin"): Promise<ExecOutput> {
    if (this._mode === t00lsMode.Local) { Promise.resolve(EMPTY_EXEC_OUT); }

    return this.hasRemote()
      .then(hasRemote => {
        if (hasRemote) {
          return this._inDir(`git push ${origin} --delete ${branch}`);
        }
        return EMPTY_EXEC_OUT;
      });
  }

  /**
   * Delete a remote branch with force.
   * @param branch the branch to delete.
   */
  deleteRemoteBranchForce(branch: string, origin: string = "origin"): Promise<ExecOutput> {
    if (this._mode === t00lsMode.Local) { Promise.resolve(EMPTY_EXEC_OUT); }

    return this.hasRemote()
      .then(hasRemote => {
        if (hasRemote) {
          return this._inDir(`git push ${origin} --force --delete ${branch}`);
        }
        return EMPTY_EXEC_OUT;
      });
  }

  /**
   * Delete a tag locally and remotely.
   * @param tag the tag.
   * @param remote the remote to delete the tag from.
   */
  deleteTag(tag: string, remote: string = "origin"): Promise<ExecOutput> {
    return this._inDir(`git tag -d ${tag}`)
      .then(() => this.hasRemote().then(hasRemote => (hasRemote) ? this._inDir(`git push ${remote} :refs/tags/${tag}`) : EMPTY_EXEC_OUT));
  }

  /**
   * Delete a set of tags locally and remotely.
   * @param tags the tags to delete.
   * @param remote the remote to use. Default is "origin"
   */
  deleteTags(tags: string[], remote: string = "origin"): Promise<ExecOutput[]> {
    return this._inDir(`git tag -d ${tags.join(" ")}`)
      .then(() => Promise.all(tags.map(t => this.hasRemote().then(hasRemote => (hasRemote) ? this._inDir(`git push ${remote} :refs/tags/${t}`) : EMPTY_EXEC_OUT))));
  }

  /**
   * Fetch a remote, pruning branches and tags
   * @param remote the remote to fetch.
   */
  fetch(remote: string = "origin"): Promise<ExecOutput> {
    return this.hasRemote()
      .then(hasRemote => {
        if (!hasRemote) {
          return EMPTY_EXEC_OUT;
        }
        // fetch and prune the tags.
        return this._inDir(`git fetch -p ${remote}`)
          .then(() => this._inDir(`git fetch --prune ${remote} "+refs/tags/*:refs/tags/*"`));
      });
  }

  /**
   * Get all branches.
   */
  getAllBranches(): Promise<Branch[]> {
    return Promise.all([this.getAllLocalBranches(), this.getAllRemoteBranches()])
      .then((result) => {
        const [local, remote] = result;
        return Promise.resolve(local.concat(remote));
      });
  }

  /**
   * Get all branches branches in the repository.
   * Returns a unique list of branches, where local 
   * branches are favored over their remote counterparts.
   */
  getAllBranchesFavorLocal(): Promise<Branch[]> {
    return Promise.all([this.getAllLocalBranches(), this.getAllRemoteBranches()])
      .then(res => {
        const [local, remote] = res;
        return Promise.resolve(_.unionBy(local, remote, 'name'));
      });
  }

  /**
   * Get all feature branches in the repository.
   */
  getAllFeatureBranches(): Promise<Branch[]> {
    return Promise.all([this.getAllLocalFeatureBranches(), this.getAllRemoteFeatureBranches()])
      .then(res => {
        const [local, remote] = res;
        return Promise.resolve(local.concat(remote));
      });
  }

  /**
   * Get all feature branches branches in the repository.
   * Returns a unique list of feature branches, where local 
   * branches are favored over their remote counterparts.
   */
  getAllFeatureBranchesFavorLocal(): Promise<Branch[]> {
    return Promise.all([this.getAllLocalFeatureBranches(), this.getAllRemoteFeatureBranches()])
      .then(res => {
        const [local, remote] = res;
        return Promise.resolve(_.unionBy(local, remote, 'name'));
      });
  }

  /**
   * Get all local branches.
   */
  getAllLocalBranches(): Promise<Branch[]> {
    return this._inDir("git show-branch --list")
      .then(out => {
        const rawLines = out.stdout.split("\n");
        const filteredLines = rawLines.filter(line => REGEX_SHOW_BRANCH.test(line));
        const mappedLines = filteredLines.map(line => {
          const matches = line.match(REGEX_SHOW_BRANCH)!!;
          return { name: matches[1], lastCommitMessage: matches[2], remote: false };
        });
        return mappedLines;
      });
  }

  /**
   * Get all local feature branches.
   */
  getAllLocalFeatureBranches(): Promise<Branch[]> {
    this._checkInitialized();
    return this.getAllLocalBranches()
      .then(branches => {
        const filtered = branches.filter(branch => branch.name !== this._mainBranchName && !REGEX_PRODUCTION_RELEASE.test(branch.name));
        return filtered;
      });
  }

  /**
   * Get all local production release branches.
   */
  getAllLocalProductionReleaseBranches(): Promise<Branch[]> {
    return this.getAllLocalBranches()
      .then(branches => branches.filter(branch => REGEX_PRODUCTION_RELEASE.test(branch.name)));
  }

  /**
   * Get all production release branches in the repository.
   */
  getAllProductionReleaseBranches(): Promise<Branch[]> {
    return Promise.all([this.getAllLocalProductionReleaseBranches(), this.getAllRemoteProductionReleaseBranches()])
      .then(res => {
        const [local, remote] = res;
        return Promise.resolve(local.concat(remote));
      });
  }

  /**
   * Get all production release branches in the repository.
   * Returns a unique list of production release branches, where local 
   * branches are favored over their remote counterparts.
   */
  getAllProductionReleaseBranchesFavorLocal(): Promise<Branch[]> {
    return Promise.all([this.getAllLocalProductionReleaseBranches(), this.getAllRemoteProductionReleaseBranches()])
      .then(res => {
        const [local, remote] = res;
        return Promise.resolve(_.unionBy(local, remote, 'name'));
      });
  }

  /**
   * Get all remote branches
   */
  getAllRemoteBranches(): Promise<Branch[]> {
    if (this._mode === t00lsMode.Local) { Promise.resolve([]); }

    return this.hasRemote()
      .then(hasRemote => {
        if (hasRemote) {
          return this._inDir("git show-branch --list --remote")
            .then(out => out.stdout.split("\n").filter(line => REGEX_SHOW_BRANCH.test(line)).map(line => {
              const matches = line.match(REGEX_SHOW_BRANCH)!!;
              const name = matches[1].split("/");
              return { name: name[1], lastCommitMessage: matches[2], remote: true, origin: name[0] };
            }));
        }
        return [];
      });
  }

  /**
   * Get all remote feature branches.
   */
  getAllRemoteFeatureBranches(): Promise<Branch[]> {
    if (this._mode === t00lsMode.Local) { Promise.resolve([]); }
    this._checkInitialized();

    return this.getAllRemoteBranches()
      .then(branches => branches.filter(branch => branch.name !== this._mainBranchName && !REGEX_PRODUCTION_RELEASE.test(branch.name)));
  }

  /**
  * Get all remote production release branches.
  */
  getAllRemoteProductionReleaseBranches(): Promise<Branch[]> {
    if (this._mode === t00lsMode.Local) { Promise.resolve([]); }

    return this.getAllRemoteProductionReleaseBranches()
      .then(branches => branches.filter(branch => REGEX_PRODUCTION_RELEASE.test(branch.name)));
  }

  /**
   * Get all remotes in the Git repository.
   */
  getAllRemotes(): Promise<string[]> {
    if (this._mode === t00lsMode.Local) { Promise.resolve([]); }

    return this._inDir("git remote")
      .then(({ stdout }) => stdout.split("\n").map(r => r.trim()).filter(r => r));
  }

  /**
   * Get all tags in the Git repository.
   */
  getAllTags(): Promise<string[]> {
    return this._inDir("git tag -l")
      .then(({ stdout }) => stdout.split("\n").map(t => t.trim()).filter(t => t));
  }

  /**
   * Get the current branch in the local Git repository.
   */
  getCurrentBranch(): Promise<string> {
    return this._inDir("git branch --show-current")
      .then((out: ExecOutput) => out.stdout);
  }

  /**
   * Get the main branch name. 'main' or 'master'
   */
  getMainBranchName(): Promise<string> {
    if (this._mainBranchName !== undefined) { return Promise.resolve(this._mainBranchName); }
    return this.getAllLocalBranches()
      .then(branches => (_.findIndex(branches, { name: "main" }) !== -1) ? "main" : "master");
  }

  /**
   * Get the number of commits one branch is ahead from another.
   * @param baseBranch the base branch to compare from.
   * @param branchToCompareAgainst the branch to compare against.
   * @returns the number of commits that branchToCompareAgainst is ahead of baseBranch.
   */
  getNumberOfCommitsAheadOfBranch(baseBranch: string, branchToCompareAgainst: string): Promise<number> {
    return this._inDir(`git rev-list --count ${baseBranch}...${branchToCompareAgainst}`)
      .then(({ stdout }) => parseInt(stdout, 10));
  }

  /**
   * Get the root directory of the Git repository.
   */
  getRepositoryDirectory(): Promise<string> {
    return this._inDir("git rev-parse --show-toplevel")
      .then(({ stdout }) => stdout);
  }

  /**
   * Check to see if a branch exists locally in the Git repository.
   * @param branch the branch.
   */
  hasLocalBranch(branch: string) {
    return this.getAllLocalBranches()
      .then(branches => branches && _.find(branches, { name: branch, remote: false }) !== undefined);
  }

  /**
   * Check to see if a remote has been configured the repository.
   */
  hasRemote(): Promise<boolean> {
    if (this._mode === t00lsMode.Local) { return Promise.resolve(false); }

    return this.getAllRemotes().then((remotes) => remotes && remotes.length > 0);
  }

  /**
   * Check to see if a remote branch exists in the repository.
   * @param branch the branch.
   * @param origin the remote to use. default is 'origin'.
   */
  hasRemoteBranch(branch: string, origin: string = "origin") {
    return this.getAllRemoteBranches()
      .then(branches => branches && _.find(branches, { name: branch, remote: true, origin }) !== undefined);
  }

  /**
   * Check to see if there are working changes (tracked and untracked) in the current Git repository.
   */
  hasWorkingChanges() {
    return this._inDir("git status --porcelain")
      .then(({ stdout }) => stdout.length > 0);
  }

  /**
   * Initialize the repository.
   */
  async initialize() {
    this._mainBranchName = await this.getMainBranchName();
  }

  /**
   * Merge a branch into the current Git branch.
   * @param branch the branch to merge.
   */
  mergeBranch(branch: string): Promise<ExecOutput> {
    return this._inDir(`git merge ${branch}`);
  }

  /**
   * Pop the latest stash.
   */
  popStash(): Promise<ExecOutput> {
    return this._inDir("git stash pop");
  }

  /**
   * Pull the current branch.
   */
  pull(): Promise<ExecOutput> {
    return this.hasRemote()
      .then(hasRemote => (hasRemote) ? this._inDir("git pull") : EMPTY_EXEC_OUT);
  }

  /**
   * Push the current branch.
   */
  push(): Promise<ExecOutput> {
    return this.hasRemote()
      .then(hasRemote => (hasRemote) ? this._inDir("git push") : EMPTY_EXEC_OUT);
  }

  /**
   * Push all the tags in the local repository to the remote repository.
   */
  pushTags(): Promise<ExecOutput> {
    return this.hasRemote()
      .then(hasRemote => (hasRemote) ? this._inDir("git push --tags") : EMPTY_EXEC_OUT);
  }

  /**
   * Setup remote tracking and push the current branch.
   * @param remote the remote repository to setup tracking against.
   */
  setupTrackingAndPush(remote: string = "origin"): Promise<ExecOutput> {
    return this.hasRemote()
      .then(hasRemote => (hasRemote) ? this.getCurrentBranch().then(branch => this._inDir(`git push -u ${remote} ${branch}`)) : EMPTY_EXEC_OUT);
  }

  /**
   * Stage a file or a directory.
   * @param path the path to stage.
   */
  stage(path: string): Promise<ExecOutput> {
    if (path.indexOf(" ") !== -1) {
      path = `"${path}"`;
    }
    return this._inDir(`git add ${path}`);
  }

  /**
   * Stash the currently staged files.
   * @param message the stash message.
   */
  stash(message: string): Promise<ExecOutput> {
    return this._inDir(`git stash save "${message}"`);
  }

  /**
   * Check to see if the Git instance has been initialized.
   */
  private _checkInitialized() {
    if (!this._mainBranchName) {
      throw new Error("You must call initialize()");
    }
  }

  /**
   * Execute a command in the current directory.
   * @param command the command to execute.
   */
  private _inDir(command: string): Promise<ExecOutput> {
    return pExec(command, { cwd: this._path })
      .then((out: { stdout: string, stderr: string }) => {
        out.stderr = out.stderr.trim();
        out.stdout = out.stdout.trim();
        return out;
      });
  }

  /**
   * Test the current path to make sure there is a Git repository.
   */
  private _testRepo() {
    try {
      const stdout = execSync("git rev-parse --is-inside-work-tree", { encoding: "utf8", cwd: this._path });
      if (stdout.trim() !== "true") {
        throw new Error(`'${this._path}' is not a Git repository.`);
      }
    } catch (error) {
      throw new Error(`'${this._path}' is not a Git repository.`);
    }
  }
}

export default Git;
