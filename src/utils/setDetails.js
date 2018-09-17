// @flow

import uniq from 'lodash/uniq';
import { set, get } from './store';

/**
 *
 * @param {*} location
 * @param {*} newArr
 * @param {*} limit
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
 *
 * @param {*} param0
 */
const setDetails = ({
  storeKey,
  branch,
  newTags,
  referenceKeys,
  scope,
  relatedTo,
}) =>
  addToArr([storeKey, 'lastUsedTags'], newTags)
    .then(() =>
      addToArr([storeKey, 'lastUsedCustomReferenceKeys'], referenceKeys))
    .then(() => scope && addToArr([storeKey, 'branches', branch, 'scope'], [scope]))
    .then(() =>
      addToArr([storeKey, 'branches', branch, 'relatedTo'], relatedTo));

export default setDetails;
