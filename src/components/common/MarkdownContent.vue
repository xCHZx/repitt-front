<script setup lang="ts">
// Sanitized Markdown (privacy notice `bodyMd`): raw HTML is disabled, so it is escaped, and
// links are restricted to http(s)/mailto by markdown-it's validateLink.
import MarkdownIt from 'markdown-it'

const props = defineProps<{
  source: string | null | undefined
}>()

const md = new MarkdownIt({ html: false, linkify: true, breaks: false })

const defaultLinkOpen = md.renderer.rules.link_open
  ?? ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options))

md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  tokens[idx].attrSet('target', '_blank')
  tokens[idx].attrSet('rel', 'noopener noreferrer')

  return defaultLinkOpen(tokens, idx, options, env, self)
}

const html = computed(() => md.render(props.source ?? ''))
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="markdown-content" v-html="html" />
</template>

<style lang="scss">
.markdown-content {
  line-height: 1.6;

  h1,
  h2,
  h3 {
    margin-block: 1em 0.5em;
  }

  p,
  ul,
  ol {
    margin-block-end: 0.75em;
  }

  ul,
  ol {
    padding-inline-start: 1.25em;
  }
}
</style>
