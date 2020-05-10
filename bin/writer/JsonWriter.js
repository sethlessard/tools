const fs = require("fs");

class JsonWriter {

  /**
   * Write to a JSON file.
   * @param {object} json the json.
   * @param {string} file the path to the JSON file.
   */
  write(json, file) {
    const toStr = JSON.stringify(json);
    fs.writeFileSync(file, toStr);
  }
}

module.exports = JsonWriter;