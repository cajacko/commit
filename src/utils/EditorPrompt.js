// @flow

const EditorPrompt = require('inquirer/lib/prompts/editor');
const chalk = require('chalk');

class AutoEditor extends EditorPrompt {
  render(error) {
    var bottomContent = '';
    var message = this.getQuestion();

    if (this.status === 'answered') {
      message += chalk.dim('Received');
    } else {
      this.startExternalEditor();
    }

    if (error) {
      bottomContent = chalk.red('>> ') + error;
    }

    this.screen.render(message, bottomContent);
  }
}

module.exports = AutoEditor;
