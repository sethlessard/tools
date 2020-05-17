const path = require("path");

const TemplateReader = require("../reader/TemplateReader");
const TemplateWriter = require("../writer/TemplateWriter");

class CTemplateCreator {

  /**
   * CTemplateCreator constructor.
   * @param {object} argv the arguements passed to the tools command
   */
  constructor(argv) {
    this._positionalArgs = argv["_"];
    this._argv = argv;
    this._type = this._positionalArgs[2];

    this._templateReader = new TemplateReader("c");
    this._templateWriter = new TemplateWriter();
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
        console.error(`"${this._type}" is not a registered C++ template type.`);
        break;
    }
  }

  /**
   * Create a main.c file.
   */
  _createMain() {
    const filePath = path.join(process.cwd(), `main.c`);

    // read the templates
    const template = this._templateReader.read("main");

    // populate & write the templates
    this._templateWriter.write(filePath, template, {});
  }
}

module.exports = CTemplateCreator;
