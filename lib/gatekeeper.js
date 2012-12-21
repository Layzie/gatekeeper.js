
(function() {
  var Gk, _addHandler, _bind, _checkType, _getMatcher, _gk_instances, _handleEvent, _handlers, _id, _level, _matcher, _matchesSelector, _removeHandler;
  _matcher = void 0;
  _level = 0;
  _id = 0;
  _handlers = {};
  _gk_instances = {};
  _checkType = function(type, arg) {
    var object;
    object = Object.prototype.toString.call(arg).slice(8, -1);
    if ((arg != null) && object === type) {
      return true;
    } else {
      return false;
    }
  };
  _getMatcher = function(el) {
    if (_matcher) {
      return _matcher;
    }
    if (el.matches) {
      _matcher = el.matches;
    }
    if (el.webkitMatchesSelector) {
      _matcher = el.webkitMatchesSelector;
    }
    if (!_matcher) {
      _matcher = Gk.matchesSelector;
    }
    return _matcher;
  };
  _matchesSelector = function(el, selector, bound_el) {
    if (selector === '_root') {
      return bound_el;
    }
    if (el === bound_el) {
      return;
    }
    if (_getMatcher(el).call(el, selector)) {
      return el;
    }
    if (el.parentNode) {
      _level++;
      return _matchesSelector(el.parentNode, selector, bound_el);
    }
  };
  _addHandler = function(gk, evt, selector, cb) {
    if (!_handlers[gk.id]) {
      _handlers[gk.id] = {};
    }
    if (!_handlers[gk.id][evt]) {
      _handlers[gk.id][evt] = {};
    }
    if (!_handlers[gk.id][evt][selector]) {
      _handlers[gk.id][evt][selector] = [];
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
    var i, j, match, matches, selector, target;
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
    selector = Object.keys(_handlers[id][type]);
    selector.forEach(function() {
      var matchesEvent;
      match = _matchesSelector(target, this, _gk_instances[id].element);
      matchesEvent = function() {
        return true;
      };
      if (match && matchesEvent(type, _gk_instances[id].element, match, this === '_root', e)) {
        _level++;
        _handlers[id][type][selector].match = match;
        return matches[_level] = _handlers[id][type][this];
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
    var global_cb, i, id;
    if (!_checkType('Array', evt)) {
      evt = [evt];
    }
    if (!cb && _checkType('Function', selector)) {
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
