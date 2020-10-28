import { assert } from "chai";
import { afterEach, beforeEach, describe, it } from "mocha";
import * as fs from "fs";
import * as path from "path";
import * as rimraf from "rimraf";

import NodeProjectCreator from "../../creator/node/NodeProjectCreator";
import NodeProjectType from "../../creator/node/NodeProjectType";
import { ExtensionContext } from "vscode";
const appBase = path.dirname(path.dirname(path.dirname(__dirname)));
const testBase = path.dirname(__dirname);
const tmpBase = path.join(testBase, ".tmp");

describe("NodeProjectCreator", () => {
  beforeEach(done => {
    rimraf(tmpBase, (e) => {
      if (e) { done(e); }
      fs.mkdir(tmpBase, { recursive: true }, done);
    });
  });

  afterEach(done => {
    rimraf(tmpBase, done);
  });

  it("Should be able to create a simple NodeJS api", async () => {
    const appPath = path.join(tmpBase, "nodejs-simple-api");
    const creator = new NodeProjectCreator({
      name: "nodejs-simple-api",
      parentPath: tmpBase,
      type: NodeProjectType.Api,
      typescript: false,
      description: "Simple Express API"
    }, { extensionPath: appBase } as ExtensionContext);

    await creator.create();

    assert.isTrue(fs.existsSync(appPath));
    assert.isTrue(fs.existsSync(path.join(appPath, "node_modules")));
    assert.isTrue(fs.existsSync(path.join(appPath, "src")));
    assert.isTrue(fs.existsSync(path.join(appPath, "src", "index.js")));
    assert.isTrue(fs.existsSync(path.join(appPath, "src", "routes.js")));
    assert.isTrue(fs.existsSync(path.join(appPath, ".gitignore")));
    assert.isTrue(fs.existsSync(path.join(appPath, "package.json")));
    assert.isTrue(fs.existsSync(path.join(appPath, "package-lock.json")));
  });

  it("Should be able to create a simple Socket IO server", async () => {
    const appPath = path.join(tmpBase, "simple-socketio");
    const creator = new NodeProjectCreator({
      name: "simple-socketio",
      parentPath: tmpBase,
      type: NodeProjectType.SocketIOServer,
      typescript: false,
      description: "Simple Socket.Io"
    }, { extensionPath: appBase } as ExtensionContext);

    await creator.create();

    assert.isTrue(fs.existsSync(appPath));
    assert.isTrue(fs.existsSync(path.join(appPath, "node_modules")));
    assert.isTrue(fs.existsSync(path.join(appPath, "src")));
    assert.isTrue(fs.existsSync(path.join(appPath, "src", "manager")));
    assert.isTrue(fs.existsSync(path.join(appPath, "src", "manager", "SocketManager.js")));
    assert.isTrue(fs.existsSync(path.join(appPath, "src", "routes")));
    assert.isTrue(fs.existsSync(path.join(appPath, "src", "routes", "http")));
    assert.isTrue(fs.existsSync(path.join(appPath, "src", "routes", "http", "index.js")));
    assert.isTrue(fs.existsSync(path.join(appPath, "src", "routes", "io")));
    assert.isTrue(fs.existsSync(path.join(appPath, "src", "routes", "io", "index.js")));
    assert.isTrue(fs.existsSync(path.join(appPath, "src", "routes", "index.js")));
    assert.isTrue(fs.existsSync(path.join(appPath, "task")));
    assert.isTrue(fs.existsSync(path.join(appPath, "task", "build.js")));
    assert.isTrue(fs.existsSync(path.join(appPath, ".babelrc")));
    assert.isTrue(fs.existsSync(path.join(appPath, ".gitignore")));
    assert.isTrue(fs.existsSync(path.join(appPath, "gulpfile.js")));
    assert.isTrue(fs.existsSync(path.join(appPath, "package.json")));
    assert.isTrue(fs.existsSync(path.join(appPath, "package-lock.json")));
  });
});
