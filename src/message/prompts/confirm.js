// @flow

import inquirer from 'inquirer';

/**
 * Confirm a git commit message, resolves with the message if accepted, null if
 * declined, and let's you edit the message if you choose that option
 *
 * @param {String} gitMessage The git message to confirm
 * @param {String} promptMessage The prompt message to show
 * @param {Function} failCallback Optional callback for when failed
 * @param {Function} restartCallback Optional callback for when we should
 * restart
 *
 * @return {Promise} Promise that resolves with the message or null if declined
 */
const confirm = (gitMessage, promptMessage, failCallback, restartCallback) =>
  inquirer
    .prompt([
      {
        name: 'confirmed',
        type: 'list',
        choices: ['Yes', 'No', 'Edit', 'Start Again'],
        default: 'Confirm',
        message: promptMessage,
      },
    ])
    .then(({ confirmed }) => {
      switch (confirmed) {
        case 'Yes':
          return gitMessage;

        case 'No':
          return failCallback ? failCallback() : null;

        case 'Start Again':
          return restartCallback ? restartCallback() : null;

        default:
          return inquirer
            .prompt([
              {
                name: 'content',
                type: 'auto-editor',
                message: 'Edit the current git message',
                default: gitMessage,
              },
            ])
            .then(({ content }) => content);
      }
    });

export default confirm;
