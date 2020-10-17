const { assert } = require("chai");
const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");

const NodeProjectCreator = require("../../bin/creator/project/NodeProjectCreator");
const appBase = path.dirname(path.dirname(__dirname));

describe("NodeProjectCreator", () => {
  beforeEach(done => {
    rimraf(".tmp", done);
  });

  afterEach(done => {
    rimraf(".tmp", done);
  });

  it("Should be able to create a simple NodeJS api", () => {
    const appPath = path.join(".tmp", "nodejs-simple-api");
    const creator = new NodeProjectCreator(appBase, {
      _: ["create", "node", "api", appPath],
    });
    creator.create();

    assert.isTrue(fs.existsSync(appPath));
    assert.isTrue(fs.existsSync(path.join(appPath, "node_modules")), "No node_modules/!");
    assert.isTrue(fs.existsSync(path.join(appPath, "src")), "No src/!");
    assert.isTrue(fs.existsSync(path.join(appPath, "src", "index.js")), "No src/index.js!");
    assert.isTrue(fs.existsSync(path.join(appPath, "src", "routes.js")), "No src/routes.js!");
    assert.isTrue(fs.existsSync(path.join(appPath, ".gitignore")), "No .gitignore!");
    assert.isTrue(fs.existsSync(path.join(appPath, "package.json")), "No package.json!");
    assert.isTrue(fs.existsSync(path.join(appPath, "package-lock.json")), "No package-lock.json!");
  });
});
