import { OutputChannel } from "vscode";

class Logger {

  private static _instance?: Logger = undefined;
  private _channel?: OutputChannel;

  /**
   * Get the Logger instance.
   */
  public static getInstance(): Logger {
    if (!Logger._instance) {
      Logger._instance = new Logger();
    }
    return Logger._instance;
  }

  /**
   * Initialize the output channel.
   * @param channel the VS Code output channel.
   */
  initChannel(channel: OutputChannel) {
    this._channel = channel;
  }

  /**
   * Show the log (VS Code channel)
   */
  show() {
    if (!this._channel) { throw new Error("You must call 'Logger.getInstance().initChannel()' before you can call this."); }
    this._channel.show();
  }

  /**
   * Write some data to the log.
   * @param data the data to write.
   */
  write(data: any) {
    if (!this._channel) { throw new Error("You must call 'Logger.getInstance().initChannel()' before you can call this."); }
    this._channel.append(data);
  }

  /**
   * Write some data to the log and append a new line.
   * @param data the data to write.
   */
  writeLn(data: any) {
    if (!this._channel) { throw new Error("You must call 'Logger.getInstance().initChannel()' before you can call this."); }
    this._channel.appendLine(data);
  }
}

export default Logger;
