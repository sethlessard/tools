#!/usr/bin/env node
// determine the root of the tools project
const path = require("path");
global.appRoot = path.dirname(__dirname);

// import npm modules
const argv = require("minimist")(process.argv.slice(2));

// import local modules
const CTemplateCreator = require("./creator/CTemplateCreator");
const CppTemplateCreator = require("./creator/CppTemplateCreator");
const DockerTemplateCreator = require("./creator/DockerTemplateCreator");
const JavascriptTemplateCreator = require("./creator/JavascriptTemplateCreator");
const NodeCreator = require("./creator/NodeCreator");
const PythonTemplateCreator = require("./creator/PythonTemplateCreator");
const ReactProjectCreator = require("./creator/ReactProjectCreator");
const { showCreateHelp, showHelp, showTemplateHelp } = require("./Help");

/**
 * Create a new something.
 */
const create = () => {
  const positionalArgs = argv["_"];
  if (positionalArgs.length <= 1) {
    showCreateHelp();
  }

  const node = new NodeCreator(global.appRoot, argv);
  const react = new ReactProjectCreator(global.appRoot, argv);
  switch (positionalArgs[1]) {
    case "node":
      node.create();
      break;
    case "react":
      react.create();
      break;
    case "c":
    case "cpp":
    case "c++":
    case "python":
      console.error(`"${positionalArgs[1]}" not yet implemented.`);
      process.exit(1);
      break;
    default:
      console.error(`Unkown language "${positionalArgs[1]}"`);
      process.exit(1);
      break;
  }
};

/**
 * Main.
 */
const main = () => {
  const positionalArgs = argv["_"];
  if (argv["debug"]) {
    console.log(JSON.stringify(argv));
  }

  if (argv["h"] || argv["help"]) {
    showHelp();
  }

  switch (positionalArgs[0]) {
    case "create":
      create();
      break;
    case "template":
      template();
      break;
    default:
      showHelp();
  }
};

/**
 * Create a new file based off of a template.
 */
const template = () => {
  const positionalArgs = argv["_"];
  if (positionalArgs.length <= 1) {
    showTemplateHelp();
  }

  const c = new CTemplateCreator(argv);
  const cpp = new CppTemplateCreator(argv);
  const docker = new DockerTemplateCreator(argv);
  const js = new JavascriptTemplateCreator(argv);
  const python = new PythonTemplateCreator(argv);

  switch (positionalArgs[1]) {
    case "c":
      c.create();
      break;
    case "cpp":
    case "c++":
      cpp.create();
      break;
    case "docker":
      docker.create();
      break;
    case "javascript":
      js.create();
      break;
    case "python":
      python.create();
      break;
    case "css":
    case "html":
      // TODO: implement
      console.error(`Templates for "${positionalArgs[1]}" are not completed yet.`);
      break;
    default:
      showHelp();
      break;
  }
};

process.on("SIGINT", function() {
  
});

main();
