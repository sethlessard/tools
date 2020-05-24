const path = require("path");

const TemplateCreator = require("./TemplateCreator");

class JavascriptTemplateCreator extends TemplateCreator {

  /**
   * JavascriptTemplateCreator constructor.
   * @param {object} argv the arguements passed to the tools command
   */
  constructor(argv) {
    super("javascript", argv);
  }

  /**
   * Create the template.
   */
  create() {
    switch (this._type) {
      case "class":
        this._createClass();
        break;
      case "class.es6":
        this._createClassES6();
        break;
      case "singleton":
        this._createSingleton();
        break;
      case "singleton.es6":
        this._createSingletonES6();
        break;
      case "test":
        this._createTest();
        break;
      default:
        console.error(`"${this._type}" is not a registered JavaScript template type.`);
        break;
    }
  }

  /**
   * Create a JavaScript class.
   */
  _createClass() {
    const className = this._positionalArgs[3];
    const filePath = path.join(process.cwd(), `${className}.js`);

    this._populateTemplate(filePath, "class", { $1: className });
  }

  /**
   * Create an ES6+ JavaScript class.
   */
  _createClassES6() {
    const className = this._positionalArgs[3];
    const filePath = path.join(process.cwd(), `${className}.js`);

    this._populateTemplate(filePath, "class.es6", { $1: className });
  }

  /**
   * Create a singleton class.
   */
  _createSingleton() {
    const className = this._positionalArgs[3];
    const filePath = path.join(process.cwd(), `${className}.js`);

    this._populateTemplate(filePath, "singleton", { $1: className });
  }

  /**
   * Create an ES6+ singleton class.
   */
  _createSingletonES6() {
    const className = this._positionalArgs[3];
    const filePath = path.join(process.cwd(), `${className}.js`);

    this._populateTemplate(filePath, "singleton.es6", { $1: className });
  }

  /**
   * Create a mocha + chai unit test file.
   */
  _createTest() {
    const className = this._positionalArgs[3];
    const filePath = path.join(process.cwd(), `${className}.tests.js`);

    this._populateTemplate(filePath, "mochachai.unit", { $1: className });
  }
}

module.exports = JavascriptTemplateCreator;
