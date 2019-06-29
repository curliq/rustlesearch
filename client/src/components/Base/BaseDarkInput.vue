<template>
  <div class="flex flex-col md:items-center md:flex-row">
    <base-dark-label
      v-if="label"
      class="mb-1 md:mr-2 md:w-1/3"
    >
      {{ label }}
    </base-dark-label>
    <input
      :value="value"
      class="flex-1 min-w-0 bg-gray-700 shadow appearance-none rounded w-full py-2 px-3 text-gray-100 focus:outline-none"
      v-bind="$attrs"
      v-on="listeners"
    >
  </div>
</template>

<script>

export default {
  inheritAttrs: false,
  props: {
    value: {
      type: null,
      default: null
    },
    label: {
      type: String,
      default: null
    }
  },
  computed: {
    listeners () {
      return {
        ...this.$listeners,
        input: e => {
          this.$emit('input', e.target.value)
        }
      }
    }
  }
}
</script>

<style>

</style>
