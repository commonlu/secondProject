import { createApp } from 'vue'
import App from './App.vue'

import router from './routers/router.js'

// 1. 引入 Element Plus 及其样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 1.1 引入 Element Plus 图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 2. 引入 Axios
import axios from 'axios'

const app = createApp(App)

// 全局注册 Element Plus 图标组件，方便在任何地方直接使用 <el-icon><User /></el-icon> 等
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 3. 全局配置 Axios
//    设置基础URL，这样后面所有请求都会自动在前面加上这个地址
axios.defaults.baseURL = 'http://47.107.75.215:8080' // 你的Spring Boot后端地址
//    可选：将axios挂载到全局，方便在任何组件中使用 this.$axios
app.config.globalProperties.$axios = axios

// 3.1 请求拦截器：自动在请求头中携带 JWT（如果存在）
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

app.use(router)
app.use(ElementPlus) // 使用Element Plus
app.mount('#app')
