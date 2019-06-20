<template>
  <q-list
    bordered
    class="rounded-borders"
  >
    <q-item-label header>
      Results
    </q-item-label>
    <div
      v-for="(result, i) in results"
      :key="i"
    >
      <q-item dense>
        <q-item-section
          top
          class="col-2"
        >
          <q-item-label
            class="q-mt-sm nice-font"
            :lines="1"
          >
            {{ result.channel }}
          </q-item-label>
        </q-item-section>
        <q-item-section
          top
          class
        >
          <q-item-label style="wrap: break-word;">
            <span class="text-body2 text-red-8 text-weight-medium nice-font">{{
              result.username
            }}</span>
            <span
              class="text-caption text-weight-light text-grey-8 q-ml-xs nice-font"
            >
              {{
                DateTime.fromISO(result.ts)
                  .toUTC()
                  .toFormat('HH:mm:ss MMM dd, yyyy')
              }}
            </span>
          </q-item-label>
          <q-item-label class="nice-font text-grey-10">
            {{ result.text }}
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-separator spaced />
    </div>
  </q-list>
</template>

<script>
import {DateTime} from 'luxon'
export default {
  props: {
    results: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    DateTime() {
      return DateTime
    },
  },
}
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css?family=Muli&display=swap');
.nice-font {
  font-family: 'Muli', sans-serif;
}
</style>
