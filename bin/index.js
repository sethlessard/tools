#!/usr/bin/env node

const argv = require("minimist")(process.argv.slice(2));
const NodeCreator = require("./creator/NodeCreator");

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
    console.error("Nothing to create.");
    process.exit(1);
  }

  // determine the language
  const language = positionalArgs[1];

  // determine the type of project
  const type = positionalArgs[2];

  switch (language) {
    case "node":
      const nc = new NodeCreator(positionalArgs[3], type);
      nc.create();
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
    default:
      showHelp();
  }
};
main();

/**
 * Show help.
 */
const showHelp = () => {
  console.log(HELP_MSG);
  process.exit(0);
};

process.on("SIGINT", function() {
  
});