import { tmpdir } from "os";
import * as path from "path";
import { v4 as uuid } from "uuid";
import { exec } from "child_process";
import { promisify } from "util";
import { mkdir, writeFile } from "fs";

const pexec = promisify(exec);
const pmkdir = promisify(mkdir);
const pwriteFile = promisify(writeFile);

// TODO: add logic that clears out old tests (2+ days old? 1+ day old?)
class TestHelper {

  private static _instance?: TestHelper;

  /*
   * Get the TestHelper instance.
   */
  static getInstance(): TestHelper {
    if (!TestHelper._instance) {
      TestHelper._instance = new TestHelper();
    }
    return TestHelper._instance;
  }

  private readonly _initializationTime: Date;
  private readonly _testRoot: string;

  /**
   * TestHelper constructor.
   */
  constructor() {
    this._initializationTime = new Date();
    const initializationDateTimestamp = `${this._initializationTime.toLocaleDateString()} ${this._initializationTime.toLocaleTimeString()}`.replace(/\//g, "-").replace(/:/g, "").replace(/\s+/g, "-");
    this._testRoot = path.join(tmpdir(), "t00ls", "Tests", initializationDateTimestamp);
  }

  /**
   * Create a Docker-hosted Git server used for testing.
   */
  createDockerHostedGitServer() {
    return this.destroyDockerHostedGitServer()
      .then(() => pexec("docker run -p 3000:3000 -d --name t00lsTestDockerGitServer pascalgn/git-server-docker"));
  }

  /**
   * Destroy the Docker-hosted Git server used for testing.
   */
  async destroyDockerHostedGitServer(): Promise<void> {
    try {
      await pexec("docker kill t00lsTestDockerGitServer");
    } catch (error) { }
    
    try {
      await pexec("docker rm t00lsTestDockerGitServer");
    } catch (error) {}
  }

  /**
   * Create a new test Git repository and return the path
   * to the Git repository.
   * @param resetRemote if true, then the remote repository will be cleared out/reset.
   */
  newTestRepository(resetRemote: boolean = true): Promise<string> {
    const repositoryPath = this._calculateNewRepositoryPath();
    // create the repository directory
    return pmkdir(repositoryPath, { recursive: true })
      // initialize the local git repository with a 'main' branch
      .then(() => pexec("git init -b main", { cwd: repositoryPath }))
      // set the remote
      .then(() => pexec("git remote add origin http://localhost:3000/repository.git", { cwd: repositoryPath }))
      // create the initial files/main branch or pull the remote
      .then(() => {
        if (resetRemote) {
          // create the README
          return pwriteFile(path.join(repositoryPath, "README.md"), "# Test Repository", { encoding: "utf-8" })
            // stage and commit the README
            .then(() => pexec("git add .", { cwd: repositoryPath }))
            .then(() => pexec("git commit -m 'Initial'", { cwd: repositoryPath }))
            // make the remote repo mirror the local repo (delete all remote tags and branches)
            .then(() => pexec("git push --mirror --force", { cwd: repositoryPath }));
        } else {
          return pexec("git fetch -p", { cwd: repositoryPath })
            .then(() => pexec("git checkout main", { cwd: repositoryPath }));
        }
      })
      // return the repository path
      .then(() => console.log(`      Using Git repository: ${repositoryPath}`))
      .then(() => repositoryPath);
  }

  /**
   * Calculate a path to place a new test Git repository.
   */
  private _calculateNewRepositoryPath(): string {
    return path.join(this._testRoot, uuid());
  }
}

export default TestHelper;
