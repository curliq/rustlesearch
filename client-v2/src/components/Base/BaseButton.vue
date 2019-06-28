<template>
  <button
    type="submit"
    class="px-10 text-center py-3 rounded text-white focus:outline-none my-1"
    :class="colorClass"
  >
    <slot />
  </button>
</template>

<script>
export default {
  props: {
    color: {
      type: String,
      default: 'blue'
    }
  },
  computed: {
    // eslint-disable-next-line vue/return-in-computed-property
    colorClass () {
      switch (this.color) {
        case ('red'):
          return 'bg-red-400 hover:bg-red-500'
        case ('blue'):
          return 'bg-blue-400 hover:bg-blue-500'
        case ('green'):
          return 'bg-green-400 hover:bg-green-500'
        case ('purple'):
          return 'bg-purple-400 hover:bg-purple-500'
      }
    }
  }

}
</script>

<style>

</style>
