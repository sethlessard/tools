import * as fs from "fs";

class JsonReader {
  // TODO: [TLS-7] test

  /**
   * Read a JSON file.
   * @param {string} file the path to the JSON file.
   * @returns {any} the json file.
   */
  read(file: string) {
    return JSON.parse(fs.readFileSync(file).toString("utf8"));
  }
}

export default JsonReader;
