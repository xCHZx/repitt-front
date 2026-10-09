<script lang="ts" setup>
import { listMyActivity } from '@/api/endpoints/me'
import type { MeActivityEvent } from '@/api/types'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import VisitListItemFull from '@/components/visits/VisitListItemFull.vue'
import { useCursorList } from '@/composables/useCursorList'
import { formatInstant } from '@/utils/dates'

// My activity (guide §4.C.3): cursor list, newest first, no totals.

definePage({
  meta: {
    layout: 'visitor',
  },
})

const { items, loading, loaded, error, hasMore, isEmpty: noActivity, reload, loadMore } = useCursorList<MeActivityEvent>(
  cursor => listMyActivity({ cursor, limit: 25 }),
)

const groups = computed(() => {
  const map = new Map<string, MeActivityEvent[]>()
  for (const event of items.value) {
    const month = formatInstant(event.occurredAt, undefined, { month: 'long', year: 'numeric' })

    // Sentence case («Octubre de 2026»): la etiqueta ya no va en mayúsculas forzadas
    const label = month.charAt(0).toLocaleUpperCase('es-MX') + month.slice(1)
    const list = map.get(label)
    if (list)
      list.push(event)
    else
      map.set(label, [event])
  }

  return [...map.entries()].map(([label, events]) => ({ label, events }))
})

onMounted(reload)
</script>

<template>
  <div>
    <template v-if="!loaded && loading">
      <VSkeletonLoader
        v-for="i in 4"
        :key="i"
        type="list-item-avatar-two-line"
        class="mb-2 rounded-xl"
      />
    </template>

    <div
      v-else-if="!loaded && error"
      class="py-6"
    >
      <ApiErrorAlert :error="error" />
      <VBtn
        variant="tonal"
        class="mt-4"
        prepend-icon="tabler-refresh"
        @click="reload"
      >
        Reintentar
      </VBtn>
    </div>

    <div
      v-else-if="noActivity"
      class="py-12"
    >
      <VIcon
        icon="tabler-activity"
        size="56"
        color="medium-emphasis"
        class="mb-4"
      />
      <div class="text-h6 font-weight-bold mb-1">
        Aún no tienes actividad
      </div>
      <div class="text-body-2 text-medium-emphasis">
        Tus sellos y canjes aparecerán aquí
      </div>
    </div>

    <template v-else>
      <template
        v-for="group in groups"
        :key="group.label"
      >
        <div class="section-label mb-3">
          {{ group.label }}
        </div>
        <div class="d-flex flex-column gap-2 mb-5">
          <VisitListItemFull
            v-for="event in group.events"
            :key="event.id"
            :event="event"
          />
        </div>
      </template>

      <ApiErrorAlert
        :error="error"
        class="mb-3"
      />

      <VBtn
        v-if="hasMore"
        block
        variant="tonal"
        :loading="loading"
        @click="loadMore"
      >
        Ver más
      </VBtn>
    </template>
  </div>
</template>
