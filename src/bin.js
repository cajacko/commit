#! /usr/bin/env node

// @flow

import inquirer from 'inquirer';
import emojic from 'emojic';
import MaxLengthInputPrompt from 'inquirer-maxlength-input-prompt';
import AutoComplete from 'inquirer-autocomplete-prompt';
import fuzzy from 'fuzzy';

inquirer.registerPrompt('maxlength-input', MaxLengthInputPrompt);
inquirer.registerPrompt('autocomplete', AutoComplete);

// http://emoji.muan.co/

const trim = (text) => {
  if (text) return text.trim();

  return text;
};

const getDetails = () =>
  Promise.resolve({
    branch: 'feature/GEN-264-somethind-and-another',
    origin: 'https://github.com.git',
    prevResponses: {
      choices: ['bug', 'feat', 'feat'],
      scope: ['withHOC', null, 'NewsCards'],
    },
    lastUsedTags: ['#123', '#234', '#345'],
  });

getDetails().then(({ prevResponses, branch, lastUsedTags }) => {
  const descriptionDefault =
    "# Don't save changes to prevent this file getting adding\n# Why is this change needed?\nPrior to this change, \n\n# How does it address the issue?\nThis change";

  let scopeSuggestions = [];

  if (prevResponses.scope && prevResponses.scope.length) {
    scopeSuggestions = prevResponses.scope.filter(val => !!val).reverse();
  }

  return inquirer
    .prompt([
      {
        type: 'list',
        name: 'type',
        message: "Select the type of change that you're committing",
        choices: [
          'none',
          'feat (A new feature)',
          'fix (A bug fix)',
          'docs (Documentation changes only)',
          'style (Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc))',
          'refactor (A code change that neither fixes a bug nor adds a feature)',
          'perf (A code change that improves performance)',
          'test (Adding missing tests or correcting existing tests)',
          'chore (Updating build tasks etc; no production code change)',
        ],
        filter: answer => answer.split(' ')[0],
      },
      {
        type: 'autocomplete',
        name: 'scope',
        suggestOnly: true,
        source: (answers, input) =>
          Promise.resolve(fuzzy
            .filter(input || '', scopeSuggestions)
            .map(({ original }) => original)),
        message:
          'What is the scope of this change (e.g. component or file name)?\n-',
        filter: trim,
      },
    ])
    .then(({ type, scope }) => {
      let firstLine = '';

      if (type !== 'none') {
        firstLine = type;
      }

      if (scope) {
        firstLine = `${firstLine}(${scope})`;
      }

      if (firstLine !== '') {
        firstLine = `${firstLine}: `;
      }

      const maxFirstLineLength = 100;
      const emojiAllowance = 2;
      const lengthLeftForTitle =
        maxFirstLineLength - emojiAllowance - firstLine.length;

      return inquirer
        .prompt([
          {
            type: 'maxlength-input',
            name: 'title',
            message: 'If applied, this commit will...\n-',
            maxLength: lengthLeftForTitle,
            validate: (text) => {
              const filteredText = trim(text);

              if (!filteredText || filteredText === '') {
                return 'This is the commit title, it cannot be blank';
              }

              if (filteredText.length > lengthLeftForTitle) {
                return `Title length cannot be longer than ${lengthLeftForTitle}. Currently at ${
                  filteredText.length
                }`;
              }

              return true;
            },
            filter: trim,
          },
          {
            type: 'editor',
            name: 'body',
            message: 'Add a description to this commit',
            default: descriptionDefault,
            filter: (text) => {
              if (text === descriptionDefault) return null;

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
        .then(({ title, body }) => {
          firstLine = `${firstLine}${title}`;

          const refs = [
            {
              key: 'Original Branch',
              value: branch,
            },
          ];

          /**
           *
           */
          const getRefs = () =>
            inquirer
              .prompt([
                {
                  type: 'autocomplete',
                  name: 'key',
                  suggestOnly: true,
                  source: (answers, input) =>
                    Promise.resolve(fuzzy
                      .filter(input || '', ['Fixes', 'Related To'])
                      .map(({ original }) => original)),
                  message:
                    'References: Add a key (return nothing to continue)\n-',
                  filter: trim,
                },
              ])
              .then(({ key }) => {
                if (!key || key === '') return Promise.resolve();

                /**
                 *
                 */
                const promise = () => {
                  if (key === 'Fixes' || 'Related To') {
                    return inquirer.prompt([
                      {
                        type: 'autocomplete',
                        name: 'value',
                        suggestOnly: true,
                        source: (answers, input) => {
                          const text = trim(input || '');

                          const issues = lastUsedTags
                            .filter(tag =>
                              !text
                                .split(' ')
                                .some(textTag => textTag === tag))
                            .reverse()
                            .map((tag) => {
                              if (text === '') return tag;
                              const textTags = input.split(' ');
                              if (textTags.length === 1) return tag;

                              textTags.pop();

                              return trim(`${textTags.reduce(
                                (a, b) => `${a} ${b}`,
                                ''
                              )} ${tag}`);
                            });

                          return Promise.resolve(issues.filter(issue => issue.startsWith(text)));
                        },
                        message: `References: Add a value for ${key}\n-`,
                        filter: trim,
                      },
                    ]);
                  }

                  return inquirer.prompt([
                    {
                      type: 'input',
                      name: 'value',
                      message: `References: Add a value for ${key}\n-`,
                      filter: trim,
                    },
                  ]);
                };

                return promise().then(({ value }) => {
                  if (!value || value === '') return getRefs();

                  refs.push({ key, value });

                  return getRefs();
                });
              });

          return getRefs().then(() =>
            inquirer
              .prompt([
                {
                  type: 'list',

                  name: 'emoji',
                  choices: [
                    'none',
                    `${
                      emojic.art
                    } when improving the format/structure of the code`,
                    `${emojic.racehorse} when improving performance`,
                  ],
                  filter: (text) => {
                    if (!text || text === 'none') return null;

                    return text.split(' ')[0];
                  },
                },
              ])
              .then(({ emoji }) => {
                let gitMessage = `${firstLine}`;

                if (emoji) {
                  gitMessage = `${emoji} ${gitMessage}`;
                }

                if (body) {
                  gitMessage = `${gitMessage}\n\n${body}`;
                }

                if (refs.length) {
                  gitMessage = `${gitMessage}\n\nReferences:`;

                  refs.forEach(({ key, value }) => {
                    gitMessage = `${gitMessage}\n- ${key}: ${value}`;
                  });
                }

                gitMessage = gitMessage.replace('\n\n\n', '\n\n');

                console.log(gitMessage);
              }));
        });
    });
});

/*
# If applied, this commit will... (limit)

# Why is this change needed?
Prior to this change, ...

# How does it address the issue?
This change...

References
- Original Branch: feature/name
- Fixes: #GEN-254 (only if does fix it)
- Related: #GEN-254 #123
- Key: Value


Title
Why
How
Refs

Originally commited on - Branch

# <type>(<scope>): <subject>
#
# <body>
#
# <footer>
#
# ** TYPES **
# feat (new feature)
# fix (bug fix)
# docs (changes to documentation)
# style (formatting, missing semi colons, etc; no code change)
# refactor (refactoring production code)
# test (adding missing tests, refactoring tests; no production code change)
# chore (updating grunt tasks etc; no production code change)
#
# ** FOOTERS **
# References #1, #4, and #2.
# Fix #1. note this marks the item as accepted in Sprintly
# Closes #1 and #2. note this marks the item as accepted in Sprintly

# ** Funtip **
# Work hard, play hard!  Consider prefixing your commit messages with a relevant emoji for
# great good:
#
#   :art: `:art:` when improving the format/structure of the code
#   :racehorse: `:racehorse:` when improving performance
#   :non-potable_water: `:non-potable_water:` when plugging memory leaks
#   :memo: `:memo:` when writing docs
#   :penguin: `:penguin:` when fixing something on Linux
#   :apple: `:apple:` when fixing something on Mac OS
#   :checkered_flag: `:checkered_flag:` when fixing something on Windows
#   :bug: `:bug:` when fixing a bug
#   :fire: `:fire:` when removing code or files
#   :green_heart: `:green_heart:` when fixing the CI build
#   :white_check_mark: `:white_check_mark:` when adding tests
#   :lock: `:lock:` when dealing with security
#   :arrow_up: `:arrow_up:` when upgrading dependencies
#   :arrow_down: `:arrow_down:` when downgrading dependencies
#   :shirt: `:shirt:` when removing linter warnings
*/
