<template>
  <tr class="text-gray-200 px-2">
    <td class="text-gray-400 inline-block pl-1 pr-4">
      {{ channel }}
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
