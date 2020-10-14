import * as fs from "fs";
import * as path from "path";

class TemplateReader {

  private readonly _language: string;

  /**
   * TemplateReader constructor.
   * @param {string} language the programming language.
   */
  constructor(language: string) {
    this._language = language;
  }

  /**
   * Read a template.
   * @param {string} template the name of the template.
   * @returns {string} the template.
   */
  read(template: string) {
    //@ts-ignore
    const templatePath = path.join(global.appRoot, "templates", "templates", this._language, `${template}.template`);
    if (!fs.existsSync(templatePath)) {
      return "";
    }
    return fs.readFileSync(templatePath).toString("utf8");
  }
}

export default TemplateReader;
