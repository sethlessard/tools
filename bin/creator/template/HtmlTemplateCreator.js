const path = require("path");

const TemplateCreator = require("./TemplateCreator");

class HtmlTemplateCreator extends TemplateCreator {

  /**
   * HtmlTemplateCreator
   * @param {object} argv the arguments passed to the t00ls application. 
   */
  constructor(argv) {
    super("html", argv);
  }

  // TODO: unit test
  /**
   * Create the template.
   */
  create() {
    switch (this._type) {
      case "simple":
        this._createSimple();
        break;
      default:
        console.error(`"${this._type}" is not a registered HTML template type.`);
        break;
    }
  }

  /**
   * Create a simple html file.
   */
  _createSimple() {
    const fileName = this._enforceFileExtension(this._positionalArgs[3] || "index.html", ".html");
    const title = this._argv["title"] || "Title";
    const filePath = path.join(process.cwd(), fileName);

    this._populateTemplate(filePath, "simple", { $1: title });
  }
}

module.exports = HtmlTemplateCreator;
