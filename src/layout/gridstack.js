/**
 * gridstack.js 1.0.0-dev
 * http://troolee.github.io/gridstack.js/
 * (c) 2014-2017 Pavel Reznikov, Dylan Weiss
 * gridstack.js may be freely distributed under the MIT license.
 * @preserve
 */
(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'lodash'], factory)
  } else if (typeof exports !== 'undefined') {
    try { jQuery = require('jquery') } catch (e) {}
    try { _ = require('lodash') } catch (e) {}
    factory(jQuery, _)
  } else {
    factory(jQuery, _)
  }
})(function ($, _) {

  var scope = window

  var obsolete = function (f, oldName, newName) {
    var wrapper = function () {
      console.warn('gridstack.js: Function `' + oldName + '` is deprecated as of v0.2.5 and has been replaced ' +
        'with `' + newName + '`. It will be **completely** removed in v1.0.')
      return f.apply(this, arguments)
    }

    // 프로토타입이 없으면 래퍼 클래스를 리턴하지 않는다.
    if (f.prototype) {
      wrapper.prototype = f.prototype
      return wrapper
    }
  }

  var obsoleteOpts = function (oldName, newName) {
    console.warn('gridstack.js: Option `' + oldName + '` is deprecated as of v0.2.5 and has been replaced with `' +
      newName + '`. It will be **completely** removed in v1.0.')
  }

  var Utils = {
    isIntercepted: function (a, b) {
      return !(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y)
    },

    sort: function (nodes) {
      // width = width || _.chain(nodes).map(function (node) { return node.x + node.width }).max().value()
      // dir = dir != -1 ? 1 : -1
      // return _.sortBy(nodes, function (n) { return dir * (n.x + n.y * width) })

      // const arrSortNodes = _.sortBy(nodes, function (n) {
      //   console.log('Node info -> ', n)
      //   return dir * (n.x + n.y * width)
      // })
      nodes.sort((beforeWidget, afterWidget) => beforeWidget.seq - afterWidget.seq)
      return nodes
    },

    createStylesheet: function (id) {
      var style = document.createElement('style')
      style.setAttribute('type', 'text/css')
      style.setAttribute('data-gs-style-id', id)
      if (style.styleSheet) {
        style.styleSheet.cssText = ''
      } else {
        style.appendChild(document.createTextNode(''))
      }
      document.getElementsByTagName('head')[0].appendChild(style)
      return style.sheet
    },

    removeStylesheet: function (id) {
      $('STYLE[data-gs-style-id=' + id + ']').remove()
    },

    insertCSSRule: function (sheet, selector, rules, index) {
      if (typeof sheet.insertRule === 'function') {
        sheet.insertRule(selector + '{' + rules + '}', index)
      } else if (typeof sheet.addRule === 'function') {
        sheet.addRule(selector, rules, index)
      }
    },

    toBool: function (v) {
      if (typeof v == 'boolean') {
        return v
      }
      if (typeof v == 'string') {
        v = v.toLowerCase()
        return !(v === '' || v == 'no' || v == 'false' || v == '0')
      }
      return Boolean(v)
    },

    _collisionNodeCheck: function (n) {
      return n != this.node && Utils.isIntercepted(n, this.nn)
    },

    _didCollide: function (bn) {
      return Utils.isIntercepted({x: this.n.x, y: this.newY, width: this.n.width, height: this.n.height}, bn)
    },

    _isAddNodeIntercepted: function (n) {
      return Utils.isIntercepted({x: this.x, y: this.y, width: this.node.width, height: this.node.height}, n)
    },

    parseHeight: function (val) {
      var height = val
      var heightUnit = 'px'
      if (height && _.isString(height)) {
        var match = height.match(/^(-[0-9]+\.[0-9]+|[0-9]*\.[0-9]+|-[0-9]+|[0-9]+)(px|em|rem|vh|vw)?$/)
        if (!match) {
          throw new Error('Invalid height')
        }
        heightUnit = match[2] || 'px'
        height = parseFloat(match[1])
      }
      return {height: height, unit: heightUnit}
    },

    removePositioningStyles: function (el) {
      var style = el[0].style
      if (style.position) {
        style.removeProperty('position')
      }
      if (style.left) {
        style.removeProperty('left')
      }
      if (style.top) {
        style.removeProperty('top')
      }
      if (style.width) {
        style.removeProperty('width')
      }
      if (style.height) {
        style.removeProperty('height')
      }
    }
  }

  // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
  Utils.is_intercepted = obsolete(Utils.isIntercepted, 'is_intercepted', 'isIntercepted')

  Utils.create_stylesheet = obsolete(Utils.createStylesheet, 'create_stylesheet', 'createStylesheet')

  Utils.remove_stylesheet = obsolete(Utils.removeStylesheet, 'remove_stylesheet', 'removeStylesheet')

  Utils.insert_css_rule = obsolete(Utils.insertCSSRule, 'insert_css_rule', 'insertCSSRule')

  // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
  function GridStackDragDropPlugin (grid) {
    this.grid = grid
  }

  GridStackDragDropPlugin.registeredPlugins = []

  GridStackDragDropPlugin.registerPlugin = function (pluginClass) {
    GridStackDragDropPlugin.registeredPlugins.push(pluginClass)
  }

  GridStackDragDropPlugin.prototype.resizable = function (el, opts) {
    return this
  }

  GridStackDragDropPlugin.prototype.draggable = function (el, opts) {
    return this
  }

  GridStackDragDropPlugin.prototype.droppable = function (el, opts) {
    return this
  }

  GridStackDragDropPlugin.prototype.isDroppable = function (el) {
    return false
  }

  GridStackDragDropPlugin.prototype.on = function (el, eventName, callback) {
    return this
  }

  var idSeq = 0

  var GridStackEngine = function (width, onchange, floatMode, height, items) {
    this.width = width
    this.float = floatMode || false
    this.height = height || 0

    this.nodes = items || []
    this.onchange = onchange || function () {}

    this._updateCounter = 0
    this._float = this.float

    this._addedNodes = []
    this._removedNodes = []
  }

  GridStackEngine.prototype.batchUpdate = function () {
    this._updateCounter = 1
    this.float = true
  }

  // 이 프로토타입은 사용하지 않습니다.
  GridStackEngine.prototype.commit = function () {
    if (this._updateCounter !== 0) {
      this._updateCounter = 0
      this.float = this._float
      this._packNodes()
      this._notify()
    }
  }

  // For Meteor support: https://github.com/troolee/gridstack.js/pull/272
  GridStackEngine.prototype.getNodeDataByDOMEl = function (el) {
    return _.find(this.nodes, function (n) { return el.get(0) === n.el.get(0) })
  }

  // 너비가 큰 위젯이 상 / 하단 위치 이동 시 위젯의 순서를 변경합니다.
  GridStackEngine.prototype._swapBigWidget = function (target, x, y) {
    // 범위에 포함되는 위젯만 따로 구하기
    let toAreaWidget = []
    // 모든 위젯 검사
    for (const widget of this.nodes) {
      if (x <= widget.x && x + target.width - 1 >= widget.x && target !== widget && widget.y === y) {
        // 잠겨있는 위젯이 있는 경우
        if (widget.locked) {
          return false
        }
        // To 위젯 저장
        toAreaWidget.push(widget)
      }
    }
    // 변경할 대상 위젯 갯수에 따라 처리과정 분기
    if (toAreaWidget.length === 0) {
      return false
    } else if (toAreaWidget.length === 1) {
      // 변경할 대상 위젯 갯수가 1개라면 스왑 (사이즈가 동일한 경우)
      return this._swapOnceWidget(target, toAreaWidget[0])
    } else {
      // 변경할 대상 위젯 갯수가 1개 초과라면 스왑처리 (사이즈가 동일하지 않고 여러개인 경우)
      for (var i = 0, max = toAreaWidget.length; i < max; i++) {
        const changeWidget = toAreaWidget[i]
        if (i === 0) {
          const targetSeq = target.seq
          target.seq = changeWidget.seq
          changeWidget.seq = targetSeq
        } else {
          // 우선순위를 두기위해 (+1을 할 경우 기존 위젯과 겹치는 증상 발생)
          changeWidget.seq = toAreaWidget[i - 1].seq + 0.1
        }
        changeWidget._dirty = true
      }
      // 변경된 시퀀스를 기준으로 정렬
      this.nodes.sort((prev, after) => {
        return (prev.seq < after.seq) ? -1 : (prev.seq > after.seq) ? 1 : 0
      })
      // 우선순위 정리
      for (var i = 0, max = this.nodes.length; i < max; i++) {
        this.nodes[i].seq = i
      }
      target._dirty = true
    }
    return true
  }

  // 크기가 동일한 위젯을 스왑합니다.
  GridStackEngine.prototype._swapOnceWidget = function (toWidget, fromWidget) {
    // 잠겨있는 위젯인가?
    if (fromWidget.locked) {
      return false
    }
    // To widget 순위 변경
    const beforeSeq = fromWidget.seq
    fromWidget.seq = toWidget.seq
    toWidget.seq = beforeSeq
    // 스타일 업데이트 시 반영
    fromWidget._dirty = true
    toWidget._dirty = true
    return true
  }

  // 드래그 & 드롭 발생 시 위젯간의 위치와 우선 순위를 변경합니다.
  GridStackEngine.prototype._swapWidgets = function (target, x, y, type) {
    // 크기가 큰 위젯은 따로 스왑을 관리한다
    if (target.width > 1 && type === 'drag') {
      if (this._swapBigWidget(target, x, y)) {
        this._sortNodes()
        return true
      } else {
        return false
      }
    }
    // 드래그 & 드롭 이벤트 발생 시 범위내에 위젯이 존재하는 경우
    for (const widget of this.nodes) {
      // 동일한 위치의 위젯을 변경하는 경우
      if (widget.x === x && widget.y === y) {
        if (!this._swapOnceWidget(target, widget)) {
          return false
        }
      }
    }
    this._sortNodes()
    return true
  }

  GridStackEngine.prototype._fixCollisions = function (node) {
    // 현재 위젯들을 정렬
    this._sortNodes(-1)
    var nn = node
    var hasLocked = Boolean(_.find(this.nodes, function (n) { return n.locked }))
    if (!this.float && !hasLocked) {
      nn = {x: 0, y: node.y, width: this.width, height: node.height}
    }
    while (true) {
      var collisionNode = _.find(this.nodes, _.bind(Utils._collisionNodeCheck, {node: node, nn: nn}))
      if (typeof collisionNode == 'undefined') {
        return
      }
      this.moveNode(collisionNode, collisionNode.x, node.y + node.height, collisionNode.width, collisionNode.height, true)
    }
  }

  GridStackEngine.prototype.isAreaEmpty = function (x, y, width, height) {
    var nn = {x: x || 0, y: y || 0, width: width || 1, height: height || 1}
    var collisionNode = _.find(this.nodes, _.bind(function (n) {
      return Utils.isIntercepted(n, nn)
    }, this))
    return collisionNode === null || typeof collisionNode === 'undefined'
  }

  GridStackEngine.prototype._sortNodes = function (dir) {
    this.nodes = Utils.sort(this.nodes, dir, this.width)
  }

  GridStackEngine.prototype._packNodes = function () {
    console.log('팩 노드 호출 ??')

    // 노드 정렬
    this._sortNodes()

    if (this.float) {
      _.each(this.nodes, _.bind(function (n, i) {
        if (n._updating || typeof n._origY == 'undefined' || n.y == n._origY) {
          return
        }

        var newY = n.y
        while (newY >= n._origY) {
          var collisionNode = _.chain(this.nodes)
            .take(i)
            .find(_.bind(Utils._didCollide, {n: n, newY: newY}))
            .value()

          if (!collisionNode) {
            n._dirty = true
            n.y = newY
          }
          --newY
        }
      }, this))
    } else {
      // 모든 위젯을 조회한다.
      _.each(this.nodes, _.bind(function (n, i) {
        // 위젯이 잠겨있으면 리턴
        if (n.locked) {
          return
        }

        // 위젯의 Row가 0보다 크다면?
        while (n.y > 0) {
          var newY = n.y - 1
          var canBeMoved = i === 0

          if (i > 0) {
            var collisionNode = _.chain(this.nodes)
              .take(i)
              .find(_.bind(Utils._didCollide, {n: n, newY: newY}))
              .value()
            canBeMoved = typeof collisionNode == 'undefined'
          }

          if (!canBeMoved) {
            break
          }
          n._dirty = n.y != newY
          n.y = newY
        }
      }, this))
    }
  }

  GridStackEngine.prototype._prepareNode = function (node, resizing) {
    node = _.defaults(node || {}, {width: 1, height: 1, x: 0, y: 0})
    node.x = parseInt('' + node.x)
    node.y = parseInt('' + node.y)
    node.width = parseInt('' + node.width)
    node.height = parseInt('' + node.height)
    node.autoPosition = node.autoPosition || false
    node.noResize = node.noResize || false
    node.noMove = node.noMove || false

    if (node.width > this.width) {
      node.width = this.width
    } else if (node.width < 1) {
      node.width = 1
    }

    if (node.height < 1) {
      node.height = 1
    }

    if (node.x < 0) {
      node.x = 0
    }

    if (node.x + node.width > this.width) {
      if (resizing) {
        node.width = this.width - node.x
      } else {
        node.x = this.width - node.width
      }
    }

    if (node.y < 0) {
      node.y = 0
    }

    return node
  }

  // 위치가 변경되거나 스타일이 변경된 위젯이 있으면 변경된 정보를 적용합니다.
  GridStackEngine.prototype._notify = function () {
    var args = Array.prototype.slice.call(arguments, 0)
    args[0] = typeof args[0] === 'undefined' ? [] : [args[0]]
    args[1] = typeof args[1] === 'undefined' ? true : args[1]

    if (this._updateCounter) {
      return
    }

    var deletedNodes = args[0].concat(this.getDirtyNodes())

    console.log('업데이트 대상 노드 -> ', deletedNodes)

    this.onchange(deletedNodes, args[1])
  }

  GridStackEngine.prototype.cleanNodes = function () {
    if (this._updateCounter) {
      return
    }
    _.each(this.nodes, function (n) {n._dirty = false })
  }

  GridStackEngine.prototype.getDirtyNodes = function () {
    return _.filter(this.nodes, function (n) { return n._dirty })
  }

  // 이 프로토타입 메서드는 사용하지 않습니다.
  GridStackEngine.prototype.addNode = function (node, triggerAddEvent) {
    node = this._prepareNode(node)

    if (typeof node.maxWidth != 'undefined') { node.width = Math.min(node.width, node.maxWidth) }
    if (typeof node.maxHeight != 'undefined') { node.height = Math.min(node.height, node.maxHeight) }
    if (typeof node.minWidth != 'undefined') { node.width = Math.max(node.width, node.minWidth) }
    if (typeof node.minHeight != 'undefined') { node.height = Math.max(node.height, node.minHeight) }

    node._id = ++idSeq
    node._dirty = true

    if (node.autoPosition) {
      this._sortNodes()

      for (var i = 0; ; ++i) {
        var x = i % this.width
        var y = Math.floor(i / this.width)
        if (x + node.width > this.width) {
          continue
        }
        if (!_.find(this.nodes, _.bind(Utils._isAddNodeIntercepted, {x: x, y: y, node: node}))) {
          node.x = x
          node.y = y
          break
        }
      }
    }

    this.nodes.push(node)
    if (typeof triggerAddEvent != 'undefined' && triggerAddEvent) {
      this._addedNodes.push(_.clone(node))
    }

    this._fixCollisions(node)
    this._packNodes()
    this._notify()
    return node
  }

  GridStackEngine.prototype.removeNode = function (node, detachNode) {
    detachNode = typeof detachNode === 'undefined' ? true : detachNode
    this._removedNodes.push(_.clone(node))
    node._id = null
    this.nodes = _.without(this.nodes, node)
    this._packNodes()
    this._notify(node, detachNode)
  }

  /* 위젯이 움직일 수 있는 위치인지 판단합니다. */
  GridStackEngine.prototype.canMoveNode = function (node, x, y, width, height) {
    // 위젯의 위치가 이전과 동일하거나 너비, 높이의 값이 최소 또는 최대치 범위를 벗어난 경우는 불가능
    if (!this.isNodeChangedPosition(node, x, y, width, height)) {
      return false
    }

    // Locked이 걸려있는 노드 검색
    var hasLocked = Boolean(_.find(this.nodes, function (n) { return n.locked }))

    // 그리드의 높이가 무제한이고 잠긴 위젯이 없으면 이동 가능
    if (!this.height && !hasLocked) {
      return true
    }

    // 복사본 위젯 생성
    var clonedNode
    var clone = new GridStackEngine(
      this.width,
      null,
      this.float,
      0,
      _.map(this.nodes, function (n) {
        if (n == node) {
          clonedNode = $.extend({}, n)
          return clonedNode
        }
        return $.extend({}, n)
      }))

    if (typeof clonedNode === 'undefined') {
      return true
    }

    clone.moveNode(clonedNode, x, y, width, height)

    var res = true

    if (hasLocked) {
      res &= !Boolean(_.find(clone.nodes, function (n) {
        return n != clonedNode && Boolean(n.locked) && Boolean(n._dirty)
      }))
    }
    if (this.height) {
      res &= clone.getGridHeight() <= this.height
    }

    return res
  }

  GridStackEngine.prototype.canBePlacedWithRespectToHeight = function (node) {
    if (!this.height) {
      return true
    }

    var clone = new GridStackEngine(
      this.width,
      null,
      this.float,
      0,
      _.map(this.nodes, function (n) { return $.extend({}, n) }))
    clone.addNode(node)
    return clone.getGridHeight() <= this.height
  }

  GridStackEngine.prototype.isNodeChangedPosition = function (node, x, y, width, height) {
    if (typeof x != 'number') { x = node.x }
    if (typeof y != 'number') { y = node.y }
    if (typeof width != 'number') { width = node.width }
    if (typeof height != 'number') { height = node.height }

    if (typeof node.maxWidth != 'undefined') { width = Math.min(width, node.maxWidth) }
    if (typeof node.maxHeight != 'undefined') { height = Math.min(height, node.maxHeight) }
    if (typeof node.minWidth != 'undefined') { width = Math.max(width, node.minWidth) }
    if (typeof node.minHeight != 'undefined') { height = Math.max(height, node.minHeight) }

    if (node.x == x && node.y == y && node.width == width && node.height == height) {
      return false
    }
    return true
  }

  // 노드에 정의되어 있는 우선순위를 기준으로 레이아웃을 다시 조절합니다.
  GridStackEngine.prototype._updateLayoutFromSeq = function () {
    // 위젯을 배치할 행, 열 변수
    let currentCol = 0
    let currentRow = 0

    // 레이아웃 컬럼과 위젯 객체
    const nodes = this.nodes
    const layoutColumns = this.width

    for (let i = 0, max = nodes.length; i < max; i++) {
      // X축 좌표를 저장하는 변수 선언
      let currentX = 0
      const currentNode = nodes[i]
      // 첫번째 노드라면 currentRow 업데이트 후 위치 지정
      if (i === 0) {
        currentCol += currentNode.width
      } else {
        // (현재 Row 너비 + 현재 노드 너비) / 그리드 컬럼 갯수 => 아래로 내릴지? 지금 Row에 추가할지?
        let whetherCheck = Math.floor(layoutColumns / (currentCol + currentNode.width))

        // 변경 체크가 0일 경우, 다음 Row로 내리는 것으로 판단한다
        if (whetherCheck === 0) {
          // 현재 Row 너비 업데이트
          currentCol = currentNode.width
          currentRow += 1
        } else {
          // 이전노드 좌표 가져오기
          const beforeNode = nodes[i - 1]
          // 현재 Row 너비 업데이트
          currentCol += currentNode.width
          // CurrentRow - 1이 새로운 X축 좌표
          currentX = beforeNode.x + beforeNode.width
        }
      }

      // 각 위젯들이 이동할 위치 구하기
      const newX = (currentX !== null && typeof currentX != 'undefined') ? currentX : currentNode.x
      const newY = (currentRow !== null && typeof currentRow != 'undefined') ? currentRow : currentNode.y

      // 위젯 정보 업데이트
      currentNode.x = newX
      currentNode.y = newY
      currentNode.lastTriedX = newX
      currentNode.lastTriedY = newY

      currentNode._dirty = true
    }
  }

  GridStackEngine.prototype.moveNode = function (node, x, y, width, height, noPack) {
    if (!this.isNodeChangedPosition(node, x, y, width, height)) {
      return node
    }

    // 목적지 좌표가 입력이 안되어 있다면, 현재 좌표를 입력
    if (typeof x !== 'number') { x = node.x }
    if (typeof y !== 'number') { y = node.y }
    if (typeof width !== 'number') { width = node.width }
    if (typeof height !== 'number') { height = node.height }

    // 위젯의 최대 너비, 높이가 허용된 범위를 넘었는지 체크
    if (typeof node.maxWidth !== 'undefined') { width = Math.min(width, node.maxWidth) }
    if (typeof node.maxHeight !== 'undefined') { height = Math.min(height, node.maxHeight) }
    if (typeof node.minWidth !== 'undefined') { width = Math.max(width, node.minWidth) }
    if (typeof node.minHeight !== 'undefined') { height = Math.max(height, node.minHeight) }

    // 현재 위젯과 이동할 위젯의 좌표가 같으면 (제자리라면 현재 위젯정보 리턴)
    if (node.x === x && node.y === y && node.width === width && node.height === height) {
      return node
    }

    // 이동할 위치로 위젯속성 설정
    node.x = x
    node.y = y
    node.width = width
    node.height = height
    node.lastTriedX = x
    node.lastTriedY = y
    node.lastTriedWidth = width
    node.lastTriedHeight = height

    // 위치 이동이 확정되면 호출되는 부분입니다.
    if (!noPack) {
      // 그리드 레이아웃 정렬 -> 스타일이 변경되기 전에 처리되야한다.
      this._updateLayoutFromSeq()
      // 스타일 변경 이벤트
      this._notify()
    }
    return node
  }

  GridStackEngine.prototype.getGridHeight = function () {
    return _.reduce(this.nodes, function (memo, n) { return Math.max(memo, n.y + n.height) }, 0)
  }

  GridStackEngine.prototype.beginUpdate = function (node) {
    _.each(this.nodes, function (n) {
      n._origY = n.y
    })
    node._updating = true
  }

  GridStackEngine.prototype.endUpdate = function () {
    _.each(this.nodes, function (n) {
      n._origY = n.y
    })
    var n = _.find(this.nodes, function (n) { return n._updating })
    if (n) {
      n._updating = false
    }
  }

  var GridStack = function (el, opts) {
    var self = this
    var oneColumnMode, isAutoCellHeight

    opts = opts || {}

    this.container = $(el)

    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    if (typeof opts.handle_class !== 'undefined') {
      opts.handleClass = opts.handle_class
      obsoleteOpts('handle_class', 'handleClass')
    }
    if (typeof opts.item_class !== 'undefined') {
      opts.itemClass = opts.item_class
      obsoleteOpts('item_class', 'itemClass')
    }
    if (typeof opts.placeholder_class !== 'undefined') {
      opts.placeholderClass = opts.placeholder_class
      obsoleteOpts('placeholder_class', 'placeholderClass')
    }
    if (typeof opts.placeholder_text !== 'undefined') {
      opts.placeholderText = opts.placeholder_text
      obsoleteOpts('placeholder_text', 'placeholderText')
    }
    if (typeof opts.cell_height !== 'undefined') {
      opts.cellHeight = opts.cell_height
      obsoleteOpts('cell_height', 'cellHeight')
    }
    if (typeof opts.vertical_margin !== 'undefined') {
      opts.verticalMargin = opts.vertical_margin
      obsoleteOpts('vertical_margin', 'verticalMargin')
    }
    if (typeof opts.min_width !== 'undefined') {
      opts.minWidth = opts.min_width
      obsoleteOpts('min_width', 'minWidth')
    }
    if (typeof opts.static_grid !== 'undefined') {
      opts.staticGrid = opts.static_grid
      obsoleteOpts('static_grid', 'staticGrid')
    }
    if (typeof opts.is_nested !== 'undefined') {
      opts.isNested = opts.is_nested
      obsoleteOpts('is_nested', 'isNested')
    }
    if (typeof opts.always_show_resize_handle !== 'undefined') {
      opts.alwaysShowResizeHandle = opts.always_show_resize_handle
      obsoleteOpts('always_show_resize_handle', 'alwaysShowResizeHandle')
    }
    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers

    opts.itemClass = opts.itemClass || 'grid-stack-item'
    var isNested = this.container.closest('.' + opts.itemClass).length > 0

    this.opts = _.defaults(opts || {}, {
      width: parseInt(this.container.attr('data-gs-width')) || 12,
      height: parseInt(this.container.attr('data-gs-height')) || 0,
      itemClass: 'grid-stack-item',
      placeholderClass: 'grid-stack-placeholder',
      placeholderText: '',
      handle: '.grid-stack-item-content',
      handleClass: null,
      cellHeight: '300px',
      verticalMargin: 20,
      auto: true,
      minWidth: 768,
      float: false,
      staticGrid: false,
      _class: 'grid-stack-instance-' + (Math.random() * 10000).toFixed(0),
      animate: Boolean(this.container.attr('data-gs-animate')) || false,
      alwaysShowResizeHandle: opts.alwaysShowResizeHandle || false,
      resizable: _.defaults(opts.resizable || {}, {
        autoHide: !(opts.alwaysShowResizeHandle || false),
        handles: 'se'
      }),
      draggable: _.defaults(opts.draggable || {}, {
        handle: (opts.handleClass ? '.' + opts.handleClass : (opts.handle ? opts.handle : '')) ||
        '.grid-stack-item-content',
        scroll: false,
        appendTo: 'body'
      }),
      disableDrag: opts.disableDrag || false,
      disableResize: opts.disableResize || false,
      rtl: 'auto',
      removable: false,
      removableOptions: _.defaults(opts.removableOptions || {}, {
        accept: '.' + opts.itemClass
      }),
      removeTimeout: 2000,
      verticalMarginUnit: 'px',
      cellHeightUnit: 'px',
      disableOneColumnMode: opts.disableOneColumnMode || false,
      oneColumnModeClass: opts.oneColumnModeClass || 'grid-stack-one-column-mode',
      ddPlugin: null
    })

    if (this.opts.ddPlugin === false) {
      this.opts.ddPlugin = GridStackDragDropPlugin
    } else if (this.opts.ddPlugin === null) {
      this.opts.ddPlugin = _.first(GridStackDragDropPlugin.registeredPlugins) || GridStackDragDropPlugin
    }

    this.dd = new this.opts.ddPlugin(this)

    if (this.opts.rtl === 'auto') {
      this.opts.rtl = this.container.css('direction') === 'rtl'
    }

    if (this.opts.rtl) {
      this.container.addClass('grid-stack-rtl')
    }

    this.opts.isNested = isNested

    isAutoCellHeight = this.opts.cellHeight === 'auto'
    if (isAutoCellHeight) {
      self.cellHeight(self.cellWidth(), true)
    } else {
      this.cellHeight(this.opts.cellHeight, true)
    }
    this.verticalMargin(this.opts.verticalMargin, true)

    this.container.addClass(this.opts._class)

    this._setStaticClass()

    if (isNested) {
      this.container.addClass('grid-stack-nested')
    }

    this._initStyles()

    this.grid = new GridStackEngine(this.opts.width, function (nodes, detachNode) {
      detachNode = typeof detachNode === 'undefined' ? true : detachNode
      var maxHeight = 0
      _.each(this.nodes, function (n) {
        maxHeight = Math.max(maxHeight, n.y + n.height)
      })

      // 변경된 노드의 요소에 좌표, 너비, 높이값 설정
      _.each(nodes, function (n) {
        if (detachNode && n._id === null) {
          if (n.el) {
            n.el.remove()
          }
        } else {
          n.el
            .attr('data-gs-x', n.x)
            .attr('data-gs-y', n.y)
            .attr('data-gs-s', n.seq)
            .attr('data-gs-width', n.width)
            .attr('data-gs-height', n.height)
        }
      })
      self._updateStyles(maxHeight + 10)
    }, this.opts.float, this.opts.height)

    if (this.opts.auto) {
      var elements = []
      var _this = this
      this.container.children('.' + this.opts.itemClass + ':not(.' + this.opts.placeholderClass + ')')
        .each(function (index, el) {
          el = $(el)
          elements.push({
            el: el,
            i: parseInt(el.attr('data-gs-x')) + parseInt(el.attr('data-gs-y')) * _this.opts.width
          })
        })
      _.chain(elements).sortBy(function (x) { return x.i }).each(function (i) {
        self._prepareElement(i.el)
      }).value()
    }

    this.setAnimation(this.opts.animate)

    this.placeholder = $(
      '<div class="' + this.opts.placeholderClass + ' ' + this.opts.itemClass + '">' +
      '<div class="placeholder-content">' + this.opts.placeholderText + '</div></div>').hide()

    this._updateContainerHeight()

    this._updateHeightsOnResize = _.throttle(function () {
      self.cellHeight(self.cellWidth(), false)
    }, 100)

    // 위젯의 리사이즈 이벤트 핸들러 함수입니다.
    this.onResizeHandler = function () {
      if (isAutoCellHeight) {
        self._updateHeightsOnResize()
      }

      // One 컬럼 모드는 사용하지 않는다.
      if (self._isOneColumnMode() && !self.opts.disableOneColumnMode) {
        if (oneColumnMode) {
          return
        }
        self.container.addClass(self.opts.oneColumnModeClass)
        oneColumnMode = true

        self.grid._sortNodes()
        _.each(self.grid.nodes, function (node) {
          self.container.append(node.el)

          if (self.opts.staticGrid) {
            return
          }
          self.dd.draggable(node.el, 'disable')
          self.dd.resizable(node.el, 'disable')

          node.el.trigger('resize')
        })
      } else {
        if (!oneColumnMode) {
          return
        }

        self.container.removeClass(self.opts.oneColumnModeClass)
        oneColumnMode = false

        if (self.opts.staticGrid) {
          return
        }

        _.each(self.grid.nodes, function (node) {
          if (!node.noMove && !self.opts.disableDrag) {
            self.dd.draggable(node.el, 'enable')
          }
          if (!node.noResize && !self.opts.disableResize) {
            self.dd.resizable(node.el, 'enable')
          }

          node.el.trigger('resize')
        })
      }
    }

    $(window).resize(this.onResizeHandler)
    this.onResizeHandler()

    if (!self.opts.staticGrid && typeof self.opts.removable === 'string') {
      var trashZone = $(self.opts.removable)
      if (!this.dd.isDroppable(trashZone)) {
        this.dd.droppable(trashZone, self.opts.removableOptions)
      }
      this.dd
        .on(trashZone, 'dropover', function (event, ui) {
          var el = $(ui.draggable)
          var node = el.data('_gridstack_node')
          if (node._grid !== self) {
            return
          }
          el.data('inTrashZone', true)
          self._setupRemovingTimeout(el)
        })
        .on(trashZone, 'dropout', function (event, ui) {
          var el = $(ui.draggable)
          var node = el.data('_gridstack_node')
          if (node._grid !== self) {
            return
          }
          el.data('inTrashZone', false)
          self._clearRemovingTimeout(el)
        })
    }

    if (!self.opts.staticGrid && self.opts.acceptWidgets) {
      var draggingElement = null

      var onDrag = function (event, ui) {
        var el = draggingElement
        var node = el.data('_gridstack_node')
        var pos = self.getCellFromPixel({left: event.pageX, top: event.pageY}, true)
        var x = Math.max(0, pos.x)
        var y = Math.max(0, pos.y)
        if (!node._added) {
          node._added = true

          node.el = el
          node.autoPosition = true
          node.x = x
          node.y = y
          self.grid.cleanNodes()
          self.grid.beginUpdate(node)
          self.grid.addNode(node)

          self.container.append(self.placeholder)
          self.placeholder
            .attr('data-gs-x', node.x)
            .attr('data-gs-y', node.y)
            .attr('data-gs-width', node.width)
            .attr('data-gs-height', node.height)
            .show()
          node.el = self.placeholder
          node._beforeDragX = node.x
          node._beforeDragY = node.y

          self._updateContainerHeight()
        }
        if (!self.grid.canMoveNode(node, x, y)) {
          return
        }
        self.grid.moveNode(node, x, y)
        self._updateContainerHeight()
      }

      this.dd
        .droppable(self.container, {
          accept: function (el) {
            el = $(el)
            var node = el.data('_gridstack_node')
            if (node && node._grid === self) {
              return false
            }
            return el.is(self.opts.acceptWidgets === true ? '.grid-stack-item' : self.opts.acceptWidgets)
          }
        })
        .on(self.container, 'dropover', function (event, ui) {
          var offset = self.container.offset()
          var el = $(ui.draggable)
          var cellWidth = self.cellWidth()
          var cellHeight = self.cellHeight()
          var origNode = el.data('_gridstack_node')

          var width = origNode ? origNode.width : (Math.ceil(el.outerWidth() / cellWidth))
          var height = origNode ? origNode.height : (Math.ceil(el.outerHeight() / cellHeight))

          draggingElement = el

          var node = self.grid._prepareNode({width: width, height: height, _added: false, _temporary: true})
          el.data('_gridstack_node', node)
          el.data('_gridstack_node_orig', origNode)

          el.on('drag', onDrag)
        })
        .on(self.container, 'dropout', function (event, ui) {
          var el = $(ui.draggable)
          if (!el.data('_gridstack_node')) {
            return
          }
          el.unbind('drag', onDrag)
          var node = el.data('_gridstack_node')
          node.el = null
          self.grid.removeNode(node)
          self.placeholder.detach()
          self._updateContainerHeight()
          el.data('_gridstack_node', el.data('_gridstack_node_orig'))
        })
        .on(self.container, 'drop', function (event, ui) {
          self.placeholder.detach()

          var node = $(ui.draggable).data('_gridstack_node')
          node._grid = self
          var el = $(ui.draggable).clone(false)
          el.data('_gridstack_node', node)
          var originalNode = $(ui.draggable).data('_gridstack_node_orig')
          if (typeof originalNode !== 'undefined' && typeof originalNode._grid !== 'undefined') {
            originalNode._grid._triggerRemoveEvent()
          }
          $(ui.helper).remove()
          node.el = el
          self.placeholder.hide()
          Utils.removePositioningStyles(el)
          el.find('div.ui-resizable-handle').remove()

          el.attr('data-gs-x', node.x)
            .attr('data-gs-y', node.y)
            .attr('data-gs-s', node.seq)
            .attr('data-gs-width', node.width)
            .attr('data-gs-height', node.height)
            .addClass(self.opts.itemClass)
            .enableSelection()
            .removeData('draggable')
            .removeClass('ui-draggable ui-draggable-dragging ui-draggable-disabled')
            .unbind('drag', onDrag)
          self.container.append(el)
          self._prepareElementsByNode(el, node)
          self._updateContainerHeight()
          self.grid._addedNodes.push(node)
          self._triggerAddEvent()
          self._triggerChangeEvent()

          self.grid.endUpdate()
          $(ui.draggable).unbind('drag', onDrag)
          $(ui.draggable).removeData('_gridstack_node')
          $(ui.draggable).removeData('_gridstack_node_orig')
        })
    }
  }

  GridStack.prototype._triggerChangeEvent = function (forceTrigger) {
    var elements = this.grid.getDirtyNodes()
    var hasChanges = false

    var eventParams = []
    if (elements && elements.length) {
      eventParams.push(elements)
      hasChanges = true
    }

    if (hasChanges || forceTrigger === true) {
      this.container.trigger('change', eventParams)
    }
  }

  GridStack.prototype._triggerAddEvent = function () {
    if (this.grid._addedNodes && this.grid._addedNodes.length > 0) {
      this.container.trigger('added', [_.map(this.grid._addedNodes, _.clone)])
      this.grid._addedNodes = []
    }
  }

  GridStack.prototype._triggerRemoveEvent = function () {
    if (this.grid._removedNodes && this.grid._removedNodes.length > 0) {
      this.container.trigger('removed', [_.map(this.grid._removedNodes, _.clone)])
      this.grid._removedNodes = []
    }
  }

  GridStack.prototype._initStyles = function () {
    if (this._stylesId) {
      Utils.removeStylesheet(this._stylesId)
    }
    this._stylesId = 'gridstack-style-' + (Math.random() * 100000).toFixed()
    this._styles = Utils.createStylesheet(this._stylesId)
    if (this._styles !== null) {
      this._styles._max = 0
    }
  }

  GridStack.prototype._updateStyles = function (maxHeight) {
    if (this._styles === null || typeof this._styles === 'undefined') {
      return
    }

    var prefix = '.' + this.opts._class + ' .' + this.opts.itemClass
    var self = this
    var getHeight

    if (typeof maxHeight == 'undefined') {
      maxHeight = this._styles._max
    }
    if (this._styles._max !== 0 && maxHeight <= this._styles._max) { // Keep this._styles._max increasing
      return
    }
    this._initStyles()
    this._updateContainerHeight()
    if (!this.opts.cellHeight) { // The rest will be handled by CSS
      return
    }

    if (!this.opts.verticalMargin || this.opts.cellHeightUnit === this.opts.verticalMarginUnit) {
      getHeight = function (nbRows, nbMargins) {
        return (self.opts.cellHeight * nbRows + self.opts.verticalMargin * nbMargins) +
          self.opts.cellHeightUnit
      }
    } else {
      getHeight = function (nbRows, nbMargins) {
        if (!nbRows || !nbMargins) {
          return (self.opts.cellHeight * nbRows + self.opts.verticalMargin * nbMargins) +
            self.opts.cellHeightUnit
        }
        return 'calc(' + ((self.opts.cellHeight * nbRows) + self.opts.cellHeightUnit) + ' + ' +
          ((self.opts.verticalMargin * nbMargins) + self.opts.verticalMarginUnit) + ')'
      }
    }

    if (this._styles._max === 0) {
      Utils.insertCSSRule(this._styles, prefix, 'min-height: ' + getHeight(1, 0) + ';', 0)
    }

    if (maxHeight > this._styles._max) {
      for (var i = this._styles._max; i < maxHeight; ++i) {
        Utils.insertCSSRule(this._styles,
          prefix + '[data-gs-height="' + (i + 1) + '"]',
          'height: ' + getHeight(i + 1, i) + ';',
          i
        )
        Utils.insertCSSRule(this._styles,
          prefix + '[data-gs-min-height="' + (i + 1) + '"]',
          'min-height: ' + getHeight(i + 1, i) + ';',
          i
        )
        Utils.insertCSSRule(this._styles,
          prefix + '[data-gs-max-height="' + (i + 1) + '"]',
          'max-height: ' + getHeight(i + 1, i) + ';',
          i
        )
        Utils.insertCSSRule(this._styles,
          prefix + '[data-gs-y="' + i + '"]',
          'top: ' + getHeight(i, i) + ';',
          i
        )
      }
      this._styles._max = maxHeight
    }
  }

  GridStack.prototype._updateContainerHeight = function () {
    if (this.grid._updateCounter) {
      return
    }
    var height = this.grid.getGridHeight()
    // check for css min height. Each row is cellHeight + verticalMargin, until last one which has no margin below
    var cssMinHeight = parseInt(this.container.css('min-height'))
    if (cssMinHeight > 0) {
      var minHeight = (cssMinHeight + this.opts.verticalMargin) / (this.cellHeight() + this.opts.verticalMargin)
      if (height < minHeight) {
        height = minHeight
      }
    }
    this.container.attr('data-gs-current-height', height)
    if (!this.opts.cellHeight) {
      return
    }
    if (!this.opts.verticalMargin) {
      this.container.css('height', (height * (this.opts.cellHeight)) + this.opts.cellHeightUnit)
    } else if (this.opts.cellHeightUnit === this.opts.verticalMarginUnit) {
      this.container.css('height', (height * (this.opts.cellHeight + this.opts.verticalMargin) -
        this.opts.verticalMargin) + this.opts.cellHeightUnit)
    } else {
      this.container.css('height', 'calc(' + ((height * (this.opts.cellHeight)) + this.opts.cellHeightUnit) +
        ' + ' + ((height * (this.opts.verticalMargin - 1)) + this.opts.verticalMarginUnit) + ')')
    }
  }

  GridStack.prototype._isOneColumnMode = function () {
    return (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) <=
      this.opts.minWidth
  }

  GridStack.prototype._setupRemovingTimeout = function (el) {
    var self = this
    var node = $(el).data('_gridstack_node')

    if (node._removeTimeout || !self.opts.removable) {
      return
    }
    node._removeTimeout = setTimeout(function () {
      el.addClass('grid-stack-item-removing')
      node._isAboutToRemove = true
    }, self.opts.removeTimeout)
  }

  GridStack.prototype._clearRemovingTimeout = function (el) {
    var node = $(el).data('_gridstack_node')

    if (!node._removeTimeout) {
      return
    }
    clearTimeout(node._removeTimeout)
    node._removeTimeout = null
    el.removeClass('grid-stack-item-removing')
    node._isAboutToRemove = false
  }

  GridStack.prototype._prepareElementsByNode = function (el, node) {
    var self = this

    var cellWidth
    var cellHeight

    var dragOrResize = function (event, ui) {
      let x = Math.round(ui.position.left / cellWidth)
      let y = Math.floor((ui.position.top + cellHeight / 2) / cellHeight)
      let width = null
      let height = null

      // 리사이즈 최대 너비를 3으로 제한
      if (event.type !== 'drag') {
        const calcWidth = Math.round(ui.size.width / cellWidth)
        width = (calcWidth > 3) ? 3 : calcWidth
        // height = Math.round(ui.size.height / cellHeight)
        height = 1
      }

      // X좌표가 범위를 벗어나면 return
      if (el.data('inTrashZone') || x < 0 || x >= self.grid.width || y < 0 || (!self.grid.float && y > self.grid.getGridHeight())) {
        if (!node._temporaryRemoved) {
          if (self.opts.removable === true) {
            self._setupRemovingTimeout(el)
          }

          x = node._beforeDragX
          y = node._beforeDragY
          //
          // self.placeholder.detach()
          // self.placeholder.hide()
          // self.grid.removeNode(node)
          // self._updateContainerHeight()
          // node._temporaryRemoved = true
        }
        // return
      }

      if (event.type === 'drag') {
        self._clearRemovingTimeout(el)

        if (node._temporaryRemoved) {
          self.grid.addNode(node)
          self.placeholder
            .attr('data-gs-x', x)
            .attr('data-gs-y', y)
            .attr('data-gs-width', width)
            .attr('data-gs-height', height)
            .show()
          self.container.append(self.placeholder)
          node.el = self.placeholder
          node._temporaryRemoved = false
        }
      } else if (event.type === 'resize') {
        if (x < 0) {
          return
        }
      }

      // 너비와 높이가 null이고, 리사이즈 이벤트가 아니라면 위젯의 직전 너비값을 불러옴.
      var lastTriedWidth = (width !== null) ? width : node.lastTriedWidth
      var lastTriedHeight = (height !== null) ? height : node.lastTriedHeight

      // 현재의 x, y 좌표로 이동이 가능한지 확인 -> 이동이 안되면 moveNode 메서드를 호출하지 않는다.
      if (!self.grid.canMoveNode(node, x, y, width, height) ||
        (node.lastTriedX === x && node.lastTriedY === y &&
          node.lastTriedWidth === lastTriedWidth && node.lastTriedHeight === lastTriedHeight)) {
        return
      }

      // 순위 변경 -> 순위는 드래그 / 드롭이 일어날 때만 발생한다.
      if (self.grid._swapWidgets(node, x, y, event.type)) {
        // 이동이 가능하면 마지막 x, y, 너비, 높이 정보를 갱신한다.
        node.lastTriedX = x
        node.lastTriedY = y
        node.lastTriedWidth = width
        node.lastTriedHeight = height

        // 위젯 이동 수행
        self.grid.moveNode(node, x, y, width, height)

        // Grid-stack 레이아웃의 너비를 재조정한다.
        self._updateContainerHeight()
      }
    }

    // 위젯을 드래그, 리사이즈 하기위해 클릭 후 마우스를 이동하면 호출된다. 이후에는 dragOrResize 메서드를 호출한다.
    var onStartMoving = function (event, ui) {
      // Placeholder 컨테이너 추가
      self.container.append(self.placeholder)
      var o = $(this)
      self.grid.cleanNodes()
      self.grid.beginUpdate(node)
      cellWidth = self.cellWidth()
      var strictCellHeight = Math.ceil(o.outerHeight() / o.attr('data-gs-height'))
      cellHeight = self.container.height() / parseInt(self.container.attr('data-gs-current-height'))
      self.placeholder
        .attr('data-gs-x', o.attr('data-gs-x'))
        .attr('data-gs-y', o.attr('data-gs-y'))
        .attr('data-gs-width', o.attr('data-gs-width'))
        .attr('data-gs-height', o.attr('data-gs-height'))
        .show()
      node.el = self.placeholder
      node._beforeDragX = node.x
      node._beforeDragY = node.y

      self.dd.resizable(el, 'option', 'minWidth', cellWidth * (node.minWidth || 1))
      self.dd.resizable(el, 'option', 'minHeight', strictCellHeight * (node.minHeight || 1))

      if (event.type == 'resizestart') {
        o.find('.grid-stack-item').trigger('resizestart')
      }
    }

    var onEndMoving = function (event, ui) {
      var o = $(this)
      if (!o.data('_gridstack_node')) {
        return
      }

      var forceNotify = false
      self.placeholder.detach()
      node.el = o
      self.placeholder.hide()

      if (node._isAboutToRemove) {
        forceNotify = true
        var gridToNotify = el.data('_gridstack_node')._grid
        gridToNotify._triggerRemoveEvent()
        el.removeData('_gridstack_node')
        el.remove()
      } else {
        self._clearRemovingTimeout(el)
        if (!node._temporaryRemoved) {
          Utils.removePositioningStyles(o)
          o.attr('data-gs-x', node.x)
            .attr('data-gs-y', node.y)
            .attr('data-gs-s', node.seq)
            .attr('data-gs-width', node.width)
            .attr('data-gs-height', node.height)
        } else {
          Utils.removePositioningStyles(o)
          o.attr('data-gs-x', node._beforeDragX)
            .attr('data-gs-y', node._beforeDragY)
            .attr('data-gs-s', node.seq)
            .attr('data-gs-width', node.width)
            .attr('data-gs-height', node.height)
          node.x = node._beforeDragX
          node.y = node._beforeDragY
          node._temporaryRemoved = false
          self.grid.addNode(node)
        }
      }
      self._updateContainerHeight()
      self._triggerChangeEvent(forceNotify)

      self.grid.endUpdate()

      var nestedGrids = o.find('.grid-stack')
      if (nestedGrids.length && event.type == 'resizestop') {
        nestedGrids.each(function (index, el) {
          $(el).data('gridstack').onResizeHandler()
        })
        o.find('.grid-stack-item').trigger('resizestop')
        o.find('.grid-stack-item').trigger('gsresizestop')
      }
      if (event.type == 'resizestop') {
        self.container.trigger('gsresizestop', o)
      }
    }

    this.dd
      .draggable(el, {
        start: onStartMoving,
        stop: onEndMoving,
        drag: dragOrResize
      })
      .resizable(el, {
        start: onStartMoving,
        stop: onEndMoving,
        resize: dragOrResize
      })

    if (node.noMove || (this._isOneColumnMode() && !self.opts.disableOneColumnMode) || this.opts.disableDrag ||
      this.opts.staticGrid) {
      this.dd.draggable(el, 'disable')
    }

    if (node.noResize || (this._isOneColumnMode() && !self.opts.disableOneColumnMode) || this.opts.disableResize ||
      this.opts.staticGrid) {
      this.dd.resizable(el, 'disable')
    }

    el.attr('data-gs-locked', node.locked ? 'yes' : null)
  }

  GridStack.prototype._prepareElement = function (el, triggerAddEvent) {
    triggerAddEvent = typeof triggerAddEvent != 'undefined' ? triggerAddEvent : false
    var self = this
    el = $(el)

    el.addClass(this.opts.itemClass)
    var node = self.grid.addNode({
      x: parseInt(el.attr('data-gs-x'), 10),
      y: parseInt(el.attr('data-gs-y'), 10),
      seq: parseInt(el.attr('data-gs-s'), 0),
      width: el.attr('data-gs-width'),
      height: el.attr('data-gs-height'),
      maxWidth: el.attr('data-gs-max-width'),
      minWidth: el.attr('data-gs-min-width'),
      maxHeight: el.attr('data-gs-max-height'),
      minHeight: el.attr('data-gs-min-height'),
      autoPosition: Utils.toBool(el.attr('data-gs-auto-position')),
      noResize: Utils.toBool(el.attr('data-gs-no-resize')),
      noMove: Utils.toBool(el.attr('data-gs-no-move')),
      locked: Utils.toBool(el.attr('data-gs-locked')),
      resizeHandles: el.attr('data-gs-resize-handles'),
      el: el,
      id: el.attr('data-gs-id'),
      _grid: self
    }, triggerAddEvent)
    el.data('_gridstack_node', node)

    this._prepareElementsByNode(el, node)
  }

  GridStack.prototype.setAnimation = function (enable) {
    if (enable) {
      this.container.addClass('grid-stack-animate')
    } else {
      this.container.removeClass('grid-stack-animate')
    }
  }

  GridStack.prototype.addWidget = function (el, x, y, width, height, autoPosition, minWidth, maxWidth, minHeight, maxHeight, id) {
    el = $(el)
    if (typeof x != 'undefined') { el.attr('data-gs-x', x) }
    if (typeof y != 'undefined') { el.attr('data-gs-y', y) }
    el.attr('data-gs-s', this.grid.nodes.length)
    if (typeof width != 'undefined') { el.attr('data-gs-width', width) }
    if (typeof height != 'undefined') { el.attr('data-gs-height', height) }
    if (typeof autoPosition != 'undefined') { el.attr('data-gs-auto-position', autoPosition ? 'yes' : null) }
    if (typeof minWidth != 'undefined') { el.attr('data-gs-min-width', minWidth) }
    if (typeof maxWidth != 'undefined') { el.attr('data-gs-max-width', maxWidth) }
    if (typeof minHeight != 'undefined') { el.attr('data-gs-min-height', minHeight) }
    if (typeof maxHeight != 'undefined') { el.attr('data-gs-max-height', maxHeight) }
    if (typeof id != 'undefined') { el.attr('data-gs-id', id) }
    this.container.append(el)
    this._prepareElement(el, true)
    this._triggerAddEvent()
    this._updateContainerHeight()
    this._triggerChangeEvent(true)

    return el
  }

  GridStack.prototype.makeWidget = function (el) {
    el = $(`#${el}`)

    this._prepareElement(el, true)
    this._triggerAddEvent()
    this._updateContainerHeight()
    this._triggerChangeEvent(true)

    return el
  }

  GridStack.prototype.willItFit = function (x, y, width, height, autoPosition) {
    var node = {x: x, y: y, width: width, height: height, autoPosition: autoPosition}
    return this.grid.canBePlacedWithRespectToHeight(node)
  }

  GridStack.prototype.removeWidget = function (el, detachNode) {
    detachNode = typeof detachNode === 'undefined' ? true : detachNode
    el = $(el)
    var node = el.data('_gridstack_node')

    // For Meteor support: https://github.com/troolee/gridstack.js/pull/272
    if (!node) {
      node = this.grid.getNodeDataByDOMEl(el)
    }

    this.grid.removeNode(node, detachNode)
    el.removeData('_gridstack_node')
    this._updateContainerHeight()
    if (detachNode) {
      el.remove()
    }
    this._triggerChangeEvent(true)
    this._triggerRemoveEvent()
  }

  GridStack.prototype.removeAll = function (detachNode) {
    _.each(this.grid.nodes, _.bind(function (node) {
      this.removeWidget(node.el, detachNode)
    }, this))
    this.grid.nodes = []
    this._updateContainerHeight()
  }

  GridStack.prototype.destroy = function (detachGrid) {
    $(window).off('resize', this.onResizeHandler)
    this.disable()
    if (typeof detachGrid != 'undefined' && !detachGrid) {
      this.removeAll(false)
      this.container.removeData('gridstack')
    } else {
      this.container.remove()
    }
    Utils.removeStylesheet(this._stylesId)
    if (this.grid) {
      this.grid = null
    }
  }

  GridStack.prototype.resizable = function (el, val) {
    var self = this
    el = $(el)
    el.each(function (index, el) {
      el = $(el)
      var node = el.data('_gridstack_node')
      if (typeof node == 'undefined' || node === null) {
        return
      }

      node.noResize = !(val || false)
      if (node.noResize || (self._isOneColumnMode() && !self.opts.disableOneColumnMode)) {
        self.dd.resizable(el, 'disable')
      } else {
        self.dd.resizable(el, 'enable')
      }
    })
    return this
  }

  GridStack.prototype.movable = function (el, val) {
    var self = this
    el = $(el)
    el.each(function (index, el) {
      el = $(el)
      var node = el.data('_gridstack_node')
      if (typeof node == 'undefined' || node === null) {
        return
      }

      node.noMove = !(val || false)
      if (node.noMove || (self._isOneColumnMode() && !self.opts.disableOneColumnMode)) {
        self.dd.draggable(el, 'disable')
        el.removeClass('ui-draggable-handle')
      } else {
        self.dd.draggable(el, 'enable')
        el.addClass('ui-draggable-handle')
      }
    })
    return this
  }

  GridStack.prototype.enableMove = function (doEnable, includeNewWidgets) {
    this.movable(this.container.children('.' + this.opts.itemClass), doEnable)
    if (includeNewWidgets) {
      this.opts.disableDrag = !doEnable
    }
  }

  GridStack.prototype.enableResize = function (doEnable, includeNewWidgets) {
    this.resizable(this.container.children('.' + this.opts.itemClass), doEnable)
    if (includeNewWidgets) {
      this.opts.disableResize = !doEnable
    }
  }

  GridStack.prototype.disable = function () {
    this.movable(this.container.children('.' + this.opts.itemClass), false)
    this.resizable(this.container.children('.' + this.opts.itemClass), false)
    this.container.trigger('disable')
  }

  GridStack.prototype.enable = function () {
    this.movable(this.container.children('.' + this.opts.itemClass), true)
    this.resizable(this.container.children('.' + this.opts.itemClass), true)
    this.container.trigger('enable')
  }

  GridStack.prototype.locked = function (el, val) {
    el = $(el)

    el.each(function (index, el) {
      el = $(el)
      var node = el.data('_gridstack_node')
      if (typeof node == 'undefined' || node === null) {
        return
      }

      node.locked = (val || false)
      el.attr('data-gs-locked', node.locked ? 'yes' : null)
    })
    return this
  }

  GridStack.prototype.maxHeight = function (el, val) {
    el = $(el)
    el.each(function (index, el) {
      el = $(el)
      var node = el.data('_gridstack_node')
      if (typeof node === 'undefined' || node === null) {
        return
      }

      if (!isNaN(val)) {
        node.maxHeight = (val || false)
        el.attr('data-gs-max-height', val)
      }
    })
    return this
  }

  GridStack.prototype.minHeight = function (el, val) {
    el = $(el)
    el.each(function (index, el) {
      el = $(el)
      var node = el.data('_gridstack_node')
      if (typeof node === 'undefined' || node === null) {
        return
      }

      if (!isNaN(val)) {
        node.minHeight = (val || false)
        el.attr('data-gs-min-height', val)
      }
    })
    return this
  }

  GridStack.prototype.maxWidth = function (el, val) {
    el = $(el)
    el.each(function (index, el) {
      el = $(el)
      var node = el.data('_gridstack_node')
      if (typeof node === 'undefined' || node === null) {
        return
      }

      if (!isNaN(val)) {
        node.maxWidth = (val || false)
        el.attr('data-gs-max-width', val)
      }
    })
    return this
  }

  GridStack.prototype.minWidth = function (el, val) {
    el = $(el)
    el.each(function (index, el) {
      el = $(el)
      var node = el.data('_gridstack_node')
      if (typeof node === 'undefined' || node === null) {
        return
      }

      if (!isNaN(val)) {
        node.minWidth = (val || false)
        el.attr('data-gs-min-width', val)
      }
    })
    return this
  }

  GridStack.prototype._updateElement = function (el, callback) {
    el = $(el).first()
    var node = el.data('_gridstack_node')
    if (typeof node == 'undefined' || node === null) {
      return
    }

    var self = this

    self.grid.cleanNodes()
    self.grid.beginUpdate(node)

    callback.call(this, el, node)

    self._updateContainerHeight()
    self._triggerChangeEvent()

    self.grid.endUpdate()
  }

  // 사용하지 않는 코드들 ...
  // GridStack.prototype.resize = function (el, width, height) {
  //   this._updateElement(el, function (el, node) {
  //     width = (width !== null && typeof width != 'undefined') ? width : node.width
  //     height = (height !== null && typeof height != 'undefined') ? height : node.height
  //
  //     this.grid.moveNode(node, node.x, node.y, width, height)
  //   })
  // }
  //
  // GridStack.prototype.move = function (el, x, y) {
  //   this._updateElement(el, function (el, node) {
  //     x = (x !== null && typeof x != 'undefined') ? x : node.x
  //     y = (y !== null && typeof y != 'undefined') ? y : node.y
  //     this.grid.moveNode(node, x, y, node.width, node.height)
  //   })
  // }

  // 변경된 노드의 좌표를 업데이트 합니다.
  GridStack.prototype.update = function (el, x, y, width, height) {
    this._updateElement(el, function (el, node) {
      x = (x !== null && typeof x != 'undefined') ? x : node.x
      y = (y !== null && typeof y != 'undefined') ? y : node.y
      this.grid.moveNode(node, x, y, width, height)
    })
  }

  GridStack.prototype.verticalMargin = function (val, noUpdate) {
    if (typeof val == 'undefined') {
      return this.opts.verticalMargin
    }

    var heightData = Utils.parseHeight(val)

    if (this.opts.verticalMarginUnit === heightData.unit && this.opts.height === heightData.height) {
      return
    }
    this.opts.verticalMarginUnit = heightData.unit
    this.opts.verticalMargin = heightData.height

    if (!noUpdate) {
      this._updateStyles()
    }
  }

  GridStack.prototype.cellHeight = function (val, noUpdate) {
    if (typeof val == 'undefined') {
      if (this.opts.cellHeight) {
        return this.opts.cellHeight
      }
      var o = this.container.children('.' + this.opts.itemClass).first()
      return Math.ceil(o.outerHeight() / o.attr('data-gs-height'))
    }
    var heightData = Utils.parseHeight(val)

    if (this.opts.cellHeightUnit === heightData.unit && this.opts.cellHeight === heightData.height) {
      return
    }
    this.opts.cellHeightUnit = heightData.unit
    this.opts.cellHeight = heightData.height

    if (!noUpdate) {
      this._updateStyles()
    }

  }

  GridStack.prototype.cellWidth = function () {
    return Math.round(this.container.outerWidth() / this.opts.width)
  }

  GridStack.prototype.getCellFromPixel = function (position, useOffset) {
    var containerPos = (typeof useOffset != 'undefined' && useOffset) ?
      this.container.offset() : this.container.position()
    var relativeLeft = position.left - containerPos.left
    var relativeTop = position.top - containerPos.top

    var columnWidth = Math.floor(this.container.width() / this.opts.width)
    var rowHeight = Math.floor(this.container.height() / parseInt(this.container.attr('data-gs-current-height')))

    return {x: Math.floor(relativeLeft / columnWidth), y: Math.floor(relativeTop / rowHeight)}
  }

  GridStack.prototype.batchUpdate = function () {
    this.grid.batchUpdate()
  }

  GridStack.prototype.commit = function () {
    this.grid.commit()
    this._updateContainerHeight()
  }

  GridStack.prototype.isAreaEmpty = function (x, y, width, height) {
    return this.grid.isAreaEmpty(x, y, width, height)
  }

  GridStack.prototype.setStatic = function (staticValue) {
    this.opts.staticGrid = (staticValue === true)
    this.enableMove(!staticValue)
    this.enableResize(!staticValue)
    this._setStaticClass()
  }

  GridStack.prototype._setStaticClass = function () {
    var staticClassName = 'grid-stack-static'

    if (this.opts.staticGrid === true) {
      this.container.addClass(staticClassName)
    } else {
      this.container.removeClass(staticClassName)
    }
  }

  /*
  현재 Grid-stack 레이아웃을 업데이트 합니다.
   */
  GridStack.prototype._updateNodeWidths = function (newColumns) {
    // 등록된 모든 노드 아이템 정렬
    this.grid._sortNodes()

    // 위젯의 X좌표 계산
    let currentCol = 0
    let currentRow = 0
    const nodes = this.grid.nodes

    for (let i = 0, max = nodes.length; i < max; i++) {
      // X축 좌표를 저장하는 변수 선언
      let currentX = 0
      const currentNode = nodes[i]

      // 첫번째 노드라면 currentRow 업데이트 후 위치 지정
      if (i === 0) {
        currentCol += currentNode.width
      } else {
        // (현재 Row 너비 + 현재 노드 너비) / 그리드 컬럼 갯수 => 아래로 내릴지? 지금 Row에 추가할지?
        let whetherCheck = Math.floor(newColumns / (currentCol + currentNode.width))

        // 변경 체크가 0일 경우, 다음 Row로 내리는 것으로 판단한다
        if (whetherCheck === 0) {
          // 현재 Row 너비 업데이트
          currentCol = currentNode.width
          currentRow += 1
        } else {
          // 이전노드 좌표 가져오기
          const beforeNode = nodes[i - 1]

          // 현재 Row 너비 업데이트
          currentCol += currentNode.width

          // CurrentRow - 1이 새로운 X축 좌표
          currentX = beforeNode.x + beforeNode.width
        }
      }

      // 노드 이동
      this.update(currentNode.el, currentX, currentRow, currentNode.width, undefined)
    }
  }
  /*
  현재 설정되어있는 Columns 값을 변경합니다. 레이아웃의 컨테이너 크기에 따라 3, 5, 6으로 변경합니다.
  */
  GridStack.prototype.setGridWidth = function (newColumns, doNotPropagate) {
    // 이전 컬럼 갯수 불러오기
    const oldColumns = this.opts.width
    // 그리드 Stack 클래스 제거
    this.container.removeClass('grid-stack-' + oldColumns)

    // 그리드 레이아웃 너비 업데이트
    this.grid.width = newColumns

    // 현재 레이아웃 정보 업데이트
    this.opts.width = newColumns

    // 보이지 않는 노드는 업데이트하지 않는지 여부
    if (doNotPropagate !== true) {
      // 위젯 너비 업데이트
      this._updateNodeWidths(newColumns)
    }

    // 새로운 클래스 추가. 반응형 위젯 크기 설정
    this.container.addClass('grid-stack-' + newColumns)

    // Gridstack 높이 조절
    this._updateContainerHeight()
  }

  GridStackEngine.prototype.batch_update = obsolete(GridStackEngine.prototype.batchUpdate)
  GridStackEngine.prototype._fix_collisions = obsolete(GridStackEngine.prototype._fixCollisions,
    '_fix_collisions', '_fixCollisions')
  GridStackEngine.prototype.is_area_empty = obsolete(GridStackEngine.prototype.isAreaEmpty,
    'is_area_empty', 'isAreaEmpty')
  GridStackEngine.prototype._sort_nodes = obsolete(GridStackEngine.prototype._sortNodes,
    '_sort_nodes', '_sortNodes')
  // GridStackEngine.prototype._pack_nodes = obsolete(GridStackEngine.prototype._packNodes,
  //   '_pack_nodes', '_packNodes')
  GridStackEngine.prototype._prepare_node = obsolete(GridStackEngine.prototype._prepareNode,
    '_prepare_node', '_prepareNode')
  GridStackEngine.prototype.clean_nodes = obsolete(GridStackEngine.prototype.cleanNodes,
    'clean_nodes', 'cleanNodes')
  GridStackEngine.prototype.get_dirty_nodes = obsolete(GridStackEngine.prototype.getDirtyNodes,
    'get_dirty_nodes', 'getDirtyNodes')
  GridStackEngine.prototype.add_node = obsolete(GridStackEngine.prototype.addNode,
    'add_node', 'addNode, ')
  GridStackEngine.prototype.remove_node = obsolete(GridStackEngine.prototype.removeNode,
    'remove_node', 'removeNode')
  GridStackEngine.prototype.can_move_node = obsolete(GridStackEngine.prototype.canMoveNode,
    'can_move_node', 'canMoveNode')
  GridStackEngine.prototype.move_node = obsolete(GridStackEngine.prototype.moveNode,
    'move_node', 'moveNode')
  GridStackEngine.prototype.get_grid_height = obsolete(GridStackEngine.prototype.getGridHeight,
    'get_grid_height', 'getGridHeight')
  GridStackEngine.prototype.begin_update = obsolete(GridStackEngine.prototype.beginUpdate,
    'begin_update', 'beginUpdate')
  GridStackEngine.prototype.end_update = obsolete(GridStackEngine.prototype.endUpdate,
    'end_update', 'endUpdate')
  GridStackEngine.prototype.can_be_placed_with_respect_to_height =
    obsolete(GridStackEngine.prototype.canBePlacedWithRespectToHeight,
      'can_be_placed_with_respect_to_height', 'canBePlacedWithRespectToHeight')
  GridStack.prototype._trigger_change_event = obsolete(GridStack.prototype._triggerChangeEvent,
    '_trigger_change_event', '_triggerChangeEvent')
  GridStack.prototype._init_styles = obsolete(GridStack.prototype._initStyles,
    '_init_styles', '_initStyles')
  GridStack.prototype._update_styles = obsolete(GridStack.prototype._updateStyles,
    '_update_styles', '_updateStyles')
  GridStack.prototype._update_container_height = obsolete(GridStack.prototype._updateContainerHeight,
    '_update_container_height', '_updateContainerHeight')
  GridStack.prototype._is_one_column_mode = obsolete(GridStack.prototype._isOneColumnMode,
    '_is_one_column_mode', '_isOneColumnMode')
  GridStack.prototype._prepare_element = obsolete(GridStack.prototype._prepareElement,
    '_prepare_element', '_prepareElement')
  GridStack.prototype.set_animation = obsolete(GridStack.prototype.setAnimation,
    'set_animation', 'setAnimation')
  GridStack.prototype.add_widget = obsolete(GridStack.prototype.addWidget,
    'add_widget', 'addWidget')
  GridStack.prototype.make_widget = obsolete(GridStack.prototype.makeWidget,
    'make_widget', 'makeWidget')
  GridStack.prototype.will_it_fit = obsolete(GridStack.prototype.willItFit,
    'will_it_fit', 'willItFit')
  GridStack.prototype.remove_widget = obsolete(GridStack.prototype.removeWidget,
    'remove_widget', 'removeWidget')
  GridStack.prototype.remove_all = obsolete(GridStack.prototype.removeAll,
    'remove_all', 'removeAll')
  GridStack.prototype.min_height = obsolete(GridStack.prototype.minHeight,
    'min_height', 'minHeight')
  GridStack.prototype.min_width = obsolete(GridStack.prototype.minWidth,
    'min_width', 'minWidth')
  GridStack.prototype._update_element = obsolete(GridStack.prototype._updateElement,
    '_update_element', '_updateElement')
  GridStack.prototype.cell_height = obsolete(GridStack.prototype.cellHeight,
    'cell_height', 'cellHeight')
  GridStack.prototype.cell_width = obsolete(GridStack.prototype.cellWidth,
    'cell_width', 'cellWidth')
  GridStack.prototype.get_cell_from_pixel = obsolete(GridStack.prototype.getCellFromPixel,
    'get_cell_from_pixel', 'getCellFromPixel')
  GridStack.prototype.batch_update = obsolete(GridStack.prototype.batchUpdate,
    'batch_update', 'batchUpdate')
  GridStack.prototype.is_area_empty = obsolete(GridStack.prototype.isAreaEmpty,
    'is_area_empty', 'isAreaEmpty')
  GridStack.prototype.set_static = obsolete(GridStack.prototype.setStatic,
    'set_static', 'setStatic')
  GridStack.prototype._set_static_class = obsolete(GridStack.prototype._setStaticClass,
    '_set_static_class', '_setStaticClass')

  scope.GridStackUI = GridStack

  scope.GridStackUI.Utils = Utils
  scope.GridStackUI.Engine = GridStackEngine
  scope.GridStackUI.GridStackDragDropPlugin = GridStackDragDropPlugin

  $.fn.gridstack = function (opts) {
    return this.each(function () {
      var o = $(this)

      if (!o.data('gridstack')) {
        o.data('gridstack', new GridStack(this, opts))
      }
    })
  }

  return scope.GridStackUI
})
