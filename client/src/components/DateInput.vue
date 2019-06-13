<template>
  <q-input
    :value="value"
    class="col-md-2 col-6"
    label="Start"
    dense
    outlined
    mask="date"
    :rules="['date']"
    @input="v => $emit('input', v)"
  >
    <template v-slot:append>
      <q-icon
        name="event"
        class="cursor-pointer"
      >
        <q-popup-proxy
          ref="dateProxy"
          transition-show="scale"
          transition-hide="scale"
        >
          <q-date
            :value="value"
            @input="v => $emit('input', v); $refs.dateProxy.hide()"
          />
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: '',
    },
  },
}
</script>

<style>

</style>
