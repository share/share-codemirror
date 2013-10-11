(function () {
  'use strict';

  /**
   * A DispatchSocket is a drop-in replacement for a BCSocket or WebSocket with some additional capabilities.
   *
   * Incoming messages can be dispatched to custom event handlers by assigning `on_xxx` event handlers.
   * This causes incoming messages with a `_type: 'xxx'` attribute to be routed to that handler instead of
   * the default `onmessage` handler.
   *
   * This makes it possible to use a single connection as a transport for different kinds of messages.
   * For example, ShareJS messages will be routed as usual, but messages with a `_type` attribute will
   * be routed to other event handlers so that it doesn't interfere.
   *
   * In order for this to work for outgoing messages, a similar dispatch mechanism will have to be implemented
   * on the server.
   *
   * @param {WebSocket} ws - a WebSocket or BCSocket object.
   * @constructor
   */
  function DispatchSocket(ws) {
    var self = this;

    ws.onopen = function () {
      self.onopen && self.onopen();
    };

    ws.onmessage = function (msg) {
      var data = msg.data ? msg.data : msg;
      if (data._type) {
        var handlerName = 'on_' + data._type;
        var handler = self[handlerName];
        if (typeof handler === 'function') {
          handler.call(self, msg);
        } else {
          // Deliver in the usual way
          self.onmessage && self.onmessage(msg);
        }
      } else {
        // Deliver in the usual way
        self.onmessage && self.onmessage(msg);
      }
    };

    ws.onerror = function (err) {
      self.onerror && self.onerror(err);
    };

    ws.onclose = function () {
      self.onclose && self.onclose();
    };

    this.send = function (msg) {
      ws.send(msg);
    };

    this.__defineGetter__('readyState', function () {
      return ws.readyState;
    });
  }

  // Exporting
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    // Node.js
    module.exports = DispatchSocket;
    module.exports.scriptsDir = __dirname;
  } else {
    if (typeof define === 'function' && define.amd) {
      // AMD
      define([], function () {
        return DispatchSocket;
      });
    } else {
      // Browser, no AMD
      window.DispatchSocket = DispatchSocket;
    }
  }

})();
