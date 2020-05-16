const { assert } = require("chai");
const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");

const TemplateWriter = require("../../bin/writer/TemplateWriter");

const TEMPLATE_SINGLE_PARAM = `
class $1 {

}

module.exports = $1;
`.trim();
const TEMPLATE_SINGLE_PARAM_EXPECTED = `
class Param1 {

}

module.exports = Param1;
`.trim();

const TEMPLATE_TWO_PARAM = `
class $1 {

  constructor($2) {

  }
}

module.exports = $1;
`.trim();
const TEMPLATE_TWO_PARAM_EXPECTED = `
class Param1 {

  constructor(Param2) {

  }
}

module.exports = Param1;
`.trim();

describe("TemplateWriter", () => {
  beforeEach(done => {
    rimraf(".tmp", done);
  });

  afterEach(done => {
    rimraf(".tmp", done);
  });

  context("_populateTemplate(template, params)", () => {
    it("Should be able to populate a template with a single parameter", () => {
      const writer = new TemplateWriter();
      const actual = writer._populateTemplate(TEMPLATE_SINGLE_PARAM, { $1: "Param1" });
      assert.equal(actual, TEMPLATE_SINGLE_PARAM_EXPECTED);
    });

    it("Should be able to populate a template with two parameters", () => {
      const writer = new TemplateWriter();
      const actual = writer._populateTemplate(TEMPLATE_TWO_PARAM, { $1: "Param1", $2: "Param2" });
      assert.equal(actual, TEMPLATE_TWO_PARAM_EXPECTED);
    });
  });

  context("write(path, template, params)", () => {
    it("Should be able to write a template with one parameter to a file.", () => {
      const templatePath = path.join(".tmp", "template");
      const writer = new TemplateWriter();
      writer.write(templatePath, TEMPLATE_SINGLE_PARAM, { $1: "Param1" });
      assert.isTrue(fs.existsSync(templatePath), "The template was not created!");

      const contents = fs.readFileSync(templatePath);
      assert.equal(contents, TEMPLATE_SINGLE_PARAM_EXPECTED);
    });

    it("Should be able to write a template with two parameters to a file.", () => {
      const templatePath = path.join(".tmp", "template");
      const writer = new TemplateWriter();
      writer.write(templatePath, TEMPLATE_TWO_PARAM, { $1: "Param1", $2: "Param2" });
      assert.isTrue(fs.existsSync(templatePath), "The template was not created!");

      const contents = fs.readFileSync(templatePath);
      assert.equal(contents, TEMPLATE_TWO_PARAM_EXPECTED);
    });
  });
});