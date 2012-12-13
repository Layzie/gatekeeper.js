
(function() {
  var Gk, _addEvent, _addHandler, _bind, _cancel, _getMatcher, _gk_instances, _handleEvent, _handlers, _id, _level, _matcher, _matchesSelector, _removeHandler;
  _matcher = void 0;
  _level = 0;
  _id = 0;
  _handlers = {};
  _gk_instances = {};
  _addEvent = function(gk, type, cb) {
    var use_capture;
    use_capture = type === 'blur' || type === 'focus';
    return gk.element.addEventListener(type, cb, use_capture);
  };
  _cancel = function(e) {
    e.preventDefault();
    return e.stopPropagation();
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
      _handlers[gk.id][event] = {};
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
    for (selector in _handlers[id][type]) {
      if (_handlers[id][type].hasOwnProperty(selector)) {
        match = _matchesSelector(target, selector, _gk_instances[id].element);
        if (match && Gk.matchesEvent(type, _gk_instances[id].element, match, selector === '_root', e)) {
          _level++;
          _handlers[id][type][selector].match = match;
          matches[_level] = _handlers[id][type][selector];
        }
      }
    }
    e.stopPropagation = function() {
      return e.cancelBubble = true;
    };
    i = 0;
    while (i <= _level) {
      if (matches[i]) {
        j = 0;
        while (j < matches[i].length) {
          if (matches[i][j].call(matches[i].match, e === false)) {
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
    if (!(evt instanceof Array)) {
      evt = [evt];
    }
    if (!cb && typeof selector === 'function') {
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
        continue;
      }
      _addHandler(this, evt[i], selector, cb);
      i++;
    }
    return this;
  };
  Gk = function(el, id) {
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
    return this.id = _id;
  };
  Gk.prototype.on = function(evt, selector, cb) {
    return _bind.call(this, evt, selector, cb);
  };
  Gk.prototype.off = function(evt, selector, cb) {
    return _bind.call(this, evt, selector, cb, true);
  };
  Gk.matchesSelector = function() {};
  Gk.cancel = _cancel;
  Gk.addEvent = _addEvent;
  Gk.matchesEvent = function() {
    return true;
  };
  return window.Gk = Gk;
})();
