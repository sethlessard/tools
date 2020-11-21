import { ExtensionContext } from "vscode";
import NeedsSyncInitialization from "../../t00ls.common/types/NeedsSyncInitialization";

export interface BranchRelationship {
  featureBranch: string;
  productionReleaseBranch: string;
}

class BranchRelationshipCache implements NeedsSyncInitialization {

  private static _instance?: BranchRelationshipCache;

  /**
   * Get the BranchRelationshipCache instance.
   */
  static getInstance(): BranchRelationshipCache {
    if (!BranchRelationshipCache._instance) {
      BranchRelationshipCache._instance = new BranchRelationshipCache();
    }
    return BranchRelationshipCache._instance;
  }

  private _context?: ExtensionContext;

  /**
   * Clear any pre-defined relationship between a feature branch and a production release branch.
   * @param featureBranch the feature branch.
   */
  clearRelationshipForFeatureBranch(featureBranch: string): Thenable<void> {
    this._checkInitialized();
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
    this._checkInitialized();
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
    return this._context!!.workspaceState.get<BranchRelationship[]>("branchRelationships", []);
  }

  /**
   * Get the production release branch relationship for a feature branch.
   * @param featureBranch the feature branch.
   */
  getRelationship(featureBranch: string): BranchRelationship | undefined {
    this._checkInitialized();
    const relationships = this.getAllRelationships().filter(b => b.featureBranch === featureBranch);
    return (relationships.length > 0) ? relationships[0] : undefined;
  }

  /**
   * Get all feature branch relationships for a specified production release branch.
   * @param productionReleaseBranch the production release branch.
   */
  getRelationshipsForProductionReleaseBranch(productionReleaseBranch: string): BranchRelationship[] {
    this._checkInitialized();
    return this.getAllRelationships().filter(r => r.productionReleaseBranch === productionReleaseBranch);
  }

  /**
   * Initialize the BranchRelationshipCache with the 
   * t00ls VS Code extension context.
   * @param context the t00ls extension context.
   */
  initialize(context: ExtensionContext): void {
    this._context = context;
  }

  /**
   * Define a relationship between a feature branch and a production release branch.
   * @param featureBranch the feature branch.
   * @param productionReleaseBranch the production release branch.
   */
  setRelationship(featureBranch: string, productionReleaseBranch: string): Thenable<void> {
    this._checkInitialized();
    this.clearRelationshipForFeatureBranch(featureBranch);

    let relationships = this.getAllRelationships();
    relationships.push({ featureBranch, productionReleaseBranch });
    return this._updateRelationships(relationships);
  }

  /**
   * Check to see if the BranchRelationshipCache has been initialized.
   */
  private _checkInitialized(): void {
    if (!this._context) {
      throw new Error("You forgot to call initialize()!");
    }
  }

  /**
   * Update the branch relationships.
   * @param relationships the branch relationships.
   */
  private _updateRelationships(relationships: BranchRelationship[]): Thenable<void> {
    return this._context!!.workspaceState.update("branchRelationships", relationships);
  }
}

export default BranchRelationshipCache;
