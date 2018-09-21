#! /usr/bin/env node

// @flow

import commit from './commit';
import validateCommit from './validateCommit';

if (process.argv.includes('--validate-commit')) {
  validateCommit();
} else {
  commit();
}
