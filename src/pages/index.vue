<script setup lang="ts">
const router = useRouter()

definePage({
  meta: {
    requiresAuth: true,
  },
})

onBeforeMount(async () => {
  await router.push('/visitante/')
  location.reload()
})
</script>

<template>
  <div>
    Repitt
  </div>
</template>
