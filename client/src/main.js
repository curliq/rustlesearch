import Vue from "vue";
import Notifications from "vue-notification";
import vSelect from "vue-select";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "vue-select/dist/vue-select.css";

import "./global-base-components";
import "./main.css";

Vue.use(Notifications);
Vue.component("v-select", vSelect);
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
