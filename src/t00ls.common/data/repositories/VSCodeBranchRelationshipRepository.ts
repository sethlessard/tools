import { ExtensionContext } from "vscode";
import BranchRelationshipRepository from "../../domain/respositories/BranchRelationshipRepository";
import BranchRelationship from "../models/BranchRelationship";

class VSCodeBranchRelationshipRepository implements BranchRelationshipRepository {

  private readonly _context: ExtensionContext;

  /**
   * VSCodeBranchRelationshipRepository constructor.
   * @param context the t00ls extension context.
   */
  constructor(context: ExtensionContext) {
    this._context = context;
  }

  /**
   * Clear any pre-defined relationship between a feature branch and a production release branch.
   * @param featureBranch the feature branch.
   */
  clearRelationshipForFeatureBranch(featureBranch: string): Thenable<void> {
    let relationships = this.getAllRelationships();
    // search for any relationships where this feature branch is declared.
    // if any are found, clear them.
    relationships = relationships.filter(r => r.featureBranch !== featureBranch);
    return this._updateRelationships(relationships);
  }

  /**
   * Clear any pre-defined relationship between a production release branch and any of it's feature branches.
   * @param productionReleaseBranch the production release branch.
   */
  clearRelationshipsForProductionReleaseBranch(productionReleaseBranch: string): Thenable<void> {
    let relationships = this.getAllRelationships();
    // search for any relationships where the production release branch branch is declared
    // if any are found, clear them.
    relationships = relationships.filter(r => r.productionReleaseBranch !== productionReleaseBranch);
    return this._updateRelationships(relationships);
  }

  /**
  * Get all branch relationships.
  */
  getAllRelationships(): BranchRelationship[] {
    return this._context.workspaceState.get<BranchRelationship[]>("branchRelationships", []);
  }

  /**
   * Get the production release branch relationship for a feature branch.
   * @param featureBranch the feature branch.
   */
  getRelationship(featureBranch: string): BranchRelationship | undefined {
    const relationships = this.getAllRelationships().filter(b => b.featureBranch === featureBranch);
    return (relationships.length > 0) ? relationships[0] : undefined;
  }

  /**
   * Get all feature branch relationships for a specified production release branch.
   * @param productionReleaseBranch the production release branch.
   */
  getRelationshipsForProductionReleaseBranch(productionReleaseBranch: string): BranchRelationship[] {
    return this.getAllRelationships().filter(r => r.productionReleaseBranch === productionReleaseBranch);
  }

  /**
   * Define a relationship between a feature branch and a production release branch.
   * @param featureBranch the feature branch.
   * @param productionReleaseBranch the production release branch.
   */
  setRelationship(featureBranch: string, productionReleaseBranch: string): Thenable<void> {
    this.clearRelationshipForFeatureBranch(featureBranch);

    let relationships = this.getAllRelationships();
    relationships.push({ featureBranch, productionReleaseBranch });
    return this._updateRelationships(relationships);
  }

  /**
   * Update the branch relationships.
   * @param relationships the branch relationships.
   */
  private _updateRelationships(relationships: BranchRelationship[]): Thenable<void> {
    return this._context.workspaceState.update("branchRelationships", relationships);
  }
}

export default VSCodeBranchRelationshipRepository;
