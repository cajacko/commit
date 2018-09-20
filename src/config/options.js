// @flow

// Line lengths taken from https://chris.beams.io/posts/git-commit/
export const MAX_TITLE_LENGTH = 50;
export const MAX_BODY_LINE_LENGTH = 72;
export const EMOJI_LENGTH_ALLOWANCE = 2;

let descriptionDefault = `
Prior to this change,
# ^ Why is this change needed?

This change
# ^ How does it address the issue?

# Don't save changes to prevent this file getting adding
`;

let descriptionGuidLine = '# MAX LINE LENGTH ';

for (let i = descriptionGuidLine.length; i < MAX_BODY_LINE_LENGTH; i += 1) {
  descriptionGuidLine = `${descriptionGuidLine}-`;
}

descriptionGuidLine = `${descriptionGuidLine}|`;

descriptionDefault = `${descriptionDefault}${descriptionGuidLine}`.trim();

export const DESCRIPTION_DEFAULT = descriptionDefault;
