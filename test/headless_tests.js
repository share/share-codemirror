// Create a browser environment for CodeMirror
var jsdom = require("jsdom");
document = jsdom.jsdom('<html><body><textarea id="editor"></textarea></body></html>');
window = document.parentWindow;
navigator = {};
// Add some missing stuff in jsdom that CodeMirror wants
jsdom.dom.level3.html.HTMLElement.prototype.createTextRange = function () {
  return {
    moveToElementText: function () {
    },
    collapse: function () {
    },
    moveEnd: function () {
    },
    moveStart: function () {
    },
    getBoundingClientRect: function () {
      return {};
    }
  };
};

var CodeMirror = require('codemirror');
var share = require('share');
var shareCodeMirror = require('..');
var assert = require('assert');

function newCm(ctx) {
  var cm = CodeMirror.fromTextArea(document.getElementById('editor'));
  shareCodeMirror(cm, ctx);
  return cm;
}

describe('CodeMirror creation', function () {
  it('sets context text in editor', function () {
    var ctx = new Ctx('hi');
    var cm = newCm(ctx);

    assert.equal('hi', cm.getValue());
  });
});

describe('CodeMirror edits', function () {
  it('adds text', function () {
    var ctx = new Ctx('');
    var cm = newCm(ctx);

    var text = "aaaa\nbbbb\ncccc\ndddd";
    cm.setValue(text);
    assert.equal(text, ctx.get());
  });

  it('adds empty text', function () {
    var ctx = new Ctx('');
    var cm = newCm(ctx);

    cm.setValue('');
    assert.equal('', ctx.get() || '');

    cm.setValue('a');
    assert.equal('a', ctx.get() || '');
  });

  it('replaces a couple of lines', function () {
    var ctx = new Ctx('three\nblind\nmice\nsee\nhow\nthey\nrun\n');
    var cm = newCm(ctx);

    cm.replaceRange('evil\nrats\n', {line: 1, ch: 0}, {line: 3, ch: 0});
    assert.equal('three\nevil\nrats\nsee\nhow\nthey\nrun\n', ctx.get());
  });
});

describe('ShareJS changes', function () {
  it('adds text', function () {
    var ctx = new Ctx('', true);
    var cm = newCm(ctx);

    var text = "aaaa\nbbbb\ncccc\ndddd";
    ctx.insert(0, text);
    assert.equal(text, cm.getValue());
  });

  it('can edit a doc that has been empty', function () {
    var ctx = new Ctx('', true);
    var cm = newCm(ctx);

    ctx.insert(0, '');
    assert.equal('', cm.getValue());

    ctx.insert(0, 'a');
    assert.equal('a', cm.getValue());
  });

  it('replaces a line', function () {
    var ctx = new Ctx('hi', true);
    var cm = newCm(ctx);

    ctx.remove(0, 2);
    ctx.insert(0, 'hello');
    assert.equal('hello', cm.getValue());
  });

  it('replaces a couple of lines', function () {
    var ctx = new Ctx('three\nblind\nmice\nsee\nhow\nthey\nrun\n', true);
    var cm = newCm(ctx);

    ctx.remove(6, 11);
    ctx.insert(6, 'evil\nrats\n');
    assert.equal('three\nevil\nrats\nsee\nhow\nthey\nrun\n', cm.getValue());
  });
});

describe('Stub context', function () {
  it('can insert at the beginning', function () {
    var ctx = new Ctx('abcdefg');
    ctx.insert(0, '123');
    assert.equal('123abcdefg', ctx.get());
  });

  it('can insert in the middle', function () {
    var ctx = new Ctx('abcdefg');
    ctx.insert(2, '123');
    assert.equal('ab123cdefg', ctx.get());
  });

  it('can insert at the end', function () {
    var ctx = new Ctx('abcdefg');
    ctx.insert(ctx.get().length, '123');
    assert.equal('abcdefg123', ctx.get());
  });

  it('can remove from the beginning', function () {
    var ctx = new Ctx('abcdefg');
    ctx.remove(0, 2);
    assert.equal('cdefg', ctx.get());
  });

  it('can remove from the middle', function () {
    var ctx = new Ctx('abcdefg');
    ctx.remove(2, 3);
    assert.equal('abfg', ctx.get());
  });

  it('can remove from the end', function () {
    var ctx = new Ctx('abcdefg');
    ctx.remove(5, 2);
    assert.equal('abcde', ctx.get());
  });
})

function Ctx(text, fireEvents) {
  this.provides = { text: true };

  this.get = function () {
    // Replicate a sharejs bug where empty docs return undefined.
    return text == '' ? undefined : text;
  };

  this.insert = function (startPos, newText) {
    var before = text.substring(0, startPos);
    var after = text.substring(startPos);
    text = before + newText + after;
    fireEvents && this.onInsert && this.onInsert(startPos, newText);
  };

  this.remove = function (startPos, length) {
    var before = text.substring(0, startPos);
    var after = text.substring(startPos + length);
    text = before + after;
    fireEvents && this.onRemove && this.onRemove(startPos, length);
  };
}
