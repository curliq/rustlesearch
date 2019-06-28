<template>
  <div class="bg-gray-850 flex items-center rounded py-1">
    <div class="xl:w-1/12 md:w-1/6 w-1/4 text-gray-300 text-center mx-1">
      {{ channel }}
    </div>
    <div class="xl:w-11/12 md:w-5/6 w-3/4 mr-1">
      <div class="flex items-center">
        <p class="text-gray-300 font-semibold mr-2">
          {{ username }}
        </p>
        <p class="text-gray-400 text-sm">
          {{ formattedDate }}
        </p>
      </div>

      <p
        class="text-gray-200 break-words"
      >
        {{ text }}
      </p>
    </div>
  </div>
</template>

<script>
import { DateTime } from 'luxon'
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
    }
  },
  computed: {
    formattedDate () {
      return DateTime.fromISO(this.ts).toFormat(displayFormat)
    }
  }
}
</script>

<style>

</style>
