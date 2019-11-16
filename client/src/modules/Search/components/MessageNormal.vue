<template>
  <div
    class="flex items-center border-b border-gray-800 py-1"
    @click="$emit('surrounds')"
  >
    <div
      class="lg:1/6 md:w-1/5 w-1/4 text-gray-300 text-center truncate px-1 font-bold"
    >
      {{ channel }}
    </div>
    <div class="xl:w-11/12 lg:5/6 md:w-4/5 w-3/4">
      <div class="flex flex-col md:flex-row md:items-center">
        <p class="text-gray-200 font-semibold mr-2">
          {{ username }}
        </p>
        <p class="text-gray-400 text-sm">
          {{ date }}
        </p>
      </div>

      <p
        class="text-gray-200 overflow-x-hidden mr-1"
        style="overflow-wrap: anywhere;"
      >
        {{ text }}
      </p>
    </div>
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
  }
};
</script>

<style></style>
