<!--
  "/" never renders in practice: the router guard sends anonymous users to login and signed-in
  users home. This is only a fallback.
-->
<script setup lang="ts">
import { homeRoute } from '@/utils/home'

const router = useRouter()

onBeforeMount(() => {
  router.replace(homeRoute())
})
</script>

<template>
  <div />
</template>
