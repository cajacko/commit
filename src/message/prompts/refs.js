// @flow

import inquirer from 'inquirer';
import fuzzy from 'fuzzy';
import trim from '../../utils/trim';

/**
 * Ask for the refs to add, can be skipped in which case the default refs are
 * added
 *
 * @param {Boolean} omitRefs Whether to omit asking for refs or not
 * @param {Object} param1 The git and previous answer options
 *
 * @return {Promise} Promise that resolves with an array or refs to add
 */
const refs = (
  omitRefs,
  {
    branch,
    lastUsedCustomReferenceKeys,
    lastUsedTags,
    prevBranchResponses: { relatedTo },
  }
) => {
  const currentRefs = [
    {
      key: 'Original Branch',
      value: branch,
    },
  ];

  if (omitRefs) return Promise.resolve(currentRefs);

  /**
   * Self calling func that will keep asking for more references
   * until the user is done
   *
   * @return {Promise} Promise that resolves when finished asking for
   * refs
   */
  const getRefs = () =>
    inquirer
      .prompt([
        {
          type: 'autocomplete',
          name: 'key',
          suggestOnly: true,
          source: (answers, input) =>
            Promise.resolve(fuzzy
              .filter(
                input || '',
                ['Related To', 'Fixes'].concat(lastUsedCustomReferenceKeys.reverse())
              )
              .map(({ original }) => original)),
          message: 'References: Add a key (return nothing to continue)\n-',
          filter: trim,
        },
      ])
      .then(({ key }) => {
        if (!key || key === '') return Promise.resolve();

        /**
         * Function that asks for the value for a certain reference
         * key. This could be an autocomplete list of tags or a free
         * text input
         *
         * @return {Promise} Promise that resolves with the value for
         * the reference
         */
        const promise = () => {
          if (key === 'Fixes' || key === 'Related To') {
            return inquirer.prompt([
              {
                type: 'autocomplete',
                name: 'value',
                suggestOnly: true,
                source: (answers, input) => {
                  const text = trim(input || '');

                  const issues = lastUsedTags
                    .filter(tag => !text.split(' ').some(textTag => textTag === tag))
                    .reverse()
                    .map((tag) => {
                      if (text === '') return tag;
                      const textTags = input.split(' ');
                      if (textTags.length === 1) return tag;

                      textTags.pop();

                      return trim(`${textTags.reduce((a, b) => `${a} ${b}`, '')} ${tag}`);
                    });

                  if (key === 'Related To') {
                    const lastResponse =
                      relatedTo &&
                      relatedTo.length &&
                      relatedTo[relatedTo.length - 1];

                    if (lastResponse) {
                      issues.unshift(`Prev: ${lastResponse}`);
                    }
                  }

                  const val = issues.filter(issue => issue.startsWith(text));
                  return Promise.resolve(val);
                },
                message: `References: Add a value for ${key}\n-`,
                filter: text => trim(text).replace('Prev: ', ''),
              },
            ]);
          }

          return inquirer.prompt([
            {
              type: 'input',
              name: 'value',
              message: `References: Add a value for ${key}\n-`,
              filter: trim,
            },
          ]);
        };

        return promise().then(({ value }) => {
          if (!value || value === '') return getRefs();

          currentRefs.push({ key, value });

          return getRefs();
        });
      });

  return getRefs().then(() => currentRefs);
};

export default refs;
