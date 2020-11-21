import { ExtensionContext } from "vscode";

import { GitMode } from "@t00ls/git/Git";
import StatusBarManager from "@t00ls/vscode/util/StatusBarManager";

/**
 * 
 * @param mode the GitMode
 * @param context the ExtensionContext.
 */
const setGitMode = (mode: GitMode, context: ExtensionContext) => {
  return context.workspaceState.update("t00ls.mode", mode.valueOf())
    .then(() => StatusBarManager.getInstance().setMode(mode));
};

export default setGitMode;
