import * as vscode from "vscode";
import * as path from "path";

import CProjectCreator from "../creator/c/CProjectCreator";
import CProjectOptions from "../creator/c/CProjectOptions";
import { mapToCProjectType } from "../creator/c/CProjectType";
import CppProjectCreator from "../creator/cpp/CppProjectCreator";
import CppProjectOptions from "../creator/cpp/CppProjectOptions";
import { mapToCppProjectType } from "../creator/cpp/CppProjectType";
import NodeProjectCreator from "../creator/node/NodeProjectCreator";
import NodeProjectOptions from "../creator/node/NodeProjectOptions";
import { EXPRESS_API, mapToNodeProjectType, REACT_APP, REACT_LIBRARY, SOCKET_IO_SERVER } from "../creator/node/NodeProjectType";
import { openFolder, promptInputRequireValue, promptYesNo } from "../util/WindowUtils";

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
      EXPRESS_API,
      REACT_APP,
      REACT_LIBRARY,
      SOCKET_IO_SERVER
    ]
  }
};

/**
 * Create a new Project.
 * @param context the t00ls extension context.
 */
const newProject = (context: vscode.ExtensionContext) => {
  return async () => {
    // get the project name
    const name = await promptInputRequireValue("Project name?");
    if (!name) { return; }

    const languages = Object.keys(languageDefinitions);
    const language = await vscode.window.showQuickPick(languages, { canPickMany: false, placeHolder: "What language would you like to write in?" });
    if (!language) { return; }

    const projectParent = await vscode.window.showOpenDialog({ canSelectFiles: false, canSelectFolders: true, canSelectMany: false, openLabel: "Select Parent Directory", title: "Project Parent Directory" })
      .then(uris => (uris) ? uris[0] : null);
    if (!projectParent) { return; }

    const projectPath = path.join(projectParent.fsPath, name);

    switch (language) {
      case "C":
        await _createCProject(projectPath, context);
        break;
      case "C++":
        await _createCppProject(projectPath, context);
        break;
      case "Node JS":
        await _createNodeProject(projectPath, context);
        break;
    }

    const newWindow = await promptYesNo({ question: "Open in a new window?", noIsDefault: true, ignoreFocusOut: true });
    await openFolder(projectPath, newWindow);
  };
};

/**
 * Create a C project.
 * @param projectPath the path to the new C project.
 */
const _createCProject = (projectPath: string, context: vscode.ExtensionContext) => {
  return vscode.window.showQuickPick(languageDefinitions["C"].projects, { canPickMany: false, placeHolder: "Which type of C project would you like to create?" })
    .then((type?: string) => {
      if (!type) { return; }

      const projectOptions: CProjectOptions = {
        path: projectPath,
        type: mapToCProjectType(type)
      };
      const creator = new CProjectCreator(projectOptions, context);
      return creator.create();
    });
};

/**
 * Create a C++ project.
 * @param projectPath the path to the new C++ project.
 */
const _createCppProject = (projectPath: string, context: vscode.ExtensionContext) => {
  return vscode.window.showQuickPick(languageDefinitions["C++"].projects, { canPickMany: false, placeHolder: "Which type of C++ project would you like to create?" })
    .then((type?: string) => {
      if (!type) { return; }

      const projectOptions: CppProjectOptions = {
        path: projectPath,
        type: mapToCppProjectType(type)
      };
      const creator = new CppProjectCreator(projectOptions, context);
      return creator.create();
    });
};

/**
 * Create a new Node JS project.
 * @param projectPath the path to the Node JS project.
 */
const _createNodeProject = (projectPath: string, context: vscode.ExtensionContext) => {
  return vscode.window.showQuickPick(languageDefinitions["Node JS"].projects, { canPickMany: false, placeHolder: "Which type of Node JS project would you like to create?" })
    .then((type?: string) => {
      if (!type) { return; }

      const projectOptions: NodeProjectOptions = {
        path: projectPath,
        type: mapToNodeProjectType(type)
      };
      const creator = new NodeProjectCreator(projectOptions, context);
      return creator.create();
    });
};

export default newProject;
