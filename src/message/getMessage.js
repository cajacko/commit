// @flow

import getNewMessage from './getNewMessage';
import { confirm } from './prompts';

/**
 * Ask all the prompts needed to build up the commit message
 *
 * @param {Options} opts The previous and computed properties of the repo
 * @param {Boolean} omitBody Whether to omit the body prompt
 * @param {Boolean} omitRefs Whether to omit the refs prompt
 *
 * @return {Promise} Promise that resolves with the commit message
 */
const getMessage = (opts, omitBody, omitRefs) => {
  const { failedMessage } = opts;

  /**
   * Wrap the get new message func with the params we will always pass
   *
   * @return {Promise} Promise that resolves with null or the new message
   */
  const getNewMessageWithParams = () => getNewMessage(opts, omitBody, omitRefs);

  if (!failedMessage) return getNewMessageWithParams();

  return confirm(
    failedMessage,
    `There is a previous commit message which failed to be applied:\n------\n${failedMessage}\n------\n\nDo you want to use this message?`,
    getNewMessageWithParams
  );
};

export default getMessage;
