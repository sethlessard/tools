const path = require("path");

const TemplateCreator = require("./TemplateCreator");

class PythonTemplateCreator extends TemplateCreator {

  /**
   * PythonTemplateCreator constructor.
   * @param {object} argv the arguements passed to the tools command
   */
  constructor(argv) {
    super("python", argv);

    // binding
    this.create = this.create.bind(this);
    this._createMain = this._createMain.bind(this);
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
      default:
        console.error(`"${this._type}" is not a registered Python template type.`);
        break;
    }
  }

  /**
   * Get the Python template help.
   * @returns {{ description: string, help: {[string]: {description: string, args: {[string]: {description: string, args: {[string|number]: { description: string, default?: any, required?: boolean }}}}}}} the help.
   */
  getHelp() {
    return {
      description: "Python templates",
      help: {
        class: {
          description: "Class template",
          args: {
            3: {
              description: "The name of the class"
            },
            extends: {
              description: "The object to extend",
              default: "object"
            }
          }
        },
        main: {
          description: "Program entrypoint template",
          args: {
            3: {
              description: "The name of the entrypoint file",
              default: "main.py"
            }
          }
        }
      }
    };
  }

  /**
   * Create a new python class file.
   */
  _createClass() {
    const fileName = this._getFileName(this._enforceFileExtension(this._positionalArgs[3], ".py"));
    const parentDirectory = this._getParentDirectory(this._positionalArgs[3]);
    const filePath = path.join(parentDirectory, fileName);
    const className = this._getObjectName(fileName);
    const ext = this._argv["extends"] || "object";
    this._populateTemplate(filePath, "class", { $1: className, $2: ext });
  }

  /**
   * Create a main.py file.
   */
  _createMain() {
    const fileName = this._getFileName(this._enforceFileExtension(this._positionalArgs[3] || "main.py", ".py"));
    const parentDirectory = this._getParentDirectory(this._positionalArgs[3]);
    const filePath = path.join(parentDirectory, fileName);
    this._populateTemplate(filePath, "main");
  }
}

module.exports = PythonTemplateCreator;
