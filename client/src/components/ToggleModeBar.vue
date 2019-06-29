<template>
  <div class="flex items-center text-gray-200 font-bold pl-2 mb-1 rounded-t bg-gray-800">
    <p class="py-1">
      Results
    </p>
    <div class="ml-auto" />
    <span
      :class="[sharedClasses, 'mdi-view-stream', !isCompact ? activeClass : nonActiveClass]"
      @click="$emit('input', 'message')"
    />
    <span
      :class="[sharedClasses, 'mdi-view-headline', isCompact ? activeClass : nonActiveClass]"
      @click="$emit('input', 'compact-message')"
    />
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      sharedClasses: 'text-2xl mdi px-3',
      activeClass: 'bg-gray-600',
      nonActiveClass: 'hover:bg-gray-700 cursor-pointer'
    }
  },
  computed: {
    isCompact () {
      return this.value === 'compact-message'
    }
  }
}
</script>

<style>

</style>
