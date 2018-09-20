// @flow

import setDetails from '../utils/setDetails';

/**
 * Figure out what data to persist and then set it to the store
 *
 * @param {String} storeKey The store key to set to
 * @param {String} branch The current branch name
 * @param {Object} responses The prompt responses
 *
 * @return {Promise} Promise that resolves when the responses have been set
 */
const persistResponses = (storeKey, branch, { refs, scope }) => {
  const newTags = [];
  const relatedTo = [];
  const referenceKeys = [];

  if (refs.length) {
    refs.forEach(({ key, value }) => {
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

  return setDetails({
    storeKey,
    branch,
    newTags,
    referenceKeys,
    scope,
    relatedTo,
  });
};

export default persistResponses;
