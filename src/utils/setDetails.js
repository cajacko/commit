// @flow

import uniq from 'lodash/uniq';
import * as defaults from '../config/gitDefaults';
import { set, get } from './store';

/**
 * Add items to an array in the store, with an optional max amount of items
 *
 * @param {Array} location The location in the object to get
 * @param {Array} newArr The new array to concat
 * @param {Number} [limit] The max amount of items to have in the array
 *
 * @return {Promise} Promise that resolves when the new array has been set
 */
const addToArr = (location, newArr, limit = 20) =>
  (!newArr.length
    ? Promise.resolve()
    : get(location).then((arr) => {
      const finalArr = arr || [];
      const combinedArr = finalArr.concat(newArr);
      const uniqCombinedArr = uniq(combinedArr.reverse()).reverse();
      const slicedCombinedArr = uniqCombinedArr.slice(-limit);

      return set(location, slicedCombinedArr);
    }));

/**
 * Set the new responses to the store so we can have better suggestions next
 * time
 *
 * @param {Object} responses The responses to set
 *
 * @return {Promise} Promise that resovles when the responses have been set
 */
const setDetails = ({
  newTags, scope, relatedTo, referenceKeys, ...opts
}) => {
  // Using a default here for global suggestions
  const storeKey = opts.storeKey || defaults.storeKey;
  const branch = opts.branch || defaults.branch;

  return addToArr([storeKey, 'lastUsedTags'], newTags)
    .then(() =>
      addToArr([storeKey, 'lastUsedCustomReferenceKeys'], referenceKeys))
    .then(() => scope && addToArr([storeKey, 'branches', branch, 'scope'], [scope]))
    .then(() =>
      addToArr([storeKey, 'branches', branch, 'relatedTo'], relatedTo));
};

export default setDetails;
