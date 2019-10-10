<template>
  <div :class="['field', value && 'field--not-empty', styles]">
    <label class="field__label">
      {{ placeholder }}
    </label>
    <v-select
      v-if="type === 'select'"
      v-bind="$attrs"
      :options="items"
      :placeholder="placeholder"
      class="field__input bg-gray-700 style-chooser rounded w-full py-1 pr-3 pl-1 focus:outline-none"
      @input="v => $emit('input', v)"
      v-on="$listeners"
    />
    <input
      v-else
      :type="type"
      :value="value"
      :placeholder="placeholder"
      class="field__input bg-gray-700 rounded w-full py-2 px-3 placeholder-gray-400 text-gray-100 focus:outline-none"
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
    placeholder: {
      type: String,
      default: null
    },
    type: {
      type: String,
      default: "text"
    },
    items: {
      type: Array,
      default: () => []
    },
    styles: {
      type: [String, Array],
      default: ""
    }
  },
  computed: {
    listeners() {
      return {
        ...this.$listeners,
        input: e => {
          this.$emit("input", e.target.value);
        }
      };
    }
  }
};
</script>

<style></style>
