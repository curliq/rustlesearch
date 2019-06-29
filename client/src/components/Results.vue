<template>
  <div
    v-if="results.length > 0"
    class="bg-gray-850 rounded"
  >
    <toggle-mode-bar
      :mode.sync="mode"
      :is-utc.sync="isUtc"
    />
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
      mode: 'message',
      isUtc: true
    }
  }
}
</script>

<style>

</style>
