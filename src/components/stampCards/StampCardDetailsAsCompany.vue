<script setup lang="ts">
interface Props {
  stampCardName?: string | null
  description?: string | null
  reward?: string | null
  requiredStamps?: number | null
  visitsCount?: number | null
  stampIcon?: string | null
  primaryColor?: string | null
  startDate?: string | null
  endDate?: string | null
  requireOtp?: boolean
  isActive?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'toggle-active'): void
  (e: 'go-visits'): void
  (e: 'go-edit'): void
  (e: 'go-register'): void
}>()

const accentColor = computed(() => props.primaryColor || '#6C3CE1')

const showDots = computed(() => (props.requiredStamps ?? 0) <= 12)

const formatDate = (iso: string | null | undefined) => {
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
    <VCardText class="pa-4 d-flex align-center justify-space-between">
      <div class="d-flex align-center gap-2">
        <VIcon
          :icon="isActive ? 'tabler-circle-check' : 'tabler-circle-x'"
          size="20"
        />
        <span class="text-body-2 font-weight-bold">
          Tarjeta {{ isActive ? 'activa' : 'inactiva' }}
        </span>
      </div>
      <VBtn
        size="small"
        variant="tonal"
        :color="isActive ? 'error' : 'success'"
        rounded="xl"
        @click="emit('toggle-active')"
      >
        {{ isActive ? 'Desactivar' : 'Activar' }}
      </VBtn>
    </VCardText>
  </VCard>

  <!-- Card header -->
  <VCard
    rounded="xl"
    class="mb-4"
    :style="{ borderBlockStart: `4px solid ${accentColor}` }"
  >
    <VCardText class="pa-4">
      <div class="d-flex align-center gap-3">
        <VAvatar
          rounded="lg"
          size="52"
          :style="{ background: `${accentColor}20` }"
        >
          <VImg
            v-if="stampIcon"
            :src="stampIcon"
          />
          <VIcon
            v-else
            icon="tabler-cards"
            size="26"
            :style="{ color: accentColor }"
          />
        </VAvatar>
        <div class="flex-grow-1">
          <div class="text-h6 font-weight-bold">
            {{ stampCardName ?? 'Sin nombre' }}
          </div>
          <div
            v-if="description"
            class="text-body-2 text-medium-emphasis mt-1"
          >
            {{ description }}
          </div>
        </div>
      </div>
    </VCardText>
  </VCard>

  <!-- Stats -->
  <VCard
    rounded="xl"
    class="mb-4"
  >
    <VCardText class="pa-4">
      <div class="d-flex align-center justify-space-between mb-3">
        <div class="text-body-2 font-weight-bold text-medium-emphasis text-uppercase section-label-sm">
          Sellos
        </div>
        <div
          class="text-h6 font-weight-bold"
          :style="{ color: accentColor }"
        >
          {{ requiredStamps ?? '?' }} sellos requeridos
        </div>
      </div>

      <!-- Dots preview -->
      <div
        v-if="showDots"
        class="stamps-grid"
      >
        <div
          v-for="i in requiredStamps ?? 0"
          :key="i"
          class="stamp-dot"
          :style="{
            background: `${accentColor}20`,
            borderColor: accentColor,
          }"
        >
          <VImg
            v-if="stampIcon"
            :src="stampIcon"
            :width="16"
            :height="16"
            cover
          />
          <VIcon
            v-else
            icon="tabler-star"
            size="14"
            :style="{ color: accentColor }"
          />
        </div>
      </div>
      <div
        v-else
        class="text-body-2 text-medium-emphasis"
      >
        {{ requiredStamps }} sellos por tarjeta completa
      </div>
    </VCardText>
  </VCard>

  <!-- Visits stat -->
  <VCard
    rounded="xl"
    class="mb-4"
  >
    <VCardText class="pa-4 d-flex align-center gap-3">
      <div
        class="stat-icon"
        :style="{ background: `${accentColor}15`, color: accentColor }"
      >
        <VIcon
          icon="tabler-walk"
          size="22"
        />
      </div>
      <div>
        <div class="text-caption text-medium-emphasis">
          Visitas totales en esta tarjeta
        </div>
        <div class="text-h5 font-weight-bold">
          {{ visitsCount ?? 0 }}
        </div>
      </div>
      <VSpacer />
      <VBtn
        variant="tonal"
        size="small"
        rounded="xl"
        :style="{ color: accentColor }"
        @click="emit('go-visits')"
      >
        Ver historial
      </VBtn>
    </VCardText>
  </VCard>

  <!-- Reward -->
  <VCard
    rounded="xl"
    class="mb-4"
    :style="{ background: `${accentColor}10` }"
  >
    <VCardText class="pa-4 d-flex align-center gap-3">
      <div
        class="stat-icon"
        :style="{ background: `${accentColor}20`, color: accentColor }"
      >
        <VIcon
          icon="tabler-gift"
          size="22"
        />
      </div>
      <div>
        <div class="text-caption text-medium-emphasis">
          Recompensa
        </div>
        <div class="text-body-1 font-weight-bold">
          {{ reward || 'Sin recompensa definida' }}
        </div>
      </div>
    </VCardText>
  </VCard>

  <!-- Validity -->
  <VCard
    v-if="startDate || endDate"
    rounded="xl"
    class="mb-4"
  >
    <VCardText class="pa-4 d-flex align-center gap-3">
      <VIcon
        icon="tabler-calendar"
        size="20"
        color="medium-emphasis"
      />
      <div>
        <div class="text-caption text-medium-emphasis">
          Vigencia
        </div>
        <div class="text-body-2 font-weight-medium">
          {{ formatDate(startDate) }} — {{ formatDate(endDate) }}
        </div>
      </div>
    </VCardText>
  </VCard>

  <!-- OTP -->
  <VCard
    v-if="requireOtp"
    rounded="xl"
    class="mb-4"
    color="info"
    variant="tonal"
  >
    <VCardText class="pa-4 d-flex align-center gap-3">
      <VIcon
        icon="tabler-shield-lock"
        size="20"
      />
      <div>
        <div class="text-body-2 font-weight-medium">
          Validación OTP activa
        </div>
        <div class="text-caption">
          Cada visita requiere confirmación con código de un solo uso
        </div>
      </div>
    </VCardText>
  </VCard>

  <!-- Actions -->
  <VBtn
    v-if="isActive"
    block
    size="large"
    class="mb-3"
    prepend-icon="tabler-qrcode"
    :style="{ background: accentColor }"
    @click="emit('go-register')"
  >
    Registrar visita
  </VBtn>

  <VBtn
    block
    variant="tonal"
    size="large"
    class="mb-3"
    prepend-icon="tabler-edit"
    @click="emit('go-edit')"
  >
    Editar tarjeta
  </VBtn>
</template>

<style scoped>
.stamps-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.stamp-dot {
  display: flex;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  border: 2px solid;
  border-radius: 50%;
  block-size: 32px;
  inline-size: 32px;
}

.stat-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  block-size: 44px;
  inline-size: 44px;
}

.section-label-sm {
  font-size: 0.72rem;
  letter-spacing: 0.05em;
}
</style>
