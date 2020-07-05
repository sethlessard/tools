const path = require("path");

const TemplateCreator = require("./TemplateCreator");

class ReactTemplateCreator extends TemplateCreator {

  /**
   * ReactTemplateCreator constructor.
   * @param {object} argv the arguements passed to the tools command
   */
  constructor(argv) {
    super("react", argv);
  }

  /**
   * Create the template.
   */
  create() {
    switch (this._type) {
      case "cc":
        this._createClassComponent();
        break;
      case "ccc":
        this._createConnectedClassComponent();
        break;
      case "sfc":
        this._createStatelessFunctionalComponent();
        break;
      case "csfc":
        this._createConnectedStatelessFunctionalComponent();
        break;
      default:
        console.error(`"${this._type}" is not a registered JavaScript template type.`);
        break;
    }
  }

  /**
   * Get the React template help.
   * @returns {{ description: string, help: {[string]: {description: string, args: {[string]: {description: string, args: {[string|number]: { description: string, default?: any, required?: boolean }}}}}}} the help.
   */
  getHelp() {
    return {
      description: "React templates",
      help: {
        cc: {
          description: "Class Component",
          args: {
            3: {
              description: "The name of the component"
            }
          }
        },
        ccc: {
          description: "Connected Class Component (connected react router)",
          args: {
            3: {
              description: "The name of the component"
            }
          }
        },
        sfc: {
          description: "Stateless Functional component",
          args: {
            3: {
              description: "The name of the component"
            }
          }
        },
        csfc: {
          description: "Connected Stateless Functional component",
          args: {
            3: {
              description: "The name of the component"
            }
          }
        }
      }
    };
  }

  /**
   * Create a class component.
   */
  _createClassComponent() {
    const fileName = this._getFileName(this._enforceFileExtension(this._positionalArgs[3], ".js"));
    const parentDirectory = this._getParentDirectory(this._positionalArgs[3]);
    const filePath = path.join(parentDirectory, fileName);
    const className = this._getObjectName(fileName);
    const classNameToLower = className.substr(0, 1).toLowerCase() + className.substr(1);
    this._populateTemplate(filePath, "cc", { $1: className, $2: classNameToLower });
  }

  /**
   * Create a connected class component.
   */
  _createConnectedClassComponent() {
    const fileName = this._getFileName(this._enforceFileExtension(this._positionalArgs[3], ".js"));
    const parentDirectory = this._getParentDirectory(this._positionalArgs[3]);
    const filePath = path.join(parentDirectory, fileName);
    const className = this._getObjectName(fileName);
    const classNameToLower = className.substr(0, 1).toLowerCase() + className.substr(1);
    this._populateTemplate(filePath, "ccc", { $1: className, $2: classNameToLower });
  }

  /**
   * Create a connected stateless functional component.
   */
  _createConnectedStatelessFunctionalComponent() {
    const fileName = this._getFileName(this._enforceFileExtension(this._positionalArgs[3], ".js"));
    const parentDirectory = this._getParentDirectory(this._positionalArgs[3]);
    const filePath = path.join(parentDirectory, fileName);
    const className = this._getObjectName(fileName);
    const classNameToLower = className.substr(0, 1).toLowerCase() + className.substr(1);
    this._populateTemplate(filePath, "csfc", { $1: className, $2: classNameToLower });
  }

  /**
   * Create a stateless functional component.
   */
  _createStatelessFunctionalComponent() {
    const fileName = this._getFileName(this._enforceFileExtension(this._positionalArgs[3], ".js"));
    const parentDirectory = this._getParentDirectory(this._positionalArgs[3]);
    const filePath = path.join(parentDirectory, fileName);
    const className = this._getObjectName(fileName);
    const classNameToLower = className.substr(0, 1).toLowerCase() + className.substr(1);
    this._populateTemplate(filePath, "sfc", { $1: className, $2: classNameToLower });
  }
}

module.exports = ReactTemplateCreator;
