<template>
  <el-card class="box-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <el-icon class="card-header-icon">
          <Setting />
        </el-icon>
        <span>数据集生成选项</span>
      </div>
    </template>
    <el-form
      ref="formIns"
      :model="form"
      :rules="rules"
      label-width="auto"
      style="max-width: 500px"
      label-position="top"
      status-icon
    >
      <el-form-item label="数据集名称 ins_name" prop="insName">
        <el-input v-model="form.insName" type="text" placeholder="数据集名称" />
      </el-form-item>
      <el-form-item label="数据集实例数量 num_ins" prop="batchSize">
        <el-input-number v-model.number="form.batchSize" placeholder="数据集实例数量" :min="1" :max="1000"/>
      </el-form-item>
      <el-form-item label="流数量范围 num_flow">
        <el-col :span="11">
          <el-form-item prop="flowMin">
            <el-input-number v-model.number="form.flowMin" :min="1" :max="form.flowMax" />
          </el-form-item>
        </el-col>
        <el-col :span="2" class="flx-center">
          <span>-</span>
        </el-col>
        <el-col :span="11">
          <el-form-item prop="flowMax">
            <el-input-number v-model.number="form.flowMax" :min="form.flowMin" :max="9999" />
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item label="流长度范围 size (byte)">
        <el-col :span="11">
          <el-form-item prop="sizeMin">
            <el-input-number
              v-model.number="form.sizeMin"
              :min="1"
            />
          </el-form-item>
        </el-col>
        <el-col :span="2" class="flx-center">
          <span>-</span>
        </el-col>
        <el-col :span="11">
          <el-form-item prop="sizeMax">
            <el-input-number
              v-model.number="form.sizeMax"
              :max="2147483647"
            />
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item label="周期备选值 period (ns)" prop="period">
        <el-input v-model="form.period" placeholder="多个值使用逗号分隔，如10,20,40,80" />
      </el-form-item>
      <el-form-item label="最大时延备选值 ddl (ns)" prop="ddl">
        <el-input v-model="form.ddl" placeholder="多个值使用逗号分隔，如10,20,40,80" />
      </el-form-item>
      <el-form-item label="网络拓扑类型选择" prop="topo">
        <div class="topo-warning">
          <el-button plain type="primary" @click="goTo('/menu/graph')">
            <el-icon class="card-header-icon">
              <Setting />
            </el-icon>
            <span>前往自定义界面</span>
          </el-button>
          <el-tag v-if="topoDataStore.topoDataJson == ''" type="danger"
            ><el-icon style="color: red"><Warning /></el-icon>未设定拓扑</el-tag
          >
          <el-tag v-else type="success"
            ><el-icon style="color: lime"><CircleCheck /></el-icon>已设定拓扑</el-tag
          >
        </div>
      </el-form-item>
      <el-divider border-style="dashed" />
      <el-form-item>
        <el-button type="primary" :disabled="!useTopoDataStore().topoDataJson" @click="onSubmit">生成</el-button>
        <el-button @click="onReset(formIns)">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { ElMessageBox, FormInstance, FormRules } from 'element-plus'
import type { ContextBridgeApi } from '../../preload/index'
import { DataGenOptions } from '../../main/data_generator_custom'
import { useRouter } from 'vue-router'
import { useTopoDataStore } from '../stores/TopoData'

const formIns = ref<FormInstance>()

// do not use same name with ref
const form = ref<DataGenOptions>({
  insName: 'data_0',
  batchSize: 20,
  flowMin: 20,
  flowMax: 50,
  sizeMin: 64,
  sizeMax: 1500,
  period: '',
  ddl: '',
  topo: {
    nodes: [],
    links: []
  }
})

const rules = reactive<FormRules<DataGenOptions>>({
  insName: [
    { required: true, message: '不可为空', trigger: 'blur' },
    { max: 19, message: '数据集名不可过长(<20)', trigger: 'blur' }
  ],
  period: [
    { required: true, message: '不可为空', trigger: 'blur' },
    {
      validator: (_, value: string, callback) => {
        const nums = value.split(',')
        for (const num of nums.map((e) => parseInt(e))) {
          if (isNaN(num) || num <= 0) {
            callback(new Error('输入不合法'))
            return
          }
        }
        callback()
      },
      trigger: 'blur'
    }
  ],
  ddl: [
    { required: true, message: '不可为空', trigger: 'blur' },
    {
      validator: (_, value: string, callback) => {
        const nums = value.split(',')
        for (const num of nums.map((e) => parseInt(e))) {
          if (isNaN(num) || num <= 0) {
            callback(new Error('输入不合法'))
            return
          }
        }
        callback()
      },
      trigger: 'blur'
    }
  ]
})

const topoDataStore = useTopoDataStore()

declare global {
  interface Window {
    api: ContextBridgeApi
  }
}

const router = useRouter()
const goTo = (path: string) => {
  router.push(path)
}

const onSubmit = () => {
  if (!formIns.value) {
    return
  }
  formIns.value.validate((valid) => {
    if (valid) {
      ElMessageBox.confirm(
        `将在程序目录下的 ./grid/${form.value.insName} 文件夹下生成数据集，是否确定？`,
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        try {
          form.value.topo = JSON.parse(useTopoDataStore().topoDataJson)
          window.api.generateData(JSON.parse(JSON.stringify(form.value)))
        } catch (_) {
          console.log('invalid_data')
        }
      })
      return true
    } else {
      return false
    }
  })
}

const onReset = (formEl: FormInstance | undefined) => {
  if (!formEl) {
    return
  }
  console.log(formEl)
  formEl.resetFields()
}
</script>

<style scoped lang="scss">
.topo-warning {
  display: flex;
  > * {
    margin-inline: 4px;
  }
}
:deep(.el-input-number) {
  width: 100%;
}
</style>
