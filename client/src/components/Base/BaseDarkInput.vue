<template>
  <div class="flex flex-col md:items-center md:flex-row">
    <base-dark-label
      v-if="label"
      class="mb-1 md:mr-2 md:w-1/3"
    >
      {{ label }}
    </base-dark-label>
    <v-select
      v-if="type === 'select'"
      v-bind="$attrs"
      :options="items"

      class="flex-1 min-w-0 bg-gray-700 shadow style-chooser rounded w-full py-1 pr-3 pl-1 focus:outline-none"
      @input="v => $emit('input', v)"
      v-on="$listeners"
    />
    <input
      v-else
      :type="type"
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
    },
    type: {
      type: String,
      default: 'text'
    },
    items: {
      type: Array,
      default: () => []
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
