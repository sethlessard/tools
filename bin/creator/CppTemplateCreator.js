const path = require("path");

const TemplateCreator = require("./TemplateCreator");

class CppTemplateCreator extends TemplateCreator {

  /**
   * CppTemplateCreator constructor.
   * @param {object} argv the arguements passed to the tools command
   */
  constructor(argv) {
    super("c++", argv);
  }

  // TODO: unit test
  /**
   * Create the template.
   */
  create() {
    switch (this._type) {
      case "class":
        this._createClass();
        break;
      case "main":
        this._createMain();
        break;
      case "singleton":
        this._createSingleton();
        break;
      default:
        console.error(`"${this._type}" is not a registered C++ template type.`);
        break;
    }
  }

  /**
   * Create a C++ class.
   */
  _createClass() {
    const className = this._positionalArgs[3];
    const classPath = path.join(process.cwd(), `${className}.cpp`);
    const headerPath = path.join(process.cwd(), `${className}.hpp`);

    // read the templates
    const classtemplate = this._templateReader.read("class");
    const headerTemplate = this._templateReader.read("class.header");

    // populate & write the templates
    this._templateWriter.write(classPath, classtemplate, { $1: className });
    this._templateWriter.write(headerPath, headerTemplate, { $1: className });
  }

  /**
   * Create a main.cpp file.
   */
  _createMain() {
    const filePath = path.join(process.cwd(), `main.cpp`);

    // read the templates
    const template = this._templateReader.read("main");

    // populate & write the templates
    this._templateWriter.write(filePath, template, {});
  }

  /**
   * Create a C++ singleton.
   */
  _createSingleton() {
    const className = this._positionalArgs[3];
    const classPath = path.join(process.cwd(), `${className}.cpp`);
    const headerPath = path.join(process.cwd(), `${className}.hpp`);

    // read the templates
    const classtemplate = this._templateReader.read("singleton");
    const headerTemplate = this._templateReader.read("singleton.header");

    // populate & write the templates
    this._templateWriter.write(classPath, classtemplate, { $1: className });
    this._templateWriter.write(headerPath, headerTemplate, { $1: className });
  }
}

module.exports = CppTemplateCreator;
