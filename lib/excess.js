var RTCPeerConnection = null;
var getUserMedia = null;
var attachMediaStream = null;
var reattachMediaStream = null;
var webrtcDetectedBrowser = null;
var webrtcDetectedVersion = null;
function trace(text) {
  if (text[text.length - 1] === "\n") {
    text = text.substring(0, text.length - 1);
  }
  if (window.performance) {
    var now = (window.performance.now() / 1E3).toFixed(3);
    console.log(now + ": " + text);
  } else {
    console.log(text);
  }
}
if (navigator.mozGetUserMedia) {
  console.log("This appears to be Firefox");
  webrtcDetectedBrowser = "firefox";
  webrtcDetectedVersion = parseInt(navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1], 10);
  RTCPeerConnection = function(pcConfig, pcConstraints) {
    if (pcConfig && pcConfig.iceServers) {
      for (var i = 0;i < pcConfig.iceServers.length;i++) {
        if (pcConfig.iceServers[i].hasOwnProperty("urls")) {
          pcConfig.iceServers[i].url = pcConfig.iceServers[i].urls;
          delete pcConfig.iceServers[i].urls;
        }
      }
    }
    return new mozRTCPeerConnection(pcConfig, pcConstraints);
  };
  window.RTCSessionDescription = mozRTCSessionDescription;
  window.RTCIceCandidate = mozRTCIceCandidate;
  getUserMedia = navigator.mozGetUserMedia.bind(navigator);
  navigator.getUserMedia = getUserMedia;
  MediaStreamTrack.getSources = function(successCb) {
    setTimeout(function() {
      var infos = [{kind:"audio", id:"default", label:"", facing:""}, {kind:"video", id:"default", label:"", facing:""}];
      successCb(infos);
    }, 0);
  };
  window.createIceServer = function(url, username, password) {
    var iceServer = null;
    var urlParts = url.split(":");
    if (urlParts[0].indexOf("stun") === 0) {
      iceServer = {"url":url};
    } else {
      if (urlParts[0].indexOf("turn") === 0) {
        if (webrtcDetectedVersion < 27) {
          var turnUrlParts = url.split("?");
          if (turnUrlParts.length === 1 || turnUrlParts[1].indexOf("transport=udp") === 0) {
            iceServer = {"url":turnUrlParts[0], "credential":password, "username":username};
          }
        } else {
          iceServer = {"url":url, "credential":password, "username":username};
        }
      }
    }
    return iceServer;
  };
  window.createIceServers = function(urls, username, password) {
    var iceServers = [];
    for (var i = 0;i < urls.length;i++) {
      var iceServer = window.createIceServer(urls[i], username, password);
      if (iceServer !== null) {
        iceServers.push(iceServer);
      }
    }
    return iceServers;
  };
  attachMediaStream = function(element, stream) {
    console.log("Attaching media stream");
    element.mozSrcObject = stream;
  };
  reattachMediaStream = function(to, from) {
    console.log("Reattaching media stream");
    to.mozSrcObject = from.mozSrcObject;
  };
} else {
  if (navigator.webkitGetUserMedia) {
    console.log("This appears to be Chrome");
    webrtcDetectedBrowser = "chrome";
    var result = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
    if (result !== null) {
      webrtcDetectedVersion = parseInt(result[2], 10);
    } else {
      webrtcDetectedVersion = 999;
    }
    window.createIceServer = function(url, username, password) {
      var iceServer = null;
      var urlParts = url.split(":");
      if (urlParts[0].indexOf("stun") === 0) {
        iceServer = {"url":url};
      } else {
        if (urlParts[0].indexOf("turn") === 0) {
          iceServer = {"url":url, "credential":password, "username":username};
        }
      }
      return iceServer;
    };
    window.createIceServers = function(urls, username, password) {
      return{"urls":urls, "credential":password, "username":username};
    };
    RTCPeerConnection = function(pcConfig, pcConstraints) {
      return new webkitRTCPeerConnection(pcConfig, pcConstraints);
    };
    getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
    navigator.getUserMedia = getUserMedia;
    attachMediaStream = function(element, stream) {
      if (typeof element.srcObject !== "undefined") {
        element.srcObject = stream;
      } else {
        if (typeof element.mozSrcObject !== "undefined") {
          element.mozSrcObject = stream;
        } else {
          if (typeof element.src !== "undefined") {
            element.src = URL.createObjectURL(stream);
          } else {
            console.log("Error attaching stream to element.");
          }
        }
      }
    };
    reattachMediaStream = function(to, from) {
      to.src = from.src;
    };
  } else {
    console.log("Browser does not appear to be WebRTC-capable");
  }
}
function requestUserMedia(constraints) {
  return new Promise(function(resolve, reject) {
    var onSuccess = function(stream) {
      resolve(stream);
    };
    var onError = function(error) {
      reject(error);
    };
    try {
      getUserMedia(constraints, onSuccess, onError);
    } catch (e) {
      reject(e);
    }
  });
}
;var events;
(function(events) {
  var TypedEvent = function() {
    function TypedEvent() {
      this._listeners = [];
    }
    TypedEvent.prototype.add = function(listener) {
      this._listeners.push(listener);
    };
    TypedEvent.prototype.remove = function(listener) {
      if (typeof listener === "function") {
        for (var i = 0, l = this._listeners.length;i < l;l++) {
          if (this._listeners[i] === listener) {
            this._listeners.splice(i, 1);
            break;
          }
        }
      } else {
        this._listeners = [];
      }
    };
    TypedEvent.prototype.trigger = function() {
      var a = [];
      for (var _i = 0;_i < arguments.length;_i++) {
        a[_i - 0] = arguments[_i];
      }
      var context = {};
      var listeners = this._listeners.slice(0);
      for (var i = 0, l = listeners.length;i < l;i++) {
        listeners[i].apply(context, a || []);
      }
    };
    return TypedEvent;
  }();
  events.TypedEvent = TypedEvent;
})(events || (events = {}));
var excess;
(function(excess) {
  excess.log = function() {
    var msg = [];
    for (var _i = 0;_i < arguments.length;_i++) {
      msg[_i - 0] = arguments[_i];
    }
    return console.log.apply(console, msg);
  };
  excess.debug = function() {
    var msg = [];
    for (var _i = 0;_i < arguments.length;_i++) {
      msg[_i - 0] = arguments[_i];
    }
    return console.debug.apply(console, msg);
  };
  excess.err = function() {
    var msg = [];
    for (var _i = 0;_i < arguments.length;_i++) {
      msg[_i - 0] = arguments[_i];
    }
    return console.error.apply(console, msg);
  };
})(excess || (excess = {}));
var c;
window.onload = function() {
};
var excess;
(function(excess) {
  var Channel = function() {
    function Channel(rtcDataChannel) {
      var _this = this;
      this.onMessage = new events.TypedEvent;
      this.onClose = new events.TypedEvent;
      this.onError = new events.TypedEvent;
      this.onOpen = new events.TypedEvent;
      this._onMessage = function(event) {
        excess.log("\nCHANNEL MESSAGE: ", event.data);
        _this.onMessage.trigger(event.data);
      };
      this._onError = function(event) {
        excess.log("\nCHANNEL ERROR: ", event);
        _this.onError.trigger(event);
      };
      this._onClose = function(event) {
        excess.log("\nCHANNEL CLOSE: ", event);
        _this.onClose.trigger(event);
      };
      this._onOpen = function(event) {
        excess.log("\nCHANNEL OPEN: ", event);
        _this.onOpen.trigger(event);
      };
      this.dataChannel = rtcDataChannel;
      this.attachCallbacks();
    }
    Channel.prototype.attachCallbacks = function() {
      this.dataChannel.onmessage = this._onMessage;
      this.dataChannel.onerror = this._onError;
      this.dataChannel.onclose = this._onClose;
      this.dataChannel.onopen = this._onOpen;
    };
    Channel.prototype.send = function(message) {
      this.dataChannel.send(message);
    };
    return Channel;
  }();
  excess.Channel = Channel;
})(excess || (excess = {}));
var excess;
(function(excess) {
  var ExcessClient = function() {
    function ExcessClient(signalEndpoint, id, iceServers) {
      var _this = this;
      if (iceServers === void 0) {
        iceServers = [{"url":"stun:stun.l.google.com:19302"}, {"url":"stun:stun2.l.google.com:19302"}];
      }
      this.onConnection = new events.TypedEvent;
      this.receiveSignalMessage = function(from, data) {
        var known = _this.connections[from] ? true : false;
        if (!data) {
          console.error("Received empty signalling message, error from server?");
        } else {
          if (data.type == "offer") {
            if (known) {
              console.warn("Already have a connection with fromId!");
            }
            excess.log("Received OFFER from", from, data);
            var peer = _this.createPeer(from);
            peer.answer(data);
            _this.onConnection.trigger(peer);
          } else {
            if (data.type == "answer") {
              if (!known) {
                console.error("Received answer SDP from unknown peer: ", from);
              } else {
                excess.log("Received ANSWER from ", from, data);
                _this.connections[from].setRemoteDescription(data);
              }
            } else {
              if (data.candidate) {
                if (!known) {
                  console.error("Received ICE candidate from unknown peer: ", from);
                } else {
                  excess.debug("Received ICE candidate from", from, data);
                  _this.connections[from].addIceCandidate(data);
                }
              } else {
                console.warn("Received unexpected signal message ", data, " from ", from);
              }
            }
          }
        }
      };
      this.id = id;
      this.connections = {};
      this.rtcConfig = {"iceServers":iceServers};
      this.signaller = new excess.Signaller(signalEndpoint, id);
      this.signaller.onSignal.add(this.receiveSignalMessage);
    }
    ExcessClient.prototype.connectToServer = function() {
      return this.signaller.connect();
    };
    ExcessClient.prototype.connect = function(id) {
      if (id == this.id) {
        console.error("You can't connect to yourself!");
        return null;
      }
      var peer = this.createPeer(id);
      peer.call();
      return peer;
    };
    ExcessClient.prototype.createPeer = function(id) {
      var _this = this;
      excess.log("Creating peer for ", id);
      var peer = new excess.ExcessPeer(id, this.signaller, this.rtcConfig);
      this.connections[id] = peer;
      peer.onClose.add(function() {
        excess.log("Connection to ", id, "closed, deleting peer");
        delete _this.connections[id];
      });
      return peer;
    };
    ExcessClient.prototype.joinRoom = function(room) {
      this.currentRoom = room;
      this.signaller.join(room);
    };
    ExcessClient.prototype.requestRoom = function(room, callback) {
      this.signaller.discover(room, callback);
    };
    return ExcessClient;
  }();
  excess.ExcessClient = ExcessClient;
})(excess || (excess = {}));
var excess;
(function(excess) {
  var ExcessPeer = function() {
    function ExcessPeer(id, signaller, rtcConfig) {
      var _this = this;
      this.onClose = new events.TypedEvent;
      this.onDataChannelReceive = new events.TypedEvent;
      this.caller = false;
      this.remoteDescriptionSet = false;
      this.onSDPCreate = function(sdp) {
        _this.connection.setLocalDescription(sdp, _this.onLocalDescrAdded, function() {
          return excess.err("Failed to set local description!");
        });
        _this.signaller.signal(_this.id, sdp);
      };
      this.onSDPError = function(event) {
        console.error(event);
      };
      this.onLocalDescrAdded = function() {
        excess.log("Set local description ", _this.caller ? "(OFFER)." : "(ANSWER).");
      };
      this.onStateChange = function(event) {
        excess.log("Connection state change ", event);
      };
      this.onIceStateChange = function(event) {
        excess.log("ICE state changed: connection:", _this.connection.iceConnectionState, "gathering:", _this.connection.iceGatheringState);
      };
      this.onIceCandidate = function(event) {
        if (event.candidate) {
          var candy = {sdpMLineIndex:event.candidate.sdpMLineIndex, sdpMid:event.candidate.sdpMid, candidate:event.candidate.candidate};
          _this.signaller.signal(_this.id, candy);
        }
      };
      this.signaller = signaller;
      this.id = id;
      this.iceBuffer = [];
      this.channels = {};
      this.connection = new RTCPeerConnection(rtcConfig);
      this.connection.ondatachannel = function(event) {
        _this.addDataChannel(event.channel);
        _this.onDataChannelReceive.trigger(_this.channels[event.channel.label]);
      };
      this.connection.onnegotiationneeded = function(e) {
        return console.warn("Negotation needed!");
      };
      this.connection.onicecandidate = this.onIceCandidate;
      this.connection.onstatechange = this.onStateChange;
      this.connection.oniceconnectionstatechange = this.onIceStateChange;
    }
    ExcessPeer.prototype.call = function() {
      this.createDataChannel("excess");
      this.caller = true;
      this.connection.createOffer(this.onSDPCreate, this.onSDPError);
    };
    ExcessPeer.prototype.answer = function(offerSDP) {
      var _this = this;
      if (this.caller) {
        this.caller = false;
      }
      this.setRemoteDescription(offerSDP, function() {
        return _this.connection.createAnswer(_this.onSDPCreate, _this.onSDPError);
      });
    };
    ExcessPeer.prototype.createDataChannel = function(label, opts) {
      if (opts === void 0) {
        opts = {};
      }
      excess.log("Creating data channel ", label, " opts:", opts);
      var channel = this.connection.createDataChannel(label, opts);
      return this.addDataChannel(channel);
    };
    ExcessPeer.prototype.addDataChannel = function(dc) {
      var _this = this;
      if (typeof dc != "object") {
        console.error("Data channel is not even an object!");
      }
      excess.log("Added data channel ", dc);
      var channelWrapper = new excess.Channel(dc);
      this.channels[dc.label] = channelWrapper;
      this.channels[dc.label].onClose.add(function() {
        return delete _this.channels[dc.label];
      });
      return channelWrapper;
    };
    ExcessPeer.prototype.addIceCandidate = function(candidate) {
      if (this.remoteDescriptionSet) {
        var can = new RTCIceCandidate(candidate);
        this.connection.addIceCandidate(can);
      } else {
        excess.log("Buffering ICE candidate");
        this.iceBuffer.push(candidate);
      }
    };
    ExcessPeer.prototype.setRemoteDescription = function(sdpi, callback) {
      var _this = this;
      if (callback === void 0) {
        callback = function() {
        };
      }
      excess.log("Attempting to set remote description.");
      var sdp = new RTCSessionDescription(sdpi);
      this.connection.setRemoteDescription(sdp, function() {
        excess.log("Set remote description", _this.caller ? "(ANSWER)." : "(OFFER).");
        _this.remoteDescriptionSet = true;
        _this.addIceBuffer();
        callback.apply(_this);
      }, function(ev) {
        return console.error("Failed to set remote descr", ev);
      });
    };
    ExcessPeer.prototype.addIceBuffer = function() {
      while (this.iceBuffer.length > 0) {
        var candy = this.iceBuffer.shift();
        this.addIceCandidate(candy);
      }
    };
    return ExcessPeer;
  }();
  excess.ExcessPeer = ExcessPeer;
})(excess || (excess = {}));
var excess;
(function(excess) {
  var Signaller = function() {
    function Signaller(endPoint, id) {
      var _this = this;
      this.onSignal = new events.TypedEvent;
      this.addChannel = function(room, channel) {
        _this.signalChannel = channel;
        _this.currentRoom = channel.topic;
        channel.on("msg:user", function(message) {
          _this.onSignal.trigger(message.from, message.data);
        });
      };
      this.receiveDiscovery = function(message) {
        _this.discoveryCallbacks[message.r](message.users);
        delete _this.discoveryCallbacks[message.r];
      };
      this.id = id;
      this.discoveryCallbacks = {};
      this.endPoint = endPoint;
    }
    Signaller.prototype.connect = function() {
      var _this = this;
      this.socket = new Phoenix.Socket(this.endPoint);
      var fulfilled = false;
      return new Promise(function(fulfill, reject) {
        _this.socket.onOpen(function() {
          fulfilled = true;
          _this.socket.join("discovery", {}, function(channel) {
            _this.addDiscoveryChannel(channel);
            fulfill();
          });
        });
        _this.socket.onError(function() {
          if (!fulfilled) {
            _this.socket.reconnect = function() {
            };
            _this.socket = null;
            reject(Error("Failed to connect to signalling server!"));
          }
        });
      });
    };
    Signaller.prototype.join = function(room) {
      var _this = this;
      if (this.socket == null) {
        excess.err("Connect the signalling server first!");
      }
      var roomtopic = "room:" + room;
      if (roomtopic != this.currentRoom) {
        if (this.currentRoom) {
          this.socket.leave(this.currentRoom, {});
        }
        this.socket.join("room:" + room, {user_id:this.id}, function(channel) {
          return _this.addChannel(room, channel);
        });
      }
    };
    Signaller.prototype.addDiscoveryChannel = function(channel) {
      this.discoveryChannel = channel;
      channel.on("get:room", this.receiveDiscovery);
    };
    Signaller.prototype.discover = function(room, callback) {
      var uid = (new Date).getTime();
      this.discoveryCallbacks[uid] = callback;
      this.discoveryChannel.send("get:room", {id:room, r:uid});
    };
    Signaller.prototype.signal = function(toId, payload) {
      var from = this.id;
      excess.debug("Signalling to ", toId, payload);
      this.signalChannel.send("msg:user", {to:toId, data:payload});
    };
    return Signaller;
  }();
  excess.Signaller = Signaller;
})(excess || (excess = {}));
(function() {
  (function(root, factory) {
    if (typeof define === "function" && define.amd) {
      return define(["phoenix"], factory);
    } else {
      if (typeof exports === "object") {
        return factory(exports);
      } else {
        return factory(root.Phoenix = {});
      }
    }
  })(this, function(exports) {
    var root;
    root = this;
    exports.Channel = function() {
      Channel.prototype.bindings = null;
      function Channel(topic, message, callback, socket) {
        this.topic = topic;
        this.message = message;
        this.callback = callback;
        this.socket = socket;
        this.reset();
      }
      Channel.prototype.reset = function() {
        return this.bindings = [];
      };
      Channel.prototype.on = function(event, callback) {
        return this.bindings.push({event:event, callback:callback});
      };
      Channel.prototype.isMember = function(topic) {
        return this.topic === topic;
      };
      Channel.prototype.off = function(event) {
        var bind;
        return this.bindings = function() {
          var _i, _len, _ref, _results;
          _ref = this.bindings;
          _results = [];
          for (_i = 0, _len = _ref.length;_i < _len;_i++) {
            bind = _ref[_i];
            if (bind.event !== event) {
              _results.push(bind);
            }
          }
          return _results;
        }.call(this);
      };
      Channel.prototype.trigger = function(triggerEvent, msg) {
        var callback, event, _i, _len, _ref, _ref1, _results;
        _ref = this.bindings;
        _results = [];
        for (_i = 0, _len = _ref.length;_i < _len;_i++) {
          _ref1 = _ref[_i], event = _ref1.event, callback = _ref1.callback;
          if (event === triggerEvent) {
            _results.push(callback(msg));
          }
        }
        return _results;
      };
      Channel.prototype.send = function(event, payload) {
        return this.socket.send({topic:this.topic, event:event, payload:payload});
      };
      Channel.prototype.leave = function(message) {
        if (message == null) {
          message = {};
        }
        this.socket.leave(this.topic, message);
        return this.reset();
      };
      return Channel;
    }();
    exports.Socket = function() {
      Socket.states = {connecting:0, open:1, closing:2, closed:3};
      Socket.prototype.conn = null;
      Socket.prototype.endPoint = null;
      Socket.prototype.channels = null;
      Socket.prototype.sendBuffer = null;
      Socket.prototype.sendBufferTimer = null;
      Socket.prototype.flushEveryMs = 50;
      Socket.prototype.reconnectTimer = null;
      Socket.prototype.reconnectAfterMs = 5E3;
      Socket.prototype.heartbeatIntervalMs = 3E4;
      Socket.prototype.stateChangeCallbacks = null;
      Socket.prototype.transport = null;
      function Socket(endPoint, opts) {
        var _ref, _ref1, _ref2, _ref3;
        if (opts == null) {
          opts = {};
        }
        this.states = exports.Socket.states;
        this.transport = (_ref = (_ref1 = opts.transport) != null ? _ref1 : root.WebSocket) != null ? _ref : exports.LongPoller;
        this.heartbeatIntervalMs = (_ref2 = opts.heartbeatIntervalMs) != null ? _ref2 : this.heartbeatIntervalMs;
        this.logger = (_ref3 = opts.logger) != null ? _ref3 : function() {
        };
        this.endPoint = this.expandEndpoint(endPoint);
        this.channels = [];
        this.sendBuffer = [];
        this.stateChangeCallbacks = {open:[], close:[], error:[], message:[]};
        this.resetBufferTimer();
        this.reconnect();
      }
      Socket.prototype.protocol = function() {
        if (location.protocol.match(/^https/)) {
          return "wss";
        } else {
          return "ws";
        }
      };
      Socket.prototype.expandEndpoint = function(endPoint) {
        if (endPoint.charAt(0) !== "/") {
          return endPoint;
        }
        if (endPoint.charAt(1) === "/") {
          return "" + this.protocol() + ":" + endPoint;
        }
        return "" + this.protocol() + "://" + location.host + endPoint;
      };
      Socket.prototype.close = function(callback, code, reason) {
        if (this.conn != null) {
          this.conn.onclose = function(_this) {
            return function() {
            };
          }(this);
          if (code != null) {
            this.conn.close(code, reason != null ? reason : "");
          } else {
            this.conn.close();
          }
          this.conn = null;
        }
        return typeof callback === "function" ? callback() : void 0;
      };
      Socket.prototype.reconnect = function() {
        return this.close(function(_this) {
          return function() {
            _this.conn = new _this.transport(_this.endPoint);
            _this.conn.onopen = function() {
              return _this.onConnOpen();
            };
            _this.conn.onerror = function(error) {
              return _this.onConnError(error);
            };
            _this.conn.onmessage = function(event) {
              return _this.onConnMessage(event);
            };
            return _this.conn.onclose = function(event) {
              return _this.onConnClose(event);
            };
          };
        }(this));
      };
      Socket.prototype.resetBufferTimer = function() {
        clearTimeout(this.sendBufferTimer);
        return this.sendBufferTimer = setTimeout(function(_this) {
          return function() {
            return _this.flushSendBuffer();
          };
        }(this), this.flushEveryMs);
      };
      Socket.prototype.log = function(msg) {
        return this.logger(msg);
      };
      Socket.prototype.onOpen = function(callback) {
        if (callback) {
          return this.stateChangeCallbacks.open.push(callback);
        }
      };
      Socket.prototype.onClose = function(callback) {
        if (callback) {
          return this.stateChangeCallbacks.close.push(callback);
        }
      };
      Socket.prototype.onError = function(callback) {
        if (callback) {
          return this.stateChangeCallbacks.error.push(callback);
        }
      };
      Socket.prototype.onMessage = function(callback) {
        if (callback) {
          return this.stateChangeCallbacks.message.push(callback);
        }
      };
      Socket.prototype.onConnOpen = function() {
        var callback, _i, _len, _ref, _results;
        clearInterval(this.reconnectTimer);
        if (!this.transport.skipHeartbeat) {
          this.heartbeatTimer = setInterval(function(_this) {
            return function() {
              return _this.sendHeartbeat();
            };
          }(this), this.heartbeatIntervalMs);
        }
        this.rejoinAll();
        _ref = this.stateChangeCallbacks.open;
        _results = [];
        for (_i = 0, _len = _ref.length;_i < _len;_i++) {
          callback = _ref[_i];
          _results.push(callback());
        }
        return _results;
      };
      Socket.prototype.onConnClose = function(event) {
        var callback, _i, _len, _ref, _results;
        this.log("WS close:");
        this.log(event);
        clearInterval(this.reconnectTimer);
        clearInterval(this.heartbeatTimer);
        this.reconnectTimer = setInterval(function(_this) {
          return function() {
            return _this.reconnect();
          };
        }(this), this.reconnectAfterMs);
        _ref = this.stateChangeCallbacks.close;
        _results = [];
        for (_i = 0, _len = _ref.length;_i < _len;_i++) {
          callback = _ref[_i];
          _results.push(callback(event));
        }
        return _results;
      };
      Socket.prototype.onConnError = function(error) {
        var callback, _i, _len, _ref, _results;
        this.log("WS error:");
        this.log(error);
        _ref = this.stateChangeCallbacks.error;
        _results = [];
        for (_i = 0, _len = _ref.length;_i < _len;_i++) {
          callback = _ref[_i];
          _results.push(callback(error));
        }
        return _results;
      };
      Socket.prototype.connectionState = function() {
        var _ref;
        switch((_ref = this.conn) != null ? _ref.readyState : void 0) {
          case this.states.connecting:
            return "connecting";
          case this.states.open:
            return "open";
          case this.states.closing:
            return "closing";
          case this.states.closed:
          ;
          case null:
            return "closed";
        }
      };
      Socket.prototype.isConnected = function() {
        return this.connectionState() === "open";
      };
      Socket.prototype.rejoinAll = function() {
        var chan, _i, _len, _ref, _results;
        _ref = this.channels;
        _results = [];
        for (_i = 0, _len = _ref.length;_i < _len;_i++) {
          chan = _ref[_i];
          _results.push(this.rejoin(chan));
        }
        return _results;
      };
      Socket.prototype.rejoin = function(chan) {
        var message, topic;
        chan.reset();
        topic = chan.topic, message = chan.message;
        this.send({topic:topic, event:"join", payload:message});
        return chan.callback(chan);
      };
      Socket.prototype.join = function(topic, message, callback) {
        var chan;
        chan = new exports.Channel(topic, message, callback, this);
        this.channels.push(chan);
        if (this.isConnected()) {
          return this.rejoin(chan);
        }
      };
      Socket.prototype.leave = function(topic, message) {
        var c;
        if (message == null) {
          message = {};
        }
        this.send({topic:topic, event:"leave", payload:message});
        return this.channels = function() {
          var _i, _len, _ref, _results;
          _ref = this.channels;
          _results = [];
          for (_i = 0, _len = _ref.length;_i < _len;_i++) {
            c = _ref[_i];
            if (!c.isMember(topic)) {
              _results.push(c);
            }
          }
          return _results;
        }.call(this);
      };
      Socket.prototype.send = function(data) {
        var callback;
        callback = function(_this) {
          return function() {
            return _this.conn.send(JSON.stringify(data));
          };
        }(this);
        if (this.isConnected()) {
          return callback();
        } else {
          return this.sendBuffer.push(callback);
        }
      };
      Socket.prototype.sendHeartbeat = function() {
        return this.send({topic:"phoenix", event:"heartbeat", payload:{}});
      };
      Socket.prototype.flushSendBuffer = function() {
        var callback, _i, _len, _ref;
        if (this.isConnected() && this.sendBuffer.length > 0) {
          _ref = this.sendBuffer;
          for (_i = 0, _len = _ref.length;_i < _len;_i++) {
            callback = _ref[_i];
            callback();
          }
          this.sendBuffer = [];
        }
        return this.resetBufferTimer();
      };
      Socket.prototype.onConnMessage = function(rawMessage) {
        var callback, chan, event, payload, topic, _i, _j, _len, _len1, _ref, _ref1, _ref2, _results;
        this.log("message received:");
        this.log(rawMessage);
        _ref = JSON.parse(rawMessage.data), topic = _ref.topic, event = _ref.event, payload = _ref.payload;
        _ref1 = this.channels;
        for (_i = 0, _len = _ref1.length;_i < _len;_i++) {
          chan = _ref1[_i];
          if (chan.isMember(topic)) {
            chan.trigger(event, payload);
          }
        }
        _ref2 = this.stateChangeCallbacks.message;
        _results = [];
        for (_j = 0, _len1 = _ref2.length;_j < _len1;_j++) {
          callback = _ref2[_j];
          _results.push(callback(topic, event, payload));
        }
        return _results;
      };
      return Socket;
    }();
    exports.LongPoller = function() {
      LongPoller.prototype.retryInMs = 5E3;
      LongPoller.prototype.endPoint = null;
      LongPoller.prototype.skipHeartbeat = true;
      LongPoller.prototype.onopen = function() {
      };
      LongPoller.prototype.onerror = function() {
      };
      LongPoller.prototype.onmessage = function() {
      };
      LongPoller.prototype.onclose = function() {
      };
      function LongPoller(endPoint) {
        this.states = exports.Socket.states;
        this.upgradeEndpoint = this.normalizeEndpoint(endPoint);
        this.pollEndpoint = this.upgradeEndpoint + (/\/$/.test(endPoint) ? "poll" : "/poll");
        this.readyState = this.states.connecting;
        this.open();
      }
      LongPoller.prototype.open = function() {
        return exports.Ajax.request("POST", this.upgradeEndpoint, "application/json", null, function(_this) {
          return function(status, resp) {
            if (status === 200) {
              _this.readyState = _this.states.open;
              _this.onopen();
              return _this.poll();
            } else {
              return _this.onerror();
            }
          };
        }(this));
      };
      LongPoller.prototype.normalizeEndpoint = function(endPoint) {
        return endPoint.replace("ws://", "http://").replace("wss://", "https://");
      };
      LongPoller.prototype.poll = function() {
        if (this.readyState !== this.states.open) {
          return;
        }
        return exports.Ajax.request("GET", this.pollEndpoint, "application/json", null, function(_this) {
          return function(status, resp) {
            var msg, _i, _len, _ref;
            switch(status) {
              case 200:
                _ref = JSON.parse(resp);
                for (_i = 0, _len = _ref.length;_i < _len;_i++) {
                  msg = _ref[_i];
                  _this.onmessage({data:JSON.stringify(msg)});
                }
                return _this.poll();
              case 204:
                return _this.poll();
              default:
                _this.close();
                return setTimeout(function() {
                  return _this.open();
                }, _this.retryInMs);
            }
          };
        }(this));
      };
      LongPoller.prototype.send = function(body) {
        return exports.Ajax.request("POST", this.pollEndpoint, "application/json", body, function(_this) {
          return function(status, resp) {
            if (status !== 200) {
              return _this.onerror();
            }
          };
        }(this));
      };
      LongPoller.prototype.close = function(code, reason) {
        this.readyState = this.states.closed;
        return this.onclose();
      };
      return LongPoller;
    }();
    exports.Ajax = {states:{complete:4}, request:function(method, endPoint, accept, body, callback) {
      var req;
      req = root.XMLHttpRequest != null ? new root.XMLHttpRequest : new root.ActiveXObject("Microsoft.XMLHTTP");
      req.open(method, endPoint, true);
      req.setRequestHeader("Content-type", accept);
      req.onreadystatechange = function(_this) {
        return function() {
          if (req.readyState === _this.states.complete) {
            return typeof callback === "function" ? callback(req.status, req.responseText) : void 0;
          }
        };
      }(this);
      return req.send(body);
    }};
    return exports;
  });
}).call(this);

