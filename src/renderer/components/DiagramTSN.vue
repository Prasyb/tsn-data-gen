<template>
  <el-container>
    <el-main>
      <div class="float-panel">
        <el-row>
          <div class="float-panel-header">可视化拓扑编辑面板</div>
          <div class="float-panel-main">
            <el-button
              type="info"
              class="main-submit-button"
              :disabled="!topoStats.isValid || topoDataStore.isUpToDate"
              @click="myDiagram.saveTopoData()"
            >
              <span>
                <el-icon><Select /></el-icon> 应用当前拓扑
              </span>
            </el-button>
          </div>
          <div class="float-panel-footer">
            <template v-if="topoDataStore.isUpToDate">
              <el-icon size="16" color="lime"><SuccessFilled /></el-icon>
              拓扑已应用
            </template>
            <template v-else-if="topoDataStore.topoDataJson === ''">
              <el-icon size="16" color="red"><CircleCloseFilled /></el-icon>
              拓扑未应用
            </template>
            <template v-else>
              <el-icon size="16" color="yellow"><WarnTriangleFilled /></el-icon>
              有未应用的更改
            </template>
          </div>
        </el-row>
      </div>
      <div ref="diagram" class="go-diagram"></div>
    </el-main>
    <el-aside width="260px">
      <el-card
        style="width: 260px; height: calc(100% - 20px)"
        class="box-card card-small"
        shadow="hover"
      >
        <template #header>
          <div class="card-header card-header-small">
            <el-icon class="card-header-icon">
              <Setting />
            </el-icon>
            <span>操作面板</span>
          </div>
        </template>
        <template #default>
          <div class="box-card-main">
            <el-tabs v-model="activeTabName" class="card-tabs">
              <el-tab-pane label="编辑" name="first"
                ><el-row>
                  <el-button :disabled="isLinkMode" @click="myDiagram.addLinkBySelection()">
                    <el-icon><CirclePlus /></el-icon>连接
                  </el-button>
                </el-row>
                <el-row class="button-group">
                  <el-button-group>
                    <el-button plain dark :color="diagramStyles.swStrokeColor" @click="myDiagram.addNode()">
                      <el-icon><CirclePlus /></el-icon>交换机
                    </el-button>
                    <el-button plain dark :color="diagramStyles.esStrokeColor" @click="myDiagram.addNode(true)">
                      <el-icon><CirclePlus /></el-icon>端设备
                    </el-button>
                  </el-button-group>
                </el-row>
                <el-row>
                  <el-button @click="myDiagram.toggleNodeType()"
                    ><el-icon><Switch /></el-icon>切换设备类型</el-button
                  >
                </el-row>
                <el-row>
                  <el-button type="warning" plain @click="myDiagram.del()"
                    ><el-icon><Delete /></el-icon>删除选中元素</el-button
                  >
                </el-row>
                <el-row>
                  <div class="switch-box">
                    <div class="switch-box-header">
                      自动排列<el-icon size="16"><Share /></el-icon>
                    </div>
                    <div class="switch-box-main">
                      <el-switch
                        v-model="useLayout"
                        active-text="开启"
                        inactive-text="关闭"
                        :disabled="!topoStats.isValid"
                        @change="myDiagram.switchUseLayout()"
                      />
                    </div>
                  </div>
                </el-row>
                <el-row>
                  <div class="switch-box">
                    <div class="switch-box-header">
                      编辑模式<el-icon size="16"><EditPen /></el-icon>
                    </div>
                    <div class="switch-box-main">
                      <el-switch
                        v-model="isLinkMode"
                        active-text="连接"
                        inactive-text="普通"
                        @change="myDiagram.switchLinkMode()"
                      />
                    </div>
                  </div>
                </el-row>
                <el-row>
                  <div class="switch-box">
                    <div class="switch-box-header">
                      视图比例(%)<el-icon size="16"><ZoomIn /></el-icon>
                    </div>
                    <div class="switch-box-main">
                      <el-slider
                        v-model="diagramScale"
                        :min="20"
                        :max="200"
                        :marks="scaleSliderMarks"
                        @input="myDiagram.changeDiagramScale()"
                      />
                      <el-input-number
                        v-model="diagramScale"
                        size="small"
                        :min="20"
                        :max="200"
                        @change="myDiagram.changeDiagramScale()"
                      />
                    </div>
                  </div>
                </el-row>
                <el-divider border-style="dashed" />
                <el-row>
                  <el-popconfirm
                    width="200"
                    confirm-button-text="确定"
                    cancel-button-text="取消"
                    :icon="WarnTriangleFilled"
                    icon-color="yellow"
                    title="确定要清空所有内容吗？"
                    @confirm="myDiagram.clear()"
                  >
                    <template #reference>
                      <el-button type="danger" plain>
                        <el-icon><MagicStick /></el-icon> 清空所有元素
                      </el-button>
                    </template>
                  </el-popconfirm>
                </el-row>
              </el-tab-pane>
              <el-tab-pane label="生成" name="second">
                <el-row>
                  <el-select
                    v-model="topoGeneratingOptions.topoOption"
                    placeholder="选择拓扑类型"
                    clearable
                  >
                    <el-option
                      v-for="item in topoOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-row>
                <el-row>
                  <div class="switch-box">
                    <div class="switch-box-header">
                      端设备数<el-icon size="16"><Monitor /></el-icon>
                    </div>
                    <div class="switch-box-main">
                      <el-input-number
                        v-model="topoGeneratingOptions.esCount"
                        :min="0"
                        :max="200"
                      />
                    </div>
                  </div>
                </el-row>
                <el-row>
                  <div class="switch-box">
                    <div class="switch-box-header">
                      交换机数<el-icon size="16"><Switch /></el-icon>
                    </div>
                    <div class="switch-box-main">
                      <el-input-number
                        v-model="topoGeneratingOptions.swCount"
                        :min="1"
                        :max="100"
                      />
                    </div>
                  </div>
                </el-row>
                <el-row>
                  <el-popconfirm
                    width="200"
                    confirm-button-text="确定"
                    cancel-button-text="取消"
                    :icon="WarnTriangleFilled"
                    icon-color="yellow"
                    title="将覆盖现有拓扑，是否确定？"
                    @confirm="myDiagram.generateTopo()"
                  >
                    <template #reference>
                      <el-button
                        type="primary"
                        plain
                        :disabled="topoGeneratingOptions.topoOption == null"
                        ><el-icon size="16"><DocumentAdd /></el-icon>生成拓扑</el-button
                      >
                    </template>
                  </el-popconfirm>
                </el-row>
              </el-tab-pane>
              <el-tab-pane label="数据" name="third">
                <el-row class="button-group">
                  <el-button-group>
                    <el-popconfirm
                      width="200"
                      confirm-button-text="确定"
                      cancel-button-text="取消"
                      :icon="WarnTriangleFilled"
                      icon-color="yellow"
                      title="将覆盖现有拓扑，是否确定？"
                      @confirm="myDiagram.importTopoData()"
                    >
                      <template #reference>
                        <el-button type="primary" plain
                          ><el-icon><Tickets /></el-icon> 导入 <el-icon><Share /></el-icon
                        ></el-button>
                      </template>
                    </el-popconfirm>
                    <el-button type="warning" plain @click="myDiagram.exportTopoData()"
                      ><el-icon><Share /></el-icon> 导出 <el-icon><Tickets /></el-icon
                    ></el-button>
                  </el-button-group>
                </el-row>
                <el-row>
                  <el-input
                    v-model="topoDataJson"
                    rows="9"
                    resize="none"
                    type="textarea"
                    placeholder="拓扑 Json"
                  ></el-input>
                </el-row>
                <el-row class="button-group">
                  <el-button-group>
                    <el-button type="danger" plain @click="topoDataJson = ''"
                      ><el-icon><MagicStick /></el-icon>清空</el-button
                    >
                    <el-button type="success" plain @click="copyText(topoDataJson)"
                      ><el-icon><CopyDocument /></el-icon>复制</el-button
                    >
                  </el-button-group>
                </el-row>
                <el-row>
                  <div class="statistic-card">
                    <div class="statistic-card-header">拓扑详细信息</div>
                    <div class="statistic-card-main">
                      <el-statistic :value="topoStats.nodeCount">
                        <template #title>
                          <div class="el-statistic-title">
                            <el-icon size="16"><HelpFilled /></el-icon>
                            总节点数
                          </div>
                        </template>
                      </el-statistic>
                      <div class="statistic-card-main-sub">
                        <el-statistic :value="topoStats.esCount">
                          <template #title>
                            <div class="el-statistic-title">
                              <el-icon size="14"><Monitor /></el-icon>
                              端设备数
                            </div>
                          </template>
                        </el-statistic>
                      </div>
                      <div class="statistic-card-main-sub">
                        <el-statistic :value="topoStats.swCount">
                          <template #title>
                            <div class="el-statistic-title">
                              <el-icon size="14"><Switch /></el-icon>
                              交换机数
                            </div>
                          </template>
                        </el-statistic>
                      </div>
                      <el-statistic :value="topoStats.linkCount">
                        <template #title>
                          <div class="el-statistic-title">
                            <el-icon size="16"><Share /></el-icon>
                            总连接数
                          </div>
                        </template>
                      </el-statistic>
                    </div>
                    <div class="statistic-card-footer">
                      连通性:<el-icon v-if="topoStats.isValid" size="16" style="color: lime"
                        ><SuccessFilled /></el-icon
                      ><el-icon v-else size="16" style="color: red"><WarningFilled /></el-icon>
                    </div>
                  </div>
                </el-row>
              </el-tab-pane>
            </el-tabs>
          </div>
        </template>
        <template #footer>
          <div class="selection-display-box">
            <div class="selection-display-box-header">当前选中</div>
            <template v-if="currentSelectedPart instanceof go.Node">
              <div class="selection-display-box-main">
                <el-tag effect="light" round> {{ currentSelectedPart.data.key }} </el-tag>
              </div>
              <div class="selection-display-box-footer">
                <div class="selection-display-icon-text-container">
                  <el-icon size="16"><HelpFilled /></el-icon>
                  节点
                </div>
              </div>
            </template>
            <template v-else-if="currentSelectedPart instanceof go.Link">
              <div class="selection-display-box-main">
                <el-tag effect="light" round> {{ currentSelectedPart?.data.from }} </el-tag>
                →
                <el-tag effect="light" round> {{ currentSelectedPart?.data.to }} </el-tag>
              </div>
              <div class="selection-display-box-footer">
                <div class="selection-display-icon-text-container">
                  <el-icon size="16"><TopRight /></el-icon>
                  连接
                </div>
              </div>
            </template>
            <template v-else>
              <div class="selection-display-box-main">
                <el-tag effect="light" round> - </el-tag>
              </div>
              <div class="selection-display-box-footer">
                <div class="selection-display-icon-text-container">
                  <el-icon size="16"><Remove /></el-icon>
                  无
                </div>
              </div>
            </template>
          </div>
        </template>
      </el-card>
    </el-aside>
  </el-container>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, shallowRef } from 'vue'
