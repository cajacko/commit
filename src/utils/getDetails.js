// @flow

import { git } from '@cajacko/template';
import lodashGet from 'lodash/get';
import { get } from './store';

/**
 * Get any config details from previous responses related to this repo and
 * branch, also gets some of the git info and passes it on
 *
 * @return {Object} The config about this repo and previous responses
 */
const getDetails = () =>
  git.getRootDir(process.cwd()).then(rootDir =>
    Promise.all([
      git.getOrigin().catch(() => null),
      git.getCurrentBranch(),
    ]).then(([origin, branch]) => {
      const storeKey = origin || rootDir;

      return get().then((storeSettings) => {
        const settings = storeSettings || {};

        return {
          storeKey,
          rootDir,
          branch,
          origin,
          prevBranchResponses: lodashGet(
            settings,
            [storeKey, 'branches', branch],
            {}
          ),
          lastUsedCustomReferenceKeys:
            lodashGet(settings, [storeKey, 'lastUsedCustomReferenceKeys']) ||
            [],
          lastUsedTags: lodashGet(settings, [storeKey, 'lastUsedTags']) || [],
        };
      });
    }));

export default getDetails;
