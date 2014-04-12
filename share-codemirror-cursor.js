(function () {
  'use strict';

  function shareCodeMirrorCursor(cm, ctx) {
    cm.on('cursorActivity', function (editor) {
      if (ctx.suppress) return;

      var start = editor.indexFromPos(editor.getCursor('start'));
      var end = editor.indexFromPos(editor.getCursor('end'));
      ctx.setSelection([ start, end]);
    });

    var cursorsBySessionId = {};
    var markersBySessionId = {};

    ctx.onPresence = function () {
      var presence = ctx.getPresence();
      var sessionIds = Object.keys(presence);
      makeUserStyles(presence);
      sessionIds.forEach(function (sessionId) {
        var session = presence[sessionId];
        displayCursor(sessionId, session);
      });
      var cursorIds = Object.keys(cursorsBySessionId);
      cursorIds.forEach(function (cid) {
        if (sessionIds.indexOf(cid) < 0) {
          cursorsBySessionId[cid].parentElement.removeChild(cursorsBySessionId[cid]);
          markersBySessionId[cid].clear();
          delete cursorsBySessionId[cid];
          delete markersBySessionId[cid];
        }
      })
    };

    function makeUserStyles(sessions) {
      var ids = Object.keys(sessions);
      var headStyle = document.getElementById("user-styles");
      if (!headStyle) {
        var head = document.getElementsByTagName("head")[0];
        headStyle = document.createElement("style");
        headStyle.setAttribute("id", "user-styles");
        head.appendChild(headStyle);
      }
      var style = "";
      for (var i = 0; i < ids.length; i++) {
        style += ".user-" + ids[i] + " { background: " + (sessions[ids[i]].color || "yellow") + "; }";
      }
      headStyle.innerHTML = style;
    }

    function displayCursor(sessionId, session) {
      // we make a cursor widget to display where the other user's cursor is
      var selection = session._selection;
      if (!selection) return;
      if (typeof selection == "number") selection = [selection, selection];
      var from = cm.posFromIndex(selection[0]);
      var to = cm.posFromIndex(selection[1]);

      // we mark up the range of text the other user has highlighted
      var marker = markersBySessionId[sessionId];
      if (marker) {
        marker.clear();
      }
      markersBySessionId[sessionId] = markCursor(cm, sessionId, to, from);

      var cursor = cursorsBySessionId[sessionId];
      if (cursor === undefined) {
        cursor = createCursorWidget(cm, sessionId, session);
        cursorsBySessionId[sessionId] = cursor;
      } else {
        updateCursor(cursor, sessionId, session);
      }
      cm.addWidget(to, cursor);
    }

    function markCursor(cm, sessionId, to, from) {
      return cm.markText(from, to, { className: "user-" + sessionId });
    }
  }

  function createCursorWidget(cm, sessionId, session) {
    var square = document.createElement('div');
    //square.style.width = 3 + 'px';
    //square.style.height = 3 + 'px';
    square.style.top = '-' + (2.1 * cm.defaultTextHeight()) + 'px';
    square.style.position = 'relative';
    square.style.background = session.color || "black";
    square.classList.add("user-name");
    square.innerHTML = session.name || sessionId;

    var line = document.createElement('div');
    line.style.width = 1 + 'px';
    line.style.height = 0.8 * cm.defaultTextHeight() + 'px';
    line.style.top = '-' + cm.defaultTextHeight() + 'px';
    line.style.position = 'relative';
    line.style.background = session.color || "black";
    line.classList.add("line");

    var cursor = document.createElement('div');
    cursor.style.position = 'absolute';
    cursor.appendChild(line);
    cursor.appendChild(square);
    return cursor;
  }

  function updateCursor(cursor, sessionId, session) {
    var square = cursor.querySelector(".user-name");
    square.style.background = session.color || "black";
    square.innerHTML = session.name || sessionId;
    var line = cursor.querySelector(".line");
    line.style.background = session.color || "black";
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
      window.sharejs.Doc.prototype.attachCodeMirrorCursor = function (cm, ctx) {
        if (!ctx) ctx = this.createContext();
        shareCodeMirrorCursor(cm, ctx);
      };
    }
  }

})();
