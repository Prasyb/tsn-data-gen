import { createApp } from 'vue'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './assets/styles/index.scss'
import ElementPlus from 'element-plus'
import * as Icons from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router/route'
import { createPinia } from 'pinia'

const app = createApp(App)

const store = createPinia()

Object.keys(Icons).forEach((key) => {
  app.component(key, Icons[key as keyof typeof Icons])
})

app.use(router).use(store).use(ElementPlus).mount('#app')
