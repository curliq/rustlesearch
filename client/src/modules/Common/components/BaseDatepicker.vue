<template>
  <input
    ref="datepicker"
    v-mask="'####-##-##'"
    class="w-full px-3 py-2 text-gray-300 bg-gray-700 rounded-sm shadow appearance-none focus:outline-none"
    type="text"
    :value="value"
    @change="e => $emit('input', e.target.value)"
  />
</template>

<script>
import TinyDatePicker from "tiny-date-picker";
import dayjs from "@/dayjs";

export default {
  props: {
    value: {
      type: String,
      default: dayjs().format("YYYY-MM-DD")
    },
    options: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      dp: null
    };
  },
  watch: {
    options: {
      handler() {
        if (this.dp) this.dp.destroy();
        this.dp = null;
        this.createDp();
      }
    }
  },
  mounted() {
    this.createDp();
  },
  methods: {
    createDp() {
      this.dp = TinyDatePicker(this.$refs.datepicker, {
        mode: "dp-below",
        parse(str) {
          const date = dayjs(str);
          if (date.isValid()) {
            return date.toDate();
          }

          return dayjs().toDate();
        },
        format(date) {
          return dayjs(date).format("YYYY-MM-DD");
        },
        ...this.options
      });
    }
  }
};
</script>

<style></style>
