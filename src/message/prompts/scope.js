// @flow

import inquirer from 'inquirer';
import fuzzy from 'fuzzy';
import trim from '../../utils/trim';

/**
 * Ask for the scope to use
 *
 * @param {Object} prevBranchResponses The previous answers object associated
 * with the current branch
 *
 * @return {Promise} Promise that returns the scope to use
 */
const scope = (prevBranchResponses) => {
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
      },
    ])
    .then(({ val }) => val);
};

export default scope;
