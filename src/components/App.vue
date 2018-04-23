<template>
  <div class="app">
    <div class="btn_container">
      <button @click="onClickAddWidget">위젯 추가</button>
      <button @click="onClickLayoutLocked">레이아웃 {{ isLocked ? '잠금 해제' : '잠금' }}</button>
      <button @click="onClickResetLayout">레이아웃 초기화</button>
    </div>
    <grid-layout ref="layout"
                 :style="style"
                 :widgets="widgets"
                 :options="options"
    >
    </grid-layout>
  </div>
</template>
<script>
  import * as Utils from '../js/utils.js'
  import GridLayout from './GridLayout.vue'

  export default {
    name: 'App',
    components: {
      GridLayout
    },
    directives: {},
    mixins: [],
    data () {
      return {
        style: {
          border: '1px solid red'
        },
        locked: false,
        options: {
          cellHeight: '300px'
        },
        widgets: []
      }
    },
    computed: {
      isLocked: {
        get () {
          return this.locked
        },
        set (value) {
          this.locked = value
        }
      }
    },
    beforeCreate () {},
    created () {
      // 서버에서 위젯의 정보를 불러왔다고 가정
      const loadWidgets = [
        {
          i: 'widget_1',
          title: '1',
          isLock: false,
          isMove: true,
          isResize: true
        },
        {
          i: 'widget_2',
          title: '2',
          isLock: false,
          isMove: true,
          isResize: true
        },
        {
          i: 'widget_3',
          title: '3',
          isLock: false,
          isMove: true,
          isResize: true
        },
        {
          i: 'widget_4',
          title: '4',
          isLock: false,
          isMove: true,
          isResize: true
        },
        {
          i: 'widget_5',
          title: '5',
          isLock: false,
          isMove: true,
          isResize: true
        },
        {
          i: 'widget_6',
          title: '6',
          isLock: false,
          isMove: true,
          isResize: true
        }
      ]

      // 불러온 정보를 모델에 추가
      this.widgets = loadWidgets
    },
    beforeMount () {},
    mounted () {
      console.log('App mounted !!')
    },
    beforeUpdate () {},
    updated () {},
    activated () {},
    deactivated () {},
    beforeDestroy () {},
    destroyed () {},
    errorCaptured () {},
    methods: {
      onClickAddWidget () {
        // 새로운 위젯 정보 생성
        const newWidget = {
          i: `widget_${this.widgets.length + 1}`,
          title: `${this.widgets.length + 1}`
        }

        // 위젯 정보 모델에 추가
        this.widgets.push(newWidget)

        // Util makeWidget 호출 - Mounte 된 후에 호출
        this.$nextTick(function () {
          Utils.makeWidget('.grid-stack', newWidget.i)
        })
      },
      onClickResetLayout () {
        // DOM에서 위젯 제거
        Utils.removeAllWidgets('.grid-stack')

        // 위젯을 저장하고 있는 모델 빈 배열로 초기화
        this.widgets = []
      },
      onClickLayoutLocked () {
        // 잠금상태 변경
        this.isLocked = !this.isLocked
        const currentLocked = this.isLocked
        // 모델 변경
        for (let i = 0, max = this.widgets.length; i < max; i++) {
          const widget = this.widgets[i]
          widget.isLock = currentLocked ? true : false
          widget.isMove = currentLocked ? false : true
          widget.isResize = currentLocked ? false : true
        }
      }
    },
    watch: {}
  }
</script>

<style>
  html,
  body {
    height: 100%;
  }

  .app {
    display: flex;
    flex-direction: column;

    padding: 10px;
  }

  .btn_container {
    display: flex;

    padding: 0;
    margin-bottom: 10px;
  }

  .btn_container button {
    margin-right: 10px;
  }
</style>