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
const { registerHelp, showHelp } = require("./help/Help");

const nodeProjectCreator = new NodeProjectCreator(global.appRoot, argv);
const cProjectCreator = new CProjectCreator(global.appRoot, argv);
const cppProjectCreator = new CppProjectCreator(global.appRoot, argv);

const cTemplateCreator = new CTemplateCreator(argv);
const cppTemplateCreator = new CppTemplateCreator(argv);
const dockerTemplateCreator = new DockerTemplateCreator(argv);
const htmlTemplateCreator = new HtmlTemplateCreator(argv);
const javascriptTemplateCreator = new JavascriptTemplateCreator(argv);
const pythonTemplateCreator = new PythonTemplateCreator(argv);
const reactTemplateCreator = new ReactTemplateCreator(argv);
const systemdTemplateCreator = new SystemdTemplateCreator(argv);

/**
 * Create a C template.
 */
const createCTemplate = () => cTemplateCreator.create();

/**
 * Create a C++ template.
 */
const createCppTemplate = () => cppTemplateCreator.create();

/**
 * Create a Docker template.
 */
const createDockerTemplate = () => dockerTemplateCreator.create();

/**
 * Create a HTML template.
 */
const createHtmlTemplate = () => htmlTemplateCreator.create();

/**
 * Create a JavaScript template.
 */
const createJavascriptTemplate = () => javascriptTemplateCreator.create();

/**
 * Create a Python template.
 */
const createPythonTemplate = () => pythonTemplateCreator.create();

/**
 * Create a React template.
 */
const createReactTemplate = () => reactTemplateCreator.create();

/**
 * Create a SystemD service template.
 */
const createSystemdTemplate = () => systemdTemplateCreator.create();

/**
 * Create a new project.
 */
const createProject = () => {
  const positionalArgs = argv["_"];
  if (positionalArgs.length <= 1) {
    showHelp("create");
  }

  switch (positionalArgs[1]) {
    case "c":
      cProjectCreator.create();
      break;
    case "cpp":
    case "c++":
      cppProjectCreator.create();
      break;
    case "node":
      nodeProjectCreator.create();
      break;
    case "python":
      console.error(`"${positionalArgs[1]}" not yet implemented.`);
      process.exit(1);
      break;
    default:
      showHelp("create");
      process.exit(1);
      break;
  }
};

const createTemplate = () => {
  const positionalArgs = argv["_"];
  if (positionalArgs.length <= 1) {
    showHelp("template");
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
      showHelp("template");
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

  // register help
  const help = {
    create: {
      description: "Create a new project",
      languages: {
        c: cProjectCreator.getHelp(),
        cpp: cppProjectCreator.getHelp(),
        node: nodeProjectCreator.getHelp()
      },
      usage: "create [language] [type]"
    },
    template: {
      description: "Create a new template",
      languages: {
        c: cTemplateCreator.getHelp(),
        cpp: cppTemplateCreator.getHelp(),
        docker: dockerTemplateCreator.getHelp(),
        html: htmlTemplateCreator.getHelp(),
        javascript: javascriptTemplateCreator.getHelp(),
        python: pythonTemplateCreator.getHelp(),
        react: reactTemplateCreator.getHelp(),
        system: systemdTemplateCreator.getHelp()
      },
      usage: "template [language] [type]"
    }
  };
  registerHelp(help);

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
