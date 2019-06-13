<template>
  <q-input
    :value="value"
    label="Start"
    dense
    hide-bottom-space
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
            @input="emitValue"
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
  methods: {
    emitValue(v) {
      this.$emit('input', v)
      this.$refs.dateProxy.hide()
    },
  },
}
</script>

<style></style>
