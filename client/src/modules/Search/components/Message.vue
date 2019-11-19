<template>
  <tr class="text-gray-200 px-2">
    <td class="text-gray-400 pl-1 pr-4 md:whitespace-no-wrap inline-block">
      <span
        class="hover:border-accent border-gray-800 border px-2 mx-1 rounded cursor-pointer select-none"
        @click="$emit('surrounds')"
        >&gt;</span
      >
      <span> {{ channel }}</span>
    </td>

    <td class="pr-1">
      <div class="break-words-container">
        <span class="text-gray-500 mr-1 block md:inline font-date text-sm">
          {{ date }}
        </span>
        <span class="font-bold mr-1">{{ username }}:</span>

        <span class="break-words">{{ text }}</span>
      </div>
    </td>
  </tr>
</template>

<script>
import dayjs from "@/dayjs";

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
    }
  },
  computed: {
    date() {
      return dayjs(this.ts)
        .utc()
        .format("YYYY-MM-DD | HH:mm:ss");
    }
  }
};
</script>

<style>
.break-words-container {
  display: table;
  table-layout: fixed;
  width: 100%;
  word-wrap: break-word;
}
</style>
