<template>
  <div class="flex flex-wrap">
    <div class="lg:mb-0 xl:1/5 lg:w-1/4 md:w-1/3 mb-4 w-full">
      <search-form
        class="md:mr-4 "
        :loading="loading"
        @submit="submitQuery"
      />
    </div>
    <div class="xl:4/5 lg:w-3/4 md:w-2/3 w-full">
      <results
        :results="results"
        :current-query="currentQuery"
        :loading="loading"
      />
    </div>
  </div>
</template>
<script>
import Results from '@/components/Results'
import SearchForm from '@/components/SearchForm'
import { reject, isNil, equals, anyPass } from 'ramda'
export default {
  components: {
    Results,
    SearchForm
  },
  data () {
    return {
    }
  },
  computed: {
    results () {
      return this.$store.state.results
    },
    loading () {
      return this.$store.state.loading
    },
    currentQuery () {
      return this.$store.state.currentQuery
    }
  },
  methods: {
    async submitQuery (query) {
      if (!this.loading) {
        await this.$store.dispatch('getResults', query)
        const isBad = anyPass([isNil, equals('')])
        this.$router.push({ name: 'Home', query: reject(isBad)(this.currentQuery) })
      }
    }
  }
}
</script>
