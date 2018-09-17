#! /usr/bin/env node

// @flow

import inquirer from 'inquirer';
import { git } from '@cajacko/template';
import MaxLengthInputPrompt from 'inquirer-maxlength-input-prompt';
import AutoComplete from 'inquirer-autocomplete-prompt';
import getMessage from './message/getMessage';
import getDetails from './utils/getDetails';
import { set, remove } from './utils/store';

inquirer.registerPrompt('maxlength-input', MaxLengthInputPrompt);
inquirer.registerPrompt('autocomplete', AutoComplete);

// TODO: If commit failed, store message and ask if want to use it next time
// TODO: saveResponses for getDetails, when done
// TODO: getDetails
// TODO: Can pass flag to do a short commit
// TODO: Ask if we to do description and open editor right after if true
// TODO: If no staged ask to stage all

git.hasStagedChanges(process.cwd()).then((hasStagedChanges) => {
  if (!hasStagedChanges) {
    throw new Error('Nothing is staged');
  }

  return getDetails().then((details) => {
    console.log(details);

    return getMessage(details).then((message) => {
      if (!message) return Promise.resolve();

      const { storeKey } = details;

      return git
        .commit(process.cwd(), message, false)
        .then(() => {
          remove([storeKey, 'failedMessage']);
        })
        .catch((e) => {
          set([storeKey, 'failedMessage'], message);
          throw e;
        });
    });
  });
});
