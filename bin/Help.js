
const CREATE_HELP = `
tools create [language] [projectType]         Create a new project.
  [language]:
    - c                                       C project
    - cpp or c++                              C++ project
    - node                                    NodeJS project
    - python                                  Python project
  [projectType]:
    - api                                     Basic API (node & python)
    - react-app                               Basic React App (node)
    - react-library                           Basic React Library (node)
    - simple                                  Simple project (c, cpp/c++)
    - socket.io-server                        Basic socket.io server (node)
`.trim();

const TEMPLATE_HELP = `
tools template [language] [templateType]      Create a file based off of a template.
  [language]:
    - c                                       C template
    - cpp or c++                              C++ template
    - css                                     CSS template
    - html                                    HTML template
    - docker                                  Docker template
    - javascript                              JavaScript template
    - python                                  Python template
    - react                                   ReactJS template
    - systemd                                 systemd template
  [templateType]:
    - cc                                      Class Component template (react)
    - ccc                                     Connected Class Component template (react)
    - csfc                                    Connected Stateless Functional Component template (react)
    - class                                   Class template (cpp/c++, javascript, python)
    - main                                    Main entrypoint file (c, cpp/c++, python)
    - minecraft                               Minecraft Services template (systemd)
    - simple                                  Simple template (html, systemd)
    - singleton                               Singleton template (cpp/c++, javascript, python)
    - sfc                                     Stateless Functional Component template (react)
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
