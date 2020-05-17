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
const { showCreateHelp, showHelp, showTemplateHelp } = require("./Help");

/**
 * Create a new something.
 */
const create = () => {
  const positionalArgs = argv["_"];
  if (positionalArgs.length <= 1) {
    showCreateHelp();
  }

  // determine the language
  const language = positionalArgs[1];

  // determine the type of project
  const type = positionalArgs[2];

  switch (language) {
    case "node":
      const nc = new NodeCreator(global.appRoot, argv);
      nc.create();
      break;
    case "c":
    case "cpp":
    case "c++":
    case "python":
    case "react":
      console.error(`"${language}" not yet implemented.`);
      process.exit(1);
      break;
    default:
      console.error(`Unkown language "${language}"`);
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

  // determine the language
  const language = positionalArgs[1];

  // determine the type of project
  const type = positionalArgs[2];

  switch (language) {
    case "c":
      const c = new CTemplateCreator(argv);
      c.create();
      break;
    case "cpp":
    case "c++":
      const cpp = new CppTemplateCreator(argv);
      cpp.create();
      break;
    case "docker":
      const docker = new DockerTemplateCreator(argv);
      docker.create();
      break;
    case "javascript":
      const js = new JavascriptTemplateCreator(argv);
      js.create();
      break;
    case "python":
      const python = new PythonTemplateCreator(argv);
      python.create();
      break;
    case "css":
    case "html":
      // TODO: implement
      console.error(`Templates for "${language}" are not completed yet.`);
      break;
    default:
      showHelp();
      break;
  }
};

process.on("SIGINT", function() {
  
});

main();
