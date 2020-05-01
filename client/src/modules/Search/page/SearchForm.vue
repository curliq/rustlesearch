<template>
  <div class="flex flex-col px-3 py-4 rounded-sm shadow bg-gray-850">
    <div>
      <div class="flex flex-row mb-5 lg:flex-row lg:items-center">
        <base-dark-label class="flex-initial mr-2 text-lg"
          >Search Options</base-dark-label
        >
        <div class="flex-1 text-sm text-gray-500">(one field required)</div>
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
      <div class="h-px my-4 border-b border-gray-800" />
      <div class="flex flex-wrap w-full mb-2">
        <div class="w-1/4">
          <button
            :class="[
              dateRange === `day` && activeButtonClass,
              `w-full px-3 py-2 text-center text-white border border-gray-700 rounded-sm hover:border-accent focus:outline-none`
            ]"
            @click="setDateRange(todayDayjs, todayDayjs)"
          >
            Today
          </button>
        </div>
        <div class="w-1/4">
          <button
            :class="[
              dateRange === `month` && activeButtonClass,
              `w-full px-3 py-2 text-center text-white border border-gray-700 rounded-sm hover:border-accent focus:outline-none`
            ]"
            @click="setDateRange(todayDayjs.subtract(1, `M`), todayDayjs)"
          >
            Month
          </button>
        </div>
        <div class="w-1/4">
          <button
            :class="[
              dateRange === `year` && activeButtonClass,
              `w-full px-3 py-2 text-center text-white border border-gray-700 rounded-sm hover:border-accent focus:outline-none`
            ]"
            @click="setDateRange(todayDayjs.subtract(1, `y`), todayDayjs)"
          >
            Year
          </button>
        </div>
        <div class="w-1/4 mb-3">
          <button
            :class="[
              dateRange === `all` && activeButtonClass,
              `w-full px-3 py-2 text-center text-white border border-gray-700 rounded-sm hover:border-accent focus:outline-none`
            ]"
            @click="setDateRange(`2010-01-01`, todayDayjs)"
          >
            All
          </button>
        </div>
        <div class="w-1/2">
          <div
            class="mb-3 mr-2 field"
            :class="query.start_date && 'field--not-empty'"
          >
            <label class="field__label">Start Date</label>
            <base-datepicker
              v-model="query.start_date"
              class="field__input"
              placeholder="Start Date"
              :options="{ max: query.end_date }"
            />
          </div>
        </div>
        <div class="w-1/2">
          <div
            class="mb-3 ml-2 field"
            :class="query.start_date && 'field--not-empty'"
          >
            <label class="field__label">End Date</label>
            <base-datepicker
              v-model="query.end_date"
              :options="{ min: query.start_date, max: today }"
              class="field__input"
              placeholder="End Date"
            />
          </div>
        </div>
      </div>
      <button
        class="w-full px-10 py-3 my-1 text-center text-white border border-transparent border-gray-700 rounded-sm hover:border-accent focus:outline-none"
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

const yearStart = dayjs()
  .utc()
  .subtract(1, "y")
  .format("YYYY-MM-DD");
const monthStart = dayjs()
  .utc()
  .subtract(1, "M")
  .format("YYYY-MM-DD");
const allStart = "2010-01-01";
const todayString = dayjs()
  .utc()
  .format("YYYY-MM-DD");
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
          .subtract(1, `y`)
          .format("YYYY-MM-DD"),
        end_date: dayjs()
          .utc()
          .format("YYYY-MM-DD")
      },
      activeButtonClass: "bg-gray-700",
      today: new Date(),
      todayDayjs: dayjs().utc()
    };
  },
  computed: {
    ...mapState("common", {
      channels: state => state.channels
    }),
    ...mapState("search", {
      currentQuery: state => state.currentQuery
    }),
    dateRange() {
      if (
        this.query.start_date === yearStart &&
        this.query.end_date === todayString
      )
        return "year";

      if (
        this.query.start_date === monthStart &&
        this.query.end_date === todayString
      )
        return "month";
      if (
        this.query.start_date === allStart &&
        this.query.end_date === todayString
      )
        return "all";
      if (
        this.query.start_date === todayString &&
        this.query.end_date === todayString
      )
        return "day";
      return "";
    }
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
  },
  methods: {
    setDateRange(s, e) {
      console.log(s, e);
      this.query.start_date = dayjs.utc(s).format("YYYY-MM-DD");
      this.query.end_date = dayjs.utc(e).format("YYYY-MM-DD");
    },
    checkSpecialDateRange(type) {
      switch (type) {
        case "year":
          return this.start_date === yearStart && this.end_date === todayString;

        case "month":
          return (
            this.start_date === monthStart && this.end_date === todayString
          );
        case "all":
          return this.start_date === allStart && this.end_date === todayString;
        case "day":
          return (
            this.start_date === todayString && this.end_date === todayString
          );
        default:
          return false;
      }
    }
  }
};
</script>

<style></style>
