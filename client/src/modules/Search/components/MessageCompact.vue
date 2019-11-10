<template>
  <div class="text-gray-200 px-2">
    <span
      class="text-gray-400 border-gray-700 inline-block"
      style="width: 6.5rem;"
    >
      {{ channel }}
    </span>

    <span class="text-gray-500 mr-1">[ {{ formattedDate }} ]</span>
    <span class="font-bold mr-1"> {{ username }}:</span>

    <span class="">{{ text }}</span>
  </div>
</template>

<script>
import dayjs from "@/dayjs";
import { displayFormat } from "@/utils";

export default {
  props: {
    channel: {
      type: String,
      default: null
    },
    username: {
      type: String,
      default: null
    },
    text: {
      type: String,
      default: null
    },
    ts: {
      type: String,
      default: null
    },
    isUtc: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    date() {
      return dayjs(this.ts);
    },
    formattedDate() {
      if (this.isUtc) {
        return this.date.utc().format(displayFormat);
      }
      return this.date.format(displayFormat);
    }
  }
};
</script>

<style></style>
