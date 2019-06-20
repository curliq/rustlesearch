<template>
  <form @submit.prevent="$emit('search')">
    <div class="row q-col-gutter-sm q-mt-sm">
      <date-input
        v-model="query.startingDate"
        class="col-md-2 col-6"
      />
      <date-input
        v-model="query.endingDate"
        class="col-md-2 col-6"
      />
      <div class="col-md-6 col-12">
        <a
          v-show="false"
          :href="shareUrl"
          target="_blank"
        >Share URL</a>
        <q-btn
          color="indigo"
          class="full-height"
          no-caps
          @click="setAllTime"
        >
          Select All Time
        </q-btn>
        <q-btn
          v-clipboard:copy="shareUrl"
          v-clipboard:success="copiedNotification"
          class="q-mx-md full-height"
          color="primary"
          outline
          no-caps
        >
          Copy Share URL
        </q-btn>
      </div>
    </div>

    <div class="row q-pt-md q-col-gutter-sm justify-center">
      <q-input
        v-model="query.username"
        class="col-md-2 col-6"
        outlined
        label="Username"
        dense
      />
      <q-select
        v-model="query.channel"
        outlined
        use-input
        hide-selected
        dense
        input-debounce="0"
        @filter="filterFn"
        :options="channels"
        class="col-md-2 col-6"
        label="Channel"
      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">
              No results
            </q-item-section>
          </q-item>
        </template>
      </q-select>
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
          no-caps
          type="submit"
          :loading="searchLoading"
        />
      </div>
    </div>
  </form>
</template>

<script>
import DateInput from './DateInput'
import {mergeRight} from 'ramda'
import {getToday} from '@/utils'
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
    channels: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
    }
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
    filteredChannels() {
      return this.channels.filter(v => v.toLowerCase().includes(this.filteredValue))
    }
  },
  methods: {
    setAllTime() {
      this.$emit(
        'update:query',
        mergeRight(this.query, {
          startingDate: '2010/01/01',
          endingDate: getToday(),
        }),
      )
    },
    copiedNotification() {
      this.$q.notify({
        message: 'Copied!',
        position: 'bottom-right',
        timeout: 1000,
      })
    },
    filterFn(val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        this.filteredChannels = this.channels.filter(
          v => v.toLowerCase().indexOf(needle) > -1,
        )
      })
    },
  },
}
</script>

<style></style>
