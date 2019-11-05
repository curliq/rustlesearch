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
      />
    </div>
  </div>
</template>
<script>
import { reject, isNil, equals, anyPass, reverse } from "ramda";
import superagent from "superagent";
import Results from "@/components/Results.vue";
import SearchForm from "@/components/SearchForm.vue";

const baseUrl = process.env.VUE_APP_API;
export default {
  components: {
    Results,
    SearchForm
  },
  data() {
    return {
      before: null,
      after: null,
      selectedIndex: null
    };
  },
  computed: {
    results() {
      /* if ( */
      /*   !isNil(this.before) && */
      /*   !isNil(this.after) && */
      /*   !isNil(this.selectedIndex) */
      /* ) { */
      /*   const arr = this.$store.state.results; */
      /*   const n = this.selectedIndex; */
      /*   return [ */
      /*     ...arr.slice(0, n), */
      /*     ...this.after, */
      /*     arr[n], */
      /*     ...this.before, */
      /*     ...arr.slice(n + 1) */
      /*   ]; */
      /* } */
      return this.$store.state.results;
    },
    loading() {
      return this.$store.state.loading;
    },
    currentQuery() {
      return this.$store.state.currentQuery;
    }
  },
  methods: {
    async submitQuery(query) {
      if (!this.loading) {
        await this.$store.dispatch("getResults", query);

        const isBad = anyPass([isNil, equals("")]);
        const toPush = reject(isBad)(this.currentQuery);
        if (!equals(toPush, this.$route.query)) {
          this.$router.push({
            name: "Home",
            query: reject(isBad)(this.currentQuery)
          });
        }
      }
    },
    async surroundsQuery(index) {
      console.log("triggered surrounds");
      const message = this.$store.state.results[index];
      try {
        const { body } = await superagent.get(`${baseUrl}/surrounds`).query({
          channel: message.channel,
          size: 10,
          search_after: message.searchAfter
        });

        this.before = reverse(body.data[0]).map(x => ({
          ...x,
          surrounds: true
        }));
        this.after = reverse(body.data[1]).map(x => ({
          ...x,
          surrounds: true
        }));
        this.selectedIndex = index;
      } catch (e) {
        if (e.response.status === 429) {
          const retryAfterString = e.response.headers["retry-after"];
          const retryAfter = parseInt(retryAfterString, 10);
          setTimeout(() => this.surroundsQuery(index), retryAfter + 100);
        } else {
          const buildNotify = msg => ({
            group: "vuex",
            title: "Error",
            text: msg,
            duration: 2000
          });

          this.$notify(buildNotify(e.response.body.message));
          this.before = null;
          this.after = null;
          this.selectedIndex = null;
        }
      }
    }
  }
};
</script>
