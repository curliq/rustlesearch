<template>
  <div>
    <message
      v-for="(message, i) in results"
      :key="i"
      class="mb-4"
      :ts="message.ts"
      :channel="message.channel"
      :username="message.username"
      :text="message.text"
    />
  </div>
</template>

<script>
import Message from './Message'
export default {
  components: {
    Message
  },
  props: {
    results: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style>

</style>
