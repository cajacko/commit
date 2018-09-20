// @flow

import * as prompts from './prompts';
import buildMessage from './buildMessage';
import persistResponses from './persistResponses';

/**
 * Ask all the prompts to build up a new message
 *
 * @param {Options} opts The previous and computed properties of the repo
 * @param {Boolean} omitBody Whether to omit the body prompt
 * @param {Boolean} omitRefs Whether to omit the refs prompt
 *
 * @return {Promise} Promise that resolves with the new message
 */
const getNewMessage = (
  {
    storeKey,
    prevBranchResponses,
    branch,
    lastUsedTags,
    lastUsedCustomReferenceKeys,
  },
  omitBody,
  omitRefs,
  restart
) => {
  const responses = {};

  /**
   * Wrap a promise func, that stores the response in an object we can access
   * in the rest of the main func
   *
   * @param {String} key The key to store the response in
   * @param {Function} func The prompt to run
   *
   * @return {Promise} Promsie that resovles with the original func response
   */
  const refResponse = (key, func) => (...args) =>
    func(...args).then((response) => {
      responses[key] = response;

      return response;
    });

  return refResponse('type', prompts.type)()
    .then(() => refResponse('scope', prompts.scope)(prevBranchResponses))
    .then(() =>
      refResponse('title', prompts.title)(responses.type, responses.scope))
    .then(() => refResponse('body', prompts.body)(omitBody))
    .then(() =>
      refResponse('refs', prompts.refs)(omitRefs, {
        branch,
        lastUsedCustomReferenceKeys,
        lastUsedTags,
        prevBranchResponses,
      }))
    .then(refResponse('emoji', prompts.emoji))
    .then(() => {
      const {
        title, emoji, body, refs,
      } = responses;

      return buildMessage(title, emoji, body, refs);
    })
    .then(message =>
      prompts.confirm(
        message,
        `Commit message:\n------\n${message}\n------\n\nDo you want to use this message?`,
        null,
        restart
      ))
    .then((message) => {
      if (!message) return null;

      persistResponses(storeKey, branch, responses);

      return message;
    });
};

export default getNewMessage;
