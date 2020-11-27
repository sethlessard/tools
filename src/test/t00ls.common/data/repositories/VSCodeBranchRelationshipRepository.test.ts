import { describe, test } from "mocha";

describe("t00ls.common/data/repositories/VSCodeBranchRelationshipRepository", () => {

  describe("clearRelationshipForFeatureBranch", () => {
    test("It should be able to clear a relationship between a feature branch and a production release branch.");
  });

  describe("clearRelationshipsForProductionReleaseBranch", () => {
    test("It should be able to clear all relationships for a specified production release branch.");
  });

  describe("getAllRelationships", () => {
    test("It should return an array of BranchRelationships describing the saved feature branch/production release branch relationships.");
    test("It should return an empty array if there are no saved feature branch/production release branch relationships.");
  });

  describe("getRelationship", () => {
    test("It should return the BranchRelationship object describing the feature branch/production release branch relationship for a specified feature branch.");
    test("It should return 'undefined' if there is no saved relationship for the specified feature branch.");
  });

  describe("getRelationshipsForProductionReleaseBranch", () => {
    test("It should return an array of BranchRelationships describing the saved feature branch/production release branch relationships related to the specified production release branch.");
    test("It should return an empty array if there are no saved feature branch/production release branch relationships related to the specified production release branch.");
    test("It should return an empty array if there are no saved feature branch/production release branch relationships.");
  });

  describe("setRelationship", () => {
    test("It should be able to set a feature branch/production release branch relationship.");
    test("It should be able to overwrite a feature branch/production release branch relationship.");
  });
});

