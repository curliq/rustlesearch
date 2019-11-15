<template>
  <div class="flex items-center text-gray-200 pl-2 mb-1 rounded-t bg-gray-800">
    <p class="py-2 pl-1 pr-4 font-bold">
      Results
    </p>
    <p v-if="results" class="text-xs">
      <span>Total Results: {{ results.count.toLocaleString("en-US") }}</span>
      <span v-if="results.countLimit">+</span>
    </p>
    <div class="ml-auto" />
    <span
      :class="[sharedClasses, !isCompact ? activeClass : nonActiveClass]"
      @click="$emit('update:mode', 'normal')"
    >
      <div>
        <div style="line-height: 0.30;">—</div>
        <div style="line-height: 0.30;">—</div>
      </div>
    </span>
    <span
      :class="[sharedClasses, isCompact ? activeClass : nonActiveClass]"
      @click="$emit('update:mode', 'compact')"
    >
      <div>
        <div style="line-height: 0.25;">—</div>
        <div style="line-height: 0.25;">—</div>
        <div style="line-height: 0.25;">—</div>
      </div>
    </span>
  </div>
</template>

<script>
export default {
  props: {
    mode: {
      type: String,
      default: "normal"
    },
    results: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      sharedWordClass: "px-3 self-stretch font-semibold flex items-center",
      sharedClasses: "self-stretch flex items-center text-2xl fas px-3",
      activeClass: "cursor-default text-accent",
      nonActiveClass: "hover:bg-gray-700 cursor-pointer"
    };
  },
  computed: {
    isCompact() {
      return this.mode === "compact";
    }
  }
};
</script>

<style></style>
