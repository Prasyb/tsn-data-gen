<template>
  <div>
    <el-card class="box-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon class="card-header-icon">
            <Share />
          </el-icon>
          <span>自定义拓扑</span>
        </div>
      </template>
      <template #default>
        <div class="card-main">
          <Diagram />
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import Diagram from '../components/DiagramTSN.vue'
</script>
