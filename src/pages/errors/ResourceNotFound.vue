<template>
  <div class="container py-5">
    <h1>404</h1>
    <p>Sorry, the {{ resource }} you're looking for is not found</p>
    <router-link to="/drive/my-files">Back to home page</router-link>
  </div>
</template>

<script>
export default {
  props: {
    resource: {
      type: String,
      required: true,
    },
  },
};
</script>
