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
   * Create a class component.
   */
  _createClassComponent() {
    const filePath = path.join(process.cwd(), this._enforceFileExtension(this._positionalArgs[3], ".js"));
    const className = this._stripFileExtension(this._positionalArgs[3]);
    const classNameToLower = className.substr(0, 1).toLowerCase() + className.substr(1);
    this._populateTemplate(filePath, "cc", { $1: className, $2: classNameToLower });
  }

  /**
   * Create a connected class component.
   */
  _createConnectedClassComponent() {
    const filePath = path.join(process.cwd(), this._enforceFileExtension(this._positionalArgs[3], ".js"));
    const className = this._stripFileExtension(this._positionalArgs[3]);
    const classNameToLower = className.substr(0, 1).toLowerCase() + className.substr(1);
    this._populateTemplate(filePath, "ccc", { $1: className, $2: classNameToLower });
  }

  /**
   * Create a connected stateless functional component.
   */
  _createConnectedStatelessFunctionalComponent() {
    const filePath = path.join(process.cwd(), this._enforceFileExtension(this._positionalArgs[3], ".js"));
    const className = this._stripFileExtension(this._positionalArgs[3]);
    const classNameToLower = className.substr(0, 1).toLowerCase() + className.substr(1);
    this._populateTemplate(filePath, "csfc", { $1: className, $2: classNameToLower });
  }

  /**
   * Create a stateless functional component.
   */
  _createStatelessFunctionalComponent() {
    const filePath = path.join(process.cwd(), this._enforceFileExtension(this._positionalArgs[3], ".js"));
    const className = this._stripFileExtension(this._positionalArgs[3]);
    const classNameToLower = className.substr(0, 1).toLowerCase() + className.substr(1);
    this._populateTemplate(filePath, "sfc", { $1: className, $2: classNameToLower });
  }

  /**
   * Create a mocha + chai unit test file.
   */
  _createTest() {
    const className = this._stripFileExtension(this._positionalArgs[3]);
    const filePath = path.join(process.cwd(), this._enforceFileExtension(this._positionalArgs[3], ".tests.js"));
    this._populateTemplate(filePath, "mochachai.unit", { $1: className });
  }
}

module.exports = ReactTemplateCreator;
