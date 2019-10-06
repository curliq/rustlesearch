<template>
  <div class="bg-gray-850 rounded">
    <toggle-mode-bar :mode.sync="mode" :is-utc.sync="isUtc" />
    <div v-if="results.length > 0">
      <component
        :is="mode"
        v-for="(message, i) in results"
        :key="i"
        :ts="message.ts"
        :channel="message.channel"
        :username="message.username"
        :text="message.text"
        :is-utc="isUtc"
      />
    </div>

    <div
      v-else-if="currentQuery && !loading"
      class="py-4 text-center font-bold text-gray-100"
    >
      No results, try a different search
    </div>
    <div v-else class="py-4 text-center font-bold text-gray-100">
      Submit a search to get started
    </div>
  </div>
</template>

<script>
import CompactMessage from "./CompactMessage.vue";
import Message from "./Message.vue";
import ToggleModeBar from "./ToggleModeBar.vue";

export default {
  components: {
    Message,
    CompactMessage,
    ToggleModeBar
  },
  props: {
    results: {
      type: Array,
      default: () => []
    },
    currentQuery: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      mode: "message",
      isUtc: true
    };
  }
};
</script>

<style></style>
