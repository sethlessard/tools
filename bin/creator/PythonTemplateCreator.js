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
    const className = this._positionalArgs[3];
    const ext = (this._argv["extends"]) ? this._argv["extends"] : "object";
    const filePath = path.join(process.cwd(), `${className}.py`);

    // read the templates
    const template = this._templateReader.read("class");

    // populate & write the templates
    this._templateWriter.write(filePath, template, { $1: className, $2: ext });
  }

  /**
   * Create a main.py file.
   */
  _createMain() {
    const fileName = (this._positionalArgs[3]) ? this._positionalArgs[3] : "main";
    const filePath = path.join(process.cwd(), `${fileName}.py`);

    // read the templates
    const template = this._templateReader.read("main");

    // populate & write the templates
    this._templateWriter.write(filePath, template, {});
  }
}

module.exports = PythonTemplateCreator;
