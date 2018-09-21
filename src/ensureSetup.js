// @flow

import lodashGet from 'lodash/get';
import inquirer from 'inquirer';
import getStoreKey from './utils/getStoreKey';
import { get, set } from './utils/store';

/**
 * Ensure a specific setting. If the setting does not exist we prompt for it
 *
 * @param {Object} settings The settings object
 * @param {Array} location Array of strings representing the location to get in
 * the settings
 * @param {String} message The prompt message
 *
 * @return {Promise} Promise that resolves when the setting is there
 */
const ensure = (settings, location, message) => {
  const setting = lodashGet(settings, location);

  if (setting === undefined || typeof setting !== 'boolean') {
    return inquirer
      .prompt([
        {
          type: 'list',
          choices: ['True', 'False'],
          name: 'val',
          message,
          default: 'Yes',
          filter: response => response === 'True',
        },
      ])
      .then(({ val }) => set(location, val));
  }

  return Promise.resolve();
};

/**
 * Ensure all the global and repo level settings are set. Will prompt for any
 * that are missing
 *
 * @return {Promise} Promise that resolves when all the settings are there
 */
const ensureSetup = () =>
  getStoreKey().then(storeKey =>
    get().then((storeSettings) => {
      const settings = storeSettings || {};

      return ensure(
        settings,
        ['globalShouldValidate'],
        'Setup - Set global default for "shouldValidate"'
      )
        .then(() =>
          ensure(
            settings,
            ['globalSkipValidateOnError'],
            'Setup - Set global default for "skipValidateOnError"'
          ))
        .then(() =>
          ensure(
            settings,
            [storeKey, 'shouldValidate'],
            'Setup - Set "shouldValidate" for this repo'
          ))
        .then(() =>
          ensure(
            settings,
            [storeKey, 'skipValidateOnError'],
            'Setup - Set "skipValidateOnError" for this repo'
          ));
    }));

export default ensureSetup;
