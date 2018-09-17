// @flow

import { git } from '@cajacko/template';
import lodashGet from 'lodash/get';
import { get } from './store';

/**
 *
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
          // prevBranchResponses: {
          //   scope: ['withHOC', null, 'NewsCards'],
          //   relatedTo: ['#456 #567'],
          // },
          prevBranchResponses: lodashGet(
            settings,
            [storeKey, 'branches', branch],
            {}
          ),
          // lastUsedCustomReferenceKeys: ['Custom'],
          lastUsedCustomReferenceKeys:
            lodashGet(settings, [storeKey, 'lastUsedCustomReferenceKeys']) ||
            [],
          // lastUsedTags: ['#123', '#234', '#345'],
          lastUsedTags: lodashGet(settings, [storeKey, 'lastUsedTags']) || [],
        };
      });
    }));

export default getDetails;
