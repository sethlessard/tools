
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
      case "simple":
        this._createSimple();
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

    this._populateTemplate(filePath, "minecraft", { $1: user, $2: memory });
  }

  /**
   * Create a simple Systemd service
   */
  _createSimple() {
    const description = this._argv["description"];
    const user = this._argv["user"] || "seth";
    const executable = this._argv["executable"];
    const filePath = path.join(process.cwd(), this._enforceFileExtension(this._positionalArgs[3], ".service"));
    if (!description) {
      console.error("--description must be set");
      process.exit(1);
    }
    if (!executable) {
      console.error("--executable must be set.");
      process.exit();
    }
    this._populateTemplate(filePath, "simple", { $1: description, $2: user, $3: executable });
  }
}

module.exports = SystemdTemplateCreator;
