import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Toast, { POSITION } from 'vue-toastification';
import 'vue-toastification/dist/index.css';

const app = createApp(App);
app.use(Toast, {
    position: 'top-center',
    timeout: false,        
    closeOnClick: true,
    pauseOnHover: true,
    draggable: false,
    hideProgressBar: true,
  });
app.use(router).mount('#app')
