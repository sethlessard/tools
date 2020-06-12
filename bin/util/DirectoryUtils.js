const path = require("path");
const fs = require("fs");

/**
 * Create the directories necessary for a given file.
 * @param {string} file the path to the file. 
 */
const createDirectoryTo = (file) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

module.exports = {
  createDirectoryTo
}
