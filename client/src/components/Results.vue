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
      <q-item>
        <q-item-section
          top
          class="col-2"
        >
          <q-item-label
            class="q-mt-sm"
            :lines="1"
          >
            {{ result.channel }}
          </q-item-label>
        </q-item-section>
        <q-item-section
          top
          class=""
        >
          <q-item-label style="wrap: break-word;">
            <span class="text-weight-medium">{{ result.username }}: </span>
            <span class="text-grey-8">{{ result.text }}</span>
          </q-item-label>
          <q-item-label
            caption
            lines="1"
          >
            {{
              DateTime.fromISO(result.ts)
                .toUTC()
                .toFormat('HH:mm:ss MMM dd, yyyy')
            }}
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

<style></style>
