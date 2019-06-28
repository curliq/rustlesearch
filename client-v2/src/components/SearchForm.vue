<template>
  <div class="bg-gray-850 shadow flex flex-col rounded py-4 px-3">
    <form @submit.prevent="$emit('submit', query)">
      <base-dark-label class="mb-4 text-lg">
        Search Options
      </base-dark-label>
      <base-dark-input
        v-model="query.username"
        placeholder="Username"
        type="text"
        class="mb-3"
      />
      <base-dark-input
        v-model="query.channel"
        placeholder="Channel"
        type="text"
        class="mb-10"
      />
      <base-dark-input
        v-model="query.text"
        label="Text"
        placeholder="Message content"
        type="textarea"
        class="mb-10"
        rows="5"
      />
      <base-dark-label class="mb-1">
        Start Date
      </base-dark-label>
      <base-dark-label class="mb-1">
        End Date
      </base-dark-label>
      <button
        type="submit"
        class="bg-purple-600 hover:bg-purple-700 w-full px-10 text-center py-3 rounded text-white focus:outline-none my-1"
      >
        Submit
      </button>
    </form>
  </div>
</template>

<script>
import { DateTime } from 'luxon'
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
        startingDate: DateTime.utc()
          .minus({ days: 30 })
          .toJSDate(),
        endingDate: DateTime.utc().toJSDate()
      },
      today: new Date(),
      dateMasks: {
        input: ['YYYY-MM-DD'],

        data: ['YYYY-MM-DD']
      }
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
