<template>
  <div
    class="flex items-center text-gray-200 pl-2 mb-1 rounded-t-sm bg-gray-800"
  >
    <p class="py-2 pl-1 pr-4 font-bold">
      Results
    </p>
    <p v-if="results" class="text-xs">
      <span>Total Results: {{ results.count.toLocaleString("en-US") }}</span>
      <span v-if="results.countLimit">+</span>
    </p>
  </div>
</template>

<script>
export default {
  props: {
    results: {
      type: Object,
      default: null
    }
  }
};
</script>

<style></style>
