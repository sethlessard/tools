import { execSync } from "child_process";
import * as fse from "fs-extra";
import * as path from "path";

import ProjectCreator from "../ProjectCreator";
import JsonReader from "../../reader/JsonReader";
import JsonWriter from "../../writer/JsonWriter";
import NodeProjectOptions from "./NodeProjectOptions";
import NodeProjectType, { getNodeProjectTemplateDirectory } from "./NodeProjectType";
import { ExtensionContext } from "vscode";

type Dependency = { name: string, version: string } | string;

class NodeProjectCreator extends ProjectCreator {

  private readonly _packagePath: string;
  private readonly _jsonReader: JsonReader;
  private readonly _jsonWriter: JsonWriter;
  protected readonly _options: NodeProjectOptions;

  /**
   * NodeProjectCreator constructor.
   * @param {string} appBase the path to the base of the tools app.
   * @param {any} argv the arguments passed to the tools command.
   */
  constructor(projectOptions: NodeProjectOptions, context: ExtensionContext) {
    super("node",  projectOptions, context);
    this._options = projectOptions;
    this._packagePath = path.join(projectOptions.path, "package.json");

    this._jsonReader = new JsonReader();
    this._jsonWriter = new JsonWriter();
  }

  create(): Promise<void> {
    return new Promise((resolve, reject) => {
      // initialize the directory
      this._createDirectory();

      // configure the package.json
      const pack = this._jsonReader.read(this._packagePath);
      pack.version = "0.0.1";
      pack.description = this._options.description;
      pack.author = "Seth Lessard <sethlessard@outlook.com>";

      switch (this._options.type) {
        case NodeProjectType.Api:
          return this._createApi(pack);
        case NodeProjectType.ReactApp:
          return this._createReactApp();
        case NodeProjectType.ReactLibrary:
          return this._createReactLibrary();
        case NodeProjectType.SocketIOServer:
          return this._createSocketioServer(pack);
      }
    });
  }

  /**
   * Get the gulp scripts.
   * @returns {{ debug: string, start: string, test: string }} the gulp scripts
   */
  private _getGulpScripts() {
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
  private _createApi(pack: any) {
    // TODO: move dependencies to package.json in template directory.
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
    fse.copySync(path.join(this._templateBase, getNodeProjectTemplateDirectory(NodeProjectType.Api)!!), this._options.path);
  }

  /**
   * Initialize the project directory.
   */
  protected _createDirectory() {
    super._createDirectory();

    // npm init
    this._inDir("npm init --yes");
  }

  /**
 * Configure the dependencies and devDependencies to use exact versions.
 * @param {object} pack the package.json.
 */
  private _configureExactDepencies(pack: any) {
    // TODO: implement
    return pack;
  }

  /**
   * Create a new React app.
   */
  private _createReactApp() {
    execSync(`${path.join(this._options.path, "node_modules/.bin/create-react-app")} ${this._options.type}`);

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
  private _createReactLibrary() {
    execSync(`${path.join(this._options.path, "node_modules/.bin/create-react-library")} --no-git --skip-prompts ${this._options.type}`);

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
  private _createSocketioServer(pack: any) {
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
    fse.copySync(path.join(this._templateBase, getNodeProjectTemplateDirectory(NodeProjectType.SocketIOServer)!!), this._options.path);
  }

  /**
   * Install NPM dependencies for a NodeJS project.
   * @param {Dependency[]} dependencies the dependencies.
   */
  private _installDependencies(dependencies: Dependency[]) {
    let installCommand = "npm install -E";
    for (const dependency of dependencies) {
      if (typeof dependency === "string") {
        installCommand += ` ${dependency}`;
      } else {
        installCommand += ` ${dependency.name}@${dependency.version}`;
      }
    }

    // install the dependencies
    this._inDir(installCommand);
  }

  /**
   * Install NPM dependencies for a NodeJS project as development dependencies
   * @param {Dependency[]} dependencies the dependencies.
   */
  private _installDevDependencies(dependencies: Dependency[]) {
    let installCommand = "npm install -E -D";
    for (const dependency of dependencies) {
      if (typeof dependency === "string") {
        installCommand += ` ${dependency}`;
      } else {
        installCommand += ` ${dependency.name}@${dependency.version}`;
      }
    }

    // install the dependencies
    this._inDir(installCommand);
  }

  
}

export default NodeProjectCreator;
