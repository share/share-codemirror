(function () {
  'use strict';

  /**
   * @param cm - CodeMirror instance
   * @param ctx - Share context
   */
  function shareCodeMirror(cm, ctx) {
    if (!ctx.provides.text) throw new Error('Cannot attach to non-text document');

    var suppress = false;
    var text = ctx.get() || ''; // Due to a bug in share - get() returns undefined for empty docs.
    cm.setValue(text);
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

    function indexFromPos(pos) {
      var doc = ctx.get() || '';
      doc = doc.split('\n');
      var last = doc.length - 1;
      if (pos.line > last) pos = {line:last, ch:doc[last].length};

      var index = pos.ch;
      if (pos.line < 0 || pos.ch < 0) return 0;

      var i = 0;
      while (i < pos.line) {
        index += doc[i].length + 1; 
        i++;
      }

      return index;
    }
    // Convert a CodeMirror change into an op understood by share.js
    function applyToShareJS(cm, change) {
      // CodeMirror changes give a text replacement.
     
     var startPos = indexFromPos(change.from);

      if (change.to.line == change.from.line && change.to.ch == change.from.ch) {
        // nothing was removed.
      } else {
        // delete.removed contains an array of removed lines as strings, so this adds
        // all the lengths. Later change.removed.length - 1 is added for the \n-chars
        // (-1 because the linebreak on the last line won't get deleted)
        var delLen = 0;
        for (var rm = 0; rm < change.removed.length; rm++) {
          delLen += change.removed[rm].length;
        }
        delLen += change.removed.length - 1;
        ctx.remove(startPos, delLen);
      }
      if (change.text) {
        ctx.insert(startPos, change.text.join('\n'));
      }
      if (change.next) {
        applyToShareJS(cm, change.next);
      }
    }

    function check() {
      setTimeout(function () {
        var cmText = cm.getValue();
        var otText = ctx.get() || '';

        if (cmText != otText) {
          console.error("Text does not match!");
          console.error("cm: " + cmText);
          console.error("ot: " + otText);
          // Replace the editor text with the ctx snapshot.
          suppress = true;
          cm.setValue(ctx.get() || '');
          suppress = false;
        }
      }, 0);
    }

    return ctx;
  }

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    // Node.js
    module.exports = shareCodeMirror;
    module.exports.scriptsDir = __dirname;
  } else {
    if (typeof define === 'function' && define.amd) {
      // AMD
      define([], function () {
        return shareCodeMirror;
      });
    } else {
      // Browser, no AMD
      window.sharejs.Doc.prototype.attachCodeMirror = function (cm, ctx) {
        if (!ctx) ctx = this.createContext();
        shareCodeMirror(cm, ctx);
      };
    }
  }
})();
