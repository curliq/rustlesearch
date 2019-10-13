<template>
  <div class="bg-gray-850 shadow">
    <div class="px-8">
      <div class="flex items-center justify-between py-3">
        <router-link
          :to="{ name: 'Home' }"
          class="outline-none text-xl text-white hover:text-gray-200"
        >
          <span class="font-bold">Rustle</span>Search
        </router-link>

        <div class="hidden sm:flex sm:items-center">
          <router-link
            :to="{ name: 'About' }"
            class="text-white text-sm font-semibold hover:text-gray-200"
            >About
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showNav: false
    };
  }
};
</script>

<style></style>
