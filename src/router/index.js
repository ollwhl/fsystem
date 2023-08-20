import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AdminView from "@/views/AdminView.vue";
import LayoutView from "@/views/Layout.vue";
import LoginView from "@/views/LoginView.vue";

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name:'Login',
    component:LoginView
  },
  {
    path: '/access',
    name: 'Layout',
    component: LayoutView,
    children: [
      {
        path: '',
        name: 'home',
        component: HomeView,
      },
      {
        path: '/admin',
        name: 'admin',
        component: AdminView,
      },

  {
    path: '/stuff',
    name: 'stuff',
    component: () => import( '../views/StuffView.vue')
  },

  {
    path: '/log',
    name: 'log',
    component: () => import('../views/LogView.vue')
  },

  {
    path: '/parts',
    name: 'parts',
    component: () => import( '../views/PartsView.vue')
  }
    ]
  },

]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
