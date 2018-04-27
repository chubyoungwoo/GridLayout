export function createGridLayout (target, options = {}) {
  $(target).gridstack(options)
}

export function getLayoutColumn (target) {
  // 레이아웃 가져오기
  const layout = $(target).data('gridstack')
  // 레이아웃 컬럼 갯수 리턴
  return layout.getGridWidth()
}

export function setLayoutColumns (target, columns) {
  // 레이아웃 가져오기
  const layout = $(target).data('gridstack')
  // 레이아웃 컬럼설정
  layout.setGridWidth(columns)
}

export function makeWidget (target, widgetId) {
  // 레이아웃 가져오기
  const layout = $(target).data('gridstack')
  // 위젯클래스 맵핑
  layout.makeWidget(widgetId)
}

export function lockWidget (target, el, locked = true) {
  // 레이아웃 가져오기
  const layout = $(target).data('gridstack')
  // 위젯클래스 맵핑
  layout.locked(el, locked)
}

export function movableWidget (target, el, movable = true) {
  // 레이아웃 가져오기
  const layout = $(target).data('gridstack')
  // 위젯클래스 맵핑
  layout.movable(el, movable)
}

export function resizableWidget (target, el, resizable = true) {
  // 레이아웃 가져오기
  const layout = $(target).data('gridstack')
  // 위젯클래스 맵핑
  layout.resizable(el, resizable)
}

export function removeWidget (target, el, options = true) {
  // 레이아웃 가져오기
  const layout = $(target).data('gridstack')
  // 위젯 제거
  layout.removeWidget(el, options)
}

export function removeAllWidgets (target) {
  // 레이아웃 가져오기
  const layout = $(target).data('gridstack')
  // 모든 위젯 제거
  layout.removeAll()
}

export function loadLayout (target, callback) {}

export function saveLayout (target, callback) {
  //0. 활성화 되어있는 위젯정보 가져오기
  const layout = $(target).data('gridstack')
  // 1. 활성화 되어있는 위젯정보 깊은복사
  callback(layout.grid.nodes.slice())
}