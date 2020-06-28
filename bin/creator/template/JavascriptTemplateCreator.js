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
      case "express-router":
        this._createExpressRouter();
        break;
      case "express-router.es6":
        this._createExpressRouterES6();
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
   * Get the JavaScript template help.
   * @returns {{ description: string, help: {[string]: {description: string, args: {[string]: {description: string, args: {[string|number]: { description: string, default?: any, required?: boolean }}}}}}} the help.
   */
  getHelp() {
    return {
      description: "JavaScript templates",
      help: {
        class: {
          description: "Class template",
          args: {
            3: {
              description: "The name of the class"
            }
          }
        },
        "class.es6": {
          description: "ES6+ Class template",
          args: {
            3: {
              description: "The name of the class"
            }
          }
        },
        "express-router": {
          description: "Express Router template",
          args: {
            3: {
              description: "The name of the file"
            }
          }
        },
        "express-router.es6": {
          description: "ES6+ Express Router template",
          args: {
            3: {
              description: "The name of the file"
            }
          }
        },
        singleton: {
          description: "Singleton template",
          args: {
            3: {
              description: "The name of the singleton (class)"
            }
          }
        },
        "singleton.es6": {
          description: "ES6+ Singleton template",
          args: {
            3: {
              description: "The name of the singleton (class)"
            }
          }
        },
        test: {
          description: "Test template",
          args: {
            3: {
              description: "The name of the test file"
            }
          }
        }
      }
    };
  }

  /**
   * Create a JavaScript class.
   */
  _createClass() {
    // TODO: accept relative paths and absolute paths
    const filePath = path.join(process.cwd(), this._enforceFileExtension(this._positionalArgs[3], ".js"));
    const className = this._stripFileExtension(this._positionalArgs[3]);
    this._populateTemplate(filePath, "class", { $1: className });
  }

  /**
   * Create an ES6+ JavaScript class.
   */
  _createClassES6() {
    // TODO: accept relative paths and absolute paths
    const filePath = path.join(process.cwd(), this._enforceFileExtension(this._positionalArgs[3], ".js"));
    const className = this._stripFileExtension(this._positionalArgs[3]);
    this._populateTemplate(filePath, "class.es6", { $1: className });
  }

  /**
   * Create an Express router template.
   */
  _createExpressRouter() {
    // TODO: accept relative paths and absolute paths
    const filePath = path.join(process.cwd(), this._enforceFileExtension(this._positionalArgs[3], ".js"));
    this._populateTemplate(filePath, "express-router");
  }
  
  /**
   * Create an Express router ES6 template.
   */
  _createExpressRouterES6() {
    // TODO: accept relative paths and absolute paths
    const filePath = path.join(process.cwd(), this._enforceFileExtension(this._positionalArgs[3], ".js"));
    this._populateTemplate(filePath, "express-router.es6");
  }

  /**
   * Create a singleton class.
   */
  _createSingleton() {
    // TODO: accept relative paths and absolute paths
    const className = this._stripFileExtension(this._positionalArgs[3]);
    const filePath = path.join(process.cwd(), this._enforceFileExtension(this._positionalArgs[3], ".js"));
    this._populateTemplate(filePath, "singleton", { $1: className });
  }

  /**
   * Create an ES6+ singleton class.
   */
  _createSingletonES6() {
    // TODO: accept relative paths and absolute paths
    const className = this._stripFileExtension(this._positionalArgs[3]);
    const filePath = path.join(process.cwd(), this._enforceFileExtension(this._positionalArgs[3], ".js"));
    this._populateTemplate(filePath, "singleton.es6", { $1: className });
  }

  /**
   * Create a mocha + chai unit test file.
   */
  _createTest() {
    // TODO: accept relative paths and absolute paths
    const className = this._stripFileExtension(this._positionalArgs[3]);
    const filePath = path.join(process.cwd(), this._enforceFileExtension(this._positionalArgs[3], ".tests.js"));
    this._populateTemplate(filePath, "mochachai.unit", { $1: className });
  }
}

module.exports = JavascriptTemplateCreator;
