<template>
  <div class="flex items-center text-gray-200 pl-2 mb-1 rounded-t bg-gray-800">
    <p class="py-2 pl-1 font-bold">
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
    <div class="border-l self-stretch my-1 border-gray-400" />
    <span
      :class="[sharedClasses, !isCompact ? activeClass : nonActiveClass]"
      @click="$emit('update:mode', 'message')"
    >
      <div>
        <div style="line-height: 0.30;">—</div>
        <div style="line-height: 0.30;">—</div>
      </div>
    </span>
    <span
      :class="[sharedClasses, isCompact ? activeClass : nonActiveClass]"
      @click="$emit('update:mode', 'compact-message')"
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
      activeClass: "cursor-default text-accent",
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
