<template>
  <div class="flex flex-wrap">
    <div class="lg:mb-0 xl:1/5 lg:w-1/4 md:w-1/3 mb-4 w-full">
      <search-form class="md:mr-4" :loading="loading" @submit="submitQuery" />
    </div>
    <div class="xl:4/5 lg:w-3/4 md:w-2/3 w-full">
      <results
        :results="results"
        :current-query="currentQuery"
        :loading="loading"
        @loadMoreMessages="loadMoreMessages"
      />
    </div>
  </div>
</template>
<script>
import { mapState } from "vuex";
import { reject, isNil, anyPass, equals } from "ramda";
import { isEqual } from "lodash-es";
import Results from "../components/Results.vue";
import SearchForm from "./SearchForm.vue";

export default {
  components: {
    Results,
    SearchForm
  },
  data() {
    return {};
  },
  computed: {
    ...mapState("search", {
      results: state => state.results,
      loading: state => state.loading,
      currentQuery: state => state.currentQuery
    })
  },
  methods: {
    async submitQuery(query) {
      if (!this.loading) {
        await this.$store.dispatch("search/getResults", query);

        const isBad = anyPass([isNil, equals("")]);
        const toPush = reject(isBad)(this.currentQuery);
        if (!isEqual(toPush, this.$route.query)) {
          this.$router.push({
            name: "Search",
            query: reject(isBad)(this.currentQuery)
          });
        }
      }
    },
    loadMoreMessages() {
      this.$store.dispatch("search/loadMoreMessages");
    }
  }
};
</script>
