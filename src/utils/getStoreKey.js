// @flow

import { git } from '@cajacko/template';

const cache = {};

/**
 * Get the store key, returned a cached version if we have already done this
 * operation
 *
 * @return {Promise} Promise that resolves with the storeKey
 */
const getStoreKey = () => {
  const dir = process.cwd();
  const cached = cache[dir];

  if (cached) return Promise.resolve(cached);

  return git
    .getOrigin()
    .catch(() => null)
    .then((origin) => {
      if (origin) return origin;

      return git.getRootDir();
    })
    .then((storeKey) => {
      cache[dir] = storeKey;

      return storeKey;
    });
};

export default getStoreKey;
