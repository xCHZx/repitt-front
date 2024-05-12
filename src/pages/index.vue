<script setup lang="ts">
const router = useRouter()

definePage({
  meta: {
    requiresAuth: true,
  },
})

onBeforeMount(() => {
  router.push('/visitante/')
})
</script>

<template>
  <div>
    Repitt
  </div>
</template>
