#! /usr/bin/env node

// @flow

import commit from './commit';
import validateCommit from './validateCommit';
import ensureSetup from './ensureSetup';

if (process.argv.includes('--validate-commit')) {
  validateCommit().catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  });
} else if (process.argv.includes('--config')) {
  ensureSetup(true);
} else {
  commit();
}
