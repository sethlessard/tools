import DomainBranchRelationship from "../../domain/entities/BranchRelationship";

interface BranchRelationship {
  featureBranch: string;
  productionReleaseBranch: string;
};

const mapToDomainBranchRelationship = (branchRelationship: BranchRelationship): DomainBranchRelationship => {
  return branchRelationship;
};

export default BranchRelationship;
export { mapToDomainBranchRelationship };
