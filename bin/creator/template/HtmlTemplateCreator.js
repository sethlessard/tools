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
   * Get the HTML template help.
   * @returns {{ description: string, help: {[string]: {description: string, args: {[string]: {description: string, args: {[string|number]: { description: string, default?: any, required?: boolean }}}}}}} the help.
   */
  getHelp() {
    return {
      description: "HTML templates",
      help: {
        simple: {
          description: "Simple HTML template",
          args: {
            3: {
              description: "The name of the HTML file.",
              default: "index.html"
            },
            title: {
              description: "The page title to be used",
              default: "Title"
            }
          }
        }
      }
    };
  }

  /**
   * Create a simple html file.
   */
  _createSimple() {
    const fileName = this._enforceFileExtension(this._positionalArgs[3] || "index.html", ".html");
    const title = this._argv["title"] || "Title";
    // TODO: accept relative paths and absolute paths
    const filePath = path.join(process.cwd(), fileName);

    this._populateTemplate(filePath, "simple", { $1: title });
  }
}

module.exports = HtmlTemplateCreator;
