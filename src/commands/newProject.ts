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

    const projectType = await vscode.window.showQuickPick(languageDefinitions[language].projects, { canPickMany: false, placeHolder: `Which type of ${language} project would you like to create?` });
    if (!projectType) { return; }

    await vscode.window.withProgress({
      cancellable: false,
      location: vscode.ProgressLocation.Notification,
      title: `Creating ${language} project (${projectType}): ${name}`
    }, async (progress) => {
        progress.report({ increment: 0 });
        try {
          switch (language) {
            case "C":
              await _createCProject(projectParent.fsPath, name, projectType, context);
              break;
            case "C++":
              await _createCppProject(projectParent.fsPath, name, projectType, context);
              break;
            case "Node JS":
              await _createNodeProject(projectParent.fsPath, name, projectType, context);
              break;
          }
        } catch (e) {
          await vscode.window.showWarningMessage(`There may have been an error creating the project: ${e}`);
        }
      
      progress.report({ increment: 100 });
    });

    const newWindow = await promptYesNo({ question: "Open in a new window?", noIsDefault: true, ignoreFocusOut: true });
    await openFolder(path.join(projectParent.fsPath, name), newWindow);
  };
};

/**
 * Create a C project.
 * @param projectParent the parent directory of the new C project.
 * @param projectName the name of the project.
 * @param projectType the type of project.
 * @param context the t00ls extension context.
 */
const _createCProject = (projectParent: string, projectName: string, projectType: string, context: vscode.ExtensionContext) => {
  const projectOptions: CProjectOptions = {
    name: projectName,
    parentPath: projectParent,
    type: mapToCProjectType(projectType)
  };

  const creator = new CProjectCreator(projectOptions, context);
  return creator.create();
};

/**
 * Create a C++ project.
 * @param projectParent the parent directory of the new C++ project.
 * @param projectName the name of the project.
 * @param projectType the type of project.
 * @param context the t00ls extension context.
 */
const _createCppProject = (projectParent: string, projectName: string, projectType: string, context: vscode.ExtensionContext) => {
  const projectOptions: CppProjectOptions = {
    name: projectName,
    parentPath: projectParent,
    type: mapToCppProjectType(projectType)
  };
  const creator = new CppProjectCreator(projectOptions, context);
  return creator.create();
};

/**
 * Create a new Node JS project.
 * @param projectParent the parent directory of the Node JS project.
 * @param projectName the name of the project.
 * @param projectType the type of project.
 * @param context the t00ls extension context.
 */
const _createNodeProject = (projectParent: string, projectName: string, projectType: string, context: vscode.ExtensionContext) => {
  const projectOptions: NodeProjectOptions = {
    name: projectName,
    parentPath: projectParent,
    type: mapToNodeProjectType(projectType)
  };
  const creator = new NodeProjectCreator(projectOptions, context);
  return creator.create();
};

export default newProject;
