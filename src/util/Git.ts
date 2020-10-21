const { exec } = require("child_process");
const { promisify } = require("util");
const pExec = promisify(exec);

type ExecOutput = { stdout: string, stderr: string };

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
   * Fetch a remote.
   * @param remote the remote to fetch.
   */
  fetch(remote: string = "origin"): Promise<ExecOutput> {
    return this._inDir(`git fetch -p ${remote}`);
  }

  /**
   * Get the current branch in the local Git repository.
   */
  getCurrentBranch(): Promise<ExecOutput> {
    return this._inDir(`git branch --show-current`);
  }

  /**
   * Pull the current branch.
   */
  pull(): Promise<ExecOutput> {
    return this._inDir("git pull");
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
}

export default Git;
