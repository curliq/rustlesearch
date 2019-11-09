<template>
  <div
    class="py-2 text-center font-bold text-gray-100 border-t border-gray-700 hover:bg-gray-800 cursor-pointer"
    @click="loadMoreMessages"
  >
    <span v-if="!loading">Load more messages</span>
    <base-loader v-else />
  </div>
</template>

<script>
export default {
  computed: {
    loading() {
      return this.$store.state.loading;
    }
  },
  methods: {
    loadMoreMessages() {
      this.$store.dispatch("search/loadMoreMessages");
    }
  }
};
</script>

<style scoped></style>
