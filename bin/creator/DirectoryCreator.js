const path = require("path");
const fs = require("fs");

let _instance = null;

/**
 * Get the DirectoryCreator instance.
 * @returns {DirectoryCreator} the DirectoryCreator instance.
 */
const getDirectoryCreatorInstance = () => {
  if (_instance === null) {
    _instance = new DirectoryCreator();
  }
  return _instance;
};

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

module.exports = getDirectoryCreatorInstance;
