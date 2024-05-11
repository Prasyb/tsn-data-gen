<!-- 经典布局 -->
<template>
  <el-container class="layout">
    <el-header>
      <div class="header-lf mask-image">
        <div class="logo">
          <img class="logo-img" :src="LocalLogo" alt=" " />
          <span class="logo-text">TSN 数据集生成器</span>
        </div>
      </div>
    </el-header>
    <el-container class="classic-content">
      <el-aside>
        <div class="aside-box" :style="{ width: '160px' }">
          <el-scrollbar>
            <el-menu
              :router="true"
              :default-active="route.path"
              :collapse="false"
              :collapse-transition="false"
            >
              <SubMenu :menu-list="authMenuList" />
            </el-menu>
          </el-scrollbar>
        </div>
      </el-aside>
      <el-container class="classic-main">
        <MainView />
      </el-container>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import MainView from './components/MainView.vue'
import SubMenu from './components/SubMenu.vue'
import routingJson from '../assets/routings.json'
import LocalLogo from '../assets/logo.svg'
import { useRoute } from 'vue-router'

const route = useRoute()

const authMenuList = routingJson.routings
</script>

<style scoped lang="scss">
.el-container {
  width: 100%;
  height: 100%;
  :deep(.el-header) {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 55px;
    padding: 0 15px 0 0;
    background-color: #202127;
    border-bottom: 1px solid var(--el-border-color);
    .header-lf {
      display: flex;
      align-items: center;
      overflow: hidden;
      white-space: nowrap;
      .logo {
        display: flex;
        justify-content: start;
        align-items: center;
        flex-shrink: 0;
        width: 400px;
        margin-left: 56px;
        .logo-img {
          width: 48px;
          margin-right: 24px;
          object-fit: contain;
        }
        .logo-text {
          font-size: 22px;
          color: var(--el-header-logo-text-color);
          white-space: nowrap;
        }
      }
    }
  }
  .classic-content {
    display: flex;
    height: calc(100% - 55px);
    :deep(.el-aside) {
      --el-aside-logo-text-color: #303133;
      --el-aside-border-color: #e4e7ed;
      width: auto;
      background-color: var(--el-menu-bg-color);
      border-right: 1px solid var(--el-border-color);
      .aside-box {
        display: flex;
        flex-direction: column;
        height: 100%;
        transition: width 0.3s ease;
        .el-menu {
          width: 100%;
          overflow-x: hidden;
          border-right: none;
        }
      }
    }
    :deep(.el-menu) {
      --el-menu-active-color: var(--el-color-primary);
      --el-menu-hover-text-color: #65ffaa;
      --el-menu-horizontal-sub-item-height: 50px;
    }
    .classic-main {
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
