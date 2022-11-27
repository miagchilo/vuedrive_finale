<template>
  <svg :height="radius * 2" :width="radius * 2">
    <circle
      stroke="#ccc"
      :stroke-width="strokeWidth"
      fill="transparent"
      :cx="radius"
      :cy="radius"
      :r="normalizedRadius"
    />
    <circle
      class="progress-ring"
      stroke="#3881ff"
      :stroke-width="strokeWidth"
      fill="transparent"
      :cx="radius"
      :cy="radius"
      :r="normalizedRadius"
      :stroke-dasharray="`${circumference} ${circumference}`"
      :stroke-dashoffset="strokeDashoffset"
    />
  </svg>
</template>

<script>
import { computed } from "vue";

export default {
  props: {
    radius: {
      type: Number,
      default: 16,
    },
    strokeWidth: {
      type: Number,
      default: 3,
    },
    progress: {
      type: Number,
      default: 0,
    },
  },
  setup(props) {
    const normalizedRadius = computed(
      () => props.radius - props.strokeWidth * 2
    );
    const circumference = computed(() => normalizedRadius.value * 2 * Math.PI);
    // circumference - (progress / 100) * circumference
    const strokeDashoffset = computed(
      () => circumference.value - (props.progress / 100) * circumference.value
    );

    return { normalizedRadius, circumference, strokeDashoffset };
  },
};
</script>

<style scoped>
.progress-ring {
  transition: stroke-dashoffset 0.35s;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
}
</style>
