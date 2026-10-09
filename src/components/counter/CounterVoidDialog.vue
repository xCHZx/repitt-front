<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import CounterErrorAlert from './CounterErrorAlert.vue'
import { useCounterError } from './useCounterError'
import { isSameKeyRetriable, useRetriableAttempt } from './useRetriableAttempt'
import { voidEvent } from '@/api/endpoints/loyalty'
import { withIdempotency } from '@/api/idempotency'
import type { VoidResult } from '@/api/types'
import { markCounterRecentVoided } from '@/composables/useCounterRecents'
import { useBusinessStore } from '@/stores/business'

// Undo (void) a stamp or a redeem (§4.B.7). Reason 3–300 chars, single line.
// 403 PASSWORD_REQUIRED is handled by the API interceptor (step-up, same Idempotency-Key).

const props = defineProps<{
  eventId: string | null

  /** 'stamp' | 'redeem': only changes the texts. */
  type?: 'stamp' | 'redeem'

  /** e.g. "Ana López · Café gratis". */
  description?: string
}>()

const emit = defineEmits<{
  voided: [result: VoidResult]

  /** Already voided elsewhere: reload. */
  changed: []
}>()

const open = defineModel<boolean>({ default: false })

const business = useBusinessStore()
const { error, fieldErrors, capture, reset } = useCounterError('void')

const reason = ref('')
const submitting = ref(false)

/** Void that failed with a retriable error: tapping again reuses its key and body (§1.8). */
const attempts = useRetriableAttempt<{ reason: string }>()

const canRetry = computed(() =>
  !!attempts.pending.value && !!error.value && isSameKeyRetriable(error.value.error),
)

const SUGGESTIONS = ['Sello por error', 'Cliente equivocado', 'Tarjeta equivocada', 'Sello duplicado']
const suggestions = computed(() => props.type === 'redeem' ? ['Canje por error', 'Cliente equivocado', 'Recompensa no entregada'] : SUGGESTIONS)

const trimmed = computed(() => reason.value.trim())
const valid = computed(() => trimmed.value.length >= 3 && trimmed.value.length <= 300)

const title = computed(() => props.type === 'redeem' ? 'Deshacer canje' : 'Deshacer sello')

watch(open, isOpen => {
  if (isOpen) {
    reason.value = ''
    reset()
  }
})

async function submit() {
  const businessId = business.activeId
  const eventId = props.eventId
  if (!businessId || !eventId || !valid.value || submitting.value)
    return

  reset()
  submitting.value = true

  // Same event + same reason after a retriable failure = same attempt (same key and body, §1.8)
  const attempt = attempts.begin(eventId, { reason: trimmed.value })
  const body = attempt.body

  try {
    const res = await withIdempotency(key => voidEvent(businessId, eventId, body, key), { key: attempt.key })

    attempts.clear()
    markCounterRecentVoided(eventId)
    emit('voided', res)
    open.value = false
  }
  catch (e) {
    const { error: err } = capture(e)

    attempts.fail(attempt, err)

    if (err.code === 'ALREADY_VOIDED') {
      markCounterRecentVoided(eventId)
      emit('changed')
    }
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <VDialog
    v-model="open"
    max-width="440"
    :persistent="submitting"
  >
    <VCard rounded="xl">
      <VCardText class="pa-5">
        <div class="mb-4">
          <VAvatar
            color="error"
            variant="tonal"
            size="56"
            class="mb-3"
          >
            <VIcon
              icon="tabler-arrow-back-up"
              size="28"
            />
          </VAvatar>
          <div class="text-h6 font-weight-bold mb-1">
            {{ title }}
          </div>
          <div
            v-if="props.description"
            class="text-body-2 text-medium-emphasis"
          >
            {{ props.description }}
          </div>
        </div>

        <form @submit.prevent="submit">
          <VTextField
            v-model="reason"
            label="Motivo"
            placeholder="¿Por qué lo deshaces?"
            variant="outlined"
            maxlength="300"
            counter="300"
            :error-messages="fieldErrors.reason"
            hint="Mínimo 3 caracteres"
            autofocus
          />

          <div class="d-flex flex-wrap gap-2 mt-2 mb-4">
            <VChip
              v-for="s in suggestions"
              :key="s"
              size="small"
              variant="tonal"
              @click="reason = s"
            >
              {{ s }}
            </VChip>
          </div>

          <CounterErrorAlert
            :error="error"
            class="mb-4"
          />

          <div class="d-flex gap-2">
            <VBtn
              variant="tonal"
              color="secondary"
              rounded="xl"
              class="flex-1-1"
              :disabled="submitting"
              @click="open = false"
            >
              Cancelar
            </VBtn>
            <!-- Destructivo (guía §15): botón de marco con texto en --error, sin relleno rojo -->
            <VBtn
              type="submit"
              variant="outlined"
              color="error"
              rounded="xl"
              class="flex-1-1"
              :disabled="!valid"
              :loading="submitting"
            >
              {{ canRetry ? 'Reintentar' : 'Deshacer' }}
            </VBtn>
          </div>
        </form>
      </VCardText>
    </VCard>
  </VDialog>
</template>
