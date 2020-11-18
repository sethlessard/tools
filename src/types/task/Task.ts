export type TaskType = "script" | "vscode-task";

interface Task {
  name: string;
  type: TaskType;
}

export default Task;