import * as go from 'gojs'
import { ChangeType } from 'gojs'
import { ElMessage } from 'element-plus'
import { useTopoDataStore } from '../stores/TopoData'
import { WarnTriangleFilled } from '@element-plus/icons-vue'
import { TopoData } from '../../main/data_generator_custom'

const diagram = ref()

let myDiagram: MyDiagram

onMounted(() => {
  myDiagram = new MyDiagram()
})

const activeTabName = ref('first')
const useLayout = ref(false)
const isLinkMode = ref(false)
const currentSelectedPart = shallowRef<go.Part | null>()
const diagramScale = ref(100)
const scaleSliderMarks = reactive({
  100: ''
})
const topoDataJson = ref('')
const topoStats = reactive({
  nodeCount: 0,
  esCount: 0,
  swCount: 0,
  linkCount: 0,
  isValid: false
})

const topoOptions = [
  {
    value: 'line',
    label: '总线'
  },
  {
    value: 'ring',
    label: '环形'
  },
  {
    value: 'tree',
    label: '树状'
  },
  {
    value: 'mesh',
    label: '网格'
  },
  {
    value: 'random',
    label: '随机'
  }
]
const topoGeneratingOptions = reactive({
  topoOption: undefined,
  swCount: 10,
  esCount: 10
})

