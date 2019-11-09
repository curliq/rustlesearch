<template>
  <notifications group="vuex" position="bottom left">
    <template slot="body" slot-scope="props">
      <div
        class="p-3 m-4 text-white bg-gray-800 shadow border-l-4 border-purple-500"
        @click="props.close"
      >
        <div v-if="props.item.title" class="notification-title">
          {{ props.item.title }}
        </div>
        <div class="notification-content">
          {{ props.item.text }}
        </div>
      </div>
    </template>
  </notifications>
</template>

<script>
export default {};
</script>

<style></style>
