<script setup lang="ts">
interface Props {
  name?: string
  description?: string
  address?: string
  phone?: string
  segment?: string
  openingHours?: string
  logoPath?: string
  createdAt?: string
  businessRepittCode?: string
  isActive?: boolean
}

const props = defineProps<Props>()

const initial = computed(() =>
  String(props.name || 'R').charAt(0).toUpperCase(),
)

const formatDate = (iso?: string) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <!-- Status banner -->
  <VCard
    rounded="xl"
    class="mb-4"
    :color="isActive ? 'success' : 'error'"
    variant="tonal"
  >
    <VCardText class="pa-3 d-flex align-center gap-2">
      <VIcon
        :icon="isActive ? 'tabler-circle-check' : 'tabler-circle-x'"
        size="18"
      />
      <span class="text-body-2 font-weight-bold">
        Negocio {{ isActive ? 'activo' : 'inactivo' }}
      </span>
    </VCardText>
  </VCard>

  <!-- Header -->
  <VCard
    rounded="xl"
    class="mb-4"
  >
    <VCardText class="pa-5 text-center">
      <VAvatar
        rounded="lg"
        size="80"
        color="primary"
        variant="tonal"
        class="mb-3"
      >
        <VImg
          v-if="logoPath"
          :src="logoPath"
        />
        <span
          v-else
          class="text-h3 font-weight-bold"
        >{{ initial }}</span>
      </VAvatar>

      <div class="text-h6 font-weight-bold mb-2">
        {{ name || 'Sin nombre' }}
      </div>

      <div class="d-flex flex-wrap justify-center gap-2 mb-3">
        <VChip
          v-if="segment"
          color="primary"
          size="small"
          variant="tonal"
        >
          {{ segment }}
        </VChip>
        <VChip
          v-if="businessRepittCode"
          size="small"
          variant="outlined"
        >
          <VIcon
            start
            icon="tabler-barcode"
            size="13"
          />
          {{ businessRepittCode }}
        </VChip>
      </div>

      <div
        v-if="description"
        class="text-body-2 text-medium-emphasis"
      >
        {{ description }}
      </div>
    </VCardText>

    <VDivider />

    <VList density="compact">
      <VListItem
        prepend-icon="tabler-map-pin"
        :title="address || 'Dirección no disponible'"
      />
      <VDivider />
      <VListItem
        prepend-icon="tabler-phone"
        :title="phone || 'Teléfono no disponible'"
      />
      <VDivider />
      <VListItem
        prepend-icon="tabler-clock"
        :title="openingHours || 'Horario no disponible'"
      />
      <VDivider />
      <VListItem
        prepend-icon="tabler-calendar"
        :title="`Miembro desde ${formatDate(createdAt)}`"
      />
    </VList>
  </VCard>
</template>
