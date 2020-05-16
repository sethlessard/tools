const fs = require("fs");
const path = require("path");

class TemplateReader {

  /**
   * TemplateReader constructor.
   * @param {string} language the programming language.
   */
  constructor(language) {
    this._language = language;
  }

  /**
   * Read a template.
   * @param {string} template the name of the template.
   * @returns {string} the template.
   */
  read(template) {
    const templatePath = path.join(process.cwd(), "templates", "templates", this._language, `${template}.template`);
    if (!fs.existsSync(templatePath)) {
      return "";
    }
    return fs.readFileSync(templatePath).toString("utf8");
  }
}

module.exports = TemplateReader;
