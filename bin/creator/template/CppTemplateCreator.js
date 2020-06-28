const path = require("path");

const TemplateCreator = require("./TemplateCreator");

class CppTemplateCreator extends TemplateCreator {

  /**
   * CppTemplateCreator constructor.
   * @param {object} argv the arguements passed to the tools command
   */
  constructor(argv) {
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
    // TODO: accept relative paths and absolute paths
    const classPath = path.join(process.cwd(), this._enforceFileExtension(this._positionalArgs[3], ".cpp"));
    const headerPath = path.join(process.cwd(), this._enforceFileExtension(this._positionalArgs[3], ".hpp"));

    const className = this._stripFileExtension(this._positionalArgs[3]);
    this._populateTemplate(classPath, "class", { $1: className });
    this._populateTemplate(headerPath, "class.header", { $1: className });
  }

  /**
   * Create a main.cpp file.
   */
  _createMain() {
    const fileName = this._enforceFileExtension(this._positionalArgs[3] || "main.cpp", ".cpp");
    // TODO: accept relative paths and absolute paths
    const filePath = path.join(process.cwd(), fileName);
    this._populateTemplate(filePath, "main");
  }

  /**
   * Create a C++ singleton.
   */
  _createSingleton() {
    // TODO: accept relative paths and absolute paths
    const classPath = path.join(process.cwd(), this._enforceFileExtension(this._positionalArgs[3], ".cpp"));
    const headerPath = path.join(process.cwd(), this._enforceFileExtension(this._positionalArgs[3], ".hpp"));

    const className = this._stripFileExtension(this._positionalArgs[3]);
    this._populateTemplate(classPath, "singleton", { $1: className });
    this._populateTemplate(headerPath, "singleton.header", { $1: className });
  }
}

module.exports = CppTemplateCreator;
