
let _help = null;
const registerHelp = (help) => {
  _help = help;
};

/**
 * Show help.
 * @param {string} subcommand the subcommand.
 */
const showHelp = (subcommand) => {
  if (!_help) throw Error("registerHelp() must be called.");

  const toShow = (subcommand) ? { [subcommand]: _help[subcommand] } : _help;
  
  let hmsg = "";
  for (const subcommand of Object.keys(toShow)) {
    const scHelp = toShow[subcommand];
    
    // add usage and description
    hmsg += `t00ls ${scHelp.usage}                        ${scHelp.description}\n`;

    // print languanges
    hmsg += "    [language]:\n";
    for (const language of Object.keys(scHelp.languages)) {
      const langInfo = scHelp.languages[language];
      hmsg += `        - ${language}                        ${langInfo.description}\n`
      hmsg += `            [type]\n`
      for (const type of Object.keys(langInfo.help)) {
        const typeHelp = langInfo.help[type];
        hmsg += `                * ${type}                        ${typeHelp.description}\n`;
      }
    }
    hmsg += "\n";
  }

  _showUsage(hmsg);
};

/**
 * Show a usage help message.
 * @param {string} help the help message.
 */
const _showUsage = (help) => {
  console.log(`Usage:\n${help}`);
  process.exit(0);
}

module.exports = {
  registerHelp,
  showHelp
};
