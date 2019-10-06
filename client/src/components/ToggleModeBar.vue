<template>
  <div class="flex items-center text-gray-200 pl-2 mb-1 rounded-t bg-gray-800">
    <p class="py-1 font-bold">
      Results
    </p>
    <div class="ml-auto" />
    <div
      :class="[sharedWordClass, isUtc ? activeClass : nonActiveClass]"
      @click="$emit('update:isUtc', true)"
    >
      UTC
    </div>
    <div
      :class="[sharedWordClass, !isUtc ? activeClass : nonActiveClass]"
      @click="$emit('update:isUtc', false)"
    >
      Local
    </div>
    <div class="border-l self-stretch border-gray-400" />
    <span
      :class="[
        sharedClasses,
        'fa-equals',
        !isCompact ? activeClass : nonActiveClass
      ]"
      @click="$emit('update:mode', 'message')"
    />
    <span
      :class="[
        sharedClasses,
        'fa-bars',
        isCompact ? activeClass : nonActiveClass
      ]"
      @click="$emit('update:mode', 'compact-message')"
    />
  </div>
</template>

<script>
export default {
  props: {
    mode: {
      type: String,
      default: "message"
    },
    isUtc: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      sharedWordClass: "px-3 self-stretch font-semibold flex items-center",
      sharedClasses: "self-stretch flex items-center text-2xl fas px-3",
      activeClass: "bg-gray-600 cursor-default",
      nonActiveClass: "hover:bg-gray-700 cursor-pointer"
    };
  },
  computed: {
    isCompact() {
      return this.mode === "compact-message";
    }
  }
};
</script>

<style></style>
