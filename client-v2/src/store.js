import Vue from 'vue'
import Vuex from 'vuex'
import superagent from 'superagent'
import { last, evolve } from 'ramda'
import { dateToSeconds } from '@/utils'

const baseUrl = process.env.VUE_APP_API
const transformQuery = evolve({
  startingDate: dateToSeconds,
  endingDate: dateToSeconds
})
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    currentQuery: null,
    results: [],
    loading: false
  },
  mutations: {
    setResults (state, data) {
      state.results = data
    },
    appendResults (state, data) {
      state.results.push(data)
    },
    setCurrentQuery (state, data) {
      state.currentQuery = data
    },
    setLoading (state, data) {
      state.loading = data
    }
  },
  actions: {
    async getResults ({ commit, dispatch }, query) {
      commit('setCurrentQuery', query)
      commit('setLoading', true)
      console.log(query.startingDate, query.endingDate)
      try {
        const { body } = await superagent
          .get(`${baseUrl}/search`)
          .query(transformQuery(query))
        commit('setResults', body)
        commit('setLoading', false)
      } catch (e) {
        console.log(e)
        if (e.response.status === 429) {
          const retryAfterString = e.response.headers['retry-after']
          const retryAfter = parseInt(retryAfterString)
          setTimeout(() => dispatch('getResults', query), retryAfter + 100)
        } else {
          commit('setLoading', false)
        }
      }
    },
    async scrollResults ({ commit, state, dispatch }) {
      if (state.currentQuery === null || state.results.length === 0) return
      const searchAfterVal = last(state.results).searchAfter
      if (!searchAfterVal) return
      try {
        const { body } = await superagent
          .get(`${baseUrl}/search`)
          .query(transformQuery(state.currentQuery))
          .query({ searchAfter: searchAfterVal })

        commit('appendResults', body)
      } catch (e) {
        if (e.response.status === 429) {
          const retryAfterString = e.response.headers['retry-after']
          const retryAfter = parseInt(retryAfterString)
          setTimeout(() => dispatch('scrollResults'), retryAfter + 100)
        }
      }
    }
  }
})
