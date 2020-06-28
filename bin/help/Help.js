
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
    hmsg += "  [language]:\n";
    for (const language of Object.keys(scHelp.languages)) {
      const langInfo = scHelp.languages[language];
      hmsg += _formatSubjectDescription(`      - ${language}`, langInfo.description) + "\n";
      hmsg += `          [type]\n`
      for (const type of Object.keys(langInfo.help)) {
        const typeHelp = langInfo.help[type];
        hmsg += _formatSubjectDescription(`            * ${type}`, typeHelp.description, 64) + "\n";
      }
    }
    hmsg += "\n";
  }

  _showUsage(hmsg);
};

/**
 * Format a subject/description so that the spacing is even for all entries.
 * @param {string} subject the subject.
 * @param {string} description the description of the subject.
 * @param {number} descriptionStart the start of the description field.
 * @returns {string} the formatted subject/description line
 */
const _formatSubjectDescription = (subject, description, descriptionStart = 60) => {
  const subjectLength = subject.length;
  for (let i = subject.length; i < descriptionStart; i++) {
    subject += " ";
  }
  return subject + description;
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
