// @flow

/**
 * Combine all the different message parts to form the entire message
 *
 * @param {String} title The message title
 * @param {String} [emoji] The emoji to use
 * @param {String} [body] The body for the message
 * @param {Array} refs Array of refs specified by key/value
 *
 * @return {String} The combined git message
 */
const buildMessage = (title, emoji, body, refs) => {
  let gitMessage = title;

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

  return gitMessage;
};

export default buildMessage;
