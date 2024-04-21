<script setup lang="ts">
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
</script>

<template>
  <VCard>
    <VCardText class="text-center pt-10">
      <!-- 👉 Avatar -->
      <VAvatar
        rounded
        :size="120"
        color="white"
        variant="tonal"
      >
        <!--
          <VImg
          src="https://www.pngitem.com/pimgs/m/30-307416_profile-icon-png-image-free-download-searchpng-employee.png"
          class="text-5xl font-weight-medium"
          />
        -->
        <VImg
          :src="props.qrPath || 'https://www.pngitem.com/pimgs/m/30-307416_profile-icon-png-image-free-download-searchpng-employee.png'"
          class="text-5xl font-weight-medium"
        />
      </VAvatar>

      <!-- 👉 Customer fullName -->
      <h5 class="text-h4 mt-3 text-weight font-weight-bold">
        {{ props.firstName || '...' }} {{ props.lastName || '...' }}
      </h5>
      <h5 class="text-h5 mt-4">
        <VIcon
          start
          icon="tabler-mail"
          size="small"
          color="primary"
        />
        {{ props.email || '...' }}
      </h5>
      <h5 class="text-h5 mt-4">
        <VIcon
          start
          icon="tabler-phone"
          size="small"
          color="primary"
        />
        {{ props.phone || '...' }}
      </h5>
      <!--
        <VCardText class="text-center mt-0">
        <h4>
        Código Repitt
        </h4>
      -->
      <div class="d-flex flex-wrap justify-center gap-x-5 mb-0 mt-3 align">
        <VChip
          color="primary"
          size="large"
        >
          <VIcon
            start
            icon="tabler-barcode"
          />
          <h1>{{ props?.repittCode }}</h1>
        </VChip>
      </div>
    </VCardText>

    <VCardText class="text-center pt-12">
      <h5 class="text-h5 mt-3">
        Visitas totales: {{ props.visitsCount || '...' }}
      </h5>
    </VCardText>

    <!-- 👉 Customer Details -->
    <VCardText>
      <VDivider class="my-3" />

      <VList class="card-list mt-2">
        <VListItem>
          <h6 class="text-h6">
            Status de la cuenta:
            <span class="text-body-1 d-inline-block">
              {{ props.accountStatus || '...' }}
            </span>
          </h6>
        </VListItem>
        <VListItem>
          <h6 class="text-h6">
            Verificación de Email:
            <span class="text-body-1 d-inline-block">
              {{ props.hasVerifiedEmail || '...' }}
            </span>
          </h6>
        </VListItem>
      </VList>
    </VCardText>
  </VCard>
</template>
