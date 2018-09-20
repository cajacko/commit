// @flow

import inquirer from 'inquirer';

/**
 * Ask for the commit type
 *
 * @return {Promise} Promise that resolves with the type
 */
const type = () =>
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'val',
        message: "Select the type of change that you're committing",
        choices: [
          'none',
          'feat (A new feature)',
          'fix (A bug fix)',
          'docs (Documentation changes only)',
          'style (Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc))',
          'refactor (A code change that neither fixes a bug nor adds a feature)',
          'perf (A code change that improves performance)',
          'test (Adding missing tests or correcting existing tests)',
          'chore (Updating build tasks etc; no production code change)',
        ],
        filter: answer => answer.split(' ')[0],
      },
    ])
    .then(({ val }) => val);

export default type;
