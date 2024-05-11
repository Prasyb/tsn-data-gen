<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import LocalLogo from '../../assets/logo.svg'

import { useRouter } from 'vue-router'

defineProps<{
  drawerVisible: boolean
  touchable: boolean
}>()

const bgLoaded = ref<boolean>(false)

const router = useRouter()

function loadBackground() {
  setTimeout(() => {
    bgLoaded.value = true
  }, 1000)
}

onMounted(() => {
  loadBackground()
})
</script>

<template>
  <div
    :class="['logo-area', { 'is-blur': drawerVisible }]"
    style="background-image: url('../../assets/index_bg.jpg')"
  >
    <div :class="['img-shadow', { 'img-shadow-show': bgLoaded }]"></div>
    <div class="inner" style="cursor: pointer" @click="router.push('/menu/form')">
      <div :class="['main-logo', { 'main-logo-top': touchable }]">
        <img :src="LocalLogo" alt="SVG" />
      </div>
      <div :class="['hello', { hello_bottom: touchable }]">
        <div>TSN 数据集生成器</div>
        <div class="hello_bottom_text">TSN Dataset Generator</div>
        <div class="hint">点击以进入</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.logo-area {
  background-size: cover !important;
  background-position: center !important;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  display: flex;
  border-radius: 100%;
  animation: logoEnter 1.5s;
  animation-fill-mode: forwards;
  transition: all 1.5s;
  &.is-blur {
    filter: blur(5px);
  }
  .img-shadow {
    content: '';
    width: 100%;
    height: 100%;
    position: absolute;
    background-color: rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: background-color 0.5s;
    border-radius: 100%;
    animation: shadowEnter 1.5s;
    animation-fill-mode: forwards;
  }
  .img-shadow-show {
    background-color: rgba(0, 0, 0, 0.5);
  }
  .inner {
    position: relative;
    .main-logo {
      width: 180px;
      position: absolute;
      transform: translate(-50%, -50%);
      transition: all 1s;
      top: 0;
      display: flex;
      justify-content: center;
    }
    .main-logo-top {
      top: -5.2rem;
    }
    .hello {
      color: #ffffff;
      width: 18.75rem;
      text-align: center;
      position: absolute;
      transform: translate(-50%, -50%);
      font-size: 1.5rem;
      opacity: 0;
      top: 100px;
      transition: all 1s;
    }
    .hello_bottom {
      opacity: 1;
      top: 3.5rem;
      .hello_bottom_text {
        font-size: 1rem;
        margin-top: 0.5rem;
        padding-top: 0.5rem;
        border-top: 1px solid #fff;
      }
    }
    .hint {
      opacity: 0.5;
      top: 3.5rem;
      font-size: 0.8rem;
      margin-top: 0.5rem;
      padding-top: 0.5rem;
    }
  }
}
</style>
