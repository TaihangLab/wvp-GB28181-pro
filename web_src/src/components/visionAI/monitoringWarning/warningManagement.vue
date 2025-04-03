<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import type { WarningItem } from '@/types/warning'
import { ElMessage } from 'element-plus'

// 定义搜索条件
const searchForm = ref({
  deviceName: '',
  startDate: '',
  endDate: '',
  status: '',
  warningType: '',
  warningLevel: ''
})

// 左侧目录数据
const directories = ref([
  {
    id: '1',
    name: '油气行业',
    selected: true
  },
  // 可以添加更多目录
])

// 预警列表数据
const warningList = ref<WarningItem[]>([
  {
    id: '1',
    deviceName: 'CH4 超上限预警',
    imageUrl: '/src/assets/warning-icon.png',
    value: 1.30,
    unit: '%LEL',
    level: '一级预警',
    time: '2022-12-20 17:02:58',
    status: 'pending',
    deviceInfo: {
      name: '可燃气体',
      position: '0.1 米'
    }
  },
  {
    id: '2',
    deviceName: 'CO 浓度预警',
    imageUrl: '/src/assets/warning-icon.png',
    value: 75,
    unit: 'ppm',
    level: '二级预警',
    time: '2022-12-20 17:01:58',
    status: 'processing',
    deviceInfo: {
      name: '一氧化碳',
      position: '1.5 米'
    }
  },
  {
    id: '3',
    deviceName: 'H2S 浓度预警',
    imageUrl: '/src/assets/warning-icon.png',
    value: 10,
    unit: 'ppm',
    level: '三级预警',
    time: '2022-12-20 16:58:32',
    status: 'pending',
    deviceInfo: {
      name: '硫化氢',
      position: '2.0 米'
    }
  },
  {
    id: '4',
    deviceName: '火焰探测器预警',
    imageUrl: '/src/assets/warning-icon.png',
    value: 85,
    unit: '%',
    level: '一级预警',
    time: '2022-12-20 16:55:12',
    status: 'pending',
    deviceInfo: {
      name: '火焰探测器',
      position: '管道区域'
    }
  },
  {
    id: '5',
    deviceName: '温度超限预警',
    imageUrl: '/src/assets/warning-icon.png',
    value: 85,
    unit: '°C',
    level: '二级预警',
    time: '2022-12-20 16:50:22',
    status: 'processing',
    deviceInfo: {
      name: '温度传感器',
      position: '储罐区'
    }
  },
  {
    id: '6',
    deviceName: '压力超限预警',
    imageUrl: '/src/assets/warning-icon.png',
    value: 2.5,
    unit: 'MPa',
    level: '一级预警',
    time: '2022-12-20 16:45:18',
    status: 'pending',
    deviceInfo: {
      name: '压力传感器',
      position: '管道接口'
    }
  }
])

// 表格加载状态
const loading = ref(false)

// 选中的预警项
const selectedWarnings = ref<string[]>([])

// 预警等级配置
const warningLevelConfig = {
  '一级预警': { color: '#F56C6C', bg: '#FEF0F0' },
  '二级预警': { color: '#E6A23C', bg: '#FDF6EC' },
  '三级预警': { color: '#409EFF', bg: '#ECF5FF' }
}

// 筛选类型
const filterType = ref('all')

// 根据筛选条件过滤的预警列表
const filteredWarningList = computed(() => {
  let list = [...warningList.value]
  
  if (filterType.value === 'pending') {
    return list.filter(item => item.status === 'pending')
  }
  
  return list
})

// 获取预警列表
const getWarningList = async () => {
  loading.value = true
  try {
    // TODO: 调用API获取数据
    // warningList.value = await getWarningListAPI(searchForm.value)
  } finally {
    loading.value = false
  }
}

// 处理预警事件
const handleWarning = async (id: string, action: 'process' | 'complete' | 'report') => {
  try {
    // TODO: 调用对应的处理API
    await getWarningList()
  } catch (error) {
    console.error('处理失败:', error)
  }
}

// 全选/取消全选
const handleSelectAll = () => {
  if (selectedWarnings.value.length === warningList.value.length) {
    selectedWarnings.value = []
  } else {
    selectedWarnings.value = warningList.value.map(item => item.id)
  }
}

