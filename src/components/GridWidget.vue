<template>
  <div class="grid-stack-item"
       :id="i"
       :data-gs-x="x"
       :data-gs-y="y"
       :data-gs-w="w"
       :data-gs-h="h"
       :data-gs-s="s"
       :data-gs-locked="isLock"
       :data-gs-no-move="!isMove"
       :data-gs-no-resize="!isResize"
       :data-gs-auto-position="autoPosition"
  >
    <div class="grid-stack-item-content">
      <div class="grid-stack-item-content-toolbar">
        <div style="flex-grow: 1">
          {{ title }} {{ s }}
        </div>
        <div>
          <button @click="onClickMaximumWidget">최대화</button>
          <button @click="onClickLockedWidget">{{ lockState }}</button>
          <button @click="onClickRemoveWidget">삭제</button>
        </div>
      </div>
      <slot></slot>
    </div>
  </div>
</template>
<script>
  import * as Utils from '../js/utils.js'

  export default {
    name: 'GridWidget',
    components: {},
    directives: {},
    mixins: [],
    props: {
      x: {
        type: [Number, String],
        default: 0
      },
      y: {
        type: [Number, String],
        default: 0
      },
      w: {
        type: [Number, String],
        default: 1
      },
      h: {
        type: [Number, String],
        default: 1
      },
      i: {
        type: String,
        required: true
      },
      s: {
        type: [Number, String],
        required: true
      },
      title: String,
      isLock: {
        type: Boolean,
        default: false
      },
      isMove: {
        type: Boolean,
        default: true
      },
      isResize: {
        type: Boolean,
        default: true
      },
      autoPosition: {
        type: Boolean,
        default: true
      }
    },
    data () {
      return {
        lockState: this.isLock ? '해제' : '고정'
      }
    },
    computed: {},
    beforeCreate () {},
    created () {},
    beforeMount () {},
    mounted () {},
    beforeUpdate () {},
    updated () {},
    activated () {},
    deactivated () {},
    beforeDestroy () {},
    destroyed () {},
    errorCaptured () {},
    methods: {
      onClickLockedWidget () {
        // 잠금여부 처리
        Utils.lockWidget('.grid-stack', this.$el, this.$el.getAttribute('data-gs-locked') === 'yes' ? false : true)

        // 문구 변경
        this.lockState = this.$el.getAttribute('data-gs-locked') === 'yes' ? '해제' : '고정'
      },
      onClickRemoveWidget () {
        // DOM에서 위젯을 제거
        Utils.removeWidget('.grid-stack', this.$el)
      },
      onClickMaximumWidget () {}
    },
    watch: {
      isMove (value) {
        Utils.movableWidget('.grid-stack', this.$el, value)
      },
      isLock (value) {
        Utils.lockWidget('.grid-stack', this.$el, value)
        this.lockState = this.$el.getAttribute('data-gs-locked') === 'yes' ? '해제' : '고정'
      },
      isResize (value) {
        Utils.resizableWidget('.grid-stack', this.$el, value)
      }
    }
  }
</script>

<style>
  .grid-stack-item-content {
    display: flex;
    flex-direction: column;

    border: 1px solid black;
  }

  .grid-stack-item-content-toolbar {
    display: flex;
    padding: 10px;
    box-sizing: padding-box;
  }
</style>