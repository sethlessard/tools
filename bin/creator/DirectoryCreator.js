const fs = require("fs");
const path = require("path");

class DirectoryCreator {
  
  // TODO: unit test
  /**
   * Create the directories necessary for a given file.
   * @param {string} file the path to the file. 
   */
  createDirectoryTo(file) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
  }
}

module.exports = DirectoryCreator;
