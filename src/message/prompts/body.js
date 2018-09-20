// @flow

import inquirer from 'inquirer';
import { DESCRIPTION_DEFAULT } from '../../config/options';
import trim from '../../utils/trim';

/**
 * Ask whether we should set the body content and then set it if so
 *
 * @param {Boolean} omitBody Whether to omit the body or not
 *
 * @return {Promise} Promise that resolves with null or the body content
 */
const body = (omitBody) => {
  if (omitBody) return Promise.resolve(null);

  return inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'shouldAddBody',
        message: 'Add a description to this commit',
      },
    ])
    .then(({ shouldAddBody }) => {
      if (!shouldAddBody) return null;

      return inquirer
        .prompt([
          {
            type: 'auto-editor',
            name: 'val',
            message: 'Add a description to this commit',
            default: DESCRIPTION_DEFAULT,
            filter: (text) => {
              if (text === DESCRIPTION_DEFAULT) return null;

              let final = '';
              let first = true;

              text.split('\n').forEach((line) => {
                if (line.startsWith('#')) return;

                if (first) {
                  first = false;
                  final = line;
                } else {
                  final = `${final}\n`;

                  if (trim(line) !== '') {
                    final = `${final}${line}`;
                  }
                }
              });

              return trim(final);
            },
          },
        ])
        .then(({ val }) => val);
    });
};

export default body;
