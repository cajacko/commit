#! /usr/bin/env node

// @flow

import inquirer from 'inquirer';
import { git } from '@cajacko/template';
import MaxLengthInputPrompt from 'inquirer-maxlength-input-prompt';
import AutoComplete from 'inquirer-autocomplete-prompt';
import getMessage from './message/getMessage';

inquirer.registerPrompt('maxlength-input', MaxLengthInputPrompt);
inquirer.registerPrompt('autocomplete', AutoComplete);

// TODO: If commit failed, store message and ask if want to use it next time
// TODO: getDetails
// TODO: saveResponses for getDetails, when done
// TODO: Show git message and confirm before doing it

git.hasStagedChanges(process.cwd()).then((hasStagedChanges) => {
  if (!hasStagedChanges) {
    throw new Error('Nothing is staged');
  }

  return getMessage().then((message) => {
    if (!message) return Promise.resolve();

    return git.commit(process.cwd(), message, false);
  });
});
