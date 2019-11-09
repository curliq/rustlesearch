<template>
  <div
    class="py-2 text-center font-bold text-gray-100 border-t border-gray-700 hover:bg-gray-800 cursor-pointer"
    v-on="$listeners"
  >
    <span v-if="!loading">Load more messages</span>
    <base-loader v-else />
  </div>
</template>

<script>
export default {
  props: {
    loading: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped></style>
