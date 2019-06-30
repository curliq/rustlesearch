<template>
  <div class="flex items-center border-b border-gray-800 py-1">
    <div class="xl:w-1/12 lg:1/6 md:w-1/5 w-1/4 text-gray-300 text-center truncate px-1">
      {{ channel }}
    </div>
    <div class="xl:w-11/12 lg:5/6 md:w-4/5 w-3/4">
      <div class="flex flex-col md:flex-row md:items-center">
        <p class="text-gray-200 font-semibold mr-2">
          {{ username }}
        </p>
        <p class="text-gray-400 text-sm">
          {{ formattedDate }}
        </p>
      </div>

      <p
        class="text-gray-200 overflow-x-hidden mr-1"
        style="overflow-wrap: anywhere;"
      >
        {{ text }}
      </p>
    </div>
  </div>
</template>

<script>
import dayjs from '@/dayjs'
import { displayFormat } from '@/utils'
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
    date () {
      return dayjs(this.ts)
    },
    formattedDate () {
      if (this.isUtc) {
        return this.date.utc().format(displayFormat)
      }
      return this.date.format(displayFormat)
    }
  }
}
</script>

<style>

</style>
