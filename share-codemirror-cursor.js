(function () {
  'use strict';

  function shareCodeMirrorCursor(cm, ctx, options) {
    options = options || {};
    options.selectionColor = options.selectionColor || 'yellow';
    options.color = options.color || '#dddddd';
    options.textColor = options.textColor || 'black';
    options.inactiveTimeout = options.inactiveTimeout || 5000;

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
        var session = sessions[ids[i]];
        var selectionColor = session.selectionColor || session.color || options.selectionColor;
        style += ".user-" + ids[i] + " { background: " + selectionColor + "; }";
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
      var ownerFactor = 0.8; // Relative size of owner font
      owner.style.height = cm.defaultTextHeight() * ownerFactor + 'px';
      owner.style['font-size'] = cm.defaultTextHeight() * ownerFactor + 'px';
      owner.style.marginTop = '-' + ((1 + ownerFactor) * cm.defaultTextHeight()) + 'px';

      owner.style['user-select'] = 'none';

      var widget = document.createElement('div');
      widget.style.position = 'absolute';
      widget.style.zIndex = 1000;
      widget.appendChild(caret);
      widget.appendChild(owner);

      var lastSession;
      var marker;
      var inactiveTimer;

      function isSessionEqual(s1, s2) {
        if(s1 === undefined && s2 === undefined) return true;
        if(s1 === undefined && s2) return false;
        if(s2 === undefined && s1) return false;
        var result =
          s1._selection[0] === s2._selection[0] &&
          s1._selection[1] === s2._selection[1] &&
          s1.name === s2.name &&
          s1.color === s2.color &&
          s1.selectionColor === s2.selectionColor &&
          s1.textColor === s2.textColor;
        return result;
      }

      this.update = function (session, from, to) {
        if(isSessionEqual(session, lastSession)) {
          return;
        }
        lastSession = session;

        caret.style.borderLeftColor = session.color || options.color;
        owner.style.background = session.color || options.color;
        owner.style.color = session.textColor || options.textColor;
        owner.innerHTML = session.name || sessionId;

        // We mark up the range of text the other user has highlighted
        if (marker) {
          marker.clear();
        }
        marker = cm.markText(from, to, { className: "user-" + sessionId });

        cm.addWidget(to, widget);

        if(inactiveTimer) {
          clearTimeout(inactiveTimer);
        }
        owner.style.display = 'block';
        var inactiveTimeout = session.inactiveTimeout || options.inactiveTimeout;
console.log(inactiveTimeout);
        inactiveTimer = setTimeout(function() {
          owner.style.display = 'none';
        }, inactiveTimeout);
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
      window.sharejs.Doc.prototype.attachCodeMirrorCursor = function (cm, ctx, options) {
        if (!ctx) ctx = this.createContext();
        shareCodeMirrorCursor(cm, ctx, options);
      };
    }
  }

})();
