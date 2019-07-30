import Vue from 'vue'
import Router from 'vue-router'
import store from './store.js'

Vue.use(Router)

let routes = [
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
    path: '/',
    name: 'root',
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
    path: '/inicio',
    name: 'inicio',
    component: function () {
      return import('@/components/Home')
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
    path: '/ordenes',
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
      //roles: ['Gerente']
    },
    component: function () {
      return import('@/components/branch/Branch')
    }
  },
  {
    path: '/seguridad/:action',
    name: 'security',
    meta: {
      requiresAuth: true,
      //roles: ['Administrador del Sistema']
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
  }
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
      next('/')
    } else if (to.meta.hasOwnProperty('roles')) {
      let found = false
      for (let i in to.meta.roles) {
        if (store.getters.getRoles.includes(to.meta.roles[i])) {
          found = true
          break
        }
      }
      if (found) {
        next()
      } else {
        next('/not-allowed')
      }
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