import * as vscode from "vscode";

import { GitMode } from "../../t00ls.git/Git";

class StatusBarManager {

  private static _instance?: StatusBarManager;

  /**
   * Get the StatusBarManager instance.
   */
  static getInstance(): StatusBarManager {
    if (!StatusBarManager._instance) {
      StatusBarManager._instance = new StatusBarManager();
    }
    return StatusBarManager._instance;
  }

  private _statusBarItem?: vscode.StatusBarItem;

  /**
   * Initialize the StatusBarManager with the VS Code StatusBarItem.
   * @param statusBarItem the StatusBarItem.
   */
  initialize(statusBarItem: vscode.StatusBarItem): StatusBarManager {
    this._statusBarItem = statusBarItem;
    return this;
  }

  /**
   * Set the t00ls Git mode.
   * @param mode the mode.
   */
  setMode(mode: GitMode) {
    if (!this._statusBarItem) { throw new Error("It looks like you forgot to call initialize()!"); }
    
    this._statusBarItem.text = `t00ls: ${mode.valueOf()}`;
  }
}

export default StatusBarManager;
