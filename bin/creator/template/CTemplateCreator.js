const path = require("path");

const TemplateCreator = require("./TemplateCreator");

class CTemplateCreator extends TemplateCreator {

  /**
   * CTemplateCreator constructor.
   * @param {object} argv the arguements passed to the tools command
   */
  constructor(argv) {
    super("c", argv);
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
        console.error(`"${this._type}" is not a registered C template type.`);
        break;
    }
  }

  /**
   * Create a main.c file.
   */
  _createMain() {
    const filePath = path.join(process.cwd(), `main.c`);
    this._populateTemplate(filePath, "main");
  }
}

module.exports = CTemplateCreator;