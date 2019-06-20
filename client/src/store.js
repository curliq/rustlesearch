import Vue from 'vue'
import Vuex from 'vuex'
import agent from '@/superagent'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    channels: [],
  },
  mutations: {
    setChannels(state, channels) {
      state.channels = channels
    },
  },

  actions: {
    async getChannels({commit}) {
      const {body} = await agent.get('/channels')
      commit('setChannels', body)
    },
  },
})
