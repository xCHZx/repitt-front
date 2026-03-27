<script setup lang="ts">
import Swal from 'sweetalert2'
import { updateCurrentVisitorData } from '@/services/visitor/users'

interface Props {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  repittCode?: string
  visitsCount?: number
  accountStatus?: string
  hasVerifiedEmail?: boolean | number
  qrPath?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'updated'): void }>()

const editDialog = ref(false)
const editFirstName = ref('')
const editLastName = ref('')
const editPhone = ref('')

const initials = computed(() => {
  const a = props.firstName?.charAt(0).toUpperCase() ?? ''
  const b = props.lastName?.charAt(0).toUpperCase() ?? ''
  return a + b || '?'
})

const fullName = computed(() => {
  const name = [props.firstName, props.lastName].filter(Boolean).join(' ')
  return name || 'Sin nombre'
})

const openEdit = () => {
  editFirstName.value = props.firstName ?? ''
  editLastName.value = props.lastName ?? ''
  editPhone.value = props.phone ?? ''
  editDialog.value = true
}

const saveEdit = async () => {
  editDialog.value = false
  Swal.fire({
    title: 'Guardando...',
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
  })
  try {
    await updateCurrentVisitorData({
      firstName: editFirstName.value,
      lastName: editLastName.value,
      phone: editPhone.value,
    })
    Swal.close()
    emit('updated')
  }
  catch (error: any) {
    Swal.fire({ icon: 'error', title: 'Error', text: String(error) })
  }
}
</script>

<template>
  <!-- Avatar + Identidad -->
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
    >
      <VIcon
        start
        icon="tabler-barcode"
        size="14"
      />
      {{ repittCode || '—' }}
    </VChip>
  </div>

  <!-- Stat visitas -->
  <VCard
    rounded="xl"
    color="primary"
    variant="tonal"
    class="mb-4"
  >
    <VCardText class="pa-3 d-flex align-center justify-center gap-2">
      <VIcon
        icon="tabler-walk"
        size="18"
        color="primary"
      />
      <span>
        <strong class="text-primary">{{ visitsCount ?? 0 }}</strong>
        <span class="text-body-2 text-medium-emphasis ms-1">visitas registradas</span>
      </span>
    </VCardText>
  </VCard>

  <!-- Info -->
  <VCard
    rounded="xl"
    class="mb-4"
  >
    <VList lines="two">
      <VListItem
        v-if="phone"
        prepend-icon="tabler-phone"
      >
        <VListItemTitle>{{ phone }}</VListItemTitle>
        <VListItemSubtitle>Teléfono</VListItemSubtitle>
      </VListItem>

      <VDivider v-if="phone && email" />

      <VListItem
        v-if="email"
        prepend-icon="tabler-mail"
      >
        <VListItemTitle>{{ email }}</VListItemTitle>
        <VListItemSubtitle>Email</VListItemSubtitle>
        <template #append>
          <VChip
            :color="hasVerifiedEmail ? 'success' : 'warning'"
            size="x-small"
            variant="tonal"
          >
            {{ hasVerifiedEmail ? 'Verificado' : 'Pendiente' }}
          </VChip>
        </template>
      </VListItem>

      <VDivider v-if="(phone || email) && accountStatus" />

      <VListItem
        v-if="accountStatus"
        prepend-icon="tabler-shield-check"
      >
        <VListItemTitle>{{ accountStatus }}</VListItemTitle>
        <VListItemSubtitle>Estado de cuenta</VListItemSubtitle>
      </VListItem>
    </VList>
  </VCard>

  <!-- Acciones -->
  <VBtn
    block
    variant="tonal"
    color="primary"
    prepend-icon="tabler-qrcode"
    size="large"
    class="mb-3"
    to="/visitante/perfil/qr"
  >
    Ver mi código QR
  </VBtn>

  <VBtn
    block
    variant="outlined"
    color="primary"
    prepend-icon="tabler-pencil"
    @click="openEdit"
  >
    Editar perfil
  </VBtn>

  <!-- Dialog edición -->
  <VDialog
    v-model="editDialog"
    max-width="480"
  >
    <VCard
      rounded="xl"
      title="Editar perfil"
    >
      <VCardText>
        <VRow>
          <VCol cols="12">
            <VTextField
              v-model="editFirstName"
              label="Nombre"
              variant="outlined"
              prepend-inner-icon="tabler-user"
            />
          </VCol>
          <VCol cols="12">
            <VTextField
              v-model="editLastName"
              label="Apellido"
              variant="outlined"
              prepend-inner-icon="tabler-user"
            />
          </VCol>
          <VCol cols="12">
            <VTextField
              v-model="editPhone"
              label="Teléfono"
              variant="outlined"
              prepend-inner-icon="tabler-phone"
              placeholder="+521234567890"
            />
          </VCol>
        </VRow>
      </VCardText>
      <VCardActions class="justify-end gap-2 pb-4 px-4">
        <VBtn
          variant="tonal"
          color="secondary"
          @click="editDialog = false"
        >
          Cancelar
        </VBtn>
        <VBtn
          color="primary"
          @click="saveEdit"
        >
          Guardar
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
