interface Branch {
  name: string;
  lastCommitMessage: string;
  remote: boolean;
  origin?: string;
};

export default Branch;
