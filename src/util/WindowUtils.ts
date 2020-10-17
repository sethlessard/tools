import { commands, Uri, window } from "vscode";

export type YesNoOptions = {
  question: string,
  noIsDefault?: boolean,
  ignoreFocusOut?: boolean
};

/**
 * Open a folder.
 * @param path the path to the folder.
 * @param newWindow if true, the folder will be opened in a new window. If false,
 * it will open in the current window.
 */
const openFolder = (path: string, newWindow?: boolean) => {
  return commands.executeCommand("vscode.openFolder", Uri.file(path), newWindow);
};

/**
 * Prompt for input and require that something was input.
 * @param prompt the prompt.
 * @param placeHolder the placeholder to show.
 * @param value the default value.
 */
const promptInputRequireValue = (prompt: string, placeHolder?: string, value?: string, ) => {
  return window.showInputBox({ prompt, placeHolder, value, validateInput: (value?: string) => (value) ? null : "You must enter a value" });
};

/**
 * Prompt a Yes/No Question to the user.
 * @param options the options.
 */
const promptYesNo = (options: YesNoOptions) => {
  const { ignoreFocusOut, noIsDefault, question } = options;
  return window.showQuickPick((noIsDefault) ? ["No", "Yes"] : ["Yes", "No"], { canPickMany: false, ignoreFocusOut, placeHolder: question })
    .then(value => value === "Yes");
};

export {
  openFolder,
  promptInputRequireValue,
  promptYesNo
};
