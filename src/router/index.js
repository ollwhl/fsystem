import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import(/* webpackChunkName: "about" */ '../views/AdminView.vue')
  },
  {
    path: '/log',
    name: 'log',
    component: () => import(/* webpackChunkName: "about" */ '../views/LogView.vue')
  },
  {
    path: '/stuff',
    name: 'stuff',
    component: () => import(/* webpackChunkName: "about" */ '../views/StuffView.vue')
  },
  {
    path: '/parts',
    name: 'parts',
    component: () => import(/* webpackChunkName: "about" */ '../views/PartsView.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
