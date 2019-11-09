<template>
  <message-normal
    v-if="mode === 'normal'"
    v-bind="$attrs"
    v-on="$listeners"
  ></message-normal>
  <message-compact v-else v-bind="$attrs" v-on="$listeners"></message-compact>
</template>

<script>
import MessageCompact from "./MessageCompact.vue";
import MessageNormal from "./MessageNormal.vue";

export default {
  components: {
    MessageCompact,
    MessageNormal
  },
  props: {
    mode: {
      type: String,
      default: "normal"
    }
  }
};
</script>

<style scoped></style>
