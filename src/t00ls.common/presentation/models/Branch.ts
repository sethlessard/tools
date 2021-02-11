import DomainBranch from "../../domain/entities/git/Branch";

interface Branch {
  name: string;
  lastCommitMessage: string;
  remote: boolean;
  origin?: string;
};

/**
 * Map a presentation-layer branch to a domain-layer branch.
 * @param branch the branch.
 */
const mapToDomainBranch = (branch: Branch): DomainBranch => {
  return branch;
};

export default Branch;
