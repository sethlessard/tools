
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

module.exports = {
  enforceFileExtension
};