const diagramStyles = {
  swFillColor: '#111827',
  esFillColor: '#111827',
  swStrokeColor: '#9252E9',
  esStrokeColor: '#2AC06A',
  selectStrokeColor: '#FF6347',
  linkColor: 'white',
  linkArrowColor: '#aaaaaa',
  selectedLinkColor: '#FF6347',
  linkHighlightColor: '#33FF33',
  fontColor: 'white',
  subFontColor: 'lightskyblue '
}

const copyText = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage({
      type: 'success',
      message: '复制成功'
    })
  })
}

const topoDataStore = useTopoDataStore()

class MyDiagram {
  myDiagram: go.Diagram
  nodeToLinkMap = new Map<string, string[]>()
  selectedAnimatedNodes = new Map<go.Node, go.Animation[]>()

  constructor() {
    const nodeToLinkMap = this.nodeToLinkMap
    this.myDiagram = new go.Diagram(diagram.value, {
      initialAutoScale: go.AutoScale.Uniform,
      contentAlignment: go.Spot.Center,
      layout: new go.ForceDirectedLayout({
        defaultElectricalCharge: 200,
        electricalCharge(v: go.ForceDirectedVertex): number {
          if (nodeToLinkMap.get(v.node!.key as string)) {
            if (v.node!.data.isES) {
              return 80
            } else {
              return 200
            }
          } else {
            return 0
          }
        },
        defaultSpringStiffness: 0.03,
        springLength(e: go.ForceDirectedEdge): number {
          if (e.toVertex?.node?.data.isES || e.fromVertex?.node?.data.isES) {
            return 50
          } else {
            return 100
          }
        },
        maxIterations: 400
      }),
      maxSelectionCount: 2
    })

    this.myDiagram.nodeTemplate = new go.Node('Horizontal', {
      locationSpot: go.Spot.Center, // Node.location is the center of the Shape
      locationObjectName: 'SHAPE',
      selectionAdorned: false,
      selectionChanged: this.selectionChanged
    }).add(
      new go.Panel('Spot')
        .add(
          new go.Shape('Circle', {
            fill: null,
            stroke: null,
            desiredSize: new go.Size(48, 48),
            scale: 3
          })
        )
        .add(
          new go.Shape('Circle', {
            name: 'SHAPE_SELECTION',
            fill: null,
            strokeWidth: 2,
            stroke: diagramStyles.selectStrokeColor,
            strokeDashArray: [6, 4],
            desiredSize: new go.Size(48, 48),
            opacity: 0
          })
        )
        .add(
          new go.Shape('Circle', {
            name: 'SHAPE',
            fill: diagramStyles.swFillColor,
            strokeWidth: 2,
            stroke: diagramStyles.swStrokeColor,
            desiredSize: new go.Size(36, 36),
            portId: '' // so links will go to the shape, not the whole node
          })
            .bind('stroke', 'isES', (isES) =>
              isES ? diagramStyles.esStrokeColor : diagramStyles.swStrokeColor
            )
            .bind('fill', 'isES', (isES) =>
              isES ? diagramStyles.esFillColor : diagramStyles.swFillColor
            )
        )
        .add(
          new go.TextBlock({ font: '16px Cambria Math', stroke: diagramStyles.fontColor }).bind(
            'text',
            'key'
          )
        )
        .add(
          new go.Panel('Spot')
            .add(
              new go.Shape('Circle', {
                fill: null,
                stroke: null,
                desiredSize: new go.Size(70, 70)
              })
            )
            .add(
              new go.TextBlock({
                font: '14px Cambria Math',
                stroke: diagramStyles.subFontColor,
                alignment: go.Spot.Top
              }).bind('text', 'distance', (d) => (d === Infinity ? '∞' : d | 0))
            )
        )
    )

    // define the Link template
    this.myDiagram.linkTemplate = new go.Link({
      selectable: true,
      curve: go.Curve.JumpGap,
      selectionAdorned: false,
      layerName: 'Background',
      routing: go.Routing.Normal,
      selectionChanged: this.selectionChanged
    })
      .add(
        new go.Shape({
          isPanelMain: true,
          stroke: null,
          strokeWidth: 6,
          opacity: 0.5
        }).bindObject('stroke', 'isHighlighted', (h) =>
          h ? diagramStyles.linkHighlightColor : null
        )
      )
      .add(
        new go.Shape({
          isPanelMain: true,
          stroke: 'transparent',
          strokeWidth: 12
        })
      )
      .add(
        new go.Shape({
          isPanelMain: true,
          stroke: null,
          strokeWidth: 2,
          opacity: 0.6
        }).bindObject('stroke', 'isSelected', (s) =>
          s ? diagramStyles.selectedLinkColor : diagramStyles.linkColor
        )
      )
      .add(
        new go.Shape({
          stroke: null,
          fill: diagramStyles.linkArrowColor,
          scale: 1.2,
          toArrow: 'Standard'
        }).bindObject('fill', 'isSelected', (s) =>
          s ? diagramStyles.selectedLinkColor : diagramStyles.linkArrowColor
        )
      )
      .add(
        new go.Shape({
          stroke: null,
          fill: diagramStyles.linkArrowColor,
          scale: 1.2,
          fromArrow: 'Backward'
        }).bindObject('fill', 'isSelected', (s) =>
          s ? diagramStyles.selectedLinkColor : diagramStyles.linkArrowColor
        )
      )

    const nodeDataArray: object[] = []
    const linkDataArray: object[] = []
    this.myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray)
    ;(this.myDiagram.model as go.GraphLinksModel).linkKeyProperty = 'key'

    this.myDiagram.addDiagramListener('ChangedSelection', (e) => {
      this.selectionChanged(e.diagram.selection.first())
    })

    this.myDiagram.addDiagramListener('ViewportBoundsChanged', (e) => {
      diagramScale.value = Math.round(e.diagram.scale * 100)
    })

    this.myDiagram.addModelChangedListener((e) => {
      switch (e.change) {
        case ChangeType.Insert:
        case ChangeType.Remove: {
          topoDataStore.isUpToDate = false
          this.refreshTopoStats()
          break
        }
        case ChangeType.Transaction: {
          if (e.isTransactionFinished && useLayout.value) {
            this.myDiagram.layoutDiagram(true)
          }
        }
      }
    })

