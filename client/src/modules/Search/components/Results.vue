<template>
  <div class="bg-gray-850 rounded-sm">
    <results-settings :results="results" />
    <div v-if="results">
      <div v-if="results.messages.length > 0">
        <table class="table-auto">
          <tbody>
            <message
              v-for="(message, i) in results.messages"
              :key="i"
              :ts="message.ts"
              :channel="message.channel"
              :username="message.username"
              :text="message.text"
              @surrounds="$emit('surrounds', message)"
            />
          </tbody>
        </table>
        <results-load-more
          :loading="loading"
          @click="$emit('loadMoreMessages')"
        />
      </div>
      <div
        v-else-if="currentQuery && !loading"
        class="py-4 text-center font-bold text-gray-100"
      >
        No results, try a different search
      </div>
    </div>
    <div v-else class="py-4 text-center font-bold text-gray-100">
      Submit a search to get started
    </div>
  </div>
</template>

<script>
import Message from "./Message.vue";
import ResultsSettings from "./ResultsSettings.vue";
import ResultsLoadMore from "./ResultsLoadMore.vue";

export default {
  components: {
    Message,
    ResultsSettings,
    ResultsLoadMore
  },
  props: {
    results: {
      type: Object,
      default: null
    },
    currentQuery: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style></style>
