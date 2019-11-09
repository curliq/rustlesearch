import superagent from "superagent";
import Vue from "vue";

import { last } from "ramda";

const baseUrl = process.env.VUE_APP_API;
const buildNotify = msg => ({
  group: "vuex",
  title: "Error",
  text: msg,
  duration: 2000
});

export default {
  async getResults({ commit, dispatch }, query) {
    commit("setCurrentQuery", query);
    commit("setLoading", true);
    console.log(query.start_date, query.end_date);
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
  }
};
