<template>
  <component
    :is="'message-' + mode"
    :date="date"
    v-bind="$attrs"
    v-on="$listeners"
  ></component>
</template>

<script>
import MessageCompact from "./MessageCompact.vue";
import MessageNormal from "./MessageNormal.vue";
import dayjs from "@/dayjs";
import { displayFormat } from "@/utils";

export default {
  components: {
    MessageCompact,
    MessageNormal
  },
  props: {
    mode: {
      type: String,
      default: "normal"
    },
    ts: {
      type: String,
      default: null
    }
  },
  computed: {
    date() {
      return dayjs(this.ts)
        .utc()
        .format(displayFormat);
    }
  }
};
</script>

<style scoped></style>
