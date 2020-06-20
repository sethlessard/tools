
/**
 * Make sure a file name ends in the proper file extension.
 * @param {string} fileName the name of the file.
 * @param {string} fileExt the file extension.
 * @returns {string} the proper file name.
 */
const enforceFileExtension = (fileName, fileExt) => {
  if (fileName.indexOf(fileExt) === -1) {
    return fileName + fileExt;
  }
  return fileName;
}

/**
 * Remove a file extension from a file.
 * @param {string} fileName the name of the file.
 * @returns {string} the name of the file without the file extension.
 */
const stripFileExtension = (fileName) => {
  if (fileName.lastIndexOf(".") > 0) {
    return fileName.substring(0, fileName.lastIndexOf("."));
  }
  return fileName;
}

module.exports = {
  enforceFileExtension,
  stripFileExtension
};
