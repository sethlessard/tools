#!/usr/bin/env node
// determine the root of the tools project
const path = require("path");
global.appRoot = path.dirname(__dirname);

// import npm modules
const argv = require("minimist")(process.argv.slice(2));

// import local modules
const CProjectCreator = require("./creator/project/CProjectCreator");
const CppProjectCreator = require("./creator/project/CppProjectCreator");
const NodeProjectCreator = require("./creator/project/NodeProjectCreator");
const { registerHelp, showHelp } = require("./help/Help");

const nodeProjectCreator = new NodeProjectCreator(global.appRoot, argv);
const cProjectCreator = new CProjectCreator(global.appRoot, argv);
const cppProjectCreator = new CppProjectCreator(global.appRoot, argv);

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
    default:
      showHelp("create");
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
    default:
      showHelp();
  }
};

main();