// 选择当前页
const handleSelectPage = () => {
  selectedWarnings.value = warningList.value
    .slice(0, 12) // 假设每页12条
    .map(item => item.id)
}

// 批量处理
const handleBatchProcess = async () => {
  if (selectedWarnings.value.length === 0) {
    ElMessage.warning('请先选择预警项')
    return
  }
  
  try {
    // TODO: 调用批量处理API
    await Promise.all(
      selectedWarnings.value.map(id => handleWarning(id, 'process'))
    )
    ElMessage.success('批量处理成功')
    selectedWarnings.value = []
    await getWarningList()
  } catch (error) {
    ElMessage.error('批量处理失败')
  }
}

// 导出数据
const exportData = () => {
  const data = selectedWarnings.value.length > 0
    ? warningList.value.filter(item => selectedWarnings.value.includes(item.id))
    : warningList.value

  // 构建CSV数据
  const csvContent = [
    ['设备名称', '预警值', '单位', '预警等级', '时间', '状态'].join(','),
    ...data.map(item => [
      item.deviceName,
      item.value,
      item.unit,
      item.level,
      item.time,
      item.status
    ].join(','))
  ].join('\n')

  // 创建下载链接
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `预警数据_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

const resetForm = () => {
  searchForm.value = {
    deviceName: '',
    startDate: '',
    endDate: '',
    status: '',
    warningType: '',
    warningLevel: ''
  }
}

const dateRange = ref([])

// 监听日期变化
watch(dateRange, (newVal) => {
  if (newVal) {
    searchForm.value.startDate = newVal[0]
    searchForm.value.endDate = newVal[1]
  }
})

// 选择预警项
const toggleSelect = (id: string) => {
  const index = selectedWarnings.value.indexOf(id)
  if (index === -1) {
    selectedWarnings.value.push(id)
  } else {
    selectedWarnings.value.splice(index, 1)
  }
}

// 添加目录搜索变量
const searchDirectory = ref('')

onMounted(() => {
  getWarningList()
})
</script>

<template>
  <div class="warning-management-container">
    <!-- 左侧目录 -->
    <div class="directory-sidebar">
      <div class="search-box">
        <el-input
          v-model="searchDirectory"
          placeholder="输入组织名称搜索"
          prefix-icon="Search"
        />
      </div>
      <div class="directory-list">
        <div
          v-for="dir in directories"
          :key="dir.id"
          :class="['directory-item', { active: dir.selected }]"
        >
          {{ dir.name }}
        </div>
      </div>
    </div>

    <!-- 右侧内容区 -->
    <div class="content-area">
      <!-- 搜索区域 -->
      <div class="search-area">
        <div class="search-row">
          <el-form :model="searchForm" inline>
            <el-form-item>
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              />
            </el-form-item>
            <el-form-item>
              <el-select v-model="searchForm.status" placeholder="特处理">
                <el-option label="待处理" value="pending" />
                <el-option label="处理中" value="processing" />
                <el-option label="已完成" value="completed" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select v-model="searchForm.warningType" placeholder="全部预警类型">
                <el-option label="全部" value="" />
                <el-option label="超限预警" value="overflow" />
                <!-- 添加更多选项 -->
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select v-model="searchForm.warningLevel" placeholder="全部预警等级">
                <el-option label="全部" value="" />
                <el-option label="二级预警" value="level2" />
                <!-- 添加更多选项 -->
              </el-select>
            </el-form-item>
          </el-form>
        </div>
        <div class="filter-tabs">
          <el-radio-group v-model="filterType">
            <el-radio-button label="all" @click="handleSelectAll">全选</el-radio-button>
            <el-radio-button label="selected" @click="handleSelectPage">选择本页</el-radio-button>
            <el-radio-button label="batch" @click="handleBatchProcess">批量处理</el-radio-button>
            <el-radio-button label="pending">仅查看预警中事件</el-radio-button>
          </el-radio-group>
          
          <div class="operation-buttons">
            <el-button type="primary" @click="exportData">
              <el-icon><Download /></el-icon>导出数据
            </el-button>
            <el-button @click="getWarningList">
              <el-icon><Refresh /></el-icon>刷新
            </el-button>
          </div>
        </div>
      </div>

      <!-- 预警列表 -->
      <div class="warning-list">
        <el-row :gutter="20">
          <el-col v-for="item in filteredWarningList" :key="item.id" :span="6">
            <el-card 
              class="warning-card"
              :class="{ selected: selectedWarnings.includes(item.id) }"
              @click="toggleSelect(item.id)"
            >
              <div class="warning-image">
                <el-image 
                  :src="item.imageUrl" 
                  fit="cover"
                  :fallback="'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><rect width=\'100\' height=\'100\' fill=\'%23409EFF\' opacity=\'0.2\'/></svg>'"
                >
                  <template #error>
                    <div class="image-error">
                      <el-icon><Warning /></el-icon>
                      <span>加载失败</span>
                    </div>
                  </template>
                </el-image>
                <div class="warning-value">{{ item.value }} {{ item.unit }}</div>
              </div>
              <div class="warning-info">
                <div class="device-name">{{ item.deviceName }}</div>
                <div class="device-info">
                  <div class="info-item">设备名称：{{ item.deviceInfo.name }}</div>
                  <div class="info-item">预警位置：{{ item.deviceInfo.position }}</div>
                </div>
                <div 
                  class="warning-level"
                  :style="{
                    color: warningLevelConfig[item.level].color,
                    backgroundColor: warningLevelConfig[item.level].bg
                  }"
                >
                  预警等级：{{ item.level }}
                </div>
                <div class="warning-time">{{ item.time }}</div>
                <div class="warning-actions">
                  <el-button 
                    v-if="item.status === 'pending'"
                    type="primary"
                    size="small" 
                    @click.stop="handleWarning(item.id, 'process')"
                  >处理</el-button>
                  <el-button 
                    v-if="item.status === 'processing'"
                    type="success"
                    size="small" 
                    @click.stop="handleWarning(item.id, 'complete')"
                  >完结</el-button>
                  <el-button 
                    type="warning"
                    size="small" 
                    @click.stop="handleWarning(item.id, 'report')"
                  >上报</el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.warning-management-container {
  display: flex;
  height: 100vh;
  background: #f5f7fa;

  .directory-sidebar {
    width: 200px;
    background: #fff;
    border-right: 1px solid #e6e6e6;
    padding: 20px 0;

    .search-box {
      padding: 0 16px 20px;
    }

    .directory-list {
      .directory-item {
        padding: 12px 16px;
        cursor: pointer;

        &:hover {
          background: #f5f7fa;
        }

        &.active {
          background: #ecf5ff;
          color: #409eff;
        }
      }
    }
  }

  .content-area {
    flex: 1;
    padding: 20px;
    overflow-y: auto;

    .search-area {
      background: #fff;
      padding: 20px;
      border-radius: 4px;
      margin-bottom: 20px;

      .search-row {
        margin-bottom: 16px;
      }

      .filter-tabs {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .operation-buttons {
          display: flex;
          gap: 8px;
        }
      }
    }
  }

  .warning-list {
    .el-col {
      margin-bottom: 20px;
    }

    .warning-card {
      height: 420px; // 固定卡片高度
      cursor: pointer;
      transition: all 0.3s;
      
      &.selected {
        border-color: #409EFF;
        box-shadow: 0 0 8px rgba(64, 158, 255, 0.2);
      }

      .warning-image {
        position: relative;
        height: 200px; // 固定图片区域高度
        background: #f5f7fa;
        border-radius: 4px;
        overflow: hidden;

        .el-image {
          width: 100%;
          height: 100%;
        }

        .image-error {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: #409EFF;
          background: rgba(64, 158, 255, 0.1);
          
          .el-icon {
            font-size: 24px;
            margin-bottom: 8px;
          }
        }

        .warning-value {
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: rgba(0, 0, 0, 0.6);
          color: #fff;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 14px;
        }
      }

      .warning-info {
        padding: 16px;

        .device-name {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .device-info {
          margin-bottom: 12px;
          
          .info-item {
            font-size: 14px;
            color: #606266;
            margin-bottom: 8px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        .warning-level {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          margin-bottom: 8px;
        }

        .warning-time {
          font-size: 12px;
          color: #909399;
          margin-bottom: 12px;
        }

        .warning-actions {
          display: flex;
          gap: 8px;
          
          .el-button {
            flex: 1;
          }
        }
      }
    }
  }
}
</style>