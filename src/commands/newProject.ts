import * as vscode from "vscode";

import CProjectCreator from "../creator/CProjectCreator";
import CppProjectCreator from "../creator/CppProjectCreator";
import NodeProjectCreator from "../creator/NodeProjectCreator";

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

    switch (language) {
      case "C":

        break;
      case "C++":
        break;
      case "Node JS":
        
        break;
    }

    await vscode.window.showInformationMessage(`Language: ${language}, Project: ${project}`);
    // TODO: implement
  };
};

const _createCProject = (projectPath: string) => { 
  const creator = new CProjectCreator(projectPath, null);
};

const _createCppProject = (projectPath: string) => { 
  const creator = new CppProjectCreator(projectPath, null);

};

const _createNodeProject = (projectPath: string) => {
  const creator = new NodeProjectCreator(projectPath, null);

};

export default newProject;
