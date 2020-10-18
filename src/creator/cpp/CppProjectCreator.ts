import * as fse from "fs-extra";
import * as path from "path";
import { ExtensionContext } from "vscode";

import ProjectCreator from "../ProjectCreator";
import CppProjectOptions from "./CppProjectOptions";
import CppProjectType, { getCppProjectTemplateDirectory } from "./CppProjectType";

class CppProjectCreator extends ProjectCreator {

  protected readonly _options: CppProjectOptions;

  constructor(options: CppProjectOptions, context: ExtensionContext) {
    super("cpp", options, context);
    this._options = options;
  }

  /**
   * Create the C project.
   */
  create(): Promise<void> {
    switch (this._options.type) {
      case CppProjectType.Simple:
        return this._createSimple();
    }
  }

  /**
   * Create a simple C++ project.
   */
  _createSimple(): Promise<void> {
    // copy the template and create the build directory
    return fse.copy(path.join(this._templateBase, getCppProjectTemplateDirectory(this._options.type)), this._options.parentPath)
      .then(() => fse.mkdir(path.join(this._options.parentPath, "build")));
  }
}

export default CppProjectCreator;
