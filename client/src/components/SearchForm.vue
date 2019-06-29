<template>
  <div class="bg-gray-850 shadow flex flex-col rounded py-4 px-3">
    <form @submit.prevent="$emit('submit', query)">
      <div class="flex lg:flex-row flex-col lg:items-center mb-5">
        <base-dark-label class="text-lg mr-2 flex-initial">
          Search Options
        </base-dark-label>
        <div class="text-gray-500 flex-1 text-sm">
          (one field required)
        </div>
      </div>

      <base-dark-input
        v-model="query.username"
        label="Username"
        placeholder="Username"
        type="text"
        class="mb-3"
      />
      <base-dark-input
        v-model="query.channel"
        placeholder="Channel"
        label="Channel"
        type="text"
        class="mb-3"
      />
      <base-dark-input
        v-model="query.text"
        label="Text"
        placeholder="Message content"
      />
      <div class="border-b border-gray-800 my-4 h-px" />
      <div class="mb-3 flex flex-col md:flex-row md:items-center">
        <base-dark-label class="mb-1 md:mr-2 md:w-1/3">
          Start Date
        </base-dark-label>
        <base-datepicker
          v-model="query.startingDate"
          class="flex-1 min-w-0"
          :options="{max: query.endingDate}"
        />
      </div>
      <div class="mb-3 flex flex-col md:flex-row md:items-center">
        <base-dark-label class="mb-1 md:mr-2 md:w-1/3">
          End Date
        </base-dark-label>

        <base-datepicker
          v-model="query.endingDate"
          class="flex-1 min-w-0"
          :options="{min: query.startingDate, max: today}"
        />
      </div>
      <button
        type="submit"
        class="bg-purple-600 hover:bg-purple-700 w-full px-10 text-center py-3 rounded text-white focus:outline-none my-1"
      >
        <span v-if="!loading">Submit</span>
        <base-loader
          v-else
        />
      </button>
    </form>
  </div>
</template>

<script>
import dayjs from '@/dayjs'
import { keys, mergeRight } from 'ramda'
export default {
  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      query: {
        username: null,
        channel: null,
        text: null,
        startingDate: dayjs().utc().subtract(30, 'day').format('YYYY-MM-DD'),
        endingDate: dayjs().utc().format('YYYY-MM-DD')
      },
      today: new Date()
    }
  },
  mounted () {
    if (keys(this.$route.query).length > 0) {
      this.query = mergeRight(this.query, this.$route.query)
      this.$emit('submit', this.query)
    }
  }
}
</script>

<style>

</style>
