<template>
  <div>
    <base-dark-label
      v-if="label"
      class="mb-1"
    >
      {{ label }}
    </base-dark-label>
    <input
      v-if="type !== 'textarea'"
      :value="value"
      class="bg-gray-700 shadow appearance-none rounded w-full py-2 px-3 text-gray-100 focus:outline-none"
      v-bind="$attrs"
      :type="type"
      v-on="listeners"
    >
    <textarea
      v-else
      :value="value"
      class="resize-none bg-gray-700 shadow appearance-none rounded w-full py-2 px-3 text-gray-100 focus:outline-none"
      v-bind="$attrs"
      v-on="listeners"
    />
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
