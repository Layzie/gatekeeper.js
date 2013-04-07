/*! gatekeeper - v0.0.2 - 2013-04-08
* Copyright (c) 2013 HIRAKI Satoru; Licensed Apache License, Version 2.0 */
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
      if (matcher === void 0) {
        throw new Error('There is no mache element');
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
    var handlerLen, i, targetSelector, _results;

    if (!cb && !selector) {
      _handlers[gk.id][evt] = {};
      return;
    }
    if (!cb) {
      delete _handlers[gk.id][evt][selector];
      return;
    }
    i = 0;
    targetSelector = _handlers[gk.id][evt][selector];
    handlerLen = targetSelector.length;
    _results = [];
    while (i < handlerLen) {
      if (targetSelector[i] === cb) {
        targetSelector.pop(i, 1);
        break;
      }
      _results.push(i++);
    }
    return _results;
  };
  _handleEvent = function(id, e, type) {
    var cancel, i, j, match, matchLen, matched, matches, selector, selectors, target, targetType;

    targetType = _handlers[id][type];
    if (!targetType) {
      return;
    }
    target = e.target;
    selector = void 0;
    match = void 0;
    matches = {};
    i = 0;
    j = 0;
    _level = 0;
    cancel = function(e) {
      e.preventDefault();
      return e.stopPropagation();
    };
    selectors = Object.keys(targetType);
    selectors.forEach(function(selector) {
      var matchesEvent, targetSelector;

      targetSelector = _handlers[id][type][selector];
      match = _matchesSelector(target, selector, _gk_instances[id].element);
      matchesEvent = function() {
        return true;
      };
      if (match && matchesEvent(type, _gk_instances[id].element, match, selector === '_root', e)) {
        _level++;
        targetSelector.match = match;
        return matches[_level] = targetSelector;
      }
    });
    e.stopPropagation = function() {
      return e.cancelBubble = true;
    };
    i = 0;
    while (i <= _level) {
      if (matches[i]) {
        j = 0;
        matchLen = matches[i].length;
        while (j < matchLen) {
          matched = matches[i][j];
          if ((matched != null) && matched.call(matches[i].match, e) === false) {
            cancel(e);
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
    var addEvent, checkType, evLen, i, id, _getGlobalCb;

    checkType = function(type, arg) {
      var object;

      object = Object.prototype.toString.call(arg).slice(8, -1);
      if ((arg != null) && object === type) {
        return true;
      } else {
        return false;
      }
    };
    addEvent = function(gk, type, cb) {
      var use_capture;

      use_capture = type === 'blur' || type === 'focus';
      return gk.element.addEventListener(type, cb, use_capture);
    };
    if (!checkType('Array', evt)) {
      evt = [evt];
    }
    if (!cb && checkType('Function', selector)) {
      cb = selector;
      selector = '_root';
    }
    id = this.id;
    i = 0;
    evLen = evt.length;
    _getGlobalCb = function(type) {
      return function(e) {
        return _handleEvent(id, e, type);
      };
    };
    while (i < evLen) {
      if (!_handlers[id] || !_handlers[id][evt[i]]) {
        addEvent(this, evt[i], _getGlobalCb(evt[i]));
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
      this.id = id;
    }

    Gk.prototype.on = function(evt, selector, cb) {
      return _bind.call(this, evt, selector, cb);
    };

    Gk.prototype.off = function(evt, selector, cb) {
      return _bind.call(this, evt, selector, cb, true);
    };

    return Gk;

  })();
  return window.Gk = Gk;
})();
