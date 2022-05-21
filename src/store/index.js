import Vue from 'vue'
import Vuex from 'vuex'

import {getWallet, getContract, getTokenInterface} from '../utils/getWeb3'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    accountWithWallets: null,
    provider: null,
    contract: null,
    contractNativeToken: null,
  },
  mutations: {
    setAccounts(state, payload) {
      state.accountWithWallets = payload[0]
      state.provider = payload[1]
      state.contractNativeToken = payload[2]
    },
    setContract(state, payload) {
      state.contract = payload
    },
  },
  actions: {
    async registerWeb3({ commit }) {
      console.log('registerWeb3 Action being executed')
      await getWallet()
        .then((result) => {
          commit('setAccounts', result)
        })
        .catch((e) => {
          console.log('error in registering Metamask', e)
        })
    },
    async registerContract({ commit }) {
      await getContract()
        .then((result) => {
          commit('setContract', result)
        })
        .catch((e) => {
          console.log('error in registering contract', e)
        })
    },
    // register multiple token interfaces on demand
    async registerTokenContract({ commit }) {
      await getTokenInterface('BTCB')
        .then((result) => {
          commit('setContract', result)
        })
        .catch((e) => {
          console.log('error in registering contract', e)
        })
    },
  },
  getters: {},
  modules: {},
})
