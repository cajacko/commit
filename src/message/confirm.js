// @flow

import inquirer from 'inquirer';

const confirm = (gitMessage, promptMessage, failCallback) =>
  inquirer
    .prompt([
      {
        name: 'confirmed',
        type: 'expand',
        choices: [
          {
            key: 'y',
            name: 'Confirm',
            value: true,
          },
          {
            key: 'n',
            name: 'Decline',
            value: false,
          },
          {
            key: 'e',
            name: 'Edit',
            value: 'edit',
          },
        ],
        default: 0,
        message: promptMessage,
      },
    ])
    .then(({ confirmed }) => {
      if (confirmed === true) return gitMessage;
      if (confirmed === false) return failCallback ? failCallback() : null;

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
    });

export default confirm;
