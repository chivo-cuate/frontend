import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersist from 'vuex-persist'
import _ from 'lodash'

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
    chosen_cooks: [],
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
    setChosenCooks(state, chosen_cooks) {
      state.payload.chosen_cooks = chosen_cooks ? chosen_cooks : []
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
      let cookRole = state.payload.roles.filter(item => item.includes("Elaborador"))
      return cookRole.length > 0
    },
    getUserPermissions: state => {
      return state.payload.permissions
    },
    getPermissions: (state) => (moduleName) => {
      let permissions = state.payload.permissions
        .filter(item => item.name === moduleName)
        .map(item => item.subModules)
      return (permissions.length > 0) ? permissions[0] : []
    },
    getCurrBranch: state => {
      return state.payload.curr_branch;
    },
    getCurrBranchID: state => {
      return state.payload.curr_branch ? state.payload.curr_branch.id : -1;
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
      return state.payload.chosen_cooks ? state.payload.chosen_cooks.map(obj => obj.id) : []
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
