<template>
  <div class="flex flex-wrap">
    <div class="w-full bg-gray-850 rounded text-gray-400">
      <div v-if="results">
        <div
          v-for="(result, i) in splitResults"
          :key="i"
          :class="[
            result.matches && 'bg-blue-700 text-gray-200 matches',
            'px-2'
          ]"
        >
          {{ result.body }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  computed: {
    ...mapState("surrounds", {
      results: state => state.results,
      loading: state => state.loading
    }),
    splitResults() {
      return this.results.body.split("\n").map(x => {
        return {
          body: x,
          matches: x.toLowerCase().includes(this.results.match)
        };
      });
    }
  },
  async mounted() {
    await this.$store.dispatch("surrounds/getResults", this.$route.query || {});
    this.$scrollTo(".matches");
  }
};
</script>

<style scoped></style>
