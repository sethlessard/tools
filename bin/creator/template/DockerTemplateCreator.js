const path = require("path");

const TemplateCreator = require("./TemplateCreator");

class DockerTemplateCreator extends TemplateCreator {

  /**
   * DockerTemplateCreator constructor.
   * @param {object} argv the arguements passed to the tools command
   */
  constructor(argv) {
    super("docker", argv);

    // binding
    this.create = this.create.bind(this);
    this._createDockerFile = this._createDockerFile.bind(this);
  }

  // TODO: unit test
  /**
   * Create the template.
   */
  create() {
    switch (this._type) {
      case "dockerfile":
        this._createDockerFile();
        break;
      case "node.dockerfile":
        this._createNodeDockerFile();
        break;
      default:
        console.error(`"${this._type}" is not a registered Docker template type.`);
        break;
    }
  }

  /**
   * Get the Docker template help.
   * @returns {{ description: string, help: {[string]: {description: string, args: {[string]: {description: string, args: {[string|number]: { description: string, default?: any, required?: boolean }}}}}}} the help.
   */
  getHelp() {
    return {
      description: "Docker templates",
      help: {
        dockerfile: {
          description: "Simple Dockerfile template",
          args: {
            3: {
              description: "The name of the Dockerfile",
              default: "Dockerfile"
            },
            image: {
              description: "The Docker image to base the Dockerfile off of",
              default: "ubuntu:18.04"
            }
          }
        },
        "node.dockerfile": {
          description: "Simple Node.js Dockerfile template",
          args: {
            3: {
              description: "The name of the Dockerfile",
              default: "Dockerfile"
            },
            version: {
              description: "The version of Node.js to use",
              default: 12
            }
          }
        }
      }
    };
  }

  /**
   * Create a Dockerfile.
   */
  _createDockerFile() {
    const fileName = this._getFileName(this._positionalArgs[3] || "Dockerfile");
    const parentDirectory = this._getParentDirectory(this._positionalArgs[3]);
    const imageName = this._argv["image"] || "ubuntu:18.04";
    const filePath = path.join(parentDirectory, fileName);
    this._populateTemplate(filePath, "Dockerfile", { $1: imageName });
  }

  /**
   * Create a Dockerfile for a Node.JS.
   */
  _createNodeDockerFile() {
    const fileName = this._getFileName(this._positionalArgs[3] || "Dockerfile");
    const parentDirectory = this._getParentDirectory(this._positionalArgs[3]);
    const filePath = path.join(parentDirectory, fileName);
    const version = this._argv["version"] || 12;
    this._populateTemplate(filePath, "Dockerfile.node", { $1: version });
  }
}

module.exports = DockerTemplateCreator;
