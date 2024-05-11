<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import BanTouchMask from '../components/index/BanTouchMask.vue'
import CenterLogo from '../components/index/CenterLogo.vue'
import type { ContextBridgeApi } from '../../preload/index.ts'

declare global {
  interface Window {
    api: ContextBridgeApi
  }
}
defineOptions({
  name: 'App'
})

const animationEnd = ref<boolean>(false)
const drawerVisible = ref<boolean>(false)
const backgroundLoaded = ref<boolean>(false)

onMounted(() => {
  setTimeout(() => {
    animationEnd.value = true
  }, 1300)
})

watch([backgroundLoaded, animationEnd], () => {
  if (backgroundLoaded.value && animationEnd.value) {
    document.body.style.backgroundColor = 'rgba(0,0,0,0.8)'
  }
})
</script>

<template>
  <div id="main-view">
    <BanTouchMask :touchable="animationEnd" />
    <CenterLogo
      :drawer-visible="drawerVisible"
      :touchable="animationEnd"
      @background-loaded="backgroundLoaded = true"
    />
  </div>
</template>

<style lang="scss" scoped>
#main-view {
  height: calc(var(--vh, 1vh) * 100);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}
</style>
