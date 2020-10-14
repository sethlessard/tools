import * as vscode from "vscode";

type LanguageDefinitions = {
  [language: string]: {
    projects: string[]
  }
};

const languageDefinitions: LanguageDefinitions = {
  "C": {
    projects: [
      "Simple"
    ]
  },
  "C++": {
    projects: [
      "Simple"
    ]
  },
  "Node JS": {
    projects: [
      "Express API",
      "React App",
      "React Library",
      "Socket.IO Server",
    ]
  }
}

/**
 * Create a new Project.
 */
const newProject = () => {
  return async () => {
    const languages = Object.keys(languageDefinitions);
    const language = await vscode.window.showQuickPick(languages, { canPickMany: false, placeHolder: "What language would you like to write in?" });
    if (!language) return;

    const projects = languageDefinitions[language].projects;
    const project = await vscode.window.showQuickPick(projects, { canPickMany: false, placeHolder: "What kind of project?" });
    if (!project) return;

    await vscode.window.showInformationMessage(`Language: ${language}, Project: ${project}`);
  };
};

export default newProject;
