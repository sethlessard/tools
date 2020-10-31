import * as path from "path";
import * as fs from "fs";

/**
 * Create the directories necessary for a given file.
 * @param {string} file the path to the file. 
 */
const createDirectoryTo = (file: string) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
};

export {
  createDirectoryTo
};
