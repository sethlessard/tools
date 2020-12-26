import { EnvironmentVariableCollection, ExtensionContext, ExtensionMode, Memento, Uri } from "vscode";
import MockMemento from "./MockMemento";

export default class MockExtensionContext implements ExtensionContext {
  subscriptions: { dispose(): any; }[] = [];
  workspaceState: Memento = new MockMemento();
  globalState: Memento = new MockMemento();
  extensionUri: Uri = Uri.file('');
  extensionPath: string = '';
  // @ts-ignore
  environmentVariableCollection: EnvironmentVariableCollection = {};
  asAbsolutePath(relativePath: string): string {
    throw new Error("Method not implemented.");
  }
  storageUri: Uri | undefined;
  storagePath: string | undefined;
  globalStorageUri: Uri = Uri.file('');
  globalStoragePath: string = '';
  logUri: Uri = Uri.file('');
  logPath: string = '';
  extensionMode: ExtensionMode = ExtensionMode.Test;
};
