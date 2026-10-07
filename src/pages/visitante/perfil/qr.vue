<script lang="ts" setup>
import UserQrCard from '@/components/users/UserQrCard.vue'
import { useSessionStore } from '@/stores/session'

// My QR (guide §4.C.1): rendered from session.me.qrPayload, no image from the API.

definePage({
  meta: {
    layout: 'visitor',
  },
})

const session = useSessionStore()
</script>

<template>
  <UserQrCard
    :first-name="session.me?.firstName"
    :last-name="session.me?.lastName"
    :qr-payload="session.me?.qrPayload"
    :repitt-code="session.me?.repittCode"
  />
</template>
