<template>
  <button @click="toggle" class="rounded-button">
    <icon-arrow-up v-if="sort.order === 'asc'" />
    <icon-arrow-down v-else />
  </button>
</template>

<script>
import { reactive } from "vue";

export default {
  setup(props, { emit }) {
    const sort = reactive({
      column: "name",
      order: "asc",
    });

    const toggle = () => {
      sort.order = sort.order === "asc" ? "desc" : "asc";
      emit("sort-change", sort);
    };

    return { sort, toggle };
  },
  emits: ["sort-change"],
};
</script>
