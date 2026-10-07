<script setup lang="ts">
const props = withDefaults(defineProps<{
  count: number
  required: number
  color: string
  iconUrl?: string | null
  size?: 'sm' | 'md'
}>(), {
  iconUrl: null,
  size: 'sm',
})

// Stamp dots (≤ 12 stamps) or a progress bar
const showDots = computed(() => props.required > 0 && props.required <= 12)

const progress = computed(() =>
  props.required > 0 ? Math.min((props.count / props.required) * 100, 100) : 0,
)

const STAMP_ROTATIONS = [-9, 5, -13, 7, -5, 11, -7, 4, -11, 8, -3, 6]

const dotStyle = (i: number) => {
  const filled = i <= props.count
  if (props.size === 'sm') {
    return {
      background: filled ? props.color : 'transparent',
      borderColor: props.color,
      opacity: filled ? 1 : 0.2,
    }
  }

  return {
    background: filled ? `${props.color}25` : 'transparent',
    borderColor: filled ? props.color : `${props.color}40`,
    transform: filled ? `rotate(${STAMP_ROTATIONS[(i - 1) % STAMP_ROTATIONS.length]}deg)` : 'none',
  }
}
</script>

<template>
  <div
    v-if="showDots"
    class="stamp-progress"
    :class="`stamp-progress--${props.size}`"
  >
    <div
      v-for="i in props.required"
      :key="i"
      class="stamp-progress__dot"
      :style="dotStyle(i)"
    >
      <VImg
        v-if="props.size === 'md' && props.iconUrl && i <= props.count"
        :src="props.iconUrl"
        :width="20"
        :height="20"
        cover
      />
    </div>
  </div>
  <VProgressLinear
    v-else
    :model-value="progress"
    :color="props.color"
    bg-color="rgba(0,0,0,0.07)"
    rounded
    :height="props.size === 'sm' ? 7 : 8"
  />
</template>

<style scoped>
.stamp-progress {
  display: flex;
  flex-wrap: wrap;
}

.stamp-progress--sm {
  gap: 5px;
}

.stamp-progress--md {
  gap: 8px;
}

.stamp-progress__dot {
  display: flex;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  border: 1.5px solid;
  border-radius: 50%;
  transition: opacity 0.2s;
}

.stamp-progress--sm .stamp-progress__dot {
  block-size: 26px;
  inline-size: 26px;
}

.stamp-progress--md .stamp-progress__dot {
  border-width: 2px;
  block-size: 36px;
  inline-size: 36px;
}
</style>
