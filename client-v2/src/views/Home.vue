<template>
  <div class="flex flex-wrap">
    <div class="lg:mb-0 lg:w-1/5 md:w-1/3 mb-4 w-full">
      <search-form
        class="md:mr-4 "
        :loading="loading"
        @submit="submitQuery"
      />
    </div>
    <div class="lg:w-4/5 md:w-2/3 w-full">
      <results :results="results" />
    </div>
  </div>
</template>
<script>
import Results from '@/components/Results'
import SearchForm from '@/components/SearchForm'
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
    }
  },
  methods: {
    submitQuery (query) {
      this.$store.dispatch('getResults', query)
    }
  }
}
</script>
