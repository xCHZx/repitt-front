<script setup lang="ts">
import type { Billing, EntitlementReason } from '@/api/types'
import { formatInstant } from '@/utils/dates'

// Current billing state of the active business (guide §3.2, §4.A.10).
// The state comes from `entitlement`; `trial` and `subscription` are informative only.

const props = defineProps<{
  billing: Billing
  timeZone: string
}>()

interface StateView {
  title: string
  text: string
  color: string
  icon: string
  chip: string
}

const STATES: Record<EntitlementReason, Omit<StateView, 'text'>> = {
  pre_trial: { title: 'Tu prueba aún no empieza', color: 'info', icon: 'tabler-hourglass-empty', chip: 'Sin iniciar' },
  trial: { title: 'Periodo de prueba', color: 'info', icon: 'tabler-hourglass', chip: 'Prueba' },
  subscribed: { title: 'Suscripción activa', color: 'success', icon: 'tabler-crown', chip: 'Activa' },
  grace: { title: 'Pago pendiente', color: 'warning', icon: 'tabler-alert-triangle', chip: 'Pago pendiente' },
  trial_expired: { title: 'Tu prueba terminó', color: 'error', icon: 'tabler-lock', chip: 'Sin acceso' },
  subscription_ended: { title: 'Tu suscripción terminó', color: 'error', icon: 'tabler-lock', chip: 'Sin acceso' },
  suspended: { title: 'Negocio suspendido', color: 'error', icon: 'tabler-ban', chip: 'Suspendido' },
}

const fmt = (iso: string | null | undefined) =>
  formatInstant(iso, props.timeZone, { day: 'numeric', month: 'long', year: 'numeric' })

const entitlement = computed(() => props.billing.entitlement)
const subscription = computed(() => props.billing.subscription)

const TEXTS: Record<EntitlementReason, (until: string) => string> = {
  pre_trial: () => 'Publica tu primera tarjeta para iniciar tu periodo de prueba.',
  trial: until => `Tienes acceso completo hasta el ${until}.`,
  subscribed: () => 'Tu programa de lealtad está activo.',
  grace: until => `No pudimos cobrar tu suscripción. Actualiza tu método de pago antes del ${until} para no perder el acceso.`,
  trial_expired: () => 'Contrata tu plan para volver a registrar sellos y canjes.',
  subscription_ended: () => 'Contrata de nuevo para volver a registrar sellos y canjes.',
  suspended: () => 'El negocio está suspendido. Contacta a soporte para más información.',
}

const view = computed<StateView>(() => {
  const { reason, until } = entitlement.value
  const base = STATES[reason]

  if (!base)
    return { title: 'Estado de tu plan', text: '', color: 'secondary', icon: 'tabler-info-circle', chip: '—' }

  // Subscribed with `until` = cancellation scheduled: access ends on that date.
  if (reason === 'subscribed' && until)
    return { ...base, chip: 'Cancelada', color: 'warning', text: `Tu suscripción termina el ${fmt(until)}. Puedes reactivarla desde Administrar pagos.` }

  return { ...base, text: TEXTS[reason](fmt(until)) }
})

interface Row { label: string; value: string }

const rows = computed<Row[]>(() => {
  const list: Row[] = []
  const { reason } = entitlement.value
  const trial = props.billing.trial
  const sub = subscription.value

  if (trial && (reason === 'trial' || reason === 'trial_expired')) {
    list.push({ label: 'Inicio de la prueba', value: fmt(trial.startedAt) })
    list.push({ label: reason === 'trial' ? 'Prueba hasta' : 'La prueba terminó el', value: fmt(trial.endsAt) })
  }

  if (sub && (reason === 'subscribed' || reason === 'grace')) {
    const scheduledEnd = sub.cancelAt ?? (sub.cancelAtPeriodEnd ? sub.currentPeriodEnd : null)

    list.push({ label: 'Periodo actual', value: `${fmt(sub.currentPeriodStart)} – ${fmt(sub.currentPeriodEnd)}` })
    if (scheduledEnd)
      list.push({ label: 'Se cancela el', value: fmt(scheduledEnd) })
    else if (reason === 'subscribed')
      list.push({ label: 'Próxima renovación', value: fmt(sub.currentPeriodEnd) })
  }

  if (sub?.canceledAt && reason === 'subscription_ended')
    list.push({ label: 'Cancelada el', value: fmt(sub.canceledAt) })

  return list
})
</script>

<template>
  <VCard rounded="xl">
    <VCardText class="pa-5">
      <div class="d-flex align-center gap-3 mb-3">
        <VAvatar
          :color="view.color"
          variant="tonal"
          rounded="lg"
          size="42"
        >
          <VIcon
            :icon="view.icon"
            size="24"
          />
        </VAvatar>
        <div class="flex-grow-1">
          <div class="text-h6 font-weight-bold">
            {{ view.title }}
          </div>
        </div>
        <VChip
          :color="view.color"
          variant="tonal"
          size="small"
        >
          {{ view.chip }}
        </VChip>
      </div>

      <p
        v-if="view.text"
        class="text-body-2 mb-0"
      >
        {{ view.text }}
      </p>

      <template v-if="rows.length">
        <VDivider class="my-4" />
        <div class="d-flex flex-column gap-2">
          <div
            v-for="row in rows"
            :key="row.label"
            class="d-flex justify-space-between gap-4"
          >
            <span class="text-body-2 text-medium-emphasis">{{ row.label }}</span>
            <span class="text-body-2 font-weight-medium text-end">{{ row.value }}</span>
          </div>
        </div>
      </template>
    </VCardText>
  </VCard>
</template>
