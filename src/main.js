import {createApp} from 'vue'
import App from './App.vue'
import {createPinia} from "pinia";
import router from './router'; // 라우터 가져오기


const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')