import t00lsGitRepository from "../../data/repositories/t00lsGitRepository";
import Branch from "../entities/Branch";
import GitRepository from "../respositories/GitRepository";

/**
 * Get all feature branches that exist in the local repository.
 * @param git the git repository.
 */
const getAllLocalFeatureBranches = (git: GitRepository): Promise<Branch[]> => {
  return git.getAllLocalFeatureBranches();
};

export default getAllLocalFeatureBranches;
