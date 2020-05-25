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

    this._populateTemplate(classPath, "class", { $1: className });
    this._populateTemplate(headerPath, "class.header", { $1: className });
  }

  /**
   * Create a main.cpp file.
   */
  _createMain() {
    const filePath = path.join(process.cwd(), `main.cpp`);
    this._populateTemplate(filePath, "main");
  }

  /**
   * Create a C++ singleton.
   */
  _createSingleton() {
    const className = this._positionalArgs[3];
    const classPath = path.join(process.cwd(), `${className}.cpp`);
    const headerPath = path.join(process.cwd(), `${className}.hpp`);

    this._populateTemplate(classPath, "singleton", { $1: className });
    this._populateTemplate(headerPath, "singleton.header", { $1: className });
  }
}

module.exports = CppTemplateCreator;