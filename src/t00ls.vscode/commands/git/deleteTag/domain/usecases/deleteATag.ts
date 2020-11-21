import GitRepository from "../../../../../../t00ls.common/domain/respositories/GitRepository";

/**
 * Delete a tag.
 * @param tag the tag to delete.
 * @param git the GitRepository.
 */
const deleteATag = (tag: string, git: GitRepository): Promise<void> => {
  return git.deleteTag(tag);
};

export default deleteATag;
