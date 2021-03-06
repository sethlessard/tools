import * as path from "path";

/**
 * Make sure a file name ends in the proper file extension.
 * @param {string} fileName the name of the file.
 * @param {string} fileExt the file extension.
 * @returns {string} the proper file name.
 */
const enforceFileExtension = (fileName: string, fileExt: string) => {
  if (fileName.indexOf(fileExt) === -1) {
    return fileName + fileExt;
  }
  return fileName;
};

/**
 * Get a file name from a full file path.
 * @param {string} fullPath the full path.
 * @returns {string} the file name.
 */
const getFileName = (fullPath: string) => path.basename(fullPath);

/**
 * Get the parent directory of a path.
 * @param {string} fullPath the full path.
 * @returns {string} the parent path.
 */
const getParentDirectory = (fullPath: string) => path.dirname(fullPath);

/**
 * Remove a file extension from a file.
 * @param {string} fileName the name of the file.
 * @returns {string} the name of the file without the file extension.
 */
const stripFileExtension = (fileName: string) => {
  if (fileName.lastIndexOf(".") > 0) {
    return fileName.substring(0, fileName.lastIndexOf("."));
  }
  return fileName;
};

export {
  enforceFileExtension,
  getFileName,
  getParentDirectory,
  stripFileExtension
};
