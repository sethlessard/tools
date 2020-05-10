#!/usr/bin/env node

const argv = require("minimist")(process.argv.slice(2));
const NodeCreator = require("./creator/NodeCreator");

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

  switch (positionalArgs[0]) {
    case "create":
      create();
      break;
  }
};
main();

process.on("SIGINT", function() {
  
});