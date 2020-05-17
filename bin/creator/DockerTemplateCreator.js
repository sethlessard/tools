const path = require("path");

const TemplateReader = require("../reader/TemplateReader");
const TemplateWriter = require("../writer/TemplateWriter");

class DockerTemplateCreator {

  /**
   * DockerTemplateCreator constructor.
   * @param {object} argv the arguements passed to the tools command
   */
  constructor(argv) {
    this._positionalArgs = argv["_"];
    this._argv = argv;
    this._type = this._positionalArgs[2];

    this._templateReader = new TemplateReader("docker");
    this._templateWriter = new TemplateWriter();

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
    const fileName = (this._positionalArgs.length >= 4) ? this._positionalArgs[3] : "Dockerfile";    const imageName = this._argv["image"];
    const filePath = path.join(process.cwd(), `${fileName}`);

    // read the templates
    const template = this._templateReader.read("Dockerfile");

    // populate & write the templates
    this._templateWriter.write(filePath, template, {
      $1: imageName || "ubuntu:18.04"
    });
  }

  /**
   * Create a Dockerfile for a NodeJS.
   */
  _createNodeDockerFile() {
    const fileName = (this._positionalArgs.length >= 4) ? this._positionalArgs[3] : "Dockerfile";
    const version = this._argv["version"];
    const filePath = path.join(process.cwd(), `${fileName}`);

    // read the templates
    const template = this._templateReader.read("Dockerfile.node");

    // populate & write the templates
    this._templateWriter.write(filePath, template, {
      $1: version || "12"
    });
  }
}

module.exports = DockerTemplateCreator;
