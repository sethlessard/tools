const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const JsonReader = require("../reader/JsonReader");
const JsonWriter = require("../writer/JsonWriter");

class NodeCreator {

  /**
   * NodeCreator constructor.
   * @param {string} path the path to the new node project.
   * @param {string} type the type of NodeJS app to create.
   */
  constructor(path, type) {
    this._path = path;
    this._type = type;

    // binding
    this._initializeDirectory = this._initializeDirectory.bind(this);
    this._installDependency = this._installDependency.bind(this);
  }

  create() {
    // initialize the directory
    this._initializeDirectory();

    // configure the package.json
    const packPath = path.join(this._path, "package.json");
    const writer = new JsonWriter();
    const reader = new JsonReader();
    const pack = reader.read(packPath);
    pack.version = "0.0.1";
    pack.description = "description here"; // TODO: description
    pack.author = "Seth Lessard <sethlessard@outlook.com>";
    writer.write(pack, packPath);

    switch (this._type) {
      case "api":
        this._initializeApi();
        break;
      case "socketio":
        this._initializeSocketio();
      default:
        console.log(`"${this._type}" is not a registered NodeJS project type.`);
        break;
    }
  }

  // TODO: outsource this to a different file
  _inDir(command) {
    execSync(command, { cwd: this._path });
  }

  /**
   * Initialize a simple API project.
   */
  _initializeApi() {
    // install the dependencies
    const dependencies = [
      "express",
      "helmet",
      "body-parser"
    ];
    const devDependencies = [
      "mocha",
      "chai",
      "supertest",
      "gulp"
    ];
    this._installDependencies(dependencies);
    this._installDependencies(devDependencies, true);

    // copy the template
  }

  /**
   * Initialize the project directory.
   */
  _initializeDirectory() {
    // create the directory
    if (!fs.existsSync(this._path)) {
      fs.mkdirSync(this._path);
    } else {
      // TODO: ask if we should delete/create the directory. For now, just exit.
      console.error(`${this._path} already exists.`);
      process.exit(1);
    }

    // npm init
    this._inDir("npm init --yes");
  }

  /**
   * Initialize a simple socket.io project.
   */
  _initializeSocketio() {
    const dependencies = [
      "express",
      "helmet",
      "body-parser",
      "socket.io"
    ];
    const devDependencies = [
      "mocha",
      "chai",
      "supertest",
      "socket.io-client",
      "gulp"
    ];
    this._installDependencies(dependencies);
    this._installDependencies(devDependencies, true);
  }

  /**
   * Install an NPM dependency.
   * @param {string} name the name of the NPM dependency.
   * @param {string?} version the version to install. The latest will be installed if not specified.
   */
  _installDependency(name, version) {
    let installCommand = "npm install -E ";
    
    if (version) {
      installCommand += `${name}@${version}`
    } else {
      installCommand += name;
    }

    // install the dependency.
    this._inDir(installCommand);
  }

  /**
   * Install an NPM dependency as a development dependency.
   * @param {string} name the name of the NPM dependency.
   * @param {string?} version the version to install. The latest will be installed if not specified.
   */
  _installDevDependency(name, version) {
    let installCommand = "npm install -E -D ";
    
    if (version) {
      installCommand += `${name}@${version}`
    } else {
      installCommand += name;
    }

    // install the dependency.
    this._inDir(installCommand);
  }

  /**
   * Install NPM dependencies for a NodeJS project.
   * @param {{ name: string, version: string}[] | string[]} dependencies the dependencies.
   * @param {boolean} areDev whether or not the dependencies should be installed as
   * development dependencies or regular dependencies.
   */
  _installDependencies(dependencies, areDev = false) {
    for (const dependency of dependencies) {
      if (typeof dependency === "string") {
        if (areDev) this._installDevDependency(dependency);
        else this._installDependency(dependency);
      } else {
        if (areDev) this._installDevDependency(dependency.name, dependency.version);
        else this._installDependency(dependency.name, dependency.version);
      }
    }
  } 
}

module.exports = NodeCreator;