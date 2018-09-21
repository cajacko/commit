// @flow

import lodashGet from 'lodash/get';
import inquirer from 'inquirer';
import getStoreKey from './utils/getStoreKey';
import { get, set } from './utils/store';

/**
 * Prompt or ensure a specific setting
 *
 * @param {Object} settings The settings object
 * @param {Array} location Array of strings representing the location to get in
 * the settings
 * @param {String} message The prompt message
 * @param {Boolean} forcePrompt Whether to force the prompt
 *
 * @return {Promise} Promise that resolves when the setting is there
 */
const prompt = (settings, location, message, forcePrompt) => {
  const setting = lodashGet(settings, location);

  const shouldPrompt =
    forcePrompt || (setting === undefined || typeof setting !== 'boolean');

  if (shouldPrompt) {
    return inquirer
      .prompt([
        {
          type: 'list',
          choices: ['True', 'False'],
          name: 'val',
          message,
          default: setting === false ? 1 : 0,
          filter: response => response === 'True',
        },
      ])
      .then(({ val }) => set(location, val));
  }

  return Promise.resolve();
};

/**
 * Ensure all the global and repo level settings are set. Will prompt for any
 * that are missing. Can optionally force the prompts.
 *
 * @param {Boolean} forcePrompt Whether to force the prompt or not
 *
 * @return {Promise} Promise that resolves when all the settings are there
 */
const ensureSetup = forcePrompt =>
  getStoreKey().then(storeKey =>
    get().then((storeSettings) => {
      const settings = storeSettings || {};

      /**
       * Small helper to run the prompts with common params
       *
       * @param {Array} location Array of strings representing the location to
       * get in the settings
       * @param {String} message The prompt message
       *
       * @return {Promise} Promise that resolves when the setting is set
       */
      const settingPrompt = (location, message) => () =>
        prompt(settings, location, message, forcePrompt);

      return settingPrompt(
        ['globalShouldValidate'],
        'Setup - Set global default for "shouldValidate"'
      )()
        .then(settingPrompt(
          ['globalSkipValidateOnError'],
          'Setup - Set global default for "skipValidateOnError"'
        ))
        .then(settingPrompt(
          [storeKey, 'shouldValidate'],
          'Setup - Set "shouldValidate" for this repo'
        ))
        .then(settingPrompt(
          [storeKey, 'skipValidateOnError'],
          'Setup - Set "skipValidateOnError" for this repo'
        ));
    }));

export default ensureSetup;
