#! /usr/bin/env node

// @flow

import inquirer from 'inquirer';
import { git } from '@cajacko/template';
import MaxLengthInputPrompt from 'inquirer-maxlength-input-prompt';
import AutoComplete from 'inquirer-autocomplete-prompt';
import chalk from 'chalk';
import getMessage from './message/getMessage';
import getDetails from './utils/getDetails';
import { set, remove } from './utils/store';

const EditorPrompt = require('./utils/EditorPrompt');

/**
 * Run the commit process. Has various prompts for figuring out the commit
 * message and eventually commits, does nothing or errors
 *
 * @return {Promise} Promise that resolves when the process has finished
 */
const commit = () => {
  inquirer.registerPrompt('maxlength-input', MaxLengthInputPrompt);
  inquirer.registerPrompt('autocomplete', AutoComplete);
  inquirer.registerPrompt('auto-editor', EditorPrompt);

  return git.hasStagedChanges(process.cwd()).then((hasStagedChanges) => {
    const omitBody = process.argv.includes('-s');
    const omitRefs = omitBody;

    /**
     * Get the commit message and commit if all good
     *
     * @return {Promise} Promise that resolves when commited or aborted
     */
    const run = () =>
      getDetails().then(details =>
        getMessage(details, omitBody, omitRefs).then((message) => {
          if (!message) return Promise.resolve();

          const { storeKey } = details;

          return set(['lastCommitMessage'], message)
            .then(() => git.commit(process.cwd(), message, false))
            .then(() => {
              remove([storeKey, 'failedMessage']);
            })
            .catch((e) => {
              set([storeKey, 'failedMessage'], message);
              throw e;
            });
        }));

    if (hasStagedChanges) return run();

    return (
      git
        .hasUnstagedChanges(process.cwd())
        .then((hasUnstagedChanges) => {
          if (!hasUnstagedChanges) {
            throw new Error(chalk.red('There are no changes to commit'));
          }

          return git.stageAll().then(run);
        })
        // eslint-disable-next-line no-console
        .catch(console.error)
    );
  });
};

export default commit;
