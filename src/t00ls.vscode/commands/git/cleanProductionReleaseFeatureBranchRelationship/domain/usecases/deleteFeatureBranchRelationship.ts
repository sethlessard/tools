import BranchRelationship from "../../../../../../t00ls.common/domain/entities/BranchRelationship";
import BranchRelationshipRepository from "../../../../../../t00ls.common/domain/respositories/BranchRelationshipRepository";
import Logger from "../../../../../util/Logger";

/**
 * Delete a relationship between a feature branch and a production release branch.
 * @param relationship the relationship to remove.
 * @param relationshipRepository the relationship repository.
 */
const deleteFeatureBranchRelationship = (relationship: BranchRelationship, relationshipRepository: BranchRelationshipRepository): Thenable<void> => {
  Logger.getInstance().writeLn(`Clearing relationship of feature branch '${relationship.featureBranch}' with '${relationship.productionReleaseBranch}'`);
  return relationshipRepository.clearRelationshipForFeatureBranch(relationship.featureBranch);
};

export default deleteFeatureBranchRelationship;
