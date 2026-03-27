<script setup lang="ts">
interface Props {
  visit: any
}

const props = defineProps<Props>()

const formattedDate = computed(() => {
  if (!props.visit?.createdAt) return '—'

  return new Date(props.visit.createdAt).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const initial = computed(() =>
  String(props.visit?.business?.name || 'R').charAt(0).toUpperCase(),
)
</script>

<template>
  <VCard
    rounded="xl"
    style="border-inline-start: 3px solid rgb(var(--v-theme-primary));"
  >
    <VCardText class="pa-4">
      <div class="d-flex align-center gap-3">
        <VAvatar
          rounded="lg"
          size="44"
          color="primary"
          variant="tonal"
        >
          <VImg
            v-if="visit?.business?.logoPath"
            :src="visit.business.logoPath"
          />
          <span
            v-else
            class="text-body-2 font-weight-bold"
          >{{ initial }}</span>
        </VAvatar>

        <div class="flex-grow-1 overflow-hidden">
          <div class="text-subtitle-2 font-weight-bold text-truncate">
            {{ visit?.business?.name ?? 'Sin nombre' }}
          </div>
          <div class="text-caption text-medium-emphasis text-truncate">
            {{ visit?.stampCard?.name ?? '—' }}
          </div>
          <div class="d-flex align-center gap-1 mt-1">
            <VIcon
              icon="tabler-calendar"
              size="12"
              color="medium-emphasis"
            />
            <span class="text-caption text-medium-emphasis">{{ formattedDate }}</span>
          </div>
        </div>

      </div>
    </VCardText>
  </VCard>
</template>
