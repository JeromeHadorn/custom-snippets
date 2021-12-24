"use babel";

// Will fetch config from atom-config.json
var API_URL = atom.config.get("snippet_file_url");
var Secondary_API_URL = atom.config.get("secondary_snippet_file_url");

import { CompositeDisposable } from "atom";

class AdvancedProvider {
  subscriptions: CompositeDisposable;

  constructor() {
    this.selector = ".text.xml, .text.html.basic, .json";
    this.disableForSelector = "";
    this.suggestionPriority = 4;

    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(
      atom.config.observe("snippet_file_url", (newValue) => {
        API_URL = newValue;
      })
    );
    this.subscriptions.add(
      atom.config.observe("secondary_snippet_file_url", (newValue) => {
        VNext_API_URL = newValue;
      })
    );
  }

  getSuggestions(options) {
    const { editor, bufferPosition } = options;
    let prefix = this.getPrefix(editor, bufferPosition);
    if (prefix.startsWith("@")) {
      return this.findMatchingSuggestions(prefix);
    } else if (prefix.startsWith("£")) {
      return this.findMatchingSuggestionsSecondary(prefix);
    }
  }

  getPrefix(editor, bufferPosition) {
    let line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
    let match = line.match(/\S+$/);
    return match ? match[0] : "";
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

  findMatchingSuggestionsSecondary(prefix) {
    return new Promise((resolve) => {
      fetch(Secondary_API_URL)
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
    var uuidReplacedText = suggestion.snippet;
    const uuidv1 = require("uuid/v1");
    var uuidFilledString = uuidReplacedText.replace("*UUID*", uuidv1());

    return {
      displayText: suggestion.displayText,
      snippet: uuidFilledString,
      description: suggestion.description,
      replacementPrefix: replacementPrefix,
      iconHTML: '<i class="icon-comment"></i>',
      type: "snippet",
      rightLabelHTML: '<span class="aab-right-label">Snippet</span>',
    };
  }

  onDidInsertSuggestion(options) {
    atom.notifications.addSuccess(
      options.suggestion.displayText + " was inserted."
    );
  }
}

export default new AdvancedProvider();
