<template>
  <div class="flex flex-wrap">
    <div class="w-full bg-gray-850 rounded-sm text-gray-400">
      <div v-if="results">
        <div
          v-for="(result, i) in splitResults"
          :key="i"
          :class="[
            result.matches && 'bg-blue-700 text-gray-200 matches',
            'px-2'
          ]"
        >
          <text-highlight :queries="[username]">
            {{ result.body }}
          </text-highlight>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { last } from "ramda";

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
    },
    username() {
      return last(this.results.match.split(" "));
    }
  },
  async mounted() {
    await this.$store.dispatch("surrounds/getResults", this.$route.query || {});
    document.querySelector(".matches").scrollIntoView({
      block: "center"
    });
  }
};
</script>

<style scoped></style>
