import DomainGitMode from "../../domain/entities/GitMode";

enum GitMode {
  Local = "Local",
  Normal = "Normal"
};

/**
 * Map a presentation-layer GitMode to a domain-layer GitMode.
 * @param gitMode the GitMode.
 */
const mapToDomainGitMode = (gitMode: GitMode): DomainGitMode => {
  return gitMode;
};

export default GitMode;
export { mapToDomainGitMode };
