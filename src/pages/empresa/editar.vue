<script lang="ts" setup>
import BusinessFormFields from '@/components/business/BusinessFormFields.vue'
import LogoUploader from '@/components/business/LogoUploader.vue'
import { businessToForm, emptyBusinessForm, toUpdateBody } from '@/components/business/businessForm'
import BusinessPreviewCard from '@/components/businesses/BusinessPreviewCard.vue'
import { updateBusiness } from '@/api/endpoints/businesses'
import { listCards } from '@/api/endpoints/cards'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useApiError } from '@/composables/useApiError'
import { useBusinessStore } from '@/stores/business'

// Edit the active business (guide §4.A.2) + logo (§4.A.3).

definePage({
  meta: {
    layout: 'company',
    area: 'business',
    ownerOnly: true,
  },
})

const router = useRouter()
const business = useBusinessStore()
const { error, fieldErrors, capture, reset } = useApiError()

// INVALID_PHONE comes without details: show it under the public phone field (§5.1)
const formFieldErrors = computed(() => error.value?.error.code === 'INVALID_PHONE'
  ? { ...fieldErrors.value, publicPhone: error.value.message }
  : fieldErrors.value)

const { error: loadError, capture: captureLoad } = useApiError()

const form = ref(business.active ? businessToForm(business.active) : emptyBusinessForm())
const originalTimezone = ref(form.value.timezone)
const isLoading = ref(true)
const isSubmitting = ref(false)
const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)
const fieldsRef = ref<InstanceType<typeof BusinessFormFields> | null>(null)

const isSuspended = computed(() => business.active?.moderationStatus === 'suspended')

// Changing the zone does not move saved card dates (§4.A.2)
const hasDatedCards = ref<boolean | null>(null)
const timezoneChanged = computed(() => form.value.timezone !== originalTimezone.value)

watch(timezoneChanged, async changed => {
  if (!changed || hasDatedCards.value !== null || !business.activeId)
    return
  try {
    const cards = await listCards(business.activeId)

    hasDatedCards.value = cards.some(c => c.status !== 'archived' && c.endsOn !== null)
  }
  catch {
    // Without the list we cannot tell: show the warning anyway
    hasDatedCards.value = true
  }
})

// The business this form edits. If it stops being the active one (a 404 on refresh drops it and
// the store may auto-select another), leave instead of saving stale data over another business.
const editingId = business.activeId

watch(() => business.activeId, id => {
  if (id !== editingId)
    router.replace('/empresa')
})

onMounted(async () => {
  try {
    const fresh = await business.refreshActive()
    if (!fresh) {
      await router.replace('/empresa')

      return
    }
    form.value = businessToForm(fresh)
    originalTimezone.value = fresh.timezone
  }
  catch (e) {
    captureLoad(e)
  }
  finally {
    isLoading.value = false
  }
})

const onSubmit = async () => {
  const result = await formRef.value?.validate()
  if ((result && !result.valid) || !editingId || business.activeId !== editingId)
    return

  reset()
  isSubmitting.value = true
  try {
    const updated = await updateBusiness(editingId, toUpdateBody(form.value))

    business.upsert(updated)
    await router.push('/empresa/informacion')
  }
  catch (e) {
    const err = capture(e)
    if (err.error.detailCode === 'categoryUnavailable')
      fieldsRef.value?.reloadCategories()
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div>
    <ApiErrorAlert
      :error="loadError"
      class="mb-4"
    />

    <template v-if="isLoading">
      <VSkeletonLoader
        type="list-item-avatar"
        class="mb-4 rounded-xl"
      />
      <VSkeletonLoader
        type="article"
        class="mb-4 rounded-xl"
      />
    </template>

    <template v-else>
      <BusinessPreviewCard
        :name="form.name"
        :description="form.description"
        :logo-src="business.active?.logoUrl"
        class="mb-6"
      />

      <!-- Logo -->
      <div class="section-label mb-3">
        <VIcon
          icon="tabler-photo"
          size="15"
        />
        Logo
      </div>
      <LogoUploader
        :disabled="isSuspended"
        class="mb-6"
      />

      <VForm
        ref="formRef"
        @submit.prevent="onSubmit"
      >
        <BusinessFormFields
          ref="fieldsRef"
          v-model="form"
          :field-errors="formFieldErrors"
          :disabled="isSubmitting"
        >
          <template #after-timezone>
            <VAlert
              v-if="timezoneChanged && hasDatedCards"
              color="warning"
              variant="tonal"
              density="compact"
              rounded="lg"
              icon="tabler-alert-triangle"
            >
              Cambiar la zona no mueve las vigencias guardadas; revisa las fechas de tus tarjetas.
            </VAlert>
          </template>
        </BusinessFormFields>

        <ApiErrorAlert
          :error="error"
          class="mb-4"
        />

        <VBtn
          type="submit"
          block
          size="large"
          color="primary"
          :loading="isSubmitting"
        >
          Guardar cambios
        </VBtn>
      </VForm>
    </template>
  </div>
</template>
