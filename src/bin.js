#! /usr/bin/env node

// @flow

import inquirer from 'inquirer';
import { git } from '@cajacko/template';
import MaxLengthInputPrompt from 'inquirer-maxlength-input-prompt';
import AutoComplete from 'inquirer-autocomplete-prompt';
import getMessage from './message/getMessage';
import getDetails from './utils/getDetails';
import { set, remove } from './utils/store';

const EditorPrompt = require('./utils/EditorPrompt');

inquirer.registerPrompt('maxlength-input', MaxLengthInputPrompt);
inquirer.registerPrompt('autocomplete', AutoComplete);
inquirer.registerPrompt('auto-editor', EditorPrompt);

// TODO: Highlight no staged chanegs or no diffs, and Yes/No etc
// TODO: Must have a type and scope
// TODO: Prioritise emoji based off what type
// TODO: Ability to force all commits to run through us
// TODO: Reorder all choices based on usage (last used is high, frequently used is high)
// TODO: How to keep related To between commits, especially short ones
// TODO: PR from here as well
// TODO: Can update changelog at the same time

git.hasStagedChanges(process.cwd()).then((hasStagedChanges) => {
  const omitBody = process.argv.includes('-s');
  const omitRefs = omitBody;

  /**
   * Get the commit message and commit if all good
   *
   * @return {Promise} Promise that resolves when commited or aborted
   */
  const commit = () =>
    getDetails().then(details =>
      getMessage(details, omitBody, omitRefs).then((message) => {
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
