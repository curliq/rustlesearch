<template>
  <q-layout view="hhh Lpr lFf">
    <q-header
      bordered
      class="bg-white"
    >
      <q-toolbar
        class="q-mx-auto bg-white text-black"
        style="max-width: 1200px;"
      >
        <q-toolbar-title>
          <router-link
            style="display: inline-block;"
            class="cursor-pointer bg-blue-5 text-white q-pa-sm q-my-sm rounded-borders"
            tag="div"
            :to="{ name: 'Home', query: $route.query }"
          >
            <strong>Rustle</strong>Search
          </router-link>
        </q-toolbar-title>

        <q-btn
          size="lg"
          no-caps
          flat
          label="About"
          class="text-grey-10"
          :to="{ name: 'About', query: $route.query }"
        />
      </q-toolbar>
    </q-header>

    <q-page-container class="q-mx-sm">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  data() {
    return {
      leftDrawerOpen: this.$q.platform.is.desktop
    }
  }
}
</script>
