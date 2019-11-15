<template>
  <div class="text-gray-200 px-2">
    <span
      class="text-gray-400 border-gray-700 inline-block"
      style="width: 6.5rem;"
    >
      {{ channel }}
    </span>

    <span class="text-gray-500 mr-1">[ {{ date }} ]</span>
    <span class="font-bold mr-1"> {{ username }}:</span>

    <span class="">{{ text }}</span>
  </div>
</template>

<script>
export default {
  props: {
    channel: {
      type: String,
      default: null
    },
    username: {
      type: String,
      default: null
    },
    text: {
      type: String,
      default: null
    },
    date: {
      type: String,
      default: null
    }
  },
  computed: {}
};
</script>

<style></style>
