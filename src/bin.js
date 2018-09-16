#! /usr/bin/env node

// @flow

import inquirer from 'inquirer';
import { git } from '@cajacko/template';
import MaxLengthInputPrompt from 'inquirer-maxlength-input-prompt';
import AutoComplete from 'inquirer-autocomplete-prompt';
import getMessage from './message/getMessage';

inquirer.registerPrompt('maxlength-input', MaxLengthInputPrompt);
inquirer.registerPrompt('autocomplete', AutoComplete);

// TODO: If commit failed, store message and ask if want to use it
// TODO: getMessage
// TODO: saveResponses for getMessage, when done
// TODO: ask for message and then commit with the message

getMessage().then(message => git.commit(process.cwd(), message, false));
