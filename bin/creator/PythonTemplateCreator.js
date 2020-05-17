const path = require("path");

const TemplateReader = require("../reader/TemplateReader");
const TemplateWriter = require("../writer/TemplateWriter");

class PythonTemplateCreator {

  /**
   * PythonTemplateCreator constructor.
   * @param {object} argv the arguements passed to the tools command
   */
  constructor(argv) {
    this._positionalArgs = argv["_"];
    this._argv = argv;
    this._type = this._positionalArgs[2];

    this._templateReader = new TemplateReader("python");
    this._templateWriter = new TemplateWriter();

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
      case "main":
        this._createMain();
        break;
      default:
        console.error(`"${this._type}" is not a registered Python template type.`);
        break;
    }
  }

  /**
   * Create a main.py file.
   */
  _createMain() {
    const fileName = this._positionalArgs[3];
    const filePath = path.join(process.cwd(), `${fileName}.py`);

    // read the templates
    const template = this._templateReader.read("main");

    // populate & write the templates
    this._templateWriter.write(filePath, template, {});
  }
}

module.exports = PythonTemplateCreator;