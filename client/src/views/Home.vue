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

    <form @submit.prevent="getResults">
      <div class="row q-col-gutter-sm q-mt-sm">
        <q-btn
          @click="setAllTime"
          @click=""
        >
          All Time
        </q-btn>
        <q-input
          v-model="startingDate"
          class="col-md-2 col-6"
          label="Start"
          dense
          outlined
          mask="date"
          :rules="['date']"
        >
          <template v-slot:append>
            <q-icon
              name="event"
              class="cursor-pointer"
            >
              <q-popup-proxy
                ref="qDateProxy1"
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date
                  v-model="startingDate"
                  @input="() => $refs.qDateProxy1.hide()"
                />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>

        <q-input
          v-model="endingDate"
          dense
          class="col-md-2 col-6"
          label="End"
          outlined
          mask="date"
          :rules="['date']"
        >
          <template v-slot:append>
            <q-icon
              name="event"
              class="cursor-pointer"
            >
              <q-popup-proxy
                ref="qDateProxy2"
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date
                  v-model="endingDate"
                  @input="() => $refs.qDateProxy2.hide()"
                />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <div class="col-md-6 col-12 q-pt-md">
          <a
            v-show="false"
            :href="shareUrl"
            target="_blank"
            class="q-ml-sm link text-subtitle1"
          >Share URL</a>
          <q-btn
            v-clipboard:copy="shareUrl"
            v-clipboard:success="
              v =>
                $q.notify({
                  message: 'Copied!',
                  position: 'bottom-right',
                  timeout: 1000
                })
            "
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
          v-model="username"
          class="col-md-2 col-6"
          outlined
          label="Username"
          dense
        />
        <q-input
          v-model="channel"
          class="col-md-2 col-6"
          outlined
          label="Channel"
          dense
        />
        <q-input
          v-model="text"
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
import { DateTime } from 'luxon'
export default {
  components: {
    Results
  },
  data() {
    return {
      searchLoading: false,
      username: null,
      text: null,
      channel: null,
      results: null,
      startingDate: DateTime.utc()
        .minus({ days: 30 })
        .toFormat('yyyy/MM/dd'),
      endingDate: DateTime.utc().toFormat('yyyy/MM/dd')
    }
  },
  computed: {
    shareUrl() {
      return (
        window.location.origin +
        '/' +
        this.$router.resolve({
          name: 'Home',
          query: {
            channel: this.channel,
            username: this.username,
            text: this.text,
            startingDate: this.startingDate,
            endingDate: this.endingDate
          }
        }).href
      )
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
        const { data } = await axios.get('api/search', {
          params: {
            username: this.username,
            text: this.text,
            channel: this.channel,
            startingDate: DateTime.fromFormat(
              this.startingDate,
              'yyyy/MM/dd'
            ).toMillis(),
            endingDate: DateTime.fromFormat(
              this.endingDate,
              'yyyy/MM/dd'
            ).toMillis()
          }
        })
        this.searchLoading = false
        this.results = data
      } catch (e) {
        setTimeout(() => {
          this.getResults()
        }, 2000)
        console.log(e)
      }
    }
  }
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
