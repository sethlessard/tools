const TemplateReader = require("../reader/TemplateReader");
const TemplateWriter = require("../writer/TemplateWriter");

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
}

module.exports = TemplateCreator;
