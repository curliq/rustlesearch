<template>
  <q-page
    class="q-py-md q-mx-auto"
    style="max-width: 1200px;"
  >
    <div class="flex flex-center column">
      <img
        alt="Quasar logo"
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
      v-model="query"
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
        endingDate: DateTime.utc().toFormat('yyyy/MM/dd'),
      },
      searchLoading: false,
      results: null,
    }
  },
  mounted() {
    if (Object.entries(this.$route.query).length > 0) {
      this.username = this.$route.query.username || null
      this.text = this.$route.query.text || null
      this.channel = this.$route.query.channel || null
      this.startingDate = this.$route.query.startingDate || this.startingDate
      this.endingDate = this.$route.query.endingDate || this.endingDate
      this.getResults()
    }
  },
  methods: {
    async getResults() {
      try {
        this.searchLoading = true
        const {data} = await axios.get('api/search', {
          params: {
            username: this.username,
            text: this.text,
            channel: this.channel,
            startingDate: DateTime.fromFormat(
              this.startingDate,
              'yyyy/MM/dd',
            ).toMillis(),
            endingDate: DateTime.fromFormat(
              this.endingDate,
              'yyyy/MM/dd',
            ).toMillis(),
          },
        })
        this.searchLoading = false
        this.results = data
      } catch (e) {
        setTimeout(() => {
          this.getResults()
        }, 2000)
        console.log(e)
      }
    },
    copiedNotification() {
      this.$q.notify({
        message: 'Copied!',
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
