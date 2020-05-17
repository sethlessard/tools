const { execSync } = require("child_process");
const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");

const JsonReader = require("../reader/JsonReader");
const JsonWriter = require("../writer/JsonWriter");

const SIMPLE_API_PATH = "templates/projects/node/simple-api";
const SIMPLE_SOCKETIO_PATH = "templates/projects/node/simple-socketio-server";

class NodeCreator {

  /**
   * NodeCreator constructor.
   * @param {string} appBase the path to the base of the tools app.
   * @param {object} argv the arguments passed to the tools command.
   */
  constructor(appBase, argv) {
    this._appBase = appBase;
    const positionalArgs = argv["_"];
    this._type = positionalArgs[2];
    this._path = positionalArgs[3];
    this._packagePath = path.join(this._path, "package.json");

    this._jsonReader = new JsonReader();
    this._jsonWriter = new JsonWriter();
  }

  create() {
    // initialize the directory
    this._initializeDirectory();

    // configure the package.json
    const pack = this._jsonReader.read(this._packagePath);
    pack.version = "0.0.1";
    pack.description = "description here"; // TODO: description
    pack.author = "Seth Lessard <sethlessard@outlook.com>";

    switch (this._type) {
      case "api":
        this._initializeApi(pack);
        break;
      case "socket.io-server":
        this._initializeSocketioServer(pack);
        break;
      default:
        console.log(`"${this._type}" is not a registered NodeJS project type.`);
        break;
    }
  }

  /**
   * Execte a command in the project's directory.
   * @param {string} command the command to execute.
   */
  _inDir(command) {
    execSync(command, { cwd: this._path });
  }

  /**
   * Initialize a simple API project.
   * @param {object} the package.json file.
   */
  _initializeApi(pack) {
    // update the package.json file.
    pack.scripts = {
      "start": "gulp develop",
      "debug": "gulp debug",
      "test": "mocha --recursive"
    }
    pack.main = "dist/index.js"
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
    fse.copySync(path.join(this._appBase, SIMPLE_API_PATH), this._path);
  }

  /**
   * Initialize the project directory.
   */
  _initializeDirectory() {
    // create the directory
    if (!fs.existsSync(this._path)) {
      fs.mkdirSync(this._path, { recursive: true });
    } else {
      // TODO: ask if we should delete/create the directory. For now, just exit.
      console.error(`${this._path} already exists.`);
      process.exit(1);
    }

    // npm init
    this._inDir("npm init --yes");
  }

  /**
   * Initialize a simple socket.io server project.
   * @param {object} the package.json file.
   */
  _initializeSocketioServer(pack) {
    // update the package.json file.
    pack.scripts = {
      "start": "gulp develop",
      "debug": "gulp debug",
      "test": "mocha --recursive"
    }
    pack.main = "dist/index.js"
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
    fse.copySync(path.join(this._appBase, SIMPLE_SOCKETIO_PATH), this._path);
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

module.exports = NodeCreator;