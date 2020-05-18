const { execSync } = require("child_process");
// const fs = require("fs");
// const fse = require("fs-extra");
const path = require("path");

const JsonReader = require("../reader/JsonReader");
const JsonWriter = require("../writer/JsonWriter");

class ReactProjectCreator {

  /**
   * ReactProjectCreator constructor.
   * @param {string} appBase the path to the base of the tools app.
   * @param {object} argv the arguments passed to the tools command.
   */
  constructor(appBase, argv) {
    this._appBase = appBase;
    this._positionalArgs = argv["_"];
    this._type = this._positionalArgs[2];
    this._path = this._positionalArgs[3];
    this._packagePath = path.join(this._path, "package.json");

    this._jsonReader = new JsonReader();
    this._jsonWriter = new JsonWriter();
  }

  create() {
    switch (this._type) {
      case "app":
        this._createApp();
        break;
      case "library":
        this._createLibrary();
        break;
      default:
        console.log(`"${this._type}" is not a registered NodeJS project type.`);
        break;
    }
  }

  /**
   * Configure the dependencies and devDependencies to use exact versions.
   * @param {object} pack the package.json.
   */
  _configureExactDepencies(pack) {
    // TODO: implement
    return pack;
  }

  /**
   * Create a new React app.
   */
  _createApp() {
    execSync(`create-react-app ${this._path}`);

    // configure the package.json
    const pack = this._jsonReader.read(this._packagePath);
    pack.version = "0.0.1";
    pack.description = "description here"; // TODO: description
    pack.author = "Seth Lessard <sethlessard@outlook.com>";
    // TODO: pack.repository
    // write the package.json file.
    this._jsonWriter.write(this._packagePath, pack);

    // define the dependencies needed
    const dependencies = [
      "@react-uix/web",
      "styled-components"
    ];

    // install the dependencies
    this._installDependencies(dependencies);
  }

  /**
   * Create a new React library.
   */
  _createLibrary() {
    execSync(`create-react-library --no-git --skip-prompts ${this._path}`);

    // configure the package.json
    const pack = this._jsonReader.read(this._packagePath);
    pack.version = "0.0.1";
    pack.description = "description here"; // TODO: description
    pack.author = "Seth Lessard <sethlessard@outlook.com>";
    // TODO: pack.repository
    // write the package.json file.
    this._jsonWriter.write(this._packagePath, pack);

    // define the dependencies needed
    const dependencies = ["styled-components"];

    // install the dependencies
    this._installDependencies(dependencies);
  }

  /**
   * Execte a command in the project's directory.
   * @param {string} command the command to execute.
   */
  _inDir(command) {
    execSync(command, { cwd: this._path });
  }
  
    /**
   * Install NPM dependencies for a NodeJS project.
   * @param {{ name: string, version: string}[] | string[]} dependencies the dependencies.
   */
  _installDependencies(dependencies) {
    let installCommand = "npm install -E";
    for (const dependency of dependencies) {
      if (typeof dependency === "string") {
        installCommand += ` ${dependency}`;
      } else {
        installCommand += ` ${dependency.name}@${dependency.version}`
      }
    }

    // install the dependencies
    this._inDir(installCommand);
  }

  /**
   * Install NPM dependencies for a NodeJS project as development dependencies
   * @param {{ name: string, version: string}[] | string[]} dependencies the dependencies.
   */
  _installDevDependencies(dependencies) {
    let installCommand = "npm install -E -D";
    for (const dependency of dependencies) {
      if (typeof dependency === "string") {
        installCommand += ` ${dependency}`;
      } else {
        installCommand += ` ${dependency.name}@${dependency.version}`
      }
    }

    // install the dependencies
    this._inDir(installCommand);
  }
}

module.exports = ReactProjectCreator;
