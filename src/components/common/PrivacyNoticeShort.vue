<script setup lang="ts">
// Simplified privacy notice (guide §4.C.5): shown before sending an OTP to a new phone, in owner
// registration and in counter enroll. Texts come from the API (pending legal review): never copy them.
import { getPrivacyNotice } from '@/api/endpoints/public'
import type { PrivacyNotice } from '@/api/types'
import MarkdownContent from '@/components/common/MarkdownContent.vue'

const notice = ref<PrivacyNotice | null>(null)
const failed = ref(false)

onMounted(async () => {
  try {
    notice.value = await getPrivacyNotice('short')
  }
  catch {
    failed.value = true
  }
})
</script>

<template>
  <div class="privacy-short text-body-2">
    <MarkdownContent
      v-if="notice"
      :source="notice.bodyMd"
    />
    <VSkeletonLoader
      v-else-if="!failed"
      type="paragraph"
    />
    <RouterLink
      to="/privacidad"
      target="_blank"
    >
      Consulta el aviso de privacidad integral
    </RouterLink>
  </div>
</template>

<style scoped>
.privacy-short {
  overflow-y: auto;
  max-block-size: 220px;
}
</style>
