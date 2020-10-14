import * as path from "path";

import TemplateCreator from "./TemplateCreator";

class CppTemplateCreator extends TemplateCreator {

  /**
   * CppTemplateCreator constructor.
   * @param {any} argv the arguements passed to the tools command
   */
  constructor(argv: any) {
    super("c++", argv);
  }

  // TODO: unit test
  /**
   * Create the template.
   */
  create() {
    switch (this._type) {
      case "class":
        this._createClass();
        break;
      case "main":
        this._createMain();
        break;
      case "singleton":
        this._createSingleton();
        break;
      default:
        console.error(`"${this._type}" is not a registered C++ template type.`);
        break;
    }
  }

   /**
   * Get the C++ template help.
   * @returns {{ description: string, help: {[string]: {description: string, args: {[string]: {description: string, args: {[string|number]: { description: string, default?: any, required?: boolean }}}}}}} the help.
   */
  getHelp() {
    return {
      description: "C++ templates",
      help: {
        class: {
          description: "Class template",
          args: {
            3: {
              description: "The name of the class"
            }
          }
        },
        main: {
          description: "Program entrypoint template",
          args: {
            3: {
              description: "The name of the entrypoint file",
              default: "main.cpp"
            }
          }
        },
        singleton: {
          description: "Singleton template",
          args: {
            3: {
              description: "The name of the singleton (class)"
            }
          }
        }
      }
    };
  }

  /**
   * Create a C++ class.
   */
  _createClass() {
    const fileName = this._getFileName(this._positionalArgs[3]);
    const parentDirectory = this._getParentDirectory(this._positionalArgs[3]);

    const classPath = path.join(parentDirectory, this._enforceFileExtension(fileName, ".cpp"));
    const headerPath = path.join(parentDirectory, this._enforceFileExtension(fileName, ".hpp"));

    const className = this._getObjectName(fileName);
    this._populateTemplate(classPath, "class", { $1: className });
    this._populateTemplate(headerPath, "class.header", { $1: className });
  }

  /**
   * Create a main.cpp file.
   */
  _createMain() {
    const fileName = this._getFileName(this._enforceFileExtension(this._positionalArgs[3], ".cpp"));
    const parentDirectory = this._getParentDirectory(this._positionalArgs[3]);
    
    const mainPath = path.join(parentDirectory, fileName);
    this._populateTemplate(mainPath, "main");
  }

  /**
   * Create a C++ singleton.
   */
  _createSingleton() {
    const fileName = this._getFileName(this._positionalArgs[3]);
    const parentDirectory = this._getParentDirectory(this._positionalArgs[3]);

    const classPath = path.join(parentDirectory, this._enforceFileExtension(fileName, ".cpp"));
    const headerPath = path.join(parentDirectory, this._enforceFileExtension(fileName, ".hpp"));

    const className = this._getObjectName(fileName);
    this._populateTemplate(classPath, "singleton", { $1: className });
    this._populateTemplate(headerPath, "singleton.header", { $1: className });
  }
}

export default CppTemplateCreator;
