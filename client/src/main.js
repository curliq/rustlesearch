import Vue from "vue";
import Notifications from "vue-notification";
import vSelect from "vue-select";
import VueTheMask from "vue-the-mask";
import VueScrollTo from "vue-scrollto";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "vue-select/dist/vue-select.css";

import "./modules/Common";
import "./main.css";

Vue.use(Notifications);
Vue.use(VueTheMask);
Vue.use(VueScrollTo);
Vue.component("v-select", vSelect);
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
