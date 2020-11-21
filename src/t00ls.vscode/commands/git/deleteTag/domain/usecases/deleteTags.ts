import GitRepository from "../../../../../../t00ls.common/domain/respositories/GitRepository";

/**
 * Delete some tags.
 * @param tag the tags to delete.
 * @param git the GitRepository.
 */
const deleteTags = (tags: string[], git: GitRepository): Promise<void> => {
  return git.deleteTags(tags);
};

export default deleteTags;
