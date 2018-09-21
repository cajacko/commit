// @flow

import { git } from '@cajacko/template';
import lodashGet from 'lodash/get';
import { readFile } from 'fs-extra';
import chalk from 'chalk';
import { join } from 'path';
import { get } from './utils/store';
import getStoreKey from './utils/getStoreKey';

/**
 * Ensure the message is a string with no trailing white spaces, so we can best
 * compare the commit messages
 *
 * @param {String} message The message to parse
 *
 * @return {String} The parsed message
 */
const parseMessage = message => message.toString().trim();

/**
 * Check whether 2 commit messages are equal
 *
 * @param {String} a The first message
 * @param {String} b The second message to compare
 *
 * @return {Boolean} whether the messages are equal
 */
const areMessagesEqual = (a, b) => parseMessage(a) === parseMessage(b);

const error = new Error(chalk.red('\nCommit failed.\nCommits are only allowed via the "commit" command from the "@cajacko/commit" npm package.\nTo bypass this remove the "commit --validate-commit" command that should be on the "commit-msg" git hook'));

/**
 * Figure out whether we should validate this commit message or not, based of
 * the users settings for the cli
 *
 * @param {Object} settings The cli settings
 * @param {String} storeKey The store key for the repo
 *
 * @return {Boolean} Whether we should validate or not
 */
const getShouldValidate = (settings, storeKey) => {
  const repoShouldValidate = lodashGet(settings, [storeKey, 'shouldValidate']);

  if (typeof repoShouldValidate === 'boolean') {
    return repoShouldValidate;
  } else if (typeof settings.globalShouldValidate === 'boolean') {
    return settings.globalShouldValidate;
  }

  return false;
};

/**
 * Validate that the current commit message in .git dir matches the one created
 * via the cli. If it doesn't match then someone is commiting not from the cli
 *
 * @return {Promise} Promise that resolves if the commit is from the cli and
 * fails if not
 */
const validateCommit = () =>
  Promise.all([get(), getStoreKey()])
    .then(([storeSettings, storeKey]) => {
      const settings = storeSettings || {};

      if (!getShouldValidate(settings, storeKey)) return Promise.resolve();

      return git.getRootDir(process.cwd()).then((gitDir) => {
        const lastCommitMessage = lodashGet(settings, ['lastCommitMessage']);

        if (!lastCommitMessage) throw error;

        return readFile(join(gitDir, '.git/COMMIT_EDITMSG'))
          .catch(() => {
            throw new Error(chalk.red('\nCould not get your current commit message.\nPlease ensure "commit --validate-commit is running on the "commit-msg" hook.\nOtherwise we can\'t get it'));
          })
          .then((currentMsg) => {
            if (!areMessagesEqual(lastCommitMessage, currentMsg)) {
              return error;
            }

            return null;
          });
      });
    })
    .then((e) => {
      if (e) throw e;
    });

export default validateCommit;
