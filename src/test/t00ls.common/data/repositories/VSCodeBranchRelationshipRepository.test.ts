import { beforeEach, describe, test } from "mocha";
import { assert } from "chai";
import * as _ from "lodash";

import VSCodeBranchRelationshipRepository from "../../../../t00ls.common/data/repositories/VSCodeBranchRelationshipRepository";
import BranchRelationship from "../../../../t00ls.common/data/models/BranchRelationship";
import MockMemento from "../../../mock/MockMemento";
import MockExtensionContext from "../../../mock/MockExtensionContext";

describe("t00ls.common/data/repositories/VSCodeBranchRelationshipRepository", () => {

  describe("clearRelationshipForFeatureBranch", () => {
    let relationshipRepo: VSCodeBranchRelationshipRepository;
    let mockExtensionContext: MockExtensionContext;
    beforeEach(() => {
      mockExtensionContext = new MockExtensionContext();
      relationshipRepo = new VSCodeBranchRelationshipRepository(mockExtensionContext);
    });

    test("It should be able to clear a relationship between a feature branch and a production release branch.", () => {
      (mockExtensionContext.workspaceState as MockMemento).entries["branchRelationships"] = [{ featureBranch: "feature-1", productionReleaseBranch: "v1.1.1-prep" }];
      assert.isNotEmpty((mockExtensionContext.workspaceState as MockMemento).entries["branchRelationships"]);

      relationshipRepo.clearRelationshipForFeatureBranch("feature-1");
      assert.isEmpty((mockExtensionContext.workspaceState as MockMemento).entries["branchRelationships"]);
    });
  });

  describe("clearRelationshipsForProductionReleaseBranch", () => {
    let relationshipRepo: VSCodeBranchRelationshipRepository;
    let mockExtensionContext: MockExtensionContext;
    beforeEach(() => {
      mockExtensionContext = new MockExtensionContext();
      relationshipRepo = new VSCodeBranchRelationshipRepository(mockExtensionContext);
    });

    test("It should be able to clear all relationships for a specified production release branch.", () => {
      (mockExtensionContext.workspaceState as MockMemento).entries["branchRelationships"] = [
        { featureBranch: "feature-1", productionReleaseBranch: "v1.1.1-prep", },
        { featureBranch: "feature-2", productionReleaseBranch: "v1.2.0-prep", },
        { featureBranch: "feature-3", productionReleaseBranch: "v1.2.0-prep", },
      ];
      assert.isNotEmpty((mockExtensionContext.workspaceState as MockMemento).entries["branchRelationships"]);

      relationshipRepo.clearRelationshipsForProductionReleaseBranch("v1.2.0-prep");
      assert.isUndefined(_.find<BranchRelationship>((mockExtensionContext.workspaceState as MockMemento).entries["branchRelationships"], { productionReleaseBranch: "v1.2.0-prep" }));
      assert.isDefined(_.find<BranchRelationship>((mockExtensionContext.workspaceState as MockMemento).entries["branchRelationships"], { productionReleaseBranch: "v1.1.1-prep" }));
    });
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

