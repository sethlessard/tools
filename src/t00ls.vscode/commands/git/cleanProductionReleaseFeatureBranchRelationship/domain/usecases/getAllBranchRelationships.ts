import BranchRelationship from "../../../../../../t00ls.common/domain/entities/BranchRelationship";
import BranchRelationshipRepository from "../../../../../../t00ls.common/domain/respositories/BranchRelationshipRepository";

/**
 * Get all of the branch relationships.
 * @param branchRelationshipRepo the branch relationship repository.
 */
const getAllBranchRelationships = (branchRelationshipRepo: BranchRelationshipRepository): BranchRelationship[] => {
  return branchRelationshipRepo.getAllRelationships();
};

export default getAllBranchRelationships;
