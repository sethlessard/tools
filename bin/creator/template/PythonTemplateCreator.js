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
   * Create a new python class file.
   */
  _createClass() {
    const className = this._stripFileExtension(this._positionalArgs[3]);
    const ext = this._argv["extends"] || "object";
    const filePath = path.join(process.cwd(), this._enforceFileExtension(this._positionalArgs[3], ".py"));
    this._populateTemplate(filePath, "class", { $1: className, $2: ext });
  }

  /**
   * Create a main.py file.
   */
  _createMain() {
    const filePath = path.join(process.cwd(), this._enforceFileExtension(this._positionalArgs[3] || "main.py", ".py"));
    this._populateTemplate(filePath, "main");
  }
}

module.exports = PythonTemplateCreator;
