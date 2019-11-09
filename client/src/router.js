import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "Search",
      component: () => import("./modules/Search/page/Search.vue")
    },
    {
      path: "/about",
      name: "About",
      component: () => import("./modules/About/page/About.vue")
    }
  ]
});
