const defaultWidgetOptions = {
  x: 0,
  y: 0,
  w: 1,
  h: 1,
  minWidth: 1,
  maxWidth: 3,
  minHeight: 1,
  maxHeight: 2,
  autoPosition: true
}

export function createGridLayout (target, options = {}) {
  $(target).gridstack(options)
}

export function getLayoutColumn (target) {
  // 레이아웃 가져오기
  const layout = $(target).data('gridstack')

  // 레이아웃 컬럼 갯수 리턴
  return layout.grid.width
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