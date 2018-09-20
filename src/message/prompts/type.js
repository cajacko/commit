// @flow

import inquirer from 'inquirer';
import trim from '../../utils/trim';

/**
 * Filter the type, get's the first word only
 *
 * @param {String} response The response to filter
 *
 * @return {String} The new type
 */
const filter = (response) => {
  if (!response) return null;

  return trim(response).split(' ')[0];
};

/**
 * Ask for the commit type
 *
 * @return {Promise} Promise that resolves with the type
 */
const type = () =>
  inquirer
    .prompt([
      {
        type: 'autocomplete',
        name: 'val',
        message: "Select the type of change that you're committing",
        suggestOnly: true,
        source: () =>
          Promise.resolve([
            'feat (A new feature)',
            'fix (A bug fix)',
            'docs (Documentation changes only)',
            'style (Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc))',
            'refactor (A code change that neither fixes a bug nor adds a feature)',
            'perf (A code change that improves performance)',
            'test (Adding missing tests or correcting existing tests)',
            'chore (Updating build tasks etc; no production code change)',
          ]),
        filter,
        validate: (response) => {
          const val = filter(response);

          if (!val || val === '' || !val.length) {
            return 'You must include a type';
          }

          return true;
        },
      },
    ])
    .then(({ val }) => val);

export default type;
