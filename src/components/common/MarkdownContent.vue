<!--
  Sanitized Markdown (privacy notice `bodyMd`): raw HTML is disabled, so it is escaped, and
  links are restricted to http(s)/mailto by markdown-it's validateLink.
-->
<script setup lang="ts">
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
  <!-- Safe: markdown-it with html disabled escapes raw HTML -->
  <!-- eslint-disable vue/no-v-html -->
  <div
    class="markdown-content"
    v-html="html"
  />
</template>

<style lang="scss">
.markdown-content {
  line-height: var(--lh-body);

  h1,
  h2,
  h3 {
    color: inherit;
    font-family: var(--f-texto);
    font-weight: 700;
    margin-block: 1em 0.5em;
  }

  h1,
  h2 {
    font-size: var(--t-h3);
    line-height: var(--lh-h3);
  }

  h3 {
    font-size: var(--t-body);
    line-height: var(--lh-body);
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
