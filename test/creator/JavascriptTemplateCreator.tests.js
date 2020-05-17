const { assert } = require("chai");
const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");

const JavascriptTemplateCreator = require("../../bin/creator/JavascriptTemplateCreator");

describe("JavascriptTemplateCreator", () => {
  beforeEach(done => {
    rimraf(".tmp", done);
  });

  afterEach(done => {
    rimraf(".tmp", done);
  });

  it("Should properly create a class", () => {
    const templateCreator = new JavascriptTemplateCreator({
      _: ["template", "javascript", "class", "Class1"]
    });
    
  });
});
