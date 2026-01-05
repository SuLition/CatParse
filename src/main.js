import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

const app = createApp(App)
app.mount('#app')

// Vue 挂载完成后显示窗口
import { getCurrentWindow } from '@tauri-apps/api/window'
getCurrentWindow().show()
