<template>
  <div class="flex items-center">
    <div class="w-full max-w-full flex flex-col lg:flex-row">
      <div class="text-gray-400 px-2 lg:border-r border-gray-700">
        {{ channel }}
      </div>
      <p
        class="inline-block text-gray-200 ml-2 overflow-x-hidden"
        style="overflow-wrap: anywhere;"
      >
        <span class="font-bold mr-1">
          {{ username }}
        </span>

        {{ text }}
      </p>

      <p
        class="text-gray-500 lg:ml-auto mr-2 pl-2 mb-2 lg:mb-0 text-sm whitespace-no-wrap"
      >
        {{ formattedDate }}
      </p>
    </div>
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
