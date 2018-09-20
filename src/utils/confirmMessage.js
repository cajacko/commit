// @flow

/**
 * Get the message to show a user to confirm the message
 *
 * @param {String} message The git message to confirm
 *
 * @return {String} The log to show
 */
const confirmMessage = message =>
  `Commit message:\n------\n${message}\n------\n\nDo you want to use this message?`;

export default confirmMessage;
