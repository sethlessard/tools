import * as fs from "fs":
import { createDirectoryTo } from "../util/DirectoryUtils";

class TemplateWriter {

  // TODO: unit test
  /**
   * Write a template file.
   * @param {string} path the path to the file to write.
   * @param {string} template the contents of the template.
   * @param {object} params the template parameters.
   */
  write(path: string, template: string, params: any) {
    // populate the template
    const populatedTemplate = this._populateTemplate(template, params);

    // write the file
    createDirectoryTo(path);
    fs.writeFileSync(path, populatedTemplate);
  }

  // TODO: outsource this to another file
  // TODO: unit test
  /**
   * Escape a Regex string.
   * Thanks to acdcjunior from https://stackoverflow.com/questions/17885855/use-dynamic-variable-string-as-regex-pattern-in-javascript/17886301
   * @param {string} stringToGoIntoTheRegex the string
   */
  _escapeRegExp(stringToGoIntoTheRegex: string) {
    return stringToGoIntoTheRegex.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  /**
   * Populate a template with its parameter values.
   * @param {string} template the contents of the template.
   * @param {any} params the parameters.
   * @returns {string} the populated template
   */
  _populateTemplate(template: string, params: any) {
    for (const [key, value] of Object.entries(params)) {
      const regex = new RegExp(this._escapeRegExp(key), "g");
      // @ts-ignore
      template = template.replace(regex, value);
    }
    return template;
  }
}

export default TemplateWriter;
