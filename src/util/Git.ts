const { exec } = require("child_process");
const { promisify } = require("util");
const pExec = promisify(exec);

class Git {

  private readonly _path: string;

  /**
   * Create a new Git instance.
   * @param repoPath the path to the Git repository.
   */
  constructor(repoPath: string) {
    if (!repoPath) throw new Error("repoPath must be specified.");
    this._path = repoPath;
  }

  /**
   * Fetch a remote.
   * @param remote the remote to fetch.
   */
  fetch(remote: string = "origin") {
    return this._inDir(`git fetch ${remote}`)
  }

  /**
   * Fetch all remotes.
   */
  fetchAll() {

  }

  /**
   * Execute a command in the current directory.
   * @param command the command to execute.
   */
  _inDir(command: string) {
    return pExec(command, { cwd: this._path });
  }
}

const fetchAll = () => {

};

export default Git;
