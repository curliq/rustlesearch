import { concat } from "ramda";

export default {
  setResults(state, data) {
    state.results = data;
  },
  appendResults(state, data) {
    state.results.messages = concat(state.results.messages, data);
  },
  setCurrentQuery(state, data) {
    state.currentQuery = data;
  },
  setLoading(state, data) {
    state.loading = data;
  }
};
