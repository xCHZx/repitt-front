<!--
  Light privacy context before creating an account (guide §2.5, §4.C.5): one line + the simplified
  notice on demand. The full notice lives at /privacidad (linked from PrivacyNoticeShort).
-->
<script setup lang="ts">
import PrivacyNoticeShort from '@/components/common/PrivacyNoticeShort.vue'

withDefaults(defineProps<{
  text?: string
}>(), {
  text: 'Si es tu primera vez en Repitt, al continuar creamos tu cuenta y aceptas nuestro aviso de privacidad.',
})

const open = ref(false)
</script>

<template>
  <div class="privacy-consent-note text-caption text-medium-emphasis">
    <span>{{ text }}</span>
    <a
      href="#"
      class="text-primary font-weight-medium ms-1"
      :aria-expanded="open"
      @click.prevent="open = !open"
    >
      {{ open ? 'Ocultar aviso' : 'Ver aviso' }}
    </a>

    <VExpandTransition>
      <div
        v-if="open"
        class="privacy-consent-note__body mt-3 pa-3"
      >
        <PrivacyNoticeShort />
      </div>
    </VExpandTransition>
  </div>
</template>

<style scoped>
.privacy-consent-note__body {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
  background: rgba(var(--v-theme-on-surface), 0.02);
}
</style>
