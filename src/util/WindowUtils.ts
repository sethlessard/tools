import { window } from "vscode";

export type YesNoOptions = {
  question: string,
  noIsDefault?: boolean,
  ignoreFocusOut?: boolean
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
  promptYesNo
};
