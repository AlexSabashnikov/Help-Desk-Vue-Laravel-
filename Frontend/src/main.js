import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { sessionHandler } from './utils/session.handler'
import App from './App.vue'
import router from './router'

// Инициализируем session handler
sessionHandler.init()

const app = createApp(App)
const pinia = createPinia()

// Сначала устанавливаем pinia
app.use(pinia)

app.use(router)

app.mount('#app')




