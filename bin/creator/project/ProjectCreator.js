const HasHelp = require("../../help/HasHelp");
const { execSync } = require("child_process");
const fs = require("fs");

class ProjectCreator extends HasHelp {

  /**
   * ProjectCreator constructor.
   * @param {string} langauge the programming language.
   * @param {string} appBase the path to the base of the t00ls app.
   * @param {object} argv the arguments passed to the t00ls app.
   */
  constructor(language, appBase, argv) {
    super();
    this._appBase = appBase;
    this._positionalArgs = argv["_"];
    this._type = this._positionalArgs[2];
    this._path = this._positionalArgs[3];
    this._templateBase = `templates/projects/${language}`;
  }

  /**
   * Create the project.
   */
  create() { }

  /**
   * Create & the project directory.
   */
  _createDirectory() {
    // create the directory
    if (!fs.existsSync(this._path)) {
      fs.mkdirSync(this._path, { recursive: true });
    } else {
      // TODO: ask if we should delete/create the directory. For now, just exit.
      console.error(`${this._path} already exists.`);
      process.exit(1);
    }
  }

  /**
   * Execte a command in the project's directory.
   * @param {string} command the command to execute.
   */
  _inDir(command) {
    execSync(command, { cwd: this._path });
  }
}

module.exports = ProjectCreator;
