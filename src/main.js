import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/theme-chalk/index.css';
import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
// import locale from 'element-plus/lib/locale/lang/zh-cn'
import "./assets/styles/element-variables.scss"
import "@/assets/icons/css/all.css"
import state from "@/store/state";


//是否为pc端
let is_mobile = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
if (is_mobile != null){
    state.is_pc = false
}

const app = createApp(App)

app.use(ElementPlus,).use(mavonEditor)
    .use(router).use(store)
    .mount('#app')
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
