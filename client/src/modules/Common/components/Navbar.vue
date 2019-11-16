<template>
  <nav
    class="flex items-center justify-between flex-wrap bg-gray-850 px-6 py-3"
  >
    <div class="flex items-center flex-no-shrink mr-6">
      <router-link
        :to="{ name: 'Search' }"
        class="outline-none text-xl text-white hover:text-gray-200"
      >
        <span class="font-bold text-accent">Rustle</span>Search
      </router-link>
    </div>
    <div class="block sm:hidden">
      <button
        class="flex items-center px-3 py-2 border rounded text-gray-500 border-gray-500 hover:text-gray-400 hover:border-white"
        @click="open = !open"
      >
        <svg
          class="fill-current h-3 w-3"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Menu</title>
          <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
        </svg>
      </button>
    </div>
    <div
      :class="open ? 'block' : 'hidden'"
      class="w-full flex-grow sm:flex sm:items-center sm:w-auto pt-2 mt-2 sm:mt-0 border-t border-gray-700 sm:border-t-0"
    >
      <div class="text-sm sm:flex-grow"></div>
      <div>
        <router-link
          :to="{ name: 'About' }"
          class="text-white font-semibold hover:text-gray-200 hover:underline block mb-2 sm:mb-0 sm:inline-block sm:mr-4"
          active-class="text-accent hover:text-orange-300"
        >
          About
        </router-link>
      </div>
      <div>
        <a
          class="block sm:inline-block"
          href="https://www.patreon.com/rustlesearch"
          target="_blank"
        >
          <img class="h-10" src="../../../assets/patreon.png" alt="Patreon" />
        </a>
      </div>
    </div>
  </nav>
  <!--
  <div class="bg-gray-850 shadow">
    <div class="px-8">
      <div class="flex items-center py-3">
        <div class="w-full flex flex-grow justify-between">
          <router-link
            :to="{ name: 'Search' }"
            class="outline-none text-xl text-white hover:text-gray-200"
          >
            <span class="font-bold text-accent">Rustle</span>Search
          </router-link>

          <div class="sm:hidden burger" @click="show = !show">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
        <div
          :class="[
            !show && 'hidden',
            'flex sm:flex flex-shrink flex-col sm:flex-row w-full border-t sm:border-t-0 border-gray-700 mt-2'
          ]"
        >
          <router-link
            :to="{ name: 'About' }"
            class="text-white font-semibold hover:text-gray-200 hover:underline"
            active-class="text-accent hover:text-orange-300"
            >About
          </router-link>
          <a
            class="ml-4"
            href="https://www.patreon.com/rustlesearch"
            target="_blank"
          >
            <img class="h-10" src="../../../assets/patreon.png" alt="Patreon" />
          </a>
        </div>
      </div>
    </div>
  </div>
    -->
</template>

<script>
export default {
  data() {
    return {
      open: false
    };
  }
};
</script>

<style scoped>
.burger > div {
  width: 30px;
  height: 2px;
  background-color: #bbb;
  border-radius: 1px;
  margin: 6px 0;
}
</style>
