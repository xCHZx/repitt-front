<script setup lang="ts">
import { deleteAccount } from '@/api/endpoints/me'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useApiError } from '@/composables/useApiError'
import { useSessionStore } from '@/stores/session'

// Account deletion (guide §4.C.7): DELETE /v1/me with {} → 204 → drop the session locally and go home.
// Do NOT call logout/refresh afterwards (the session is already revoked). REAUTH is handled by the interceptor.
// 409 CONFLICT ownsBusinesses → contact support (text from the error catalog).

const session = useSessionStore()
const router = useRouter()
const { error, capture, reset } = useApiError()

const CONFIRM_WORD = 'ELIMINAR'

const dialog = ref(false)
const typed = ref('')
const deleting = ref(false)

const ownsBusinesses = computed(() => session.memberships.some(m => m.role === 'owner'))
const canDelete = computed(() => typed.value.trim().toUpperCase() === CONFIRM_WORD && !deleting.value)

function open() {
  typed.value = ''
  reset()
  dialog.value = true
}

async function confirm() {
  if (!canDelete.value)
    return
  deleting.value = true
  reset()
  try {
    await deleteAccount()
    dialog.value = false
    session.clear()
    router.replace('/')
  }
  catch (e) {
    capture(e)
  }
  finally {
    deleting.value = false
  }
}
</script>

<template>
  <VCard
    rounded="xl"
    class="zona-riesgo"
  >
    <VCardText class="pa-4">
      <div class="d-flex align-center gap-3 mb-2">
        <VIcon
          icon="tabler-user-x"
          color="error"
        />
        <div class="text-subtitle-1 font-weight-bold">
          Eliminar mi cuenta
        </div>
      </div>
      <p class="text-body-2 text-medium-emphasis mb-4">
        Borra tu cuenta de Repitt de forma permanente.
      </p>
      <VBtn
        block
        variant="tonal"
        color="error"
        prepend-icon="tabler-trash"
        @click="open"
      >
        Eliminar mi cuenta
      </VBtn>
    </VCardText>
  </VCard>

  <VDialog
    v-model="dialog"
    max-width="480"
    :persistent="deleting"
  >
    <VCard rounded="xl">
      <VCardText class="pa-5">
        <div class="d-flex align-center gap-3 mb-4">
          <VAvatar
            color="error"
            variant="tonal"
            size="44"
          >
            <VIcon
              icon="tabler-alert-octagon"
              color="error"
            />
          </VAvatar>
          <div class="text-h6 font-weight-bold">
            ¿Eliminar tu cuenta?
          </div>
        </div>

        <p class="text-body-2 mb-2">
          Esta acción <strong>no se puede deshacer</strong>:
        </p>
        <ul class="loss-list text-body-2 mb-4">
          <li>Se borran tu nombre, correo, contraseña y teléfono.</li>
          <li>Pierdes todas tus tarjetas, sellos y recompensas pendientes.</li>
          <li>Te damos de baja de todos los negocios y sales del personal de los negocios donde trabajas.</li>
          <li>Se cierra tu sesión en todos tus dispositivos.</li>
          <li>Los movimientos de los negocios se conservan sin tus datos personales.</li>
        </ul>

        <VAlert
          v-if="ownsBusinesses"
          color="warning"
          variant="tonal"
          density="compact"
          rounded="lg"
          class="mb-4"
        >
          Eres dueño de al menos un negocio: para cancelar tu cuenta primero hay que cerrarlo. Escríbenos a soporte.
        </VAlert>

        <VTextField
          v-model="typed"
          :label="`Escribe ${CONFIRM_WORD} para confirmar`"
          autocomplete="off"
          class="mb-3"
        />

        <ApiErrorAlert :error="error" />
      </VCardText>
      <VCardActions class="justify-end gap-2 pb-4 px-4">
        <VBtn
          variant="tonal"
          color="secondary"
          :disabled="deleting"
          @click="dialog = false"
        >
          Cancelar
        </VBtn>
        <VBtn
          color="error"
          variant="flat"
          :loading="deleting"
          :disabled="!canDelete"
          @click="confirm"
        >
          Eliminar definitivamente
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
/* Filete de 3px en --error: la tarjeta de la zona de riesgo (guía §5.3) */
.v-card.zona-riesgo {
  border-inline-start: 3px solid var(--error);
}

.loss-list {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  padding-inline-start: var(--s-5);
}
</style>
