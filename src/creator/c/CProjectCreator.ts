import * as fse from "fs-extra";
import * as path from "path";

import ProjectCreator from "../ProjectCreator";
import CProjectOptions from "./CProjectOptions";
import CProjectType, { getCProjectTemplateDirectory } from "./CProjectType";

class CProjectCreator extends ProjectCreator {

  protected readonly _options: CProjectOptions;

  constructor(options: CProjectOptions) {
    super("c", options);
    this._options = options;
  }

  /**
   * Create the C project.
   */
  create(): Promise<void> {
    return new Promise((resolve, _) => {
      switch (this._options.type) {
        case CProjectType.Simple:
          resolve(this._createSimple());
          return;
      }
    });
  }

  /**
   * Create a simple C project.
   */
  private _createSimple(): Promise<void> {
    // copy the template and create the build directory
    return fse.copy(path.join(this._templateBase, getCProjectTemplateDirectory(this._options.type)), this._options.path)
      .then(() => fse.mkdir(path.join(this._options.path, "build")));
  }
}

export default CProjectCreator;
