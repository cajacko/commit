// @flow

import { git } from '@cajacko/template';
import { readFile } from 'fs-extra';
import chalk from 'chalk';
import { join } from 'path';
import { get, remove } from './utils/store';

const parseMessage = message => message.toString().trim();

const areMessagesEqual = (a, b) => parseMessage(a) === parseMessage(b);

const clearLastCommitMessage = () => remove(['lastCommitMessage']);

const error = new Error(chalk.red('\nCommit failed.\nCommits are only allowed via the "commit" command from the "@cajacko/commit" npm package.\nTo bypass this remove the "commit --validate-commit" command that should be on the "commit-msg" git hook'));

/**
 * Validate that the current commit message in .git dir matches the one created
 * via the cli. If it doesn't match then someone is commiting not from the cli
 *
 * @return {Proimse} Promise that resolves if the commit is from the cli and
 * fails if not
 */
const validateCommit = () =>
  Promise.all([get(['lastCommitMessage']), git.getRootDir(process.cwd())])
    .then(([lastCommitMessage, gitDir]) => {
      if (!lastCommitMessage) throw error;

      return readFile(join(gitDir, '.git/COMMIT_EDITMSG'))
        .catch(() => {
          throw new Error(chalk.red('\nCould not get your current commit message.\nPlease ensure "commit --validate-commit is running on the "commit-msg" hook.\nOtherwise we can\'t get it'));
        })
        .then((currentMsg) => {
          if (!areMessagesEqual(lastCommitMessage, currentMsg)) {
            throw error;
          }
        });
    })
    .then(clearLastCommitMessage)
    .catch(e =>
      clearLastCommitMessage().then(() => {
        throw e;
      }));

export default validateCommit;
