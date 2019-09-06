const { join } = require('path');
const { writeJson, ensureFile } = require('fs-extra');

const adapterPath = join(
  __dirname,
  'node_modules/@cajacko/cz-conventional-changelog'
);

const json = {
  path: adapterPath
};

const homeDir = process.env.HOME || process.env.USERPROFILE;

const configPath = join(homeDir, '.czrc');

ensureFile(configPath).then(() => writeJson(configPath, json, { spaces: 2 }));
