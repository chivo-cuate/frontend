import Vue from 'vue'
import Router from 'vue-router'
import store from './store.js'

Vue.use(Router)

let routes = [
  {
    path: '/404',
    name: '404',
    meta: {
      requiresAuth: false
    },
    component: function () {
      return import('@/components/NotFound')
    }
  },
  {
    path: '/403',
    name: '403',
    meta: {
      requiresAuth: false
    },
    component: function () {
      return import('@/components/NotAllowed')
    }
  },
  {
    path: '/',
    name: 'home',
    meta: {
      requiresAuth: true
    },
    component: function () {
      return import('@/components/Home')
    }
  },
  {
    path: '/inicio',
    name: 'inicio',
    meta: {
      requiresAuth: true
    },
    component: function () {
      return import('@/components/Home')
    }
  },
  {
    path: '/test',
    name: 'test',
    meta: {
      requiresAuth: false
    },
    component: function () {
      return import('@/components/Test')
    }
  },
  {
    path: '/about',
    name: 'about',
    component: function () {
      return import('@/views/About.vue')
    }
  },
  {
    path: '/acceso/:action',
    name: 'acceso',
    meta: {
      requiresAnon: true
    },
    component: function () {
      return import('@/components/Auth')
    }
  },
  {
    path: '/perfil',
    name: 'perfil',
    meta: {
      requiresAuth: true
    },
    component: function () {
      return import('@/components/MyProfile')
    }
  },
  {
    path: '/clientes/ordenes',
    name: 'ordenes',
    meta: {
      requiresAuth: true
    },
    component: function () {
      return import('@/components/orders/OrdersIndex')
    }
  },
  {
    path: '/sucursal/:action',
    name: 'sucursal',
    meta: {
      requiresAuth: true,
    },
    component: function () {
      return import('@/components/branch/Branch')
    }
  },
  {
    path: '/sucursales/:action',
    name: 'sucursales',
    meta: {
      requiresAuth: true,
    },
    component: function () {
      return import('@/components/branches/Branches')
    }
  },
  {
    path: '/seguridad/:action',
    name: 'security',
    meta: {
      requiresAuth: true,
    },
    component: function () {
      return import('@/components/security/Security')
    }
  },
  {
    path: '/activate-account/:token',
    name: 'activate-account',
    meta: {
      requiresAnon: true
    },
    component: function () {
      return import('@/components/ActivateAccount')
    }
  },
  {
    path: '/productos/:action',
    name: 'productos',
    meta: {
      requiresAuth: true
    },
    component: function () {
      return import('@/components/assets/Assets')
    }
  },
  {
    path: '*',
    name: 'not-found',
    meta: {
      requiresAuth: false
    },
    component: function () {
      return import('@/components/NotFound')
    }
  },
]

let router = new Router({
  //mode: 'history',
  base: process.env.BASE_URL,
  routes: routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    if (store.getters.isGuest) {
      store.commit('setAuthRouteRequested', to.path)
      next('/acceso/iniciar-sesion')
    } else {
      next()
    }
  } else if (to.meta.requiresAnon) {
    if (!store.getters.isGuest) {
      next('/')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router