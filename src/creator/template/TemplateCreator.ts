import { enforceFileExtension, getFileName, getParentDirectory, stripFileExtension } from "../../util/FileUtils";
import TemplateReader from "../../reader/TemplateReader";
import TemplateWriter from "../../writer/TemplateWriter";

class TemplateCreator {

  protected readonly _positionalArgs: any;
  protected readonly _argv: any;
  protected readonly _type: string;

  protected readonly _templateReader: TemplateReader;
  protected readonly _templateWriter: TemplateWriter;

  /**
   * TemplateCreator constructor.
   * @param {string} type the type of template creator.
   * @param {any} argv the arguements passed to the t00ls command.
   */
  constructor(type: string, argv: any) {
    this._positionalArgs = argv["_"];
    this._argv = argv;
    this._type = this._positionalArgs[2];

    this._templateReader = new TemplateReader(type);
    this._templateWriter = new TemplateWriter();
    this._enforceFileExtension = this._enforceFileExtension.bind(this);
    this._getFileName = this._getFileName.bind(this);
    this._getParentDirectory = this._getParentDirectory.bind(this);
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
  protected _enforceFileExtension(fileName: string, fileExtension: string) {
    return enforceFileExtension(fileName, fileExtension);
  }

  /**
   * Get the file name from a full path.
   * @param {string} fullPath the full path.
   * @returns {string} the file name. 
   */
  protected _getFileName(fullPath: string) {
    return getFileName(fullPath);
  }

  /**
   * Get an object name from a file name. Simply strips the file extension and returns.
   * @param {string} fileName the file name.
   * @returns {string} the object name.
   */
  protected _getObjectName(fileName: string) {
    return this._stripFileExtension(fileName);
  }

  /**
   * Get the parent directory of a path.
   * @param {string} fullPath the full path.
   * @returns {string} the parent path.
   */
  protected _getParentDirectory(fullPath: string) {
    return getParentDirectory(fullPath);
  }

  /**
   * Read and populate a template file.
   * @param {string} filePath the path to the file to write.
   * @param {string} templateName the name of the template.
   * @param {object} templateContents the contents of the template.
   */
  protected _populateTemplate(filePath: string, templateName: string, templateContents = {}) {
    // read the templates
    const template = this._templateReader.read(templateName);

    // populate & write the templates
    this._templateWriter.write(filePath, template, templateContents);
  }

  /**
   * Strip the file extension from a file name.
   */
  protected _stripFileExtension(fileName: string) {
    return stripFileExtension(fileName);
  }
}

export default TemplateCreator;
