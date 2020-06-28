
class HasHelp {

  /**
   * Get the help.
   * @returns {{ description: string, help: {[string]: {description: string, args: {[string]: {description: string, args: {[string|number]: { description: string, default?: any, required?: boolean }}}}}}} the help.
   */
  getHelp() { return {}; }
}

module.exports = HasHelp;
