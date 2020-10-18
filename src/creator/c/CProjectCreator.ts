import * as fse from "fs-extra";
import * as path from "path";
import { ExtensionContext } from "vscode";

import ProjectCreator from "../ProjectCreator";
import CProjectOptions from "./CProjectOptions";
import CProjectType, { getCProjectTemplateDirectory } from "./CProjectType";

class CProjectCreator extends ProjectCreator {

  protected readonly _options: CProjectOptions;

  constructor(options: CProjectOptions, context: ExtensionContext) {
    super("c", options, context);
    this._options = options;
  }

  /**
   * Create the C project.
   */
  create(): Promise<void> {
    switch (this._options.type) {
      case CProjectType.Simple:
        return this._createSimple();
    }
  }

  /**
   * Create a simple C project.
   */
  private _createSimple(): Promise<void> {
    // copy the template and create the build directory
    return fse.copy(path.join(this._templateBase, getCProjectTemplateDirectory(this._options.type)), this._options.parentPath)
      .then(() => fse.mkdir(path.join(this._options.parentPath, "build")));
  }
}

export default CProjectCreator;
