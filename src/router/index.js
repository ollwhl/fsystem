import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AdminView from "@/views/AdminView.vue";
import LayoutView from "@/views/Layout.vue";
import LoginView from "@/views/LoginView.vue";

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
    path: '/log',
    name: 'log',
    component: () => import('../views/LogView.vue')
  },


      {
        path: '/product',
        name: 'product',
        component: () => import('../views/ProductView.vue')
      },


      {
        path: '/factory',
        name: 'Factory',
        component: () => import('../views/FactoryView.vue')
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
      },
      {
        path: '/newplan',
        name: 'newPlan',
        component: () => import('../views/Planview.vue')
      },
      {
        path: '/oldplan',
        name: 'oldPlan',
        component: () => import('../views/oldPlanview.vue')
      },
    {
      path: '/notice',
      name: 'notice',
    component: () => import('../views/Notice.vue')
    },
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
