<template>
  <div class="grid-stack">
    <grid-widget v-for="widget in widgets"
                 :x="widget.x"
                 :y="widget.y"
                 :w="widget.w"
                 :h="widget.h"
                 :i="widget.i"
                 :s="widget.s"
                 :key="widget.i"
                 :title="widget.title"
                 :isLock="widget.isLock"
                 :isMove="widget.isMove"
                 :isResize="widget.isResize"
                 @openMaximumWidget="openMaximumWidget"
    >
    </grid-widget>
    <grid-widget-maximum v-show="showMaximum"
                         @closeMaximumWidget="closeMaximumWidget"
    >
      {{ }}
    </grid-widget-maximum>
  </div>
</template>
<script>
  // Util.JS 불러오기
  import {createGridLayout, setLayoutColumns, getLayoutColumn} from '../js/utils'

  // Widget 불러오기
  import GridWidget from './GridWidget.vue'
  import GridWidgetMaximum from './GridWidgetMaximum'

  export default {
    name: 'GridLayout',
    components: {
      GridWidget,
      GridWidgetMaximum
    },
    directives: {},
    mixins: [],
    props: {
      isLock: {
        type: Boolean,
        default: false
      },
      options: {
        type: Object,
        default () {
          return {}
        }
      },
      widgets: {
        type: Array,
        default () {
          return []
        }
      }
    },
    data () {
      return {
        showMaximum: false
      }
    },
    computed: {},
    beforeCreate () {},
    created () {
      window.addEventListener('resize', this.onResizeLayout)
    },
    beforeMount () {},
    mounted () {
      this.$nextTick(function () {
        // 원컬럼모드 제거
        this.options.disableOneColumnMode = true
        // 기본 설정 - 최소 너비, 높이 설정
        this.options.minWidth = 1
        this.options.maxWidth = 3
        this.options.cellHeight = '300px'
        // 애니메이션 추가
        this.options.animate = true
        // Grid layout 초기화
        createGridLayout('.grid-stack', this.options)
        // 그리드 사이즈 조절
        this.onResizeLayout()
      })
    },
    beforeUpdate () {},
    updated () {},
    activated () {},
    deactivated () {},
    beforeDestroy () {
      window.removeEventListener('resize', this.onResizeLayout)
    },
    destroyed () {},
    errorCaptured () {},
    methods: {
      onResizeLayout () {
        // 0. 브라우저 영역 구하기
        const layout = '.grid-stack'
        const layoutWidth = this.$el.clientWidth
        // 1. 레이아웃 변경 - 컬럼갯수 및 노드 업데이트 처리
        if (layoutWidth >= 1920) {
          if (getLayoutColumn(layout) !== 6) {
            setLayoutColumns(layout, 6)
          }
        } else if (layoutWidth >= 1600 && layoutWidth < 1920) {
          if (getLayoutColumn(layout) !== 5) {
            setLayoutColumns(layout, 5)
          }
        } else {
          if (getLayoutColumn(layout) !== 3) {
            setLayoutColumns(layout, 3)
          }
        }
      },
      openMaximumWidget (content) {
        this.showMaximum = true
      },
      closeMaximumWidget () {
        this.showMaximum = false
      }
    },
    watch: {}
  }
</script>

<style scoped>
</style>