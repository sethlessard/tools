
const path = require("path");

const TemplateCreator = require("./TemplateCreator");

class SystemdTemplateCreator extends TemplateCreator {

  /**
   * SystemdTemplateCreator constructor.
   * @param {object} argv the arguements passed to the tools command
   */
  constructor(argv) {
    super("systemd", argv);
  }

  // TODO: unit test
  /**
   * Create the template.
   */
  create() {
    switch (this._type) {
      case "minecraft":
        this._createMinecraft();
        break;
      default:
        console.error(`"${this._type}" is not a registered systemd template type.`);
        break;
    }
  }

  /**
   * Create a Minecraft systemd definition.
   */
  _createMinecraft() {
    const user = this._argv["user"] || "minecraft";
    const memory = this._argv["memory"] || "3G";
    const filePath = path.join(process.cwd(), `minecraft@.service`);

    // read the templates
    const template = this._templateReader.read("minecraft");

    // populate & write the templates
    this._templateWriter.write(filePath, template, { $1: user, $2: memory });
  }
}

module.exports = SystemdTemplateCreator;
