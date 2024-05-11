<template>
  <router-view v-slot="{ Component }">
    <transition name="page-fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>
<script setup lang="ts">
</script>

<style lang="scss" scoped>
.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.5s;
}
</style>
