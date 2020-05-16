const fs = require("fs");

class JsonReader {

  /**
   * Read a JSON file.
   * @param {string} file the path to the JSON file.
   * @returns {object} the json file.
   */
  read(file) {
    return JSON.parse(fs.readFileSync(file).toString("utf8"));
  }
}

module.exports = JsonReader;
