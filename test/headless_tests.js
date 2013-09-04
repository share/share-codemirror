// Create a browser environment for CodeMirror
var jsdom = require("jsdom");
document = jsdom.jsdom('<html><body><textarea id="editor"></textarea></body></html>');
window = document.parentWindow;
navigator = {};
// Add some missing stuff in jsdom that CodeMirror wants
jsdom.dom.level3.html.HTMLElement.prototype.getBoundingClientRect = function() { 
  return {};
};

var codemirror = require('codemirror');
var share = require('share');
var shareCodeMirror = require('..');
var assert = require('assert');

function newCm(ctx) {
  var cm = window.CodeMirror.fromTextArea(document.getElementById('editor'));
  shareCodeMirror(cm, ctx);
  return cm;
}

describe('CodeMirror creation', function() {
  it('sets context text in editor', function() {
    var ctx = new Ctx('hi');
    var cm = newCm(ctx);

    assert.equal('hi', cm.getValue());
  });
});

describe('CodeMirror edits', function() {
  xit('inserts a line', function() {
    var ctx = new Ctx('hi');
    var cm = newCm(ctx);

    cm.setLine(0, 'hello');
    assert.equal('hello', cm.getValue());
  });

  it('propagates small new text from cm to share', function() {
    var ctx = new Ctx('');
    var cm = newCm(ctx);

    cm.setValue('Hello');
    assert.equal('Hello', ctx.getText());
  });

  it('propagates big new text from cm to share', function() {
    var text = "aaaa\nbbbb\ncccc\ndddd";
    var ctx = new Ctx('');
    var cm = newCm(ctx);

    cm.setValue(text);
    assert.equal(text, ctx.getText());
  });
});

describe('Stub context', function() {
  it('can insert at the beginning', function() {
    var ctx = new Ctx('abcdefg');
    ctx.insert(0, '123');
    assert.equal('123abcdefg', ctx.getText());
  });

  it('can insert in the middle', function() {
    var ctx = new Ctx('abcdefg');
    ctx.insert(2, '123');
    assert.equal('ab123cdefg', ctx.getText());
  });

  it('can insert at the end', function() {
    var ctx = new Ctx('abcdefg');
    ctx.insert(ctx.getText().length, '123');
    assert.equal('abcdefg123', ctx.getText());
  });

  it('can remove from the beginning', function() {
    var ctx = new Ctx('abcdefg');
    ctx.remove(0, 2);
    assert.equal('cdefg', ctx.getText());
  });

  it('can remove from the middle', function() {
    var ctx = new Ctx('abcdefg');
    ctx.remove(2, 3);
    assert.equal('abfg', ctx.getText());
  });

  it('can remove from the end', function() {
    var ctx = new Ctx('abcdefg');
    ctx.remove(5, 2);
    assert.equal('abcde', ctx.getText());
  });
})

function Ctx(text) {
  this.provides = { text: true };

  this.getText = function() { return text; };

  this.insert = function(startPos, newText) {
    var before = text.substring(0, startPos);
    var after = text.substring(startPos);
    text = before + newText + after;
  };

  this.remove = function(startPos, length) {
    var before = text.substring(0, startPos);
    var after = text.substring(startPos+length);
    text = before + after;
  };
}
