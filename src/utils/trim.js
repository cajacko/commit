// @flow

/**
 * Remove whitespace from text if the text exists
 *
 * @param {String} text The text to trim
 *
 * @return {String} The trimmed text
 */
const trim = (text) => {
  if (text) return text.trim();

  return text;
};

export default trim;
