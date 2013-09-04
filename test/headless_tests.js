// Create a browser environment for CodeMirror
var jsdom = require("jsdom");
document = jsdom.jsdom('<html><body><textarea id="editor"></textarea></body></html>');
window = document.parentWindow;
navigator = {};
// Add some missing stuff in jsdom that CodeMirror wants
jsdom.dom.level3.html.HTMLElement.prototype.getBoundingClientRect = function(){ 
  return {
	  bottom: 100,
	  height: 100,
	  left:   100,
	  right:  100,
	  top:    100,
	  width:  100
  };
};

var codemirror = require('codemirror');
var share = require('share');
var shareCodeMirror = require('..');
var assert = require('assert');

describe('shareCodeMirror', function() {
  it('removes text in context when delete occurs in CodeMirror', function(cb) {
    var ctx = {
      provides: {
        text: true
      },
      getText: function() { return 'a\nb\nc\n'; },
      remove: function(startPos, delLen) {
        console.log('remove', startPos, delLen);
      }
    };
    var cm = window.CodeMirror.fromTextArea(document.getElementById('editor'));
    shareCodeMirror(cm, ctx);

    var from = cm.posFromIndex(2);
    var to = cm.posFromIndex(2 + 2);
    cm.replaceRange('', from, to);

  });
});
