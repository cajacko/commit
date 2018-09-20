// @flow

import inquirer from 'inquirer';
import chalk from 'chalk';
import confirmMessage from '../../utils/confirmMessage';

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
const confirm = (gitMessage, promptMessage, failCallback, restartCallback) => {
  const choices = {
    yes: chalk.green('Yes'),
    no: chalk.red('No'),
    edit: 'Edit',
    restart: 'Start Again',
  };

  return inquirer
    .prompt([
      {
        name: 'confirmed',
        type: 'list',
        choices: Object.values(choices),
        default: 'Confirm',
        message: promptMessage,
      },
    ])
    .then(({ confirmed }) => {
      switch (confirmed) {
        case choices.yes:
          return gitMessage;

        case choices.no:
          return failCallback ? failCallback() : null;

        case choices.restart:
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
            .then(({ content }) =>
              confirm(content, confirmMessage(content), null, restartCallback));
      }
    });
};

export default confirm;
