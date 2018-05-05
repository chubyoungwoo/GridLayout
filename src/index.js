// Gridstack css import
import './scss/gridstack.scss'
import './scss/gridstack-extra.scss'

// Gridstack Import
import './app'
import './layout/gridstack.js'
import './layout/gridstack.jQueryUI.js'

import Vue from 'vue'
import VGridLayout from './components/GridLayout'
import VGridWidget from './components/GridWidget'
import VGridWidgetMax from './components/GridWidgetMaximum'

export default {
  install () {
    Vue.component(VGridLayout.name, VGridLayout)
    Vue.component(VGridWidget.name, VGridWidget)
    Vue.component(VGridWidgetMax.name, VGridWidgetMax)
  }
}