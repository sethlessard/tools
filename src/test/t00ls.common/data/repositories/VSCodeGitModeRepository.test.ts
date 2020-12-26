import { describe, test } from "mocha";

describe("t00ls.common/data/repositories/VSCodeGitModeRepository", () => {
  
  describe("getGitMode", () => {
    test("It should return 'Local' when the saved Git mode is 'Local'.");
    test("It should return 'Normal' when the saved Git mode is 'Normal'.");
  });

  describe("setGitMode", () => {
    test("It should be able to set the Git mode.");
  });
});
