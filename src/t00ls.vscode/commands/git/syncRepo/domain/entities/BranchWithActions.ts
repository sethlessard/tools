import Branch from "../../../../../../t00ls.common/presentation/models/Branch";

interface BranchWithActions extends Branch {
  baseBranch?: string;
  mergeBaseBranch?: boolean;
  publish?: boolean;
}

export default BranchWithActions;
