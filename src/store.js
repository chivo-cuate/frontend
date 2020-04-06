import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersist from 'vuex-persist'

Vue.use(Vuex)

const vuexLocal = new VuexPersist({
  key: 'chivo-cuate-app',
  storage: localStorage
})

export default new Vuex.Store({
  state: {
    themeColor: 'light-green',
    authRouteRequested: null,
    debug: true,
    payload: {
      is_guest: true,
      user_id: null,
      name: null,
      curr_branch: {},
      branches: [],
      jwt: null,
      permissions: [],
      roles: [],
      cooks: [],
      chosen_cooks: [],
    }
  },
  mutations: {
    updatePayload(state, payload) {
      state.payload = payload
    },
    setCurrBranch(state, branch) {
      state.payload.curr_branch = branch
    },
    setAuthRouteRequested(state, authRouteRequested) {
      state.authRouteRequested = authRouteRequested
    },
    setChosenCooks(state, cooks) {
      state.payload.chosen_cooks = cooks
    },
    logout(state) {
      state.authRouteRequested = null
      state.payload = {
        is_guest: true,
        user_id: null,
        name: null,
        curr_branch: {},
        branches: [],
        jwt: null,
        permissions: [],
        roles: [],
        cooks: [],
        chosen_cooks: [],
      }
    }
  },
  actions: {},
  getters: {
    isGuest: state => {
      return state.payload.roles.length === 0
    },
    isAdmin: state => {
      return state.payload.roles.includes("Administrador del Sistema")
    },
    isManager: state => {
      return state.payload.roles.includes("Gerente de Sucursal")
    },
    isWaiter: state => {
      return state.payload.roles.includes("Mesero")
    },
    isCook: state => {
      return state.payload.roles.includes("Elaborador")
    },
    getUserPermissions: state => {
      return state.payload.permissions
    },
    getSecurityPermissions: state => {
      let res = [];
      state.payload.permissions.forEach(element => {
        if (element.name === "Seguridad") {
          res = element.subModules
        }
      });
      return res;
    },
    getBranchPermissions: state => {
      let res = [];
      state.payload.permissions.forEach(element => {
        if (element.name === "Mi Sucursal") {
          res = element.subModules
        }
      });
      return res;
    },
    getBranchesPermissions: state => {
      let res = [];
      state.payload.permissions.forEach(element => {
        if (element.name === "Sucursales") {
          res = element.subModules
        }
      });
      return res;
    },
    getOrdersPermissions: state => {
      let res = [];
      state.payload.permissions.forEach(element => {
        if (element.name === "Clientes") {
          res = element.subModules
        }
      });
      return res;
    },
    getCurrBranch: state => {
      return state.payload.curr_branch;
    },
    getBranches: state => {
      return state.payload.branches
    },
    getRoles: state => {
      return state.payload.roles
    },
    getCooks: state => {
      return state.payload.cooks
    },
    getChosenCooks: state => {
      return state.payload.chosen_cooks
    },
    getChosenCooksIDs: state => {
      return state.payload.chosen_cooks.map(obj => obj.id)
    },
    getCurrentBranchCooks: state => {
      return state.payload.cooks[state.payload.curr_branch.id].users
    },
    getPayload: state => {
      return state.payload
    },
    getAuthRouteRequested: state => {
      return state.authRouteRequested
    },
    getThemeColor: state => {
      return state.themeColor
    },
    getJWT: state => {
      return state.payload.jwt
    },
    getFullName: state => {
      return state.payload.username
    },
    getUserToken: state => {
      return state.payload.token
    },
    getUserID: state => {
      return state.payload.user_id
    }
  },
  plugins: [vuexLocal.plugin]
})
