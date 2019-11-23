<template>
  <div class="bg-gray-850 shadow flex flex-col rounded-sm py-4 px-3">
    <div>
      <div class="flex lg:flex-row flex-col lg:items-center mb-5">
        <base-dark-label class="text-lg mr-2 flex-initial"
          >Search Options</base-dark-label
        >
        <div class="text-gray-500 flex-1 text-sm">(one field required)</div>
      </div>

      <base-dark-input
        v-model="query.username"
        type="text"
        placeholder="Username"
        styles="mb-3"
        @keydown.enter="$emit('submit', query)"
      />
      <base-dark-input
        v-model="query.channel"
        placeholder="Channel"
        label="Channel"
        :items="channels"
        type="select"
        class="mb-3"
      />
      <base-dark-input
        v-model="query.text"
        placeholder="Text"
        @keydown.enter="$emit('submit', query)"
      />
      <div class="border-b border-gray-800 my-4 h-px" />
      <div class="mb-3 field" :class="query.start_date && 'field--not-empty'">
        <label class="field__label">Start Date</label>
        <base-datepicker
          v-model="query.start_date"
          class="field__input"
          placeholder="Start Date"
          :options="{ max: query.end_date }"
        />
      </div>
      <div class="mb-3 field" :class="query.start_date && 'field--not-empty'">
        <label class="field__label">End Date</label>
        <base-datepicker
          v-model="query.end_date"
          :options="{ min: query.start_date, max: today }"
          class="field__input"
          placeholder="End Date"
        />
      </div>
      <button
        class="hover:border-accent border-gray-700 text-white border border-transparent w-full px-10 text-center py-3 rounded-sm focus:outline-none my-1"
        @click="$emit('submit', query)"
      >
        <span v-if="!loading">Submit</span>
        <base-loader v-else />
      </button>
    </div>
  </div>
</template>

<script>
import { keys, mergeRight, reject, isNil, anyPass, equals } from "ramda";
import { isEqual } from "lodash-es";
import { mapState } from "vuex";
import dayjs from "@/dayjs";

export default {
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    results: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      query: {
        username: null,
        channel: null,
        text: null,
        start_date: dayjs()
          .utc()
          .subtract(30, "day")
          .format("YYYY-MM-DD"),
        end_date: dayjs()
          .utc()
          .format("YYYY-MM-DD")
      },
      today: new Date()
    };
  },
  computed: {
    ...mapState("common", {
      channels: state => state.channels
    }),
    ...mapState("search", {
      currentQuery: state => state.currentQuery
    })
  },
  async mounted() {
    await this.$store.dispatch("common/getChannels");
    if (keys(this.$route.query).length > 0) {
      this.query = mergeRight(this.query, this.$route.query);

      if (!this.results) {
        this.$emit("submit", this.query);
      }
    }
    const isBad = anyPass([isNil, equals("")]);
    const toPush = reject(isBad)(this.currentQuery || {});
    if (!isEqual(toPush, this.$route.query)) {
      this.$router.push({
        name: "Search",
        query: reject(isBad)(this.currentQuery)
      });

      this.query = mergeRight(this.query, this.$route.query);
    }
  }
};
</script>

<style></style>
