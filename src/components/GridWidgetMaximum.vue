<template>
  <div class="grid-widget-modal">
    <transition name="modal">
      <div class="grid-widget-maximum-background">
        <div class="grid-widget-maximum">
          <div class="grid-widget-maximum-tool">
            <div style="flex-grow:1"></div>
            <button>차트 변경</button>
            <button @click="$emit('closeMaximumWidget')">닫기</button>
          </div>
          <div class="grid-widget-maximum-content"></div>
          <div class="grid-widget-maximum-control"></div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
  export default {
    name: 'GridWidgetMaxium',
    components: {},
    directives: {},
    mixins: [],
    data () {
      return {}
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
    methods: {},
    watch: {}
  }
</script>

<style scoped>
  .grid-widget-modal {
    width: 100%;
    height: 100%;
  }

  .grid-widget-maximum-background {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .5);
    display: table;
  }

  .grid-widget-maximum {
    display: flex;
    flex-direction: column;
    width: calc(100% - 42px);
    height: 100%;
    margin: 0 auto;
    padding: 20px;

    border: 1px solid lime;
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  }

  .grid-widget-maximum-tool {
    display: flex;
    border: 1px solid blue;
    padding: 10px;
    margin-bottom: 10px;
  }

  .grid-widget-maximum-content {
    flex-grow: 1;
    border: 1px solid red;
  }

</style>