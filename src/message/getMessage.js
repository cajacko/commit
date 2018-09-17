// @flow

import inquirer from 'inquirer';
import fuzzy from 'fuzzy';
import emojiChoices from './emojiChoices';
import setDetails from '../utils/setDetails';

/**
 *
 */
const trim = (text) => {
  if (text) return text.trim();

  return text;
};

/**
 *
 */
const getMessage = (
  {
    storeKey,
    prevBranchResponses,
    branch,
    lastUsedTags,
    lastUsedCustomReferenceKeys,
    failedMessage,
  },
  omitBody,
  omitRefs
) => {
  /**
   *
   */
  const getNewMessage = () => {
    const newTags = [];
    const relatedTo = [];
    const referenceKeys = [];
    let scopeAnswer;

    const descriptionDefault =
      "# Don't save changes to prevent this file getting adding\n# Why is this change needed?\nPrior to this change, \n\n# How does it address the issue?\nThis change";

    let scopeSuggestions = [];

    if (prevBranchResponses.scope && prevBranchResponses.scope.length) {
      scopeSuggestions = prevBranchResponses.scope
        .filter(val => !!val)
        .reverse();
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
        scopeAnswer = scope;
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

        const questions = [
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
        ];

        if (!omitBody) {
          questions.push({
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
          });
        }

        return inquirer.prompt(questions).then(({ title, body }) => {
          firstLine = `${firstLine}${title}`;

          const refs = [
            {
              key: 'Original Branch',
              value: branch,
            },
          ];

          let refPromise = Promise.resolve();

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
                      .filter(
                        input || '',
                        ['Fixes', 'Related To'].concat(lastUsedCustomReferenceKeys.reverse())
                      )
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
                  if (key === 'Fixes' || key === 'Related To') {
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

                          if (key === 'Related To') {
                            const lastResponse =
                              prevBranchResponses.relatedTo &&
                              prevBranchResponses.relatedTo.length &&
                              prevBranchResponses.relatedTo[
                                prevBranchResponses.relatedTo.length - 1
                              ];

                            if (lastResponse) {
                              issues.unshift(`Prev: ${lastResponse}`);
                            }
                          }

                          return Promise.resolve(issues.filter(issue => issue.startsWith(text)));
                        },
                        message: `References: Add a value for ${key}\n-`,
                        filter: text => trim(text).replace('Prev: ', ''),
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

          if (!omitRefs) {
            refPromise = getRefs();
          }

          return refPromise.then(() =>
            inquirer
              .prompt([
                {
                  type: 'list',

                  name: 'emoji',
                  choices: ['none'].concat(emojiChoices),
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

                    if (key === 'Related To' && !relatedTo.includes(value)) {
                      relatedTo.push(value);
                    }

                    if (
                      key !== 'Related To' &&
                      key !== 'Fixes' &&
                      key !== 'Original Branch' &&
                      !referenceKeys.includes(key)
                    ) {
                      referenceKeys.push(key);
                    }

                    value.split(' ').forEach((tag) => {
                      if (tag.startsWith('#') && !newTags.includes(tag)) {
                        newTags.push(tag);
                      }
                    });
                  });
                }

                gitMessage = gitMessage.replace('\n\n\n', '\n\n');

                return gitMessage;
              }));
        });
      })
      .then(message =>
        inquirer
          .prompt([
            {
              type: 'confirm',
              name: 'shouldCommit',
              message: `Commit message:\n------\n${message}\n------\n\nDo you want to use this message?`,
            },
          ])
          .then(({ shouldCommit }) => {
            if (!shouldCommit) return null;

            setDetails({
              storeKey,
              branch,
              newTags,
              referenceKeys,
              scope: scopeAnswer,
              relatedTo,
            });

            return message;
          }));
  };

  if (!failedMessage) return getNewMessage();

  return inquirer
    .prompt([
      {
        name: 'shouldUseFailedMessage',
        type: 'confirm',
        message: `There is a previous commit message which failed to be applied:\n------\n${failedMessage}\n------\n\nDo you want to use this message?`,
      },
    ])
    .then(({ shouldUseFailedMessage }) => {
      if (shouldUseFailedMessage) return failedMessage;

      return getNewMessage();
    });
};

export default getMessage;
