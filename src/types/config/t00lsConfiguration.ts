import Task from "../task/Task";

interface t00lsConfiguration {
  name: string;
  preReleaseTask?: Task;
  postReleaseTask?: Task;
}

export default t00lsConfiguration;
