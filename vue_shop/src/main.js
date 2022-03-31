import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
//导入字体图标样式
// import './assets/fonts/iconfont.css'

// 第三方树型表格插件
import TreeTable from 'vue-table-with-tree-grid'
// 全局注册
Vue.component('tree-table', TreeTable)

import axios from 'axios'
// 将axios挂载到vue的原型对象上
Vue.prototype.$http = axios
// 设置axios请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

// 可以阻止 vue 在启动时生成生产提示
// 开发环境下，Vue 会提供很多警告来帮你对付常见的错误与陷阱。而在生产环境下，这些警告语句却没有用，反而会增加应用的体积。此外，有些警告检查还有一些小的运行时开销，这在生产环境模式下是可以避免的
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
