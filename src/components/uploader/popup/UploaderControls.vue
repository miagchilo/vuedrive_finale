<template>
  <div
    class="
      bg-light
      py-2
      px-3
      d-flex
      justify-content-between
      align-items-center
      border-bottom
    "
  >
    <span class="text-secondary">{{ overallProgress }}% complete</span>
    <div v-if="showButtons">
      <a
        href="#"
        class="text-decoration-none"
        @click.prevent="$emit('cancel')"
        v-if="showCancelBtn"
        >CANCEL</a
      >
      <a
        href="#"
        class="text-decoration-none"
        @click.prevent="$emit('retry')"
        v-else
        >RETRY</a
      >
    </div>
  </div>
</template>

<script>
import { computed, toRef } from "vue";
import useUploadStatistics from "../../../composable/upload-statistics";

export default {
  props: {
    items: Array,
  },
  setup(props) {
    const items = toRef(props, "items");

    const overallProgress = computed(() => {
      const { processingItemsCount, processingItemsProgress } =
        useUploadStatistics(items);

      if (processingItemsCount < 1) {
        return 0;
      }

      return Math.round(processingItemsProgress / processingItemsCount);
    });

    const showCancelBtn = computed(() => {
      const { failedItemsCount } = useUploadStatistics(items);
      return items.value.length !== failedItemsCount;
    });

    const showButtons = computed(() => {
      const { completeItemsCount } = useUploadStatistics(items);
      return items.value.length !== completeItemsCount;
    });

    return { overallProgress, showCancelBtn, showButtons };
  },
  emits: ["cancel", "retry"],
};
</script>