    this.myDiagram.toolManager.clickSelectingTool.standardMouseSelect = this.defaultMouseSelect

    this.generateTreeTopo(15, 30)
    this.myDiagram.layoutDiagram(true)
    this.chooseTwoNodes()
  }

  refreshTopoStats = () => {
    topoStats.nodeCount = this.myDiagram.model.nodeDataArray.length
    topoStats.linkCount = (this.myDiagram.model as go.GraphLinksModel).linkDataArray.length
    topoStats.esCount = this.myDiagram.model.nodeDataArray.reduce(
      (sum, data) => (data.isES ? sum + 1 : sum),
      0
    )
    topoStats.swCount = topoStats.nodeCount - topoStats.esCount
    topoStats.isValid = topoStats.esCount > 0 && this.detectConnectivity()
    if (useLayout.value) {
      useLayout.value = topoStats.isValid
      this.myDiagram.layout.isValidLayout = !useLayout.value
    }
    this.myDiagram.layout.isOngoing = useLayout.value
  }

  detectConnectivity = () => {
    if (this.myDiagram.model.nodeDataArray.length == 0) {
      return true
    }
    const source = this.myDiagram.findPartForKey(
      this.myDiagram.model.nodeDataArray[0].key
    )! as go.Node
    const seen = new go.Set<go.Part>()
    seen.add(source)
    const finished = new go.Set()
    while (seen.count > 0) {
      const least = seen.first()! as go.Node
      seen.delete(least)
      finished.add(least)
      const neighbors = least.findLinksConnected()
      while (neighbors.next()) {
        const link = neighbors.value
        const neighbor = link.getOtherNode(least)!
        if (finished.has(neighbor)) continue
        seen.add(neighbor)
      }
    }
    return finished.count == this.myDiagram.model.nodeDataArray.length
  }

  defaultMouseSelect = () => {
    const diagram = this.myDiagram
    if (diagram === null || !diagram.allowSelect) return
    const e = diagram.lastInput
    const count = diagram.selection.count
    const curobj = diagram.findPartAt(e.documentPoint, false)
    if (curobj !== null) {
      if (count == 0) {
        if (!curobj.isSelected) {
          const part = curobj
          if (part !== null) part.isSelected = true
        }
      } else if (count == 1) {
        if (diagram.selection.first()!.constructor === curobj.constructor) {
          if (diagram.selection.first()! instanceof go.Link) {
            if (!curobj.isSelected) {
              const part = curobj
              if (part !== null) diagram.select(part)
            }
          } else {
            if (!curobj.isSelected) {
              const part = curobj
              if (part !== null) part.isSelected = true
            }
          }
        } else {
          if (!curobj.isSelected) {
            const part = curobj
            if (part !== null) diagram.select(part)
          }
        }
      } else if (count >= 2) {
        if (!curobj.isSelected) {
          const part = curobj
          if (part !== null) diagram.select(part)
        }
      }
    } else if (e.left && !(e.control || e.meta) && !e.shift) {
      // left click on background with no modifier: clear selection
      diagram.clearSelection()
    }
  }

  linkModeMouseSelect = () => {
    const diagram = this.myDiagram
    if (diagram === null || !diagram.allowSelect) return
    const e = diagram.lastInput
    const count = diagram.selection.count
    const curobj = diagram.findPartAt(e.documentPoint, false)
    if (curobj !== null && curobj instanceof go.Node) {
      if (count == 0) {
        if (!curobj.isSelected) {
          const part = curobj
          if (part !== null) part.isSelected = true
        }
      } else if (count == 1) {
        if (!curobj.isSelected) {
          const part = curobj
          if (part !== null) part.isSelected = true
        }
        this.addLinkBySelection()
        diagram.clearSelection()
      } else if (count >= 2) {
        diagram.clearSelection()
      }
    } else if (curobj instanceof go.Link) {
      if (count > 0) {
        this.myDiagram.clearSelection()
      }
      if (!curobj.isSelected) {
        const part = curobj
        if (part !== null) part.isSelected = true
        this.del()
      }
    } else if (e.left && !(e.control || e.meta) && !e.shift) {
      diagram.clearSelection()
    }
  }

  nodeSelectionAnimation(node: go.Node) {
    const animation = new go.Animation()
    animation.add(node.findObject('SHAPE_SELECTION') as go.Shape, 'scale', 2, 1)
    animation.duration = 300
    animation.easing = go.Animation.EaseInExpo
    animation.start()
    const animation2 = new go.Animation()
    animation2.add(node.findObject('SHAPE_SELECTION') as go.Shape, 'opacity', 0, 0.9)
    animation2.duration = 400
    animation2.start()
    const animation3 = new go.Animation()
    animation3.add(node.findObject('SHAPE_SELECTION') as go.Shape, 'angle', 0, 120)
    animation3.duration = 600
    animation3.easing = go.Animation.EaseOutQuad
    animation3.start()
    this.selectedAnimatedNodes.set(node, [animation, animation2, animation3])
  }

  nodeReleaseAnimation(node: go.Node) {
    this.selectedAnimatedNodes.get(node)?.forEach((ani) => ani.stop())
    const animation = new go.Animation()
    animation.add(node.findObject('SHAPE_SELECTION') as go.Shape, 'scale', 1, 1.5)
    animation.duration = 300
    animation.easing = go.Animation.EaseOutQuad
    animation.start()
    const animation2 = new go.Animation()
    animation2.add(node.findObject('SHAPE_SELECTION') as go.Shape, 'opacity', 0.9, 0, false)
    animation2.duration = 200
    animation2.start()
    const animation3 = new go.Animation()
    animation3.add(node.findObject('SHAPE_SELECTION') as go.Shape, 'angle', 120, 180)
    animation3.duration = 200
    animation3.easing = go.Animation.EaseInOutQuad
    animation3.start()
  }

  chooseTwoNodes() {
    this.myDiagram.clearSelection()
    const num = this.myDiagram.model.nodeDataArray.length
    let node1: go.Node | null = null
    let node2: go.Node | null = null
    for (let i = Math.floor(Math.random() * num); i < num * 2; i++) {
      node1 = this.myDiagram.findNodeForKey(`${i % num}`)
      const distances = this.findDistances(node1!)
      for (let j = Math.floor(Math.random() * num); j < num * 2; j++) {
        node2 = this.myDiagram.findNodeForKey(`${j % num}`)
        const dist = distances.get(node2!)!
        if (dist > 1 && dist < Infinity) {
          node1!.isSelected = true
          node2!.isSelected = true
          break
        }
      }
      if (this.myDiagram.selection.count > 0) break
    }
  }

  // This event handler is declared in the node template and is called when a node's
  //   Node.isSelected property changes value.
  // When a node is selected show distances from the first selected node.
  // When a second node is selected, highlight the shortest path between two selected nodes.
  // If a node is deselected, clear all highlights.

  selectionChanged = (node: go.Part | null) => {
    currentSelectedPart.value = node
    if (node instanceof go.Node) {
      const diagram = node.diagram
      if (diagram === null) return
      diagram.clearHighlighteds()
      if (node.isSelected) {
        this.nodeSelectionAnimation(node)
        // show the distance for each node from the selected node
        if (!(node instanceof go.Node && diagram.selection.first() instanceof go.Node)) {
          return
        }
        const begin = diagram.selection.first() as go.Node
        this.showDistances(begin)
        if (diagram.selection.count === 2) {
          const end = node as go.Node // just became selected
          // highlight the shortest path
          this.highlightShortestPath(begin, end)
        }
      } else {
        this.nodeReleaseAnimation(node)
      }
    }
  }

  showDistances(begin: go.Part) {
    const distances = this.findDistances(begin)
    const it = distances.iterator
    while (it.next()) {
      const n = it.key
      const dist = it.value
      this.myDiagram.model.setDataProperty(n.data, 'distance', dist)
    }
  }

  highlightShortestPath(begin: go.Node, end: go.Node) {
    this.highlightPath(this.findShortestPath(begin, end))
  }

  addLink(src: string, dst: string) {
    if (src > dst) {
      const temp = src
      src = dst
      dst = temp
    }
    if (
      (this.myDiagram.model as go.GraphLinksModel).findLinkDataForKey(`[${src}, ${dst}]`) !== null
    ) {
      return
    }
    const linkKey = `[${src}, ${dst}]`
    if (!this.nodeToLinkMap.has(src)) {
      this.nodeToLinkMap.set(src, [linkKey])
    } else {
      this.nodeToLinkMap.get(src)!.push(linkKey)
    }
    if (!this.nodeToLinkMap.has(dst)) {
      this.nodeToLinkMap.set(dst, [linkKey])
    } else {
      this.nodeToLinkMap.get(dst)!.push(linkKey)
    }

    ;(this.myDiagram.model as go.GraphLinksModel).addLinkData({
      key: linkKey,
      from: src,
      to: dst
    })
  }
  addLinkBySelection() {
    if (this.myDiagram.selection.count !== 2) {
      return
    }
    const src = this.myDiagram.selection.first()!
    const dst = this.myDiagram.selection.filter((node) => node !== src).first()!
    this.addLink(src.key as string, dst.key as string)
    this.myDiagram.clearSelection()
  }

  findNextNodeId = () => {
    let id = 0
    // eslint-disable-next-line no-constant-condition
    while (true) {
      let same = false
      this.myDiagram.model.nodeDataArray.forEach((data) => {
        if (data.key.toString() === id.toString()) {
          same = true
        }
      })
      if (same) {
        id++
      } else {
        return id.toString()
      }
    }
  }

  addNode = (isES = false, id: string | undefined = undefined) => {
    if (!id) {
      id = this.findNextNodeId()
    }
    if ((this.myDiagram.model as go.GraphLinksModel).findNodeDataForKey(id) !== null) {
      return
    }
    ;(this.myDiagram.model as go.GraphLinksModel).addNodeData({
      key: id,
      isES: isES
    })
    this.myDiagram.findNodeForKey(id)!.position = new go.Point(
      Math.random() * 160 + 1,
      Math.random() * 160 + 1
    )
  }

  del = () => {
    const part = currentSelectedPart.value
    if (part === null || !(part instanceof go.Node || part instanceof go.Link)) {
      return
    }
    if (part instanceof go.Node) {
      this.nodeToLinkMap.get(part.key as string)?.forEach((linkKey) => {
        ;(this.myDiagram.model as go.GraphLinksModel).removeLinkData(
          (this.myDiagram.model as go.GraphLinksModel).findLinkDataForKey(linkKey)!
        )
      })
      this.nodeToLinkMap.delete(part.key as string)
      ;(this.myDiagram.model as go.GraphLinksModel).removeNodeData(
        this.myDiagram.model.findNodeDataForKey(part.key)!
      )
    } else if (part instanceof go.Link) {
      const linkList = this.nodeToLinkMap.get(part.data.from)!
      linkList.splice(
        linkList.findIndex((l) => l == part.data.key),
        1
      )
      const linkListDst = this.nodeToLinkMap.get(part.data.to)!
      linkListDst.splice(
        linkListDst.findIndex((l) => l == part.data.key),
        1
      )
      ;(this.myDiagram.model as go.GraphLinksModel).removeLinkData(
        (this.myDiagram.model as go.GraphLinksModel).findLinkDataForKey(part.data.key)!
      )
    }
  }

  clear = () => {
    this.nodeToLinkMap.clear()
    this.myDiagram.clear()
    this.refreshTopoStats()
  }

  generateTopo = () => {
    this.clear()
    if (!topoGeneratingOptions.topoOption) {
      return
    }
    switch (topoGeneratingOptions.topoOption as string) {
      case 'line': {
        this.generateLineTopo(topoGeneratingOptions.swCount, topoGeneratingOptions.esCount)
        break
      }
      case 'ring': {
        this.generateRingTopo(topoGeneratingOptions.swCount, topoGeneratingOptions.esCount)
        break
      }
      case 'mesh': {
        this.generateMeshTopo(topoGeneratingOptions.swCount, topoGeneratingOptions.esCount)
        break
      }
      case 'tree': {
        this.generateTreeTopo(topoGeneratingOptions.swCount, topoGeneratingOptions.esCount)
        break
      }
      case 'random': {
        this.generateRandomTopo(topoGeneratingOptions.swCount, topoGeneratingOptions.esCount)
        break
      }
    }
    this.myDiagram.layoutDiagram(true)
  }

  modelToTopoData = () => {
    const topoData: TopoData = {
      nodes: [],
      links: []
    }
    this.myDiagram.model.nodeDataArray.forEach((data) => {
      topoData.nodes.push({
        id: data.key.toString(),
        isES: data.isES
      })
    })
    ;(this.myDiagram.model as go.GraphLinksModel).linkDataArray.forEach((data) => {
      topoData.links.push({
        from: data.from.toString(),
        to: data.to.toString()
      })
    })
    return topoData
  }

  exportTopoData = () => {
    topoDataJson.value = JSON.stringify(this.modelToTopoData())
    ElMessage.success({
      message: '导出成功'
    })
    activeTabName.value = 'third'
  }

  importTopoData = () => {
    let topoData: TopoData
    try {
      topoData = JSON.parse(topoDataJson.value)
    } catch (e) {
      ElMessage.error({
        message: '导入失败'
      })
      return
    }
    this.clear()
    ;(this.myDiagram.layout as go.ForceDirectedLayout).isOngoing = true
    topoData.nodes.forEach((data) => {
      this.addNode(data.isES, data.id)
    })
    topoData.links.forEach((data) => {
      this.addLink(data.from, data.to)
    })
    ;(this.myDiagram.layout as go.ForceDirectedLayout).isOngoing = false
    ElMessage.success({
      message: '导入成功'
    })
  }

  saveTopoData = () => {
    topoDataStore.topoDataJson = JSON.stringify(this.modelToTopoData())
    topoDataStore.isUpToDate = true
    ElMessage.success({
      message: '成功应用当前拓扑'
    })
  }

  toggleNodeType = () => {
    const part = currentSelectedPart.value
    if (part === null || !(part instanceof go.Node)) {
      return
    }
    this.myDiagram.model.setDataProperty(part.data, 'isES', !part.data.isES)
    this.myDiagram.clearSelection()
  }

  switchUseLayout = () => {
    if (useLayout.value) {
      this.myDiagram.layoutDiagram(true)
    } else {
      this.myDiagram.layout.isValidLayout = true
    }
  }

  switchLinkMode = () => {
    if (isLinkMode.value) {
      this.myDiagram.toolManager.clickSelectingTool.standardMouseSelect = this.linkModeMouseSelect
    } else {
      this.myDiagram.toolManager.clickSelectingTool.standardMouseSelect = this.defaultMouseSelect
    }
    this.myDiagram.clearSelection()
  }

  changeDiagramScale = () => {
    this.myDiagram.scale = diagramScale.value / 100
  }

  highlightPath(path: go.List<go.Node>) {
    this.myDiagram.clearHighlighteds()
    for (let i = 0; i < path.count - 1; i++) {
      const f = path.get(i)
      const t = path.get(i + 1)
      f.findLinksTo(t).each((l: go.Link) => (l.isHighlighted = true))
      t.findLinksTo(f).each((l: go.Link) => (l.isHighlighted = true))
    }
  }

  // There are three bits of functionality here:
  // 1: findDistances(Node) computes the distance of each Node from the given Node.
  //    This function is used by showDistances to update the model data.
  // 2: findShortestPath(Node, Node) finds a shortest path from one Node to another.
  //    This uses findDistances.  This is used by highlightShortestPath.
  // 3: collectAllPaths(Node, Node) produces a collection of all paths from one Node to another.
  //    This is used by listAllPaths.  The result is remembered in a global variable
  //    which is used by highlightSelectedPath.  This does not depend on findDistances.

  // 此函数来自 gojs 官方示例 https://gojs.net/latest/samples/distances.html
  // Returns a Map of Nodes with distance values from the given source Node.
  // Assumes all links are directional.
  findDistances(source: go.Part): go.Map<go.Part, number> {
    const diagram = source.diagram
    // keep track of distances from the source node
    const distances = new go.Map<go.Part, number>(/*go.Node, "number"*/)
    // all nodes start with distance Infinity
    const nit = diagram!.nodes
    while (nit.next()) {
      const n = nit.value
      distances.set(n, Infinity)
    }
    // the source node starts with distance 0
    distances.set(source, 0)
    // keep track of nodes for which we have set a non-Infinity distance,
    // but which we have not yet finished examining
    const seen = new go.Set<go.Part>()
    seen.add(source)

    // keep track of nodes we have finished examining;
    // this avoids unnecessary traversals and helps keep the SEEN collection small
    const finished = new go.Set(/*go.Node*/)
    while (seen.count > 0) {
      // look at the unfinished node with the shortest distance so far
      const least = this.leastNode(seen, distances)! as go.Node
      const leastdist = distances.get(least)!
      // by the end of this loop we will have finished examining this LEAST node
      seen.delete(least)
      finished.add(least)
      // look at all Links connected with this node
      const it = least.findLinksConnected()
      while (it.next()) {
        const link = it.value
        const neighbor = link.getOtherNode(least)!
        // skip nodes that we have finished
        if (finished.has(neighbor)) continue
        const neighbordist = distances.get(neighbor)!
        // assume "distance" along a link is unitary, but could be any non-negative number.
        const dist = leastdist + 1 //Math.sqrt(least.location.distanceSquaredPoint(neighbor.location));
        if (dist < neighbordist) {
          // if haven't seen that node before, add it to the SEEN collection
          if (neighbordist === Infinity) {
            seen.add(neighbor)
          }
          // record the new best distance so far to that node
          distances.set(neighbor, dist)
        }
      }
    }

    return distances
  }

  // 此函数来自 gojs 官方示例 https://gojs.net/latest/samples/distances.html
  // This helper function finds a Node in the given collection that has the smallest distance.
  leastNode(coll: go.Iterable<go.Part>, distances: go.Map<go.Part, number>) {
    let bestdist = Infinity
    let bestnode: go.Part | null = null
    const it = coll.iterator
    while (it.next()) {
      const n = it.value
      const dist = distances.get(n)
      if (dist! < bestdist) {
        bestdist = dist!
        bestnode = n
      }
    }
    return bestnode
  }

  // 此函数来自 gojs 官方示例 https://gojs.net/latest/samples/distances.html
  // Find a path that is shortest from the BEGIN node to the END node.
  // (There might be more than one, and there might be none.
  findShortestPath(begin: go.Node, end: go.Node | null): go.List<go.Node> {
    // compute and remember the distance of each node from the BEGIN node
    const distances = this.findDistances(begin)

    // now find a path from END to BEGIN, always choosing the adjacent Node with the lowest distance
    const path = new go.List<go.Node>()
    path.add(end!)
    while (end !== null) {
      let next: go.Node | null = this.leastNode(end.findNodesConnected(), distances)! as go.Node
      if (next !== null) {
        if (distances.get(next)! < distances.get(end)!) {
          path.add(next) // making progress towards the beginning
        } else {
          next = null // nothing better found -- stop looking
        }
      }
      end = next
    }
    // reverse the list to start at the node closest to BEGIN that is on the path to END
    // NOTE: if there's no path from BEGIN to END, the first node won't be BEGIN!
    path.reverse()
    return path
  }

  generateMeshTopo(numSw: number, numEs: number) {
    const numNode = numSw + numEs
    const net: number[][] = new Array(numNode).fill([]).map(() => new Array(numNode).fill(0))
    for (let i = 0; i < numSw - 1; i++) {
      net[i][i + 1] = 1
      net[i + 1][i] = 1
    }
    net[0][numSw - 1] = 1
    net[numSw - 1][0] = 1
    for (let i = 0; i < numSw; i++) {
      net[i][numSw - i - 1] = 1
      net[numSw - i - 1][i] = 1
    }
    let sw = 0
    for (let i = numSw; i < numNode; i++) {
      if (i >= numEs + numSw) {
        break
      }
      net[sw][i] = 1
      net[i][sw] = 1
      sw++
      sw = sw >= numSw ? 0 : sw
    }
    for (let i = 0; i < numSw; i++) {
      this.addNode(false, i.toString())
    }
    for (let i = numSw; i < numNode; i++) {
      this.addNode(true, i.toString())
    }
    for (let i = 0; i < numNode; i++) {
      for (let j = 0; j < numNode; j++) {
        if (net[i][j] == 1) {
          this.addLink(i.toString(), j.toString())
        }
      }
    }
  }
  generateLineTopo(numSw: number, numEs: number) {
    const numNode = numSw + numEs
    const net: number[][] = new Array(numNode).fill([]).map(() => new Array(numNode).fill(0))
    for (let i = 0; i < numSw - 1; i++) {
      net[i][i + 1] = 1
      net[i + 1][i] = 1
    }
    let sw = 0
    for (let i = numSw; i < numNode; i++) {
      if (i >= numEs + numSw) {
        break
      }
      net[sw][i] = 1
      net[i][sw] = 1
      sw++
      sw = sw >= numSw ? 0 : sw
    }
    for (let i = 0; i < numSw; i++) {
      this.addNode(false, i.toString())
    }
    for (let i = numSw; i < numNode; i++) {
      this.addNode(true, i.toString())
    }
    for (let i = 0; i < numNode; i++) {
      for (let j = 0; j < numNode; j++) {
        if (net[i][j] == 1) {
          this.addLink(i.toString(), j.toString())
        }
      }
    }
  }
  generateRingTopo(numSw: number, numEs: number) {
    const numNode = numSw + numEs
    const net: number[][] = new Array(numNode).fill([]).map(() => new Array(numNode).fill(0))
    for (let i = 0; i < numSw - 1; i++) {
      net[i][i + 1] = 1
      net[i + 1][i] = 1
    }
    net[0][numSw - 1] = 1
    net[numSw - 1][0] = 1
    let sw = 0
    for (let i = numSw; i < numNode; i++) {
      if (i >= numEs + numSw) {
        break
      }
      net[sw][i] = 1
      net[i][sw] = 1
      sw++
      sw = sw >= numSw ? 0 : sw
    }
    for (let i = 0; i < numSw; i++) {
      this.addNode(false, i.toString())
    }
    for (let i = numSw; i < numNode; i++) {
      this.addNode(true, i.toString())
    }
    for (let i = 0; i < numNode; i++) {
      for (let j = 0; j < numNode; j++) {
        if (net[i][j] == 1) {
          this.addLink(i.toString(), j.toString())
        }
      }
    }
  }

  generateTreeTopo(numSw: number, numEs: number) {
    const numNode = numSw + numEs
    const net: number[][] = new Array(numNode).fill([]).map(() => new Array(numNode).fill(0))
    for (let i = 0; i < (numSw - 1) / 2; i++) {
      net[i][i * 2 + 1] = 1
      net[i * 2 + 1][i] = 1
      if (i * 2 + 2 >= numSw) {
        break
      }
      net[i][i * 2 + 2] = 1
      net[i * 2 + 2][i] = 1
    }
    let sw = 0
    for (let i = numSw; i < numNode; i++) {
      if (i >= numEs + numSw) {
        break
      }
      net[sw][i] = 1
      net[i][sw] = 1
      sw++
      sw = sw >= numSw ? 0 : sw
    }
    for (let i = 0; i < numSw; i++) {
      this.addNode(false, i.toString())
    }
    for (let i = numSw; i < numNode; i++) {
      this.addNode(true, i.toString())
    }
    for (let i = 0; i < numNode; i++) {
      for (let j = 0; j < numNode; j++) {
        if (net[i][j] == 1) {
          this.addLink(i.toString(), j.toString())
        }
      }
    }
  }

  generateRandomTopo(numSw: number, numEs: number) {
    const numNode = numSw + numEs
    const net: number[][] = new Array(numNode).fill([]).map(() => new Array(numNode).fill(0))
    for (let i = 0; i < numSw * 2; i++) {
      const a = Math.floor(i / 2)
      const b = (Math.floor((Math.random() * numSw) / 4) + 1 + a) % numSw
      net[a][b] = 1
      net[b][a] = 1
    }
    let sw = 0
    for (let i = numSw; i < numNode; i++) {
      if (i >= numEs + numSw) {
        break
      }
      net[sw][i] = 1
      net[i][sw] = 1
      sw++
      sw = sw >= numSw ? 0 : sw
    }
    for (let i = 0; i < numSw; i++) {
      this.addNode(false, i.toString())
    }
    for (let i = numSw; i < numNode; i++) {
      this.addNode(true, i.toString())
    }
    for (let i = 0; i < numNode; i++) {
      for (let j = 0; j < numNode; j++) {
        if (net[i][j] == 1) {
          this.addLink(i.toString(), j.toString())
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
.box-card {
  margin: 10px;
  .box-card-main {
    flex: 1;
    min-height: 600px;
  }
}
.float-panel {
  position: absolute;
  display: flex;
  justify-content: center;
  transition: all 0.3s ease;
  top: 30px;
  left: 30px;
  width: 200px;
  border: solid var(--el-border-color) 1px;
  border-radius: 4px;
  background-color: var(--el-bg-color-overlay);
  z-index: 5;
  padding: 4px;
  &:hover {
    border: solid var(--el-color-primary-light-5) 1px;
    background-color: var(--el-color-primary-light-9);
  }
  .float-panel-header {
    width: 100%;
    display: flex;
    justify-content: space-around;
    font-size: 13px;
    border-bottom: solid var(--el-border-color) 1px;
    padding: 4px;
  }
  .float-panel-main {
    width: 100%;
    padding: 4px 0;
    padding-inline: 16px;
    flex-wrap: wrap;
    display: flex;
    justify-content: center;
  }
  .float-panel-footer {
    width: 100%;
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    border-top: solid var(--el-border-color) 1px;
    padding: 4px 16px;
  }
}
.go-diagram {
  width: 100%;
  height: 780px;
  border: solid var(--el-border-color) 1px;
  border-radius: 4px;
  background-color: #1f2332;
  position: relative;
}
.box-card {
  padding: 10px;
  .button-group {
    * {
      width: 100%;
    }
    margin-bottom: 4px;
  }
  :deep(.el-row > .el-button) {
    flex: 1;
    margin-bottom: 4px;
  }
  :deep(.el-row > .el-button-group) {
    display: flex;
  }
  :deep(.el-row > .el-textarea) {
    margin-bottom: 4px;
    font-size: 12px;
  }
  :deep(.el-row > .el-select) {
    flex: 1;
    margin-bottom: 4px;
  }
}

.card-small {
  .card-header-small {
    margin: -12px;
  }
  :deep(.el-card__body) {
    padding-top: 0;
  }
}

.switch-box {
  width: 100%;
  transition: all 0.3s ease;
  border: solid var(--el-border-color) 1px;
  border-radius: 4px;
  background-color: var(--el-bg-color);
  margin-bottom: 4px;
  padding: 4px;
  &:hover {
    border: solid var(--el-color-primary-light-5) 1px;
    background-color: var(--el-color-primary-light-9);
  }
  .switch-box-header {
    display: flex;
    justify-content: space-around;
    font-size: 12px;
    border-bottom: solid var(--el-border-color) 1px;
    padding: 4px;
  }
  .switch-box-main {
    padding: 4px 0 0 2px;
    padding-inline: 16px;
    flex-wrap: wrap;
    display: flex;
    justify-content: center;
  }
}

.selection-display-box {
  width: 100%;
  flex: 1;
  transition: all 0.3s ease;
  border: solid var(--el-border-color) 1px;
  border-radius: 4px;
  background-color: var(--el-bg-color);
  margin-top: 4px;
  padding: 4px;
  &:hover {
    border: solid var(--el-color-primary-light-5) 1px;
  }
  .selection-display-box-header {
    display: flex;
    justify-content: space-around;
    font-size: 12px;
    border-bottom: solid var(--el-border-color) 1px;
    padding: 4px;
  }
  .selection-display-box-main {
    font-size: 16px;
    padding: 2px;
    display: flex;
    justify-content: center;
  }
  .selection-display-box-footer {
    display: flex;
    justify-content: space-around;
    font-size: 12px;
    border-top: solid var(--el-border-color) 1px;
    padding: 4px;
  }
  .selection-display-icon-text-container {
    display: flex;
    justify-content: space-around;
  }
}

.statistic-card {
  flex: 1;
  margin-bottom: 4px;
  padding: 12px;
  border-radius: 4px;
  border: solid var(--el-border-color) 1px;
  background-color: var(--el-bg-color-overlay);
  &:hover {
    border: solid var(--el-color-primary-light-5) 1px;
  }
  .statistic-card-header {
    display: flex;
    justify-content: space-around;
    font-size: 12px;
    border-bottom: solid var(--el-border-color) 1px;
    padding: 0 4px 8px 4px;
  }
  .statistic-card-main {
    margin: 4px;
    .el-statistic {
      display: flex;
      justify-content: space-between;
      --el-statistic-content-font-size: 15px;
      :deep(.el-statistic__head) {
        margin: 2px;
      }
    }
    .el-statistic-title {
      display: inline-flex;
      align-items: center;
      font-size: 12px;
    }
    .statistic-card-main-sub {
      margin-left: 16px;
      .el-statistic {
        display: flex;
        justify-content: space-between;
        --el-statistic-content-font-size: 12px;
        :deep(.el-statistic__head) {
          margin: 0;
        }
      }
      .el-statistic-title {
        display: inline-flex;
        align-items: center;
        font-size: 11px;
      }
    }
  }
  .statistic-card-footer {
    display: flex;
    justify-content: space-around;
    font-size: 12px;
    border-top: solid var(--el-border-color) 1px;
    padding: 8px 4px 0 4px;
  }
}

.main-submit-button {
  background-image: linear-gradient(144deg, #af40ff, #5b42f3 50%, #00ddeb);
  border: 0;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  flex: 1;
  padding: 1px;
  :deep(> *) {
    width: 100%;
    height: 100%;
  }
  &:active {
    background-image: linear-gradient(144deg, #c883fa, #8876fa 50%, #3feef4);
  }
  span {
    background-color: rgb(32, 32, 43);
    padding: 6px 6px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    width: 100%;
    height: 100%;
    transition: 300ms;
    font-size: 14px;
  }
  &:hover {
    span {
      background: none;
    }
  }
}
</style>
