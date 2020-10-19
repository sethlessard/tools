import { commands, Uri, window } from "vscode";

const SEMVER_REGEX = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

export type InputOptions = {
  prompt: string,
  placeHolder?: string,
  value?: string,
  requireValue?: boolean
};

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
const promptInput = (options: InputOptions) => {
  const validateInput = (options.requireValue) ? (value?: string) => (value) ? null : "You must enter a value" : undefined;
  return window.showInputBox({ prompt: options.prompt, placeHolder: options.placeHolder, value: options.value, validateInput });
};

/**
 * Prompt for a version to be entered.
 * @param prompt the question to ask.
 */
const promptVersion = (prompt: string) => {
  return promptInput({ prompt, requireValue: true, placeHolder: "1.0.0" })
    .then((version?: string) => {
      if (!version) {
        throw new Error("You must enter a version.");
      }
      if (!SEMVER_REGEX.test(version)) {
        throw new Error("Invalid version.");
      }
      return version;
    });
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
  promptInput,
  promptVersion,
  promptYesNo
};
