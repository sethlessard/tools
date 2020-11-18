import t00lsConfiguration from "../types/config/t00lsConfiguration";

class ConfigManager {

  private static _instance?: ConfigManager;

  /*
   * Get the ConfigManager instance.
   */
  static getInstance(): ConfigManager {
    if (!ConfigManager._instance) {
      ConfigManager._instance = new ConfigManager();
    }
    return ConfigManager._instance;
  }

  private _configs: { [workspace: string]: t00lsConfiguration } = {};

  /**
   * Add a t00ls configuration for a workspace.
   * @param workspacePath the path to the workspace.
   * @param config the t00ls configuration.
   */
  addConfig(workspacePath: string, config: t00lsConfiguration) { 
    this._configs[workspacePath] = config;
  }

  /**
   * Get a t00ls configuration for a workspace.
   * @param workspacePath the path to the workspace.
   */
  getConfig(workspacePath: string): t00lsConfiguration | undefined {
    return this._configs[workspacePath];
  }

  /**
   * Check to see if a t00ls config exists for a workspace path.
   * @param workspacePath the path to the workspace.
   */
  hasConfig(workspacePath: string): boolean {
    return this._configs[workspacePath] !== undefined;
  }

  /**
   * Remove a t00ls configuration.
   * @param workspacePath the path to the workspace.
   */
  removeConfig(workspacePath: string) {
    if (this._configs[workspacePath] !== undefined) {
      delete this._configs[workspacePath];
    }
  }
}

export default ConfigManager;
