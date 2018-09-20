// @flow

import inquirer from 'inquirer';
import emojiChoices from '../emojiChoices';

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
        message: 'Prepend an emoji',
        source: (answers, input) =>
          Promise.resolve(['none'].concat(emojiChoices(input))),
        filter: (text) => {
          if (!text || text === 'none') return null;

          return text.split(' ')[0];
        },
      },
    ])
    .then(({ val }) => val);

export default type;
