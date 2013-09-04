(function () {
  'use strict';

  function shareCodeMirror(cm, ctx) {
    if (!ctx.provides.text) throw new Error('Cannot attach to non-text document');

    var suppress = false;
    cm.setValue(ctx.getText());
    check();

    // *** remote -> local changes

    ctx.onInsert = function (pos, text) {
      suppress = true;
      cm.replaceRange(text, cm.posFromIndex(pos));
      suppress = false;
      check();
    };

    ctx.onRemove = function (pos, length) {
      suppress = true;
      var from = cm.posFromIndex(pos);
      var to = cm.posFromIndex(pos + length);
      cm.replaceRange('', from, to);
      suppress = false;
      check();
    };

    // *** local -> remote changes

    cm.on('change', function (cm, change) {
      if (suppress) return;
      applyToShareJS(cm, change);
      check();
    });

    // Convert a CodeMirror delta into an op understood by share.js
    function applyToShareJS(cm, delta) {
      // CodeMirror deltas give a text replacement.
      // I tuned this operation a little bit, for speed.
      var startPos = 0;  // Get character position from # of chars in each line.
      var i = 0;         // i goes through all lines.

      while (i < delta.from.line) {
        startPos += cm.lineInfo(i).text.length + 1;   // Add 1 for '\n'
        i++;
      }

      startPos += delta.from.ch;

      if (delta.to.line == delta.from.line && delta.to.ch == delta.from.ch) {
        // Then nothing was removed.
        ctx.insert(startPos, delta.text.join('\n'));
      } else {
        // delete.removed contains an array of removed lines as strings, so this adds
        // all the lengths. Later delta.removed.length - 1 is added for the \n-chars
        // (-1 because the linebreak on the last line won't get deleted)
        var delLen = 0;
        for (var rm in delta.removed) {
          delLen += rm.length;
        }
        delLen += delta.removed.length - 1;

        ctx.remove(startPos, delLen);
        if (delta.text) {
          ctx.insert(startPos, delta.text.join('\n'));
        }
      }
      if (delta.next) {
        applyToShareJS(cm, delta.next);
      }
    }

    function check() {
      setTimeout(function () {
        var cmText = cm.getValue();
        var otText = ctx.getText();

        if (cmText != otText) {
          console.error("Text does not match!");
          console.error("cm: " + cmText);
          console.error("ot: " + otText);
          // Replace the editor text with the ctx snapshot.
          cm.setValue(ctx.getText());
        }
      }, 0);
    }

    return ctx;
  }

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = shareCodeMirror;
  } else {
    if (typeof define === 'function' && define.amd) {
      define([], function () {
        return shareCodeMirror;
      });
    } else {
      // TODO: stick it on window.sharejs or window.CodeMirror - or both? Or none?
      window.shareCodeMirror = shareCodeMirror;
    }
  }
})();
