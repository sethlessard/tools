import { exec } from "child_process";
import { ExtensionContext } from "vscode";
import { promisify } from "util";
import * as fse from "fs-extra";
import * as path from "path";
const pExec = promisify(exec);

import ProjectCreator from "../ProjectCreator";
import JsonReader from "../../reader/JsonReader";
import JsonWriter from "../../writer/JsonWriter";
import NodeProjectOptions from "./NodeProjectOptions";
import NodeProjectType, { getNodeProjectTemplateDirectory } from "./NodeProjectType";

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
    super("node", projectOptions, context);
    this._options = projectOptions;
    this._packagePath = path.join(this._projectPath, "package.json");

    this._jsonReader = new JsonReader();
    this._jsonWriter = new JsonWriter();
  }

  create(): Promise<void> {
    switch (this._options.type) {
      case NodeProjectType.Api:
        return this._createApi();
      case NodeProjectType.ReactApp:
        return this._createReactApp();
      case NodeProjectType.ReactLibrary:
        return this._createReactLibrary();
      case NodeProjectType.SocketIOServer:
        return this._createSocketioServer();
    }
  }

  /**
   * Get the package.json and set some defaults.
   */
  private _getPackageJson() {
    const pack = this._jsonReader.read(this._projectPath);
    pack.version = "0.0.1";
    pack.description = this._options.description;
    pack.author = "Seth Lessard <sethlessard@outlook.com>";
    return pack;
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
   */
  private _createApi(): Promise<void> {
    // initialize the directory
    this._createDirectory();

    // configure the package.json
    const pack = this._getPackageJson();
    // TODO: [TLS-11] move dependencies to package.json in template directory.
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
    return fse.copy(path.join(this._templateBase, getNodeProjectTemplateDirectory(NodeProjectType.Api)!!), this._projectPath);
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
    // TODO: [TLS-14] implement
    return pack;
  }

  /**
   * Create a new React app.
   */
  private _createReactApp() {
    const craExec = path.join(this._context.extensionPath, "node_modules/.bin/create-react-app");
    return pExec(`${craExec} ${(this._options.typescript) ? "--typescript " : ""}${this._options.name}`, { cwd: this._options.parentPath })
      .then(({ stdout, stderr }) => {
        if (stderr) { throw new Error(stderr); }
        // TODO: [TLS-12] display stdout somehow

        // configure the package.json
        const pack = this._getPackageJson();

        // TODO: [TLS-13] pack.repository
        // write the package.json file.
        this._jsonWriter.write(this._packagePath, pack);

        // define the dependencies needed
        const dependencies = [
          "@react-uix/web",
          "styled-components"
        ];

        // install the dependencies
        this._installDependencies(dependencies);
      });
  }

  /**
   * Create a new React library.
   */
  private _createReactLibrary() {
    const crlExec = path.join(this._context.extensionPath, "node_modules/.bin/create-react-library");

    return pExec(`${crlExec} --no-git --skip-prompts  ${(this._options.typescript) ? "--template=typescript " : ""}${this._options.name}`, { cwd: this._options.parentPath })
      .then(({ stdout, stderr }) => {
        // if (stderr) { throw new Error(stderr); }
        // configure the package.json
        const pack = this._getPackageJson();

        // TODO: [TLS-13] pack.repository
        // write the package.json file.
        this._jsonWriter.write(this._packagePath, pack);

        // define the dependencies needed
        const dependencies = ["styled-components"];

        // install the dependencies
        this._installDependencies(dependencies);
      });
  }

  /**
   * Initialize a simple socket.io server project.
   */
  private _createSocketioServer(): Promise<void> {
    // initialize the directory
    this._createDirectory();

    // configure the package.json
    const pack = this._getPackageJson();
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

    return fse.copy(path.join(this._templateBase, getNodeProjectTemplateDirectory(NodeProjectType.SocketIOServer)!!), this._projectPath);
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
