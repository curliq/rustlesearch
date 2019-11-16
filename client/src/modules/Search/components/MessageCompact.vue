<template>
  <tr class="text-gray-200 px-2">
    <td class="text-gray-400 pl-1 pr-4 whitespace-no-wrap inline-block">
      <span
        class="hover:border-accent border-gray-800 border px-2 mx-1 rounded cursor-pointer"
        @click="$emit('surrounds')"
        >&gt;</span
      >
      <span> {{ channel }}</span>
    </td>
    <td class="pr-1">
      <span class="text-gray-500 mr-1 block md:inline">[ {{ date }} ]</span>
      <span class="font-bold mr-1"> {{ username }}:</span>

      <span class="">{{ text }}</span>
    </td>
  </tr>
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
