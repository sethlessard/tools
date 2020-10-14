import * as fse from "fs-extra";
import * as path from "path";

import ProjectCreator from "./ProjectCreator";

class CProjectCreator extends ProjectCreator {

  constructor(appBase: string, argv: any) {
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
   * Get the C project help.
   * @returns {{ description: string, help: {[string]: {description: string, args: {[string]: {description: string, args: {[string|number]: { description: string, default?: any, required?: boolean }}}}}}} the help.
   */
  getHelp() {
    return {
      description: "C projects",
      help: {
        simple: {
          description: "Simple C project"
        }
      }
    }; 
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

export default CProjectCreator;
