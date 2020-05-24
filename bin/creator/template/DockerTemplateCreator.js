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
   * Create a Dockerfile.
   */
  _createDockerFile() {
    const fileName = (this._positionalArgs.length >= 4) ? this._positionalArgs[3] : "Dockerfile";
    const imageName = this._argv["image"];
    const filePath = path.join(process.cwd(), `${fileName}`);

    this._populateTemplate(filePath, "Dockerfile", { $1: imageName || "ubuntu:18.04" });
  }

  /**
   * Create a Dockerfile for a NodeJS.
   */
  _createNodeDockerFile() {
    const fileName = (this._positionalArgs.length >= 4) ? this._positionalArgs[3] : "Dockerfile";
    const version = this._argv["version"];
    const filePath = path.join(process.cwd(), `${fileName}`);

    this._populateTemplate(filePath, "Dockerfile.node", { $1: version || "12" });
  }
}

module.exports = DockerTemplateCreator;
