import { ExtensionContext } from "vscode";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";

const pExec = promisify(exec);

import ProjectOptions from "./ProjectOptions";

abstract class ProjectCreator {

  protected readonly _context: ExtensionContext;
  protected readonly _options: ProjectOptions;
  protected readonly _projectPath: string;
  protected readonly _templateBase: string;

  /**
   * ProjectCreator constructor.
   * @param langauge the programming language.
   * @param options the path to the base of the t00ls app.
   */
  constructor(language: string, options: ProjectOptions, context: ExtensionContext) {
    this._context = context;
    this._options = options;
    this._projectPath = path.join(this._options.parentPath, this._options.name);
    this._templateBase = path.join(this._context.extensionPath, `templates/${language}`);
  }

  /**
   * Create the project.
   */
  abstract create(): Promise<void>;

  /**
   * Create & the project directory.
   */
  protected _createProjectDirectory() {
    // create the directory
    if (!fs.existsSync(this._projectPath)) {
      fs.mkdirSync(this._projectPath, { recursive: true });
    } else {
      // TODO: [TLS-10] ask if we should delete/create the directory. For now, just exit.
      console.error(`${this._projectPath} already exists.`);
      process.exit(1);
    }
  }

  /**
   * Execte a command in the project's directory.
   * @param {string} command the command to execute.
   */
  protected _inParentDir(command: string) {
    return pExec(command, { cwd: this._options.parentPath });
  }

  /**
   * Execte a command in the project's directory.
   * @param {string} command the command to execute.
   */
  protected _inProjectDir(command: string) {
    return pExec(command, { cwd: this._projectPath });
  }
}

export default ProjectCreator;