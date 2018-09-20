// @flow

import inquirer from 'inquirer';
import { MAX_TITLE_LENGTH, EMOJI_LENGTH_ALLOWANCE } from '../../config/options';
import trim from '../../utils/trim';

/**
 * Ask for the commit title and return the entire combined title
 *
 * @param {String} type The type of commit
 * @param {String} scope The scope of the commit
 *
 * @return {Promise} Promise that resolves with the commit title
 */
const title = (type, scope) => {
  let firstLine = '';

  if (type !== 'none') {
    firstLine = type;
  }

  if (scope) {
    firstLine = `${firstLine}(${scope})`;
  }

  if (firstLine !== '') {
    firstLine = `${firstLine}: `;
  }

  const lengthLeftForTitle =
    MAX_TITLE_LENGTH - EMOJI_LENGTH_ALLOWANCE - firstLine.length;

  return inquirer
    .prompt([
      {
        type: 'maxlength-input',
        name: 'val',
        message: 'If applied, this commit will...\n-',
        maxLength: lengthLeftForTitle,
        validate: (text) => {
          const filteredText = trim(text);

          if (!filteredText || filteredText === '') {
            return 'This is the commit title, it cannot be blank';
          }

          if (filteredText.length > lengthLeftForTitle) {
            return `Title length cannot be longer than ${lengthLeftForTitle}. Currently at ${
              filteredText.length
            }`;
          }

          return true;
        },
        filter: trim,
      },
    ])
    .then(({ val }) => `${firstLine}${val}`);
};

export default title;
