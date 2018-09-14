#! /usr/bin/env node

// @flow

import editor from 'tiny-cli-editor';

console.log('Commityy');

editor('Hello this is dog.')
  .on('data', (text) => {
    console.log('data', text);
  })
  .on('abort', (text) => {
    console.log('abort', text);

    setTimeout(() => {
      console.log('yay');
    }, 3000);
  })
  .on('submit', (text) => {
    console.log('submit', text);
  });
/*
# If applied, this commit will... (limit)

# Why is this change needed?
Prior to this change, ...

# How does it address the issue?
This change...

References
- Jira: #GEN-254 - https://www....
- Key: Value


Title
Why
How
Refs

Originally commited on - Branch
*/
