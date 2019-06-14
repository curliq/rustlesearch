<template>
  <q-page
    class="q-py-md q-mx-auto"
    style="max-width: 1200px;"
  >
    <div class="flex flex-center column">
      <img
        alt="RustleMagnify"
        src="../assets/rustle_magnify.png"
      >
      <p class="text-h2">
        <span class="text-weight-bold">Rustle</span>Search
      </p>
      <p class="text-h5">
        Advanced searching of
        <a
          class="link text-blue-5"
          href="https://overrustlelogs.net/"
          target="_blank"
        >OverRustleLogs</a>
        (twitch chat logs).
      </p>
    </div>
    <search-form
      :query.sync="query"
      :search-loading="searchLoading"
      @search="getResults"
    />
    <results
      v-if="results"
      :results="results"
      class="q-mt-lg"
    />
  </q-page>
</template>

<script>
import axios from '@/axios'
import Results from '@/components/Results.vue'
import {DateTime} from 'luxon'
import SearchForm from '@/components/SearchForm.vue'
import {getToday, dateToSeconds} from '@/utils'
import {mergeRight, pick, evolve} from 'ramda'
const pickQuery = pick([
  'username',
  'text',
  'channel',
  'startingDate',
  'endingDate',
])
export default {
  components: {
    Results,
    SearchForm,
  },
  data() {
    return {
      query: {
        username: null,
        text: null,
        channel: null,
        startingDate: DateTime.utc()
          .minus({days: 30})
          .toFormat('yyyy/MM/dd'),
        endingDate: getToday(),
      },
      searchLoading: false,
      results: null,
    }
  },
  mounted() {
    if (Object.entries(this.$route.query).length > 0) {
      this.query = mergeRight(this.query, pickQuery(this.$route.query))
      this.getResults()
    }
  },
  methods: {
    async getResults() {
      try {
        this.searchLoading = true
        const {data} = await axios.get('api/search', {
          params: evolve(
            {startingDate: dateToSeconds, endingDate: dateToSeconds},
            pickQuery(this.query),
          ),
        })
        if (!Array.isArray(data)) throw new Error('Bad')
        this.searchLoading = false
        this.results = data
      } catch (e) {
        if (e.response.status === 429) {
          const retryAfter = e.response.headers['retry-after']
          console.log(retryAfter)
          setTimeout(() => this.getResults(), retryAfter + 500)
        } else {
          this.notify(e.message)
          this.searchLoading = false
        }
      }
    },
    notify(text) {
      this.$q.notify({
        message: text,
        position: 'bottom-right',
        timeout: 1000,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.link {
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
}
</style>
