import Vue from 'vue'
import Router from 'vue-router'
import About from './views/About'
Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('./views/Home')
    },
    {
      path: '/about',
      name: 'About',
      component: About
    }
  ]
})
