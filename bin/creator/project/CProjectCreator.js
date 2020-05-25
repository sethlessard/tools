const fse = require("fs-extra");
const path = require("path");

const ProjectCreator = require("./ProjectCreator");

class CProjectCreator extends ProjectCreator {

  constructor(appBase, argv) {
    super("c", appBase, argv);
  }

  /**
   * Create the C project.
   */
  create() {
    switch (this._type) {
      case "simple":
        this._createSimple();
        break;
      default:
        console.log(`"${this._type}" is not a registered C project type.`);
        break;
    }
  }

  /**
   * Create a simple C project.
   */
  _createSimple() {
    // copy the template
    fse.copySync(path.join(this._templateBase, "simple"), this._path);

    // create the build directory
    fse.mkdirSync(path.join(this._path, "build"));
  }
}

module.exports = CProjectCreator;
