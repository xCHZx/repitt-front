<script lang="ts" setup>
import BusinessFormFields from '@/components/business/BusinessFormFields.vue'
import { emptyBusinessForm, toCreateBody } from '@/components/business/businessForm'
import { createBusiness } from '@/api/endpoints/businesses'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useApiError } from '@/composables/useApiError'
import { useBusinessStore } from '@/stores/business'
import { useSessionStore } from '@/stores/session'

// Create another business (guide §4.A.1). Requires amr=pwd: the API interceptor runs the
// password step-up. No Stripe checkout here: the business starts in pre_trial.

definePage({
  meta: {
    layout: 'blank',
    area: 'business',
    needsBusiness: false,
  },
})

const router = useRouter()
const business = useBusinessStore()
const session = useSessionStore()
const { error, fieldErrors, capture, reset } = useApiError()

// INVALID_PHONE comes without details: show it under the public phone field (§5.1)
const formFieldErrors = computed(() => error.value?.error.code === 'INVALID_PHONE'
  ? { ...fieldErrors.value, publicPhone: error.value.message }
  : fieldErrors.value)

const form = ref(emptyBusinessForm())
const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)
const fieldsRef = ref<InstanceType<typeof BusinessFormFields> | null>(null)
const isSubmitting = ref(false)

const goBack = () => {
  if (window.history.length > 1)
    router.back()
  else
    router.push(business.active ? '/empresa' : '/empresa/seleccionar')
}

const onSubmit = async () => {
  const result = await formRef.value?.validate()
  if (result && !result.valid)
    return

  reset()
  isSubmitting.value = true
  try {
    const created = await createBusiness(toCreateBody(form.value))

    business.upsert(created)
    business.select(created.id)

    // The guard reads me.memberships: refresh it BEFORE navigating, or a first business
    // (no memberships yet) would be bounced to /visitante. If GET /v1/me fails, add the
    // new owner membership locally so the business area stays reachable.
    try {
      await session.loadMe()
    }
    catch {
      if (session.me && !session.me.memberships.some(m => m.businessId === created.id))
        session.me.memberships = [...session.me.memberships, { businessId: created.id, businessName: created.name, role: 'owner' }]
    }

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
  <div class="crear-page">
    <div class="crear-inner">
      <div class="d-flex align-center gap-2 mb-5">
        <VBtn
          icon
          variant="text"
          color="default"
          size="small"
          aria-label="Regresar"
          @click="goBack"
        >
          <VIcon
            icon="tabler-arrow-left"
            size="20"
          />
        </VBtn>
        <h1 class="titulo-display mb-0">
          Nuevo negocio
        </h1>
      </div>

      <VAlert
        v-if="!session.hasPassword"
        color="warning"
        variant="tonal"
        rounded="lg"
        icon="tabler-lock"
        class="mb-5"
      >
        Para crear un negocio necesitas una contraseña en tu cuenta.
        <template #append>
          <VBtn
            size="small"
            variant="text"
            to="/visitante/perfil"
          >
            Ir a mi perfil
          </VBtn>
        </template>
      </VAlert>

      <VForm
        ref="formRef"
        @submit.prevent="onSubmit"
      >
        <BusinessFormFields
          ref="fieldsRef"
          v-model="form"
          :field-errors="formFieldErrors"
          :disabled="isSubmitting || !session.hasPassword"
        />

        <ApiErrorAlert
          :error="error"
          class="mb-4"
        />

        <VBtn
          type="submit"
          block
          size="large"
          :loading="isSubmitting"
          :disabled="!session.hasPassword"
        >
          Crear negocio
          <VIcon
            icon="tabler-arrow-right"
            end
          />
        </VBtn>

        <p class="note mt-3 mb-0">
          Podrás subir tu logo y crear tus tarjetas en el siguiente paso.
        </p>
      </VForm>
    </div>
  </div>
</template>

<style scoped>
.crear-page {
  background: var(--fondo);
  min-block-size: 100vh;
  padding-block: var(--s-4) var(--s-6);
  padding-inline: var(--s-4);
}

.crear-inner {
  margin-inline: auto;
  max-inline-size: 600px;
}
</style>
