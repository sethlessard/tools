const path = require("path");

const TemplateReader = require("../reader/TemplateReader");
const TemplateWriter = require("../writer/TemplateWriter");

class JavascriptTemplateCreator {

  constructor(argv) {
    this._positionalArgs = argv["_"];
    this._argv = argv;
    this._type = this._positionalArgs[2];

    this._templateReader = new TemplateReader("javascript");
    this._templateWriter = new TemplateWriter();
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

    // read the template
    const template = this._templateReader.read("class");

    // populate & write the template
    this._templateWriter.write(filePath, template, { $1: className });
  }

  /**
   * Create an ES6+ JavaScript class.
   */
  _createClassES6() {
    const className = this._positionalArgs[3];
    const filePath = path.join(process.cwd(), `${className}.js`);

    // read the template
    const template = this._templateReader.read("class.es6");

    // populate & write the template
    this._templateWriter.write(filePath, template, { $1: className });
  }

  /**
   * Create a singleton class.
   */
  _createSingleton() {
    const className = this._positionalArgs[3];
    const filePath = path.join(process.cwd(), `${className}.js`);

    // read the template
    const template = this._templateReader.read("singleton");

    // populate & write the template
    this._templateWriter.write(filePath, template, { $1: className });
  }

  /**
   * Create an ES6+ singleton class.
   */
  _createSingletonES6() {
    const className = this._positionalArgs[3];
    const filePath = path.join(process.cwd(), `${className}.js`);

    // read the template
    const template = this._templateReader.read("singleton.es6");

    // populate & write the template
    this._templateWriter.write(filePath, template, { $1: className });
  }

  /**
   * Create a mocha + chai unit test file.
   */
  _createTest() {
    const className = this._positionalArgs[3];
    const filePath = path.join(process.cwd(), `${className}.tests.js`);

    // read the template
    const template = this._templateReader.read("mochachai.unit");

    // populate & write the template
    this._templateWriter.write(filePath, template, { $1: className });
  }
}

module.exports = JavascriptTemplateCreator;
