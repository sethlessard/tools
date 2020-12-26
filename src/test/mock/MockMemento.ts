import { Memento } from "vscode";

export default class MockMemento implements Memento {
  entries: { [key: string]: any; } = {};

  get(key: string, defaultValue?: any) {
    return this.entries[key] || defaultValue;
  }
  update(key: string, value: any): Thenable<void> {
    this.entries[key] = value;
    return Promise.resolve();
  }
}
