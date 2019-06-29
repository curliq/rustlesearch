<template>
  <input
    ref="datepicker"
    class="cursor-pointer bg-gray-700 shadow appearance-none rounded w-full py-2 px-3 text-gray-300 focus:outline-none"
    type="text"
    readonly
    :value="value"
    @change="(e) => $emit('input', e.target.value)"
  >
</template>

<script>
import dayjs from '@/dayjs'
import TinyDatePicker from 'tiny-date-picker'
export default {
  props: {
    value: {
      type: String,
      default: null
    },
    options: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      dp: null
    }
  },
  watch: {
    options: {
      handler () {
        if (this.dp) this.dp.destroy()
        this.dp = null
        this.createDp()
      }
    }
  },
  mounted () {
    this.createDp()
  },
  methods: {
    createDp () {
      this.dp = TinyDatePicker(this.$refs.datepicker, {
        mode: 'dp-below',
        parse (date) {
          return dayjs(date).toDate()
        },
        format (date) {
          return dayjs(date).format('YYYY-MM-DD')
        },
        ...this.options
      })
    }
  }
}
</script>

<style>

</style>
