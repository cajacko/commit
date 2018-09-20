// @flow

import inquirer from 'inquirer';
import fuzzy from 'fuzzy';
import trim from '../../utils/trim';

/**
 * Ask for the scope to use
 *
 * @param {Object} prevBranchResponses The previous answers object associated
 * with the current branch
 * @param {Boolean} [omitScope] Whether to skip the scope or not
 * @param {Boolean} [mustInclude] Whether to validate the scope
 *
 * @return {Promise} Promise that returns the scope to use
 */
const scope = (prevBranchResponses, omitScope, mustInclude) => {
  if (omitScope) return Promise.resolve(null);

  const prevScope = prevBranchResponses.scope;
  let scopeSuggestions = [];

  if (prevScope && prevScope.length) {
    scopeSuggestions = prevScope.filter(val => !!val).reverse();
  }

  return inquirer
    .prompt([
      {
        type: 'autocomplete',
        name: 'val',
        suggestOnly: true,
        source: (answers, input) =>
          Promise.resolve(fuzzy
            .filter(input || '', scopeSuggestions)
            .map(({ original }) => original)),
        message:
          'What is the scope of this change (e.g. component or file name)?\n-',
        filter: trim,
        validate: (response) => {
          if (!mustInclude) return true;

          if (!response || response === '' || !response.length) {
            return 'You must include a scope';
          }

          return true;
        },
      },
    ])
    .then(({ val }) => val);
};

export default scope;
