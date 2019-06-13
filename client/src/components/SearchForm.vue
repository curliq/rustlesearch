<template>
  <form @submit.prevent="$emit('search')">
    <div class="row q-col-gutter-sm q-mt-sm">
      <q-btn @click="setAllTime">
        All Time
      </q-btn>
      <date-input v-model="query.startingDate" />
      <date-input v-model="query.endingDate" />
      <div class="col-md-6 col-12 q-pt-md">
        <a
          v-show="false"
          :href="shareUrl"
          target="_blank"
          class="q-ml-sm link text-subtitle1"
        >Share URL</a>
        <q-btn
          v-clipboard:copy="shareUrl"
          v-clipboard:success="copiedNotification"
          class="q-mx-md q-mb-xs"
          size="sm"
          color="primary"
          outline
        >
          Copy Share URL
        </q-btn>
      </div>
    </div>

    <div class="row q-col-gutter-sm justify-center">
      <q-input
        v-model="query.username"
        class="col-md-2 col-6"
        outlined
        label="Username"
        dense
      />
      <q-input
        v-model="query.channel"
        class="col-md-2 col-6"
        outlined
        label="Channel"
        dense
      />
      <q-input
        v-model="query.text"
        class="col-md-7 col-12"
        outlined
        label="Text"
        dense
      />
      <div class="col-md-1 col-4">
        <q-btn
          color="primary"
          class="full-height full-width"
          label="Search"
          type="submit"
          :loading="searchLoading"
        />
      </div>
    </div>
  </form>
</template>

<script>
import DateInput from 'DateInput'
export default {
  components: {
    DateInput,
  },
  props: {
    query: {
      type: Object,
      default: () => {},
    },
    searchLoading: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    shareUrl() {
      return (
        window.location.origin
        + '/'
        + this.$router.resolve({
          name: 'Home',
          query: this.query,
        }).href
      )
    },
  },
}
</script>

<style>

</style>
