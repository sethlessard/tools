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
   * Get the C template help.
   * @returns {{ description: string, help: {[string]: {description: string, args: {[string]: {description: string, args: {[string|number]: { description: string, default?: any, required?: boolean }}}}}}} the help.
   */
  getHelp() {
    return {
      description: "C templates",
      help: {
        main: {
          description: "Program entrypoint template",
          args: {
            3: {
              description: "The name of the entrypoint file",
              default: "main.c"
            }
          }
        }
      }
    };
  }

  /**
   * Create a main.c file.
   */
  _createMain() {
    // TODO: accept relative paths and absolute paths
    const filePath = path.join(process.cwd(), this._enforceFileExtension(this._positionalArgs[3] || "main.c", ".c"));
    this._populateTemplate(filePath, "main");
  }
}

module.exports = CTemplateCreator;
