interface NeedsAsyncInitialization {

  initialize(...params: any): Promise<void>;
}

export default NeedsAsyncInitialization;
