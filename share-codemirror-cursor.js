(function () {
  'use strict';

  function shareCodeMirrorCursor(cm, ds) {
    cm.on('cursorActivity', function (doc) {
      var startCur = doc.getCursor('start');
      //var endCur = doc.getCursor('end');

      var from = startCur;
      var to = {line: startCur.line, ch: startCur.ch + 1};

      if (ds) {
        ds.send({_type: 'cursor', from: from, to: to});
      }
    });

    var cursorsByConnectionId = {};
    var connectionId;

    ds.on_connectionId = function (msg) {
      connectionId = msg.connectionId;
    };

    ds.on_cursor = function (msg) {
      if(msg.connectionId == connectionId) return;
      var cursor = cursorsByConnectionId[connectionId];
      if(cursor === undefined) {
        cursor = createCursorWidget(cm);
        cursorsByConnectionId[connectionId] = cursor;
      }
      cm.addWidget(msg.from, cursor);
    };
  }

  function createCursorWidget(cm) {
    var square = document.createElement('div');
    square.style.width = cm.defaultCharWidth() + 'px';
    square.style.height = cm.defaultTextHeight() + 'px';
    square.style.top = '-' + cm.defaultTextHeight() + 'px';
    square.style.position = 'relative';
    square.style.background = '#FF00FF';
    var cursor = document.createElement('div');
    cursor.appendChild(square);
    return cursor;
  }

  // Exporting
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    // Node.js
    module.exports = shareCodeMirrorCursor;
    module.exports.scriptsDir = __dirname;
  } else {
    if (typeof define === 'function' && define.amd) {
      // AMD
      define([], function () {
        return shareCodeMirrorCursor;
      });
    } else {
      // Browser, no AMD
      window.shareCodeMirrorCursor = shareCodeMirrorCursor;
    }
  }

})();
