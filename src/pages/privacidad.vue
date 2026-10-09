<!-- Full privacy notice (guide §4.C.5). Texts come from the API (pending legal review): never copy them. -->
<script setup lang="ts">
import { publicApi } from '@/api'
import type { PrivacyNotice } from '@/api/types'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import MarkdownContent from '@/components/common/MarkdownContent.vue'
import { useApiError } from '@/composables/useApiError'
import logo from '@images/logo-v2.png'
import { formatInstant } from '@/utils/dates'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const router = useRouter()

const notice = ref<PrivacyNotice | null>(null)
const loading = ref(false)

const { error, capture, reset } = useApiError()

async function load() {
  reset()
  loading.value = true
  try {
    notice.value = await publicApi.getPrivacyNotice('full')
  }
  catch (e) {
    capture(e)
  }
  finally {
    loading.value = false
  }
}

function goBack() {
  if (window.history.length > 1)
    router.back()
  else
    router.push('/')
}

onMounted(load)
</script>

<template>
  <div class="privacy-page">
    <div class="privacy-page__inner">
      <div class="d-flex align-center justify-space-between mb-6">
        <VBtn
          variant="text"
          size="small"
          prepend-icon="tabler-arrow-left"
          @click="goBack"
        >
          Regresar
        </VBtn>
        <img
          :src="logo"
          alt="Repitt"
          class="privacy-page__logo"
        >
      </div>

      <VCard>
        <VCardText class="pa-6">
          <h1 class="titulo-display mb-3">
            Aviso de privacidad
          </h1>

          <div
            v-if="notice"
            class="text-caption text-medium-emphasis mb-5"
          >
            Versión {{ notice.version }} · Vigente desde el {{ formatInstant(notice.effectiveFrom) }}
          </div>

          <VSkeletonLoader
            v-if="loading"
            type="paragraph, paragraph, paragraph"
          />

          <template v-else-if="error">
            <ApiErrorAlert
              :error="error"
              class="my-4"
            />
            <VBtn
              variant="tonal"
              @click="load"
            >
              Reintentar
            </VBtn>
          </template>

          <template v-else-if="notice">
            <MarkdownContent :source="notice.bodyMd" />

            <VBtn
              v-if="notice.url"
              :href="notice.url"
              target="_blank"
              rel="noopener noreferrer"
              variant="tonal"
              prepend-icon="tabler-external-link"
              class="mt-4"
            >
              Ver el documento oficial
            </VBtn>
          </template>
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

<style scoped>
.privacy-page {
  background: var(--fondo);
  min-block-size: 100dvh;
  padding-block: var(--s-5) var(--s-7);
  padding-inline: var(--s-4);
}

.privacy-page__inner {
  margin-inline: auto;
  max-inline-size: 760px;
}

.privacy-page__logo {
  block-size: auto;
  inline-size: 110px;
}
</style>
