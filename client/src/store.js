import Vue from "vue";
import Vuex from "vuex";
import searchModule from "./modules/Search/store";
import commonModule from "./modules/Common/store";

Vue.use(Vuex);
export default new Vuex.Store({
  modules: {
    search: searchModule,
    common: commonModule
  }
});
