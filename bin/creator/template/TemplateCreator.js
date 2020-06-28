const { enforceFileExtension, stripFileExtension } = require("../../util/FileUtils");
const TemplateReader = require("../../reader/TemplateReader");
const TemplateWriter = require("../../writer/TemplateWriter");
const HasHelp = require("../../help/HasHelp");

class TemplateCreator extends HasHelp {

  /**
   * TemplateCreator constructor.
   * @param {string} type the type of template creator.
   * @param {object} argv the arguements passed to the t00ls command.
   */
  constructor(type, argv) {
    super();
    this._positionalArgs = argv["_"];
    this._argv = argv;
    this._type = this._positionalArgs[2];

    this._templateReader = new TemplateReader(type);
    this._templateWriter = new TemplateWriter();
    this._enforceFileExtension = this._enforceFileExtension.bind(this);
    this._populateTemplate = this._populateTemplate.bind(this);
    this._stripFileExtension = this._stripFileExtension.bind(this);
  }

  /**
   * Create the template
   */
  create() { }

  /**
   * Make sure a file has the correct extension. 
   * @param {string} fileName the name of the file.
   * @param {string} fileExtension the file extension.
   * @returns {string} the proper file name.
   */
  _enforceFileExtension(fileName, fileExtension) {
    return enforceFileExtension(fileName, fileExtension);
  }

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

  /**
   * Strip the file extension from a file name.
   */
  _stripFileExtension(fileName) {
    return stripFileExtension(fileName);
  }
}

module.exports = TemplateCreator;
