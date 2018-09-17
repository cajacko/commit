// @flow

import { git } from '@cajacko/template';
import { get } from './store';

/**
 *
 */
const getDetails = () =>
  git.getRootDir(process.cwd()).then(rootDir =>
    Promise.all([git.getOrigin().catch(() => null)]).then(([origin]) =>
      get([origin || rootDir]).then(settings => ({
        storeKey: origin || rootDir,
        rootDir,
        branch: 'feature/GEN-264-somethind-and-another',
        origin,
        prevBranchResponses: {
          choices: ['bug', 'feat', 'feat'],
          scope: ['withHOC', null, 'NewsCards'],
          relatedTo: ['#456 #567'],
        },
        lastUsedCustomReferenceKeys: ['Custom'],
        lastUsedTags: ['#123', '#234', '#345'],
        ...(settings || {}),
      }))));

export default getDetails;
