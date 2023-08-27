import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AdminView from "@/views/AdminView.vue";
import LayoutView from "@/views/Layout.vue";
import LoginView from "@/views/LoginView.vue";
import TecView from "@/views/TecView";
Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name:'Login',
    component:LoginView
  },
  {
    path: '/',
    name: 'Layout',
    component: LayoutView,
    children: [
      {
        path: '/',
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
  },
      {
        path: '/tec',
        name: 'Tec',
        component: () => import('../views/TecView.vue')
      }

    ]
  },

]

const router = new VueRouter({
  mode: 'history',
  routes
})

router.beforeEach((to,form,next) => {
    if(to.path === '/login'){
      next()
    }
    const user =localStorage.getItem("user")
  if (!user && to.path !== "/login"){
    return next("/login")
  }
    next()
})
export default router
