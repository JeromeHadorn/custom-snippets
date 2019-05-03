'use babel';

var API_URL = atom.config.get('snippet_file_url');

import {
  CompositeDisposable
} from 'atom'


class AdvancedProvider {

  subscriptions: CompositeDisposable

  constructor() {
    this.selector = '.text.xml, .text.html.basic';
    this.disableForSelector = '';
    this.suggestionPriority = 4;

    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(
      atom.config.observe('snippet_file_url', newValue => {
        API_URL = newValue
      }),
    )
  }

  getSuggestions(options) {
    const {
      editor,
      bufferPosition
    } = options;
    let prefix = this.getPrefix(editor, bufferPosition);
    if (prefix.startsWith('@')) {
      return this.findMatchingSuggestions(prefix);
    }
  }

  getPrefix(editor, bufferPosition) {
    let line = editor.getTextInRange([
      [bufferPosition.row, 0], bufferPosition
    ]);
    let match = line.match(/\S+$/);
    return match ? match[0] : '';
  }

  findMatchingSuggestions(prefix) {
    return new Promise((resolve) => {
      fetch(API_URL)
        .then((response) => {
          return response.json();
        })
        .then((json) => {
          let matchingSuggestions = json.filter((suggestion) => {
            return suggestion.displayText.startsWith(prefix);
          });
          let inflateSuggestion = this.inflateSuggestion.bind(this, prefix);
          let inflatedSuggestions = matchingSuggestions.map(inflateSuggestion);
          resolve(inflatedSuggestions);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }

  inflateSuggestion(replacementPrefix, suggestion) {
    return {
      displayText: suggestion.displayText,
      snippet: suggestion.snippet,
      description: suggestion.description,
      replacementPrefix: replacementPrefix,
      iconHTML: '<i class="icon-comment"></i>',
      type: 'snippet',
      rightLabelHTML: '<span class="aab-right-label">Snippet</span>'
    };
  }

  onDidInsertSuggestion(options) {
    atom.notifications.addSuccess(options.suggestion.displayText + ' was inserted.');
  }
}

export default new AdvancedProvider();
