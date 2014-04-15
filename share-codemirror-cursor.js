(function () {
  'use strict';

  function shareCodeMirrorCursor(cm, ctx) {
    cm.on('cursorActivity', function (editor) {
      if (ctx.suppress) return;

      var start = editor.indexFromPos(editor.getCursor('start'));
      var end = editor.indexFromPos(editor.getCursor('end'));
      ctx.setSelection([start, end]);
    });

    var cursorsBySessionId = {};

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
          cursorsBySessionId[cid].remove();
          delete cursorsBySessionId[cid];
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

      var cursor = cursorsBySessionId[sessionId];
      if (cursor === undefined) {
        cursor = new Cursor(cm, sessionId);
        cursorsBySessionId[sessionId] = cursor;
      }
      cursor.update(session, from, to);
    }

    function Cursor(cm, sessionId) {
      var caret = document.createElement('pre');

      caret.style.borderLeftWidth = '2px';
      caret.style.borderLeftStyle = 'solid';
      caret.style.height = cm.defaultTextHeight() + 'px';
      caret.style.marginTop = '-' + cm.defaultTextHeight() + 'px';
      caret.innerHTML = '&nbsp;';

      var owner = document.createElement('div');
      owner.style.height = cm.defaultTextHeight() + 'px';
      owner.style.marginTop = '-' + (2 * cm.defaultTextHeight()) + 'px';

      var widget = document.createElement('div');
      widget.style.position = 'absolute';
      widget.style.zIndex = 1000;
      widget.appendChild(caret);
      widget.appendChild(owner);

      var marker;

      this.update = function (session, from, to) {
        var defaultColor = '#dddddd';

        caret.style.borderLeftColor = session.color || defaultColor;
        owner.style.background = session.color || defaultColor;
        owner.innerHTML = session.name || sessionId;

        // We mark up the range of text the other user has highlighted
        if (marker) {
          marker.clear();
        }
        marker = cm.markText(from, to, { className: "user-" + sessionId });

        cm.addWidget(to, widget);
      };

      this.remove = function () {
        widget.parentElement.removeChild(widget);
        if (marker) {
          marker.clear();
        }
      }
    }
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
