#!/usr/bin/env node
// determine the root of the tools project
const path = require("path");
global.appRoot = path.dirname(__dirname);

// import npm modules
const argv = require("minimist")(process.argv.slice(2));

// import local modules
const CProjectCreator = require("./creator/project/CProjectCreator");
const CppProjectCreator = require("./creator/project/CppProjectCreator");
const CTemplateCreator = require("./creator/template/CTemplateCreator");
const CppTemplateCreator = require("./creator/template/CppTemplateCreator");
const DockerTemplateCreator = require("./creator/template/DockerTemplateCreator");
const HtmlTemplateCreator = require("./creator/template/HtmlTemplateCreator");
const JavascriptTemplateCreator = require("./creator/template/JavascriptTemplateCreator");
const NodeProjectCreator = require("./creator/project/NodeProjectCreator");
const PythonTemplateCreator = require("./creator/template/PythonTemplateCreator");
const ReactTemplateCreator = require("./creator/template/ReactTemplateCreator");
const SystemdTemplateCreator = require("./creator/template/SystemdTemplateCreator");
const { showCreateHelp, showHelp, showTemplateHelp } = require("./Help");

/**
 * Create a C template.
 */
const createCTemplate = () => new CTemplateCreator(argv).create();

/**
 * Create a C++ template.
 */
const createCppTemplate = () => new CppTemplateCreator(argv).create();

/**
 * Create a Docker template.
 */
const createDockerTemplate = () => new DockerTemplateCreator(argv).create();

/**
 * Create a HTML template.
 */
const createHtmlTemplate = () => new HtmlTemplateCreator(argv).create();

/**
 * Create a JavaScript template.
 */
const createJavascriptTemplate = () => new JavascriptTemplateCreator(argv).create();

/**
 * Create a Python template.
 */
const createPythonTemplate = () => new PythonTemplateCreator(argv).create();

/**
 * Create a React template.
 */
const createReactTemplate = () => new ReactTemplateCreator(argv).create();

/**
 * Create a SystemD service template.
 */
const createSystemdTemplate = () => new SystemdTemplateCreator(argv).create();

/**
 * Create a new project.
 */
const createProject = () => {
  const positionalArgs = argv["_"];
  if (positionalArgs.length <= 1) {
    showCreateHelp();
  }

  const node = new NodeProjectCreator(global.appRoot, argv);
  const c = new CProjectCreator(global.appRoot, argv);
  const cpp = new CppProjectCreator(global.appRoot, argv);
  switch (positionalArgs[1]) {
    case "node":
      node.create();
      break;
    case "c":
      c.create();
      break;
    case "cpp":
    case "c++":
      cpp.create();
      break;
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

const createTemplate = () => {
  const positionalArgs = argv["_"];
  if (positionalArgs.length <= 1) {
    showTemplateHelp();
  }

  switch (positionalArgs[1]) {
    case "c":
      createCTemplate();
      break;
    case "cpp":
    case "c++":
      createCppTemplate();
      break;
    case "docker":
      createDockerTemplate();
      break;
    case "html":
      createHtmlTemplate();
      break;
    case "javascript":
      createJavascriptTemplate();
      break;
    case "python":
      createPythonTemplate();
      break;
    case "react":
      createReactTemplate();
      break;
    case "systemd":
      createSystemdTemplate();
      break;
    case "css":
      // TODO: implement
      console.error(`Templates for "${positionalArgs[1]}" are not completed yet.`);
      break;
    default:
      showTemplateHelp();
      break;
  }
}

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
      createProject();
      break;
    case "template":
      createTemplate();
      break;
    default:
      showHelp();
  }
};

process.on("SIGINT", function () {

});

main();
