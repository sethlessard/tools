import * as fs from "fs";

class JsonWriter {

  /**
   * Write to a JSON file.
   * @param {string} path the path to the JSON file.
   * @param {any} json the json.
   */
  write(path: string, json: any) {
    fs.writeFileSync(path, JSON.stringify(json));
  }
}

export default JsonWriter;
