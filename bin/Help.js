
const CREATE_HELP = `
tools create [language] [projectType]               Create a new project.
  [language]:
    - node                                          NodeJS project
    - python                                        Python project
    - c                                             C project
    - cpp or c++                                    C++ project
    - react                                         ReactJS project
  [projectType]:
    - api                                           Basic API (node & python)
    - socket.io-server                              Basic socket.io server (node)
`.trim();

const TEMPLATE_HELP = `
tools template [language] [templateType]            Create a file based off of a template.
  [language]:
    - javascript                                    JavaScript template
    - python                                        Python template
    - html                                          HTML template
    - css                                           CSS template
    - docker                                        Docker template
    - c                                             C template
    - cpp or c++                                    C++ template
  [templateType]:
    - class                                         Class template (cpp/c++, javascript, python)
    - singleton                                     Singleton template (cpp/c++, javascript, python)
    - main                                          Main entrypoint file (c, cpp/c++, python)
`.trim();

/**
 * Show the create help.
 */
const showCreateHelp = () => {
  _showUsage(CREATE_HELP);
};

/**
 * Show help.
 */
const showHelp = () => {
  _showUsage(`${CREATE_HELP}\n\n${TEMPLATE_HELP}`);
};

/**
 * Show the template help.
 */
const showTemplateHelp = () => {
  _showUsage(TEMPLATE_HELP);
};

/**
 * Show a usage help message.
 * @param {string} help the help message.
 */
const _showUsage = (help) => {
  console.log(`Usage:\n\n${help}`);
  process.exit(0);
}

module.exports = {
  showCreateHelp,
  showHelp,
  showTemplateHelp
};
