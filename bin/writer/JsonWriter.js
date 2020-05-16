const fs = require("fs");

class JsonWriter {

  /**
   * Write to a JSON file.
   * @param {string} path the path to the JSON file.
   * @param {object} json the json.
   */
  write(path, json) {
    fs.writeFileSync(path, JSON.stringify(json));
  }
}

module.exports = JsonWriter;