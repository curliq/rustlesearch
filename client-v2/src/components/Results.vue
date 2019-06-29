<template>
  <div
    v-if="results.length > 0"
    class="bg-gray-850 rounded"
  >
    <toggle-mode-bar v-model="mode" />
    <component
      :is="mode"
      v-for="(message, i) in results"
      :key="i"
      :ts="message.ts"
      :channel="message.channel"
      :username="message.username"
      :text="message.text"
    />
  </div>
</template>

<script>
import CompactMessage from './CompactMessage'
import Message from './Message'
import ToggleModeBar from './ToggleModeBar'
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
    }
  },
  data () {
    return {
      mode: 'message'
    }
  }
}
</script>

<style>

</style>
