const TemplateReader = require("../../reader/TemplateReader");
const TemplateWriter = require("../../writer/TemplateWriter");

class TemplateCreator {

  /**
   * TemplateCreator constructor.
   * @param {string} type the type of template creator.
   * @param {object} argv the arguements passed to the t00ls command.
   */
  constructor(type, argv) {
    this._positionalArgs = argv["_"];
    this._argv = argv;
    this._type = this._positionalArgs[2];

    this._templateReader = new TemplateReader(type);
    this._templateWriter = new TemplateWriter();
  }

  /**
   * Create the template
   */
  create() { }

  /**
   * Read and populate a template file.
   * @param {string} filePath the path to the file to write.
   * @param {string} templateName the name of the template.
   * @param {object} templateContents the contents of the template.
   */
  _populateTemplate(filePath, templateName, templateContents = {}) {
    // read the templates
    const template = this._templateReader.read(templateName);

    // populate & write the templates
    this._templateWriter.write(filePath, template, templateContents);
  }
}

module.exports = TemplateCreator;
