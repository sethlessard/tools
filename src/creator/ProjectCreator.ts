import { ExtensionContext } from "vscode";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
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
  protected _createDirectory() {
    const { parentPath: path } = this._options;
    // create the directory
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    } else {
      // TODO: ask if we should delete/create the directory. For now, just exit.
      console.error(`${path} already exists.`);
      process.exit(1);
    }
  }

  /**
   * Execte a command in the project's directory.
   * @param {string} command the command to execute.
   */
  protected _inDir(command: string) {
    execSync(command, { cwd: this._options.parentPath });
  }
}

export default ProjectCreator;