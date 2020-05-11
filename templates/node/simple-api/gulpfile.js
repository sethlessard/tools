const { series, task } = require("gulp");
const rimraf = require("rimraf");
const nodemon = require("gulp-nodemon");

const build = require("./task/build");

task("clean", function(done) {
  rimraf("./dist", done);
});
task("build:dev", series("clean", build.buildDev));
task("build:prod", series("clean", build.build));
task("debug", series("build:dev", function(done) {
  nodemon({
    script: "./dist/index.js",
    nodeArgs: ["--inspect-brk=9774"],
    ext: "js html css",
    env: { "NODE_ENV": "development" },
    tasks: ["build:dev"],
    watch: ["src"],
    done: done
  });
}));
task("develop", series("build:dev", function(done) {
  nodemon({
    script: "./dist/index.js",
    ext: 'js html css',
    env: { "NODE_ENV": "development" },
    tasks: ["build:dev"],
    watch: ["src"],
    quiet: true,
    done: done
  });
}));