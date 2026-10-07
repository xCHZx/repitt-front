<script lang="ts" setup>
import ProfileEmailDialog from '@/components/visitor/ProfileEmailDialog.vue'
import ProfileNameDialog from '@/components/visitor/ProfileNameDialog.vue'
import ProfilePasswordDialog from '@/components/visitor/ProfilePasswordDialog.vue'
import { formatRepittCode } from '@/components/visitor/wallet'
import { useSessionStore } from '@/stores/session'

// "Mi cuenta" for every user (visitors, owners and cashiers) — guide §2.4, §2.11, §2.12.

definePage({
  meta: {
    layout: 'visitor',
  },
})

const session = useSessionStore()
const router = useRouter()

const nameDialog = ref(false)
const emailDialog = ref(false)
const passwordDialog = ref(false)
const logoutAllDialog = ref(false)
const loggingOut = ref<'one' | 'all' | null>(null)

const snackbar = ref({ show: false, text: '' })
const notify = (text: string) => (snackbar.value = { show: true, text })

const me = computed(() => session.me)

const initials = computed(() => {
  const a = me.value?.firstName?.charAt(0).toUpperCase() ?? ''
  const b = me.value?.lastName?.charAt(0).toUpperCase() ?? ''

  return a + b || '?'
})

const fullName = computed(() => [me.value?.firstName, me.value?.lastName].filter(Boolean).join(' ') || 'Sin nombre')

async function logout(everywhere: boolean) {
  loggingOut.value = everywhere ? 'all' : 'one'
  try {
    await session.logout(everywhere)
  }
  finally {
    loggingOut.value = null
  }
  router.replace('/auth/login')
}
</script>

<template>
  <div v-if="me">
    <!-- Identity -->
    <div class="text-center mb-6">
      <VAvatar
        size="88"
        color="primary"
        variant="tonal"
        class="mb-4"
      >
        <span class="text-h3 font-weight-bold">{{ initials }}</span>
      </VAvatar>
      <div class="text-h5 font-weight-bold mb-2">
        {{ fullName }}
      </div>
      <VChip
        color="primary"
        variant="tonal"
        size="small"
        to="/visitante/perfil/qr"
      >
        <VIcon
          start
          icon="tabler-barcode"
          size="14"
        />
        {{ formatRepittCode(me.repittCode) }}
      </VChip>
    </div>

    <!-- Personal data -->
    <div class="section-label">
      Mis datos
    </div>
    <VCard
      rounded="xl"
      class="mb-5"
    >
      <VList lines="two">
        <VListItem
          prepend-icon="tabler-user"
          append-icon="tabler-pencil"
          @click="nameDialog = true"
        >
          <VListItemTitle>{{ fullName }}</VListItemTitle>
          <VListItemSubtitle>Nombre</VListItemSubtitle>
        </VListItem>
        <VDivider />
        <VListItem
          prepend-icon="tabler-phone"
          append-icon="tabler-chevron-right"
          to="/visitante/perfil/telefono"
        >
          <VListItemTitle>{{ me.phone }}</VListItemTitle>
          <VListItemSubtitle>Teléfono</VListItemSubtitle>
        </VListItem>
        <VDivider />
        <VListItem
          prepend-icon="tabler-mail"
          @click="emailDialog = true"
        >
          <VListItemTitle>{{ me.email ?? 'Agregar correo' }}</VListItemTitle>
          <VListItemSubtitle>Correo electrónico</VListItemSubtitle>
          <template #append>
            <VChip
              v-if="me.email"
              :color="me.emailVerifiedAt ? 'success' : 'warning'"
              size="x-small"
              variant="tonal"
              class="me-2"
            >
              {{ me.emailVerifiedAt ? 'Verificado' : 'Sin verificar' }}
            </VChip>
            <VIcon
              :icon="me.email ? 'tabler-pencil' : 'tabler-plus'"
              size="20"
            />
          </template>
        </VListItem>
        <template v-if="me.hasPassword">
          <VDivider />
          <VListItem
            prepend-icon="tabler-lock"
            append-icon="tabler-pencil"
            @click="passwordDialog = true"
          >
            <VListItemTitle>••••••••••</VListItemTitle>
            <VListItemSubtitle>Contraseña</VListItemSubtitle>
          </VListItem>
        </template>
      </VList>
    </VCard>

    <!-- Shortcuts -->
    <div class="section-label">
      Más opciones
    </div>
    <VCard
      rounded="xl"
      class="mb-5"
    >
      <VList>
        <VListItem
          prepend-icon="tabler-qrcode"
          append-icon="tabler-chevron-right"
          title="Mi código QR"
          to="/visitante/perfil/qr"
        />
        <template v-if="session.hasMemberships">
          <VDivider />
          <VListItem
            prepend-icon="tabler-building-store"
            append-icon="tabler-chevron-right"
            :title="session.memberships.length > 1 ? 'Mis negocios' : 'Mi negocio'"
            :subtitle="session.memberships.length === 1 ? session.memberships[0].businessName : undefined"
            to="/empresa"
          />
        </template>
        <VDivider />
        <VListItem
          prepend-icon="tabler-shield-lock"
          append-icon="tabler-chevron-right"
          title="Privacidad y mis datos"
          subtitle="Negocios con tus datos, descarga y baja de cuenta"
          to="/visitante/perfil/privacidad"
        />
        <VDivider />
        <VListItem
          prepend-icon="tabler-file-text"
          append-icon="tabler-chevron-right"
          title="Aviso de privacidad"
          to="/privacidad"
        />
      </VList>
    </VCard>

    <!-- Session -->
    <VBtn
      block
      variant="tonal"
      color="secondary"
      prepend-icon="tabler-logout"
      class="mb-3"
      :loading="loggingOut === 'one'"
      :disabled="!!loggingOut"
      @click="logout(false)"
    >
      Cerrar sesión
    </VBtn>
    <VBtn
      block
      variant="text"
      color="error"
      prepend-icon="tabler-devices-off"
      :disabled="!!loggingOut"
      @click="logoutAllDialog = true"
    >
      Cerrar sesión en todos mis dispositivos
    </VBtn>

    <ProfileNameDialog
      v-model="nameDialog"
      @saved="notify('Nombre actualizado')"
    />
    <ProfileEmailDialog
      v-model="emailDialog"
      @saved="email => notify(`Te enviamos un enlace de verificación a ${email}`)"
    />
    <ProfilePasswordDialog
      v-model="passwordDialog"
      @saved="notify('Contraseña actualizada. Cerramos tu sesión en los demás dispositivos.')"
    />

    <VDialog
      v-model="logoutAllDialog"
      max-width="420"
    >
      <VCard
        rounded="xl"
        title="¿Cerrar sesión en todos lados?"
      >
        <VCardText class="text-body-2">
          Se cerrará tu sesión en todos tus dispositivos, incluido este. Tendrás que volver a iniciar sesión.
        </VCardText>
        <VCardActions class="justify-end gap-2 pb-4 px-4">
          <VBtn
            variant="tonal"
            color="secondary"
            @click="logoutAllDialog = false"
          >
            Cancelar
          </VBtn>
          <VBtn
            color="error"
            variant="flat"
            :loading="loggingOut === 'all'"
            @click="logout(true)"
          >
            Cerrar sesiones
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <VSnackbar
      v-model="snackbar.show"
      color="success"
      :timeout="3500"
    >
      {{ snackbar.text }}
    </VSnackbar>
  </div>
</template>

<style scoped>
.section-label {
  color: rgb(var(--v-theme-primary));
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-block-end: 10px;
  text-transform: uppercase;
}
</style>
