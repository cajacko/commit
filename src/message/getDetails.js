// @flow

const getDetails = () =>
  Promise.resolve({
    branch: 'feature/GEN-264-somethind-and-another',
    origin: 'https://github.com.git',
    prevBranchResponses: {
      choices: ['bug', 'feat', 'feat'],
      scope: ['withHOC', null, 'NewsCards'],
      relatedTo: ['#456 #567'],
    },
    lastUsedCustomReferenceKeys: ['Custom'],
    lastUsedTags: ['#123', '#234', '#345'],
  });

export default getDetails;
