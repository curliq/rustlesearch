<template>
  <div
    id="app"
    class="bg-gray-950 w-full min-h-screen m-0"
  >
    <base-notifications />
    <navbar />
    <div class="mt-8 lg:px-8 md:px-4 px-2">
      <router-view />
    </div>
  </div>
</template>
<script>
import Navbar from './components/Navbar'
export default {
  components: {
    Navbar
  }
}
</script>

<style lang="scss">
</style>
