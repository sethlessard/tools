import { execSync } from "child_process";
import * as fse from "fs-extra";
import * as path from "path";

import ProjectCreator from "./ProjectCreator";
import JsonReader from "../../reader/JsonReader";
import JsonWriter from "../../writer/JsonWriter";

type Dependency = { name: string, version: string } | string;

class NodeProjectCreator extends ProjectCreator {

  private readonly _packagePath: string;
  private readonly _jsonReader: JsonReader;
  private readonly _jsonWriter: JsonWriter;

  /**
   * NodeProjectCreator constructor.
   * @param {string} appBase the path to the base of the tools app.
   * @param {any} argv the arguments passed to the tools command.
   */
  constructor(appBase: string, argv: any) {
    super("node", appBase, argv);
    if (this._path) {
      this._packagePath = path.join(this._path, "package.json");
    } else {
      throw new Error("Path must be specified.");
    }

    this._jsonReader = new JsonReader();
    this._jsonWriter = new JsonWriter();
  }

  create() {
    // initialize the directory
    this._createDirectory();

    // configure the package.json
    const pack = this._jsonReader.read(this._packagePath);
    pack.version = "0.0.1";
    pack.description = "description here"; // TODO: description
    pack.author = "Seth Lessard <sethlessard@outlook.com>";

    switch (this._type) {
      case "api":
        this._createApi(pack);
        break;
      case "react-app":
        this._createReactApp();
        break;
      case "react-library":
        this._createReactLibrary();
        break;
      case "socket.io-server":
        this._createSocketioServer(pack);
        break;
      default:
        console.log(`"${this._type}" is not a registered NodeJS project type.`);
        break;
    }
  }

  /**
   * Get the Node.js project help.
   * @returns {{ description: string, help: {[string]: {description: string, args: {[string]: {description: string, args: {[string|number]: { description: string, default?: any, required?: boolean }}}}}}} the help.
   */
  getHelp() {
    return {
      description: "Node.js projects",
      help: {
        api: {
          description: "Simple Express api"
        },
        "react-app": {
          description: "Simple React app"
        },
        "react-library": {
          description: "Simple React library"
        },
        "socket.io-server": {
          description: "Simple Express api"
        }
      }
    };
  }

  /**
   * Get the gulp scripts.
   * @returns {{ debug: string, start: string, test: string }} the gulp scripts
   */
  _getGulpScripts() {
    return {
      "debug": "gulp debug",
      "start": "gulp develop",
      "test": "mocha --recursive"
    };
  }

  /**
   * Initialize a simple API project.
   * @param {any} the package.json file.
   */
  _createApi(pack: any) {
    // update the package.json file.
    pack.scripts = this._getGulpScripts();
    pack.main = "dist/index.js";
    // write the package.json file.
    this._jsonWriter.write(this._packagePath, pack);

    // install the dependencies
    const dependencies = [
      "express",
      "helmet",
      "body-parser",
      "dotenv"
    ];
    const devDependencies = [
      "rimraf",
      "mocha",
      "chai",
      "supertest",
      "gulp",
      "gulp-babel",
      "gulp-sourcemaps",
      "gulp-inject-string",
      "gulp-nodemon",
      "nodemon",
      "@babel/cli",
      "@babel/core",
      "@babel/node",
      "@babel/preset-env"
    ];
    this._installDependencies(dependencies);
    this._installDevDependencies(devDependencies);

    // copy the template
    fse.copySync(path.join(this._templateBase, "simple-api"), this._path);
  }

  /**
   * Initialize the project directory.
   */
  _createDirectory() {
    super._createDirectory();

    // npm init
    this._inDir("npm init --yes");
  }

  /**
 * Configure the dependencies and devDependencies to use exact versions.
 * @param {object} pack the package.json.
 */
  _configureExactDepencies(pack: any) {
    // TODO: implement
    return pack;
  }

  /**
   * Create a new React app.
   */
  _createReactApp() {
    execSync(`${path.join(this._appBase, "node_modules/.bin/create-react-app")} ${this._path}`);

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
  _createReactLibrary() {
    execSync(`${path.join(this._appBase, "node_modules/.bin/create-react-library")} --no-git --skip-prompts ${this._path}`);

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
   * Initialize a simple socket.io server project.
   * @param {any} pack the package.json file.
   */
  _createSocketioServer(pack: any) {
    // update the package.json file.
    pack.scripts = this._getGulpScripts();
    pack.main = "dist/index.js";
    // write the package.json file.
    this._jsonWriter.write(this._packagePath, pack);

    const dependencies = [
      "express",
      "helmet",
      "body-parser",
      "socket.io"
    ];
    const devDependencies = [
      "rimraf",
      "mocha",
      "chai",
      "supertest",
      "gulp",
      "gulp-babel",
      "gulp-sourcemaps",
      "gulp-inject-string",
      "gulp-nodemon",
      "nodemon",
      "@babel/cli",
      "@babel/core",
      "@babel/node",
      "@babel/preset-env",
      "socket.io-client"
    ];
    this._installDependencies(dependencies);
    this._installDevDependencies(devDependencies);

    // copy the template
    fse.copySync(path.join(this._templateBase, "simple-socketio-server"), this._path);
  }

  /**
   * Install NPM dependencies for a NodeJS project.
   * @param {Dependency[]} dependencies the dependencies.
   */
  _installDependencies(dependencies: Dependency[]) {
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
   * @param {Dependency[]} dependencies the dependencies.
   */
  _installDevDependencies(dependencies: Dependency[]) {
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

module.exports = NodeProjectCreator;