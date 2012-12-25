/*! gatekeeper.js - v0.0.1 - 2012-12-25
* Copyright (c) 2012 HIRAKI Satoru; Licensed Apache License, Version 2.0 */


(function() {
  var Gk, _addHandler, _bind, _gk_instances, _handleEvent, _handlers, _id, _level, _matchesSelector, _removeHandler;
  _level = 0;
  _id = 0;
  _handlers = {};
  _gk_instances = {};
  _matchesSelector = function(el, selector, bound_el) {
    var getMatcher;
    getMatcher = function(el) {
      var matcher;
      matcher = void 0;
      if (matcher) {
        return matcher;
      }
      if (matcher == null) {
        matcher = el.matches;
      }
      if (matcher == null) {
        matcher = el.webkitMatchesSelector;
      }
      if (!matcher) {
        matcher = Gk.matchesSelector;
      }
      return matcher;
    };
    if (selector === '_root') {
      return bound_el;
    }
    if (el === bound_el) {
      return;
    }
    if (getMatcher(el).call(el, selector)) {
      return el;
    }
    if (el.parentNode) {
      _level++;
      return _matchesSelector(el.parentNode, selector, bound_el);
    }
  };
  _addHandler = function(gk, evt, selector, cb) {
    var _base, _base1, _name, _ref, _ref1, _ref2;
    if ((_ref = _handlers[_name = gk.id]) == null) {
      _handlers[_name] = {};
    }
    if ((_ref1 = (_base = _handlers[gk.id])[evt]) == null) {
      _base[evt] = {};
    }
    if ((_ref2 = (_base1 = _handlers[gk.id][evt])[selector]) == null) {
      _base1[selector] = [];
    }
    return _handlers[gk.id][evt][selector].push(cb);
  };
  _removeHandler = function(gk, evt, selector, cb) {
    var i, _results;
    if (!cb && !selector) {
      _handlers[gk.id][evt] = {};
      return;
    }
    if (!cb) {
      delete _handlers[gk.id][evt][selector];
      return;
    }
    i = 0;
    _results = [];
    while (i < _handlers[gk.id][evt][selector].length) {
      if (_handlers[gk.id][evt][selector][i] === cb) {
        _handlers[gk.id][evt][selector].pop(i, 1);
        break;
      }
      _results.push(i++);
    }
    return _results;
  };
  _handleEvent = function(id, e, type) {
    var i, j, match, matches, selector, selectors, target;
    if (!_handlers[id][type]) {
      return;
    }
    target = e.target;
    selector = void 0;
    match = void 0;
    matches = {};
    i = 0;
    j = 0;
    _level = 0;
    selectors = Object.keys(_handlers[id][type]);
    selectors.forEach(function(selector) {
      var matchesEvent;
      match = _matchesSelector(target, selector, _gk_instances[id].element);
      matchesEvent = function() {
        return true;
      };
      if (match && matchesEvent(type, _gk_instances[id].element, match, selector === '_root', e)) {
        _level++;
        _handlers[id][type][selector].match = match;
        return matches[_level] = _handlers[id][type][selector];
      }
    });
    e.stopPropagation = function() {
      return e.cancelBubble = true;
    };
    i = 0;
    while (i <= _level) {
      if (matches[i]) {
        j = 0;
        while (j < matches[i].length) {
          if ((matches[i][j] != null) && matches[i][j].call(matches[i].match, e) === false) {
            Gk.cancel(e);
            return;
          }
          if (e.cancelBubble) {
            return;
          }
          j++;
        }
      }
      i++;
    }
  };
  _bind = function(evt, selector, cb, remove) {
    var checkType, global_cb, i, id;
    checkType = function(type, arg) {
      var object;
      object = Object.prototype.toString.call(arg).slice(8, -1);
      if ((arg != null) && object === type) {
        return true;
      } else {
        return false;
      }
    };
    if (!checkType('Array', evt)) {
      evt = [evt];
    }
    if (!cb && checkType('Function', selector)) {
      cb = selector;
      selector = '_root';
    }
    id = this.id;
    global_cb = function(e) {
      return _handleEvent(id, e, global_cb.original);
    };
    i = void 0;
    i = 0;
    while (i < evt.length) {
      global_cb.original = evt[i];
      if (!_handlers[this.id] || !_handlers[this.id][evt[i]]) {
        Gk.addEvent(this, evt[i], global_cb);
      }
      if (remove) {
        _removeHandler(this, evt[i], selector, cb);
      }
      _addHandler(this, evt[i], selector, cb);
      i++;
    }
    return this;
  };
  Gk = (function() {

    function Gk(el, id) {
      var key;
      if (!(this instanceof Gk)) {
        for (key in _gk_instances) {
          if (_gk_instances[key].element === el) {
            return _gk_instances[key];
          }
        }
        _id++;
        _gk_instances[_id] = new Gk(el, _id);
        return _gk_instances[_id];
      }
      this.element = el;
      this.id = _id;
    }

    Gk.prototype.on = function(evt, selector, cb) {
      return _bind.call(this, evt, selector, cb);
    };

    Gk.prototype.off = function(evt, selector, cb) {
      return _bind.call(this, evt, selector, cb, true);
    };

    return Gk;

  })();
  Gk.cancel = function(e) {
    e.preventDefault();
    return e.stopPropagation();
  };
  Gk.addEvent = function(gk, type, cb) {
    var use_capture;
    use_capture = type === 'blur' || type === 'focus';
    return gk.element.addEventListener(type, cb, use_capture);
  };
  Gk.matchesSelector = function() {};
  return window.Gk = Gk;
})();
