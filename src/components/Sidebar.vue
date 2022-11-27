<template>
  <nav class="nav nav-pills flex-column pt-2">
    <router-link
      class="nav-link d-flex align-items-center"
      :to="{ name: 'my-files' }"
    >
      <icon-hdd /> <span class="ms-2">My Files</span>
    </router-link>
    <router-link
      class="nav-link d-flex align-items-center"
      :to="{ name: 'recent' }"
    >
      <icon-clock /> <span class="ms-2">Recent</span>
    </router-link>
    <router-link
      class="nav-link d-flex align-items-center"
      :to="{ name: 'starred' }"
    >
      <icon-star /> <span class="ms-2">Starred</span>
    </router-link>
  </nav>
</template>

<style scoped>
.nav-pills .nav-link.router-link-active {
  color: #fff;
  background-color: #0d6efd;
}
</style>
