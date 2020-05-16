#!/usr/bin/env node
const argv = require("minimist")(process.argv.slice(2));

const JavascriptTemplateCreator = require("./creator/JavascriptTemplateCreator");
const NodeCreator = require("./creator/NodeCreator");

// TODO: update with template stuff
const HELP_MSG = `
Usage:

tools create [language] [projectType]               Create a new project.
  [language]:
    - node                                          NodeJS project
    - python                                        Python project
    - c                                             C project
    - cpp or c++                                    C++ project
    - react                                         ReactJS project
  [projectType]:
    - api                                           Basic API (node & python)
    - socket.io                                     Basic socket.io server (node)

tools template [language] [templateType]            Create a file based off of a template.
  [language]:
    - javascript                                    JavaScript template
    - python                                        Python template
    - html                                          HTML template
    - css                                           CSS template
    - docker                                        Docker template
  [templateType]:
    - class                                         Class template (javascript, python)
`.trim();

/**
 * Create a new something.
 */
const create = () => {
  const positionalArgs = argv["_"];
  if (positionalArgs.length <= 1) {
    showHelp();
    // TODO: showCreateHelp();
  }

  // determine the language
  const language = positionalArgs[1];

  // determine the type of project
  const type = positionalArgs[2];

  switch (language) {
    case "node":
      const nc = new NodeCreator(argv);
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
 * Show help.
 */
const showHelp = () => {
  console.log(HELP_MSG);
  process.exit(0);
};

/**
 * Create a new file based off of a template.
 */
const template = () => {
  const positionalArgs = argv["_"];
  if (positionalArgs.length <= 1) {
    showHelp();
    // TODO: showTemplateHelp();
  }

  // determine the language
  const language = positionalArgs[1];

  // determine the type of project
  const type = positionalArgs[2];

  switch (language) {
    case "javascript":
      const js = new JavascriptTemplateCreator(argv);
      js.create();
      break;
    case "css":
    case "docker":
    case "html":
    case "python":
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
