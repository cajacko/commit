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

// TODO: Final confirm is Yne - e is editor, same it confirming previous commit
// TODO: Can pass flag to do a short commit
// TODO: Ask if we to do description and open editor right after if true
// TODO: Reorder all choices based on usage (last used is high, frequently used is high)
// TODO: "Related to" ordered above "fixes"
// TODO: Ability to force all commits to run through us
// TODO: Can enter cutom emoji

git.hasStagedChanges(process.cwd()).then((hasStagedChanges) => {
  /**
   *
   */
  const commit = () =>
    getDetails().then(details =>
      getMessage(details).then((message) => {
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
      }));

  if (hasStagedChanges) return commit();

  return git.hasUnstagedChanges(process.cwd()).then((hasUnstagedChanges) => {
    if (!hasUnstagedChanges) {
      throw new Error('There are no changes to commit');
    }

    return git.stageAll().then(commit);
  });
});
