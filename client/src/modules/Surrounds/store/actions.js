import superagent from "superagent";
import Vue from "vue";
import { buildNotify } from "@/utils";

const baseUrl = process.env.VUE_APP_API;

export default {
  async getResults({ commit, dispatch }, query) {
    commit("setCurrentQuery", query);
    commit("setLoading", true);
    try {
      const { body } = await superagent
        .get(`${baseUrl}/surrounds`)
        .query(query);
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
  }
};
