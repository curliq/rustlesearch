import Vue from "vue";
import Notifications from "vue-notification";
import vSelect from "vue-select";
import VueTheMask from "vue-the-mask";
import TextHighlight from "vue-text-highlight";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import "./modules/Common";
import "./main.css";

Vue.use(Notifications);
Vue.use(VueTheMask);
Vue.component("text-highlight", TextHighlight);
Vue.component("v-select", vSelect);
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
