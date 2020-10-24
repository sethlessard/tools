import { exec } from "child_process";
import { promisify } from "util";
import * as _ from "lodash";
const pExec = promisify(exec);

const REGEX_SHOW_BRANCH = /\*?\s*\[(.*)\]\s+(.*)/;
const REGEX_PRODUCTION_RELEASE = /v(\d+\.\d+\.\d+)-prep/;

export type Branch = {
  name: string,
  lastCommitMessage: string,
  remote: boolean,
  origin?: string
};

export type ExecOutput = { stdout: string, stderr: string };
const EMPTY_EXEC_OUT = { stdout: "", stderr: "" };


class Git {

  private readonly _path: string;

  /**
   * Create a new Git instance.
   * @param repoPath the path to the Git repository.
   */
  constructor(repoPath: string) {
    if (!repoPath) { throw new Error("repoPath must be specified."); }
    this._path = repoPath;
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
    return this.hasRemote()
      .then(hasRemote => {
        if (hasRemote) {
          return this._inDir(`git push ${origin} --delete ${branch}`);
        }
        return Promise.resolve(EMPTY_EXEC_OUT);
      });
  }

  /**
   * Delete a remote branch with force.
   * @param branch the branch to delete.
   */
  deleteRemoteBranchForce(branch: string, origin: string = "origin"): Promise<ExecOutput> {
    return this.hasRemote()
      .then(hasRemote => {
        if (hasRemote) {
          return this._inDir(`git push ${origin} --force --delete ${branch}`);
        }
        return Promise.resolve(EMPTY_EXEC_OUT);
      });
  }

  /**
   * Fetch a remote.
   * @param remote the remote to fetch.
   */
  fetch(remote?: string): Promise<ExecOutput> {
    return this.hasRemote()
      .then(hasRemote => {
        if (!hasRemote) {
          return Promise.resolve(EMPTY_EXEC_OUT);
        }
        return this._inDir(`git fetch -p${(remote) ? ` ${remote}` : ""}`);
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
        const rawLines = out.stdout.trim().split("\n");
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
    return this.getAllLocalBranches()
      .then(branches => {
        const filtered = branches.filter(branch => branch.name !== "master" && !REGEX_PRODUCTION_RELEASE.test(branch.name));
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
    return this.hasRemote()
      .then(hasRemote => {
        if (hasRemote) {
          return this._inDir("git show-branch --list --remote")
            .then(out => out.stdout.trim().split("\n").filter(line => REGEX_SHOW_BRANCH.test(line)).map(line => {
              const matches = line.match(REGEX_SHOW_BRANCH)!!;
              const name = matches[1].split("/");
              return { name: name[1], lastCommitMessage: matches[2], remote: true, origin: name[0] };
            }));
        }
        return Promise.resolve([]);
      });
  }

  /**
   * Get all remote feature branches.
   */
  getAllRemoteFeatureBranches(): Promise<Branch[]> {
    return this.getAllRemoteBranches()
      .then(branches => branches.filter(branch => branch.name !== "master" && !REGEX_PRODUCTION_RELEASE.test(branch.name)));
  }

  /**
  * Get all remote production release branches.
  */
  getAllRemoteProductionReleaseBranches(): Promise<Branch[]> {
    return this.getAllRemoteProductionReleaseBranches()
      .then(branches => branches.filter(branch => REGEX_PRODUCTION_RELEASE.test(branch.name)));
  }

  /**
   * Get all remotes in the Git repository.
   */
  getAllRemotes(): Promise<string[]> {
    return this._inDir("git remote")
      .then(({ stdout }) => stdout.split("\n").map(r => r.trim()).filter(r => r));
  }

  /**
   * Get the current branch in the local Git repository.
   */
  getCurrentBranch(): Promise<string> {
    return this._inDir(`git branch --show-current`)
      .then((out: ExecOutput) => out.stdout);
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
   * Merge a branch into the current Git branch.
   * @param branch the branch to merge.
   */
  mergeBranch(branch: string): Promise<ExecOutput> {
    return this._inDir(`git merge ${branch}`);
  }

  /**
   * Pull the current branch.
   */
  pull(): Promise<ExecOutput> {
    return this.hasRemote()
      .then(hasRemote => (hasRemote) ? this._inDir("git pull") : Promise.resolve(EMPTY_EXEC_OUT));
  }

  /**
   * Push the current branch.
   */
  push(): Promise<ExecOutput> {
    return this.hasRemote()
      .then(hasRemote => (hasRemote) ? this._inDir("git push") : Promise.resolve(EMPTY_EXEC_OUT));
  }

  /**
   * Setup remote tracking and push the current branch.
   */
  setupTrackingAndPush(): Promise<ExecOutput> {
    // TODO: [TLS-28] add ability to specify the remote
    return this.hasRemote()
      .then(hasRemote => (hasRemote) ? this.getCurrentBranch().then(branch => this._inDir(`git push -u origin ${branch}`)) : Promise.resolve(EMPTY_EXEC_OUT));
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
        return Promise.resolve(out);
      });
  }
}

export default Git;
