import * as fse from "fs-extra";
import * as path from "path";

import ProjectCreator from "../ProjectCreator";
import CppProjectOptions from "./CppProjectOptions";
import CppProjectType, { getCppProjectTemplateDirectory } from "./CppProjectType";

class CppProjectCreator extends ProjectCreator {

  protected readonly _options: CppProjectOptions;

  constructor(options: CppProjectOptions) {
    super("cpp", options);
    this._options = options;
  }

  /**
   * Create the C project.
   */
  create(): Promise<void> {
    return new Promise((resolve, _) => {
      switch (this._options.type) {
        case CppProjectType.Simple:
          resolve(this._createSimple());
          return;
      }
    });
  }

  /**
   * Create a simple C++ project.
   */
  _createSimple() {
    // copy the template and create the build directory
    return fse.copy(path.join(this._templateBase, getCppProjectTemplateDirectory(this._options.type)), this._options.path)
      .then(() => fse.mkdir(path.join(this._options.path, "build")));
  }
}

export default CppProjectCreator;
