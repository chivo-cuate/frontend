import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import VProgress from '@/components/VProgress'
import AxiosComponent from '@/components/Axios'
import vuetify from './plugins/vuetify';

Vue.use(Vuetify)
Vue.config.productionTip = false
Vue.component('VProgress', VProgress)
Vue.component('AxiosComponent', AxiosComponent)

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
