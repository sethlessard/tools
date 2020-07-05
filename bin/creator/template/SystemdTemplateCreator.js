
const path = require("path");

const TemplateCreator = require("./TemplateCreator");

// minecraft
const DEFAULT_MINECRAFT_USER = "minecraft";
const DEFAULT_MINECRAFT_MEMORY = "3G";

// simple
const DEFAULT_SIMPLE_USER = "seth";

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
   * Get the systemd template help.
   * @returns {{ description: string, help: {[string]: {description: string, args: {[string]: {description: string, args: {[string|number]: { description: string, default?: any, required?: boolean }}}}}}} the help.
   */
  getHelp() {
    return {
      description: "systemd templates",
      help: {
        minecraft: {
          description: "Minecraft multi-instance service template",
          args: {
            user: {
              description: "The linux user to run the Minecraft server serivce as",
              default: DEFAULT_MINECRAFT_USER
            },
            memory: {
              description: "The amount of memory to use for each server instance. (1G, 2G, 2.5G, etc.)",
              default: DEFAULT_MINECRAFT_MEMORY
            }
          }
        },
        simple: {
          description: "Simple systemd service template",
          args: {
            3: {
              name: "The name of the systemd service file"
            },
            description: {
              description: "The description of the systemd service",
              required: true
            },
            executable: {
              description: "The absolute path to the binary to run",
              required: true
            },
            user: {
              description: "The linux user the run the service as",
              default: DEFAULT_SIMPLE_USER
            }
          }
        }
      }
    };
  }

  /**
   * Create a Minecraft systemd definition.
   */
  _createMinecraft() {
    const user = this._argv["user"] || DEFAULT_MINECRAFT_USER;
    const memory = this._argv["memory"] || DEFAULT_MINECRAFT_MEMORY;
    const fileName = this._getFileName(this._enforceFileExtension(this._positionalArgs[3] || "minecraft@.service", ".service"));
    const parentDirectory = this._getParentDirectory(this._positionalArgs[3]);
    const filePath = path.join(parentDirectory, fileName);
    this._populateTemplate(filePath, "minecraft", { $1: user, $2: memory });
  }

  /**
   * Create a simple Systemd service
   */
  _createSimple() {
    const description = this._argv["description"];
    const user = this._argv["user"] || DEFAULT_SIMPLE_USER;
    const executable = this._argv["executable"];
    if (!description) {
      console.error("--description must be set");
      process.exit(1);
    }
    if (!executable) {
      console.error("--executable must be set.");
      process.exit(1);
    }
    const fileName = this._getFileName(this._enforceFileExtension(this._positionalArgs[3], ".service"));
    const parentDirectory = this._getParentDirectory(this._positionalArgs[3]);
    const filePath = path.join(parentDirectory, fileName);
    this._populateTemplate(filePath, "simple", { $1: description, $2: user, $3: executable });
  }
}

module.exports = SystemdTemplateCreator;
