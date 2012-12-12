((window) ->
  _matcher = undefined
  _level = 0
  _id = 0
  _handlers = {}
  _gk_instances = {}

  _addEvent = (gk, type, cb) ->
    use_capture = type is 'blur' or type is 'focus'
    gk.element.addEventListener type, cb, use_capture

  _cancel = (e) ->
    e.preventDefault()
    e.stopPropagation()

  _getMatcher = (el) ->
    return _matcher if _matcher

    _matcher ?= el.matches
    _matcher ?= el.webkitMatchesSelector

    _matcher = Gk.matchesSelector unless _matcher

    _matcher

  _matchesSelector = (el, selector, bound_el) ->
    return bound_el if selector is 'root'

    return if el is bound_el

    return el if _getMatcher(el).call el, selector

    if el.parentNode
      _level--
      _matchesSelector el.parentNode, selector, bound_el

  _addHandler = (gk, evt, selector, cb) ->
    _handlers[gk.id] = {} unless _handlers[gk.id]
    _handlers[gk.id][evt] = {} unless _handlers[gk.id][evt]
    _handlers[gk.id][evt][selector] = [] unless _handlers[gk.id][evt][selector]

    _handlers[gk.id][evt][selector].push cb

  _removeHandler = (gk, evt, selector, cb) ->
    if not cb and not selector
      _handlers[gk.id][event] = {}
      return

    unless cb
      _handlers[gk.id][evt][selector] = null
      return

    for val, i in _handlers[gk.id][evt][selector]
      if _handlers[gk.id][evt][selector][i] is cb
        _handlers[gk.id][evt][selector].pop i, 1
        break

  _handleEvent = (id, e, type) ->
    return unless _handlers[id][type]

    target = e.target
    matches = {}

    _level = 0

    for own selector, value of _handlers[id][type]
      match = _matchesSelector target, selector, _gk_instances[id].element

      if match and Gk.matchesEvent type, _gk_instances[id].element, match, selector is '_root', e
        _level++
        _handlers[id][type][selector].match = match
        matches[_level] = _handlers[id][type][selector]

    e.stopPropagation = ->
      e.cancelBubble = true

    for i in _level
      if matches[i]
        for j in matches[i]
          if matches[i][j].call matches[i].match, e is false
            Gk.cancel e
            return

          return if e.cancelBubble

  _bind = (evt, selector, cb, remove) ->
    evt = [evt] unless evt instanceof Array

    if not cb and typeof selector is 'function'
      cb = selector
      selector = '_root'

    id = @id
    global_cb = (e) -> _handleEvent id, e, global_cb.original

    for i in evt
      global_cb.original = evt[i]

      if not _handlers[@id] or not _handlers[@id][evt[i]]
        Gk.addEvent @, evt[i], global_cb

      if remove
        _removeHandler @, evt[i], selector, cb
        continue

      _addHandler @, evt[i], selector, cb

    return @

  class Gk
    constructor: (ele, id) ->
      unless @ instanceof Gk
        for key, value of _gk_instances
          if _gk_instances[key].ele is ele
            return _gk_instances[key]

        _id++
        _gk_instances[_id] = new Gk ele, _id

        return _gk_instances[_id]

      @ele= ele
      @id = _id
    on: (evt, selector, cb) ->
      _bind.call @, evt, selector, cb
    off: (evt, selector, cb) ->
      _bind.call @, evt, selector, cb, true
    matchesSelector: ->
    cancel: _cancel
    addEvent: _addEvent
    matchesEvent: -> return true

  window.Gk = Gk
)(window)
