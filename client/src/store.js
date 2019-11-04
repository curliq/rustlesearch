import Vue from "vue";
import Vuex from "vuex";
import superagent from "superagent";
import { last, concat } from "ramda";

const baseUrl = process.env.VUE_APP_API;
Vue.use(Vuex);
const buildNotify = msg => ({
  group: "vuex",
  title: "Error",
  text: msg,
  duration: 2000
});

export default new Vuex.Store({
  state: {
    currentQuery: null,
    results: [],
    loading: false,
    channels: ["Destinygg"]
  },
  mutations: {
    setResults(state, data) {
      state.results = data;
    },
    appendResults(state, data) {
      state.results = concat(state.results, data);
    },
    setCurrentQuery(state, data) {
      state.currentQuery = data;
    },
    setLoading(state, data) {
      state.loading = data;
    },
    setChannels(state, data) {
      state.channels = data;
    }
  },
  actions: {
    async getResults({ commit, dispatch }, query) {
      commit("setCurrentQuery", query);
      commit("setLoading", true);
      console.log(query.startingDate, query.endingDate);
      try {
        const { body } = await superagent.get(`${baseUrl}/search`).query(query);
        commit("setResults", body.data);

        commit("setLoading", false);
      } catch (e) {
        if (e.response.status === 429) {
          const retryAfterString = e.response.headers["retry-after"];
          const retryAfter = parseInt(retryAfterString, 10);
          setTimeout(() => dispatch("getResults", query), retryAfter + 100);
        } else {
          Vue.notify(buildNotify(e.response.body.message));
          commit("setLoading", false);
        }
      }
    },
    async loadMoreMessages({ commit, state, dispatch }) {
      const lastResult = last(state.results);
      const searchAfter = lastResult ? lastResult.searchAfter : undefined;
      commit("setLoading", true);
      try {
        const { body } = await superagent
          .get(`${baseUrl}/search`)
          .query(state.currentQuery)
          .query({ search_after: searchAfter });
        commit("appendResults", body.data);
        commit("setLoading", false);
      } catch (e) {
        if (e.response.status === 429) {
          const retryAfterString = e.response.headers["retry-after"];
          const retryAfter = parseInt(retryAfterString, 10);
          setTimeout(() => dispatch("loadMoreMessages"), retryAfter + 100);
        } else {
          Vue.notify(buildNotify(e.response.body.message));
          commit("setLoading", false);
        }
      }
    },
    async getChannels({ commit }) {
      try {
        const { body } = await superagent.get(`${baseUrl}/channels.json`);
        commit("setChannels", body);
      } catch (e) {
        console.log(e);
      }
    }
  }
});
