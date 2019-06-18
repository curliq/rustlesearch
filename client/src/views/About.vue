<template>
  <q-page
    class="q-py-md q-mx-auto"
    style="max-width: 1200px;"
  >
    <div class="flex flex-center column">
      <p class="text-h2">
        About RustleSearch
      </p>
      <p>
        contact me at rustlesearch@gmail.com for inquiry
      </p>
      <q-btn
        color="primary"
        @click="signUp"
      >
        Signup with Patreon
      </q-btn>
      {{ resp }}
    </div>
  </q-page>
</template>

<script>
import popupTools from 'popup-tools'
export default {
  data() {
    return {
      resp: null,
    }
  },
  methods: {
    signUp() {
      popupTools
        .popup(
          `${process.env.VUE_APP_API}/connect/patreon`,
          'Patreon Connect', {}, (err, jwt) => {
            if (err) {
              this.$q.notify({
                text: 'Authentication Failed',
                position: 'bottom-right',
                timeout: 1000,
              })
            } else
              this.resp = jwt
          })
    },
  },
}
</script>

<style lang="scss" scoped></style>
