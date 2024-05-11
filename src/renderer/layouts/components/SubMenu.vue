<template>
  <template v-for="subItem in menuList" :key="subItem.path">
    <el-sub-menu v-if="subItem.children?.length" :index="subItem.path">
      <template #title>
        <el-icon v-if="subItem.meta.icon">
          <component :is="subItem.meta.icon"></component>
        </el-icon>
        <span class="sle">{{ subItem.meta.title }}</span>
      </template>
      <SubMenu :menu-list="subItem.children" />
    </el-sub-menu>
    <el-menu-item v-else :index="subItem.path" @click="handleClickMenu(subItem)">
      <el-icon v-if="subItem.meta.icon">
        <component :is="subItem.meta.icon"></component>
      </el-icon>
      <template #title>
        <span class="sle">{{ subItem.meta.title }}</span>
      </template>
    </el-menu-item>
  </template>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

defineProps<{ menuList: Menu.MenuOptions[] }>()

const router = useRouter()
const handleClickMenu = (subItem: Menu.MenuOptions) => {
  if (subItem.meta.isLink) {
    window.open(subItem.meta.isLink, '_blank')
  } else {
    router.push(subItem.path)
  }
}
</script>

<style scoped lang="scss">
.el-sub-menu .el-sub-menu__title:hover {
  color: var(--el-menu-hover-text-color) !important;
  background-color: transparent !important;
}

.el-menu--collapse {
  .is-active {
    .el-sub-menu__title {
      color: var(--el-color-primary-light-5) !important;
      background-color: var(--el-color-primary) !important;
    }
  }
}

.el-menu-item {
  height: 55px;
  transition-property: margin-left, background-color, color;
  transition-timing-function: ease-in-out;
  transition-duration: 0.2s;
  &:hover {
    color: var(--el-menu-hover-text-color);
    margin-left: 8px;
    &::before {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: 4px;
      content: '';
      background-color: var(--el-menu-hover-text-color);
    }
  }

  &.is-active {
    color: var(--el-menu-active-color) !important;
    background-color: var(--el-menu-active-bg-color) !important;

    &::before {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: 4px;
      content: '';
      background-color: var(--el-color-primary);
    }
  }
}
</style>
