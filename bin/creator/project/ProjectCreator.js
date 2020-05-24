const { execSync } = require("child_process");

class ProjectCreator {

  /**
   * ProjectCreator constructor.
   * @param {string} appBase the path to the base of the t00ls app.
   * @param {object} argv the arguments passed to the t00ls app.
   */
  constructor(appBase, argv) {
    this._appBase = appBase;
    this._positionalArgs = argv["_"];
    this._type = this._positionalArgs[2];
    this._path = this._positionalArgs[3];
  }

  /**
   * Create the project.
   */
  create() { }

  /**
   * Execte a command in the project's directory.
   * @param {string} command the command to execute.
   */
  _inDir(command) {
    execSync(command, { cwd: this._path });
  }
}

module.exports = ProjectCreator;
