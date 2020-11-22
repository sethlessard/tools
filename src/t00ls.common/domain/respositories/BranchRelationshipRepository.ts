import BranchRelationship from "../entities/BranchRelationship";

interface BranchRelationshipRepository {

  /**
   * Clear any pre-defined relationship between a feature branch and a production release branch.
   * @param featureBranch the feature branch.
   */
  clearRelationshipForFeatureBranch(featureBranch: string): Thenable<void>;

  /**
   * Clear any pre-defined relationship between a production release branch and any of it's feature branches.
   * @param productionReleaseBranch the production release branch.
   */
  clearRelationshipsForProductionReleaseBranch(productionReleaseBranch: string): Thenable<void>;

  /**
   * Get all branch relationships.
   */
  getAllRelationships(): BranchRelationship[];

  /**
   * Get the production release branch relationship for a feature branch.
   * @param featureBranch the feature branch.
   */
  getRelationship(featureBranch: string): BranchRelationship | undefined;

  /**
   * Get all feature branch relationships for a specified production release branch.
   * @param productionReleaseBranch the production release branch.
   */
  getRelationshipsForProductionReleaseBranch(productionReleaseBranch: string): BranchRelationship[];

  /**
   * Define a relationship between a feature branch and a production release branch.
   * @param featureBranch the feature branch.
   * @param productionReleaseBranch the production release branch.
   */
  setRelationship(featureBranch: string, productionReleaseBranch: string): Thenable<void>;
};

export default BranchRelationshipRepository;
