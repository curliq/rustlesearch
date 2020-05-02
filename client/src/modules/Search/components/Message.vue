<template>
  <tr class="px-2 text-gray-200">
    <td class="inline-block pl-1 pr-4 text-gray-400 md:whitespace-no-wrap">
      <router-link
        :to="{ name: 'Surrounds', query: { channel, date: ts, username } }"
        target="_blank"
        class="px-2 mx-1 border border-gray-800 rounded-sm cursor-pointer select-none hover:border-accent"
        >&gt;</router-link
      >
      <span> {{ channel }}</span>
    </td>

    <td class="pr-1">
      <div class="break-words-container">
        <span class="block mr-1 text-sm text-gray-500 md:inline font-date">
          {{ date }}
        </span>
        <span class="mr-1 font-bold">{{ username }}: </span>

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
