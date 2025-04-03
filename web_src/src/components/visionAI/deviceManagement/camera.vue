<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Search, Plus, Edit, Delete, Setting, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface TreeNode {
  label: string;
  children?: TreeNode[];
  status?: 'online' | 'offline';
}

// 设备树数据
const deviceTree = ref<TreeNode[]>([
  {
    label: '电力行业',
    children: [
      { label: '监控设备1', status: 'online' },
      { label: '监控设备2', status: 'offline' }
    ]
  },
  {
    label: '油气行业',
    children: [
      { label: '摄像头01', status: 'online' },
      { label: '消防设备', status: 'offline' }
    ]
  }
])

// 搜索关键词
const searchKeyword = ref('')

// 设备列表数据
const deviceList = ref([
  {
    id: '1',
    name: '监控设备1',
    status: 'online',
    location: '中心节点',
    skill: '安全帽检测 v2',
    createTime: '2024-03-20'
  },
  {
    id: '2',
    name: '摄像头01',
    status: 'online',
    location: '中心节点',
    skill: '工服检测 v1',
    createTime: '2024-03-19'
  },
  {
    id: '3',
    name: '消防设备',
    status: 'offline',
    location: '中心节点',
    skill: '未穿工服检测',
    createTime: '2024-03-18'
  },
  {
    id: '4',
    name: '监控设备2',
    status: 'offline',
    location: '中心节点',
    skill: '安全帽检测 v2, 工服检测 v1',
    createTime: '2024-03-17'
  },
  {
    id: '5',
    name: '车牌识别东',
    status: 'online',
    location: '中心节点',
    skill: '车牌识别 v6',
    createTime: '2024-03-16'
  },
  {
    id: '6',
    name: '沪宁高速监控',
    status: 'online',
    location: '中心节点',
    skill: '雨天人车检测 v1',
    createTime: '2024-03-15'
  },
  {
    id: '7',
    name: '水位监测',
    status: 'offline',
    location: '中心节点',
    skill: '水位监测 v1',
    createTime: '2024-03-14'
  },
  {
    id: '8',
    name: '护边检测',
    status: 'online',
    location: '中心节点',
    skill: 'ks_xuangan_detect_851_v1_0',
    createTime: '2024-03-13'
  }
])

// 添加设备对话框
const dialogVisible = ref(false)
const deviceForm = ref({
  name: '',
  type: '',
  location: '',
  skills: []
})

// 处理添加设备
const handleAddDevice = () => {
  dialogVisible.value = true
}

// 新增：选中的设备列表
const selectedDevices = ref<string[]>([])

// 新增：表格选择变化处理
const handleSelectionChange = (selection: any[]) => {
  selectedDevices.value = selection.map(item => item.id)
}

// 新增：批量删除处理
const handleBatchDelete = () => {
  if (selectedDevices.value.length === 0) {
    ElMessage.warning('请选择要删除的设备')
    return
  }
  
  ElMessageBox.confirm(
    `确认删除选中的 ${selectedDevices.value.length} 个设备吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 从设备列表中移除选中的设备
    deviceList.value = deviceList.value.filter(
      device => !selectedDevices.value.includes(device.id)
    )
    selectedDevices.value = []
    ElMessage.success('删除成功')
  }).catch(() => {
    // 用户点击取消，不做操作
  })
}

// 确认添加设备
const confirmAddDevice = () => {
  // TODO: 处理设备添加逻辑
  dialogVisible.value = false
}

// 添加分页相关的响应式数据
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(deviceList.value.length)

// 处理页码改变
const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

// 处理每页条数改变
const handleSizeChange = (val: number) => {
  pageSize.value = val
}

// 原始设备列表数据（用于搜索和刷新）
const originalDeviceList = ref([...deviceList.value])

// 搜索功能实现
watch(searchKeyword, (newValue) => {
  if (!newValue) {
    // 如果搜索关键词为空，恢复原始数据
    deviceList.value = [...originalDeviceList.value]
  } else {
    // 根据关键词过滤设备列表
    deviceList.value = originalDeviceList.value.filter(device => 
      device.name.toLowerCase().includes(newValue.toLowerCase()) ||
      device.skill.toLowerCase().includes(newValue.toLowerCase()) ||
      device.location.toLowerCase().includes(newValue.toLowerCase())
    )
  }
})

// 刷新功能实现
const handleRefresh = () => {
  // 恢复原始数据
  deviceList.value = [...originalDeviceList.value]
  // 清空搜索关键词
  searchKeyword.value = ''
  // 重置分页
  currentPage.value = 1
  ElMessage.success('刷新成功')
}

// 处理编辑设备
const handleEdit = (row: any) => {
  // 打开编辑对话框，并填充当前设备数据
  deviceForm.value = {
    name: row.name,
    type: row.type || '',
    location: row.location,
    skills: row.skill ? row.skill.split(',').map((s: string) => s.trim()) : []
  }
  dialogVisible.value = true
}

// 配置技能对话框
const skillDialogVisible = ref(false)
const skillForm = ref({
  selectedSkill: '未佩戴安全帽 (v7)',
  alarmLevel: '四级预警',
  isEnabled: true,
  timeRanges: [{
    start: '00:00',
    end: '23:59'
  }],
  frequency: {
    seconds: 1,
    frames: 1
  },
  images: [] as string[]
})

// 可选技能列表
const skillOptions = [
  { label: '未佩戴安全帽 (v7)', value: '未佩戴安全帽 (v7)' },
  { label: '管道泄漏 (v2)', value: '管道泄漏 (v2)' },
  { label: '烟雾识别 (v6)', value: '烟雾识别 (v6)' },
  { label: '明火识别 (v3)', value: '明火识别 (v3)' },
  { label: '人员摔倒 (v1)', value: '人员摔倒 (v1)' },
  { label: '人员聚集 (v1)', value: '人员聚集 (v1)' },
  { label: '人员离岗 (v2)', value: '人员离岗 (v2)' },
  { label: '未穿工服 (v3)', value: '未穿工服 (v3)' }
]

// 预警等级选项
const alarmLevels = [
  { label: '四级预警', value: '四级预警' },
  { label: '三级预警', value: '三级预警' },
  { label: '二级预警', value: '二级预警' },
  { label: '一级预警', value: '一级预警' }
]

// 处理配置技能
const handleConfigSkill = (row: any) => {
  skillDialogVisible.value = true
}

// 添加时间段
const addTimeRange = () => {
  if (skillForm.value.timeRanges.length < 3) {
    skillForm.value.timeRanges.push({
      start: '00:00',
      end: '23:59'
    })
  }
}

// 删除时间段
const removeTimeRange = (index: number) => {
  skillForm.value.timeRanges.splice(index, 1)
}

// 保存配置
const saveSkillConfig = () => {
  // TODO: 保存配置到后端
  ElMessage.success('保存成功')
  skillDialogVisible.value = false
}

// 处理删除单个设备
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确认删除设备 ${row.name} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    deviceList.value = deviceList.value.filter(device => device.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {
    // 用户点击取消，不做操作
  })
}
</script>

<template>
  <div class="camera-management">
    <!-- 左侧设备树 -->
    <div class="device-tree">
      <h3 class="tree-title">设备目录</h3>
      <el-input
        v-model="searchKeyword"
        placeholder="输入关键字搜索"
        prefix-icon="Search"
      />
      <el-tree
        :data="deviceTree"
        :props="{ children: 'children', label: 'label' }"
        default-expand-all
      >
        <template #default="{ node }">
          <span class="custom-tree-node">
            <span>{{ node.label }}</span>
            <el-tag
              v-if="node.data.status"
              :type="node.data.status === 'online' ? 'success' : 'danger'"
              size="small"
            >
              {{ node.data.status === 'online' ? '在线' : '离线' }}
            </el-tag>
          </span>
        </template>
      </el-tree>
    </div>

    <!-- 右侧设备列表 -->
    <div class="device-list">
      <div class="operation-bar">
        <div class="left-operations">
          <el-button type="primary" @click="handleAddDevice">
            <el-icon><Plus /></el-icon>添加摄像头
          </el-button>
          <el-button type="danger" @click="handleBatchDelete" :disabled="selectedDevices.length === 0">
            <el-icon><Delete /></el-icon>批量删除
          </el-button>
        </div>
        <div class="right-operations">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入设备名称搜索"
            style="width: 200px"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button 
            type="primary" 
            :icon="Refresh" 
            circle 
            @click="handleRefresh"
          />
        </div>
      </div>

      <el-table 
        :data="deviceList" 
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="name" label="摄像头名称" align="center" />
        <el-table-column prop="status" label="状态" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'online' ? 'success' : 'danger'">
              {{ row.status === 'online' ? '在线' : '离线' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="设备来源" align="center" />
        <el-table-column prop="skill" label="视频技能" align="center" />
        <el-table-column label="操作" width="280" align="center">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" size="small" :icon="Setting" @click="handleConfigSkill(row)">配置技能</el-button>
              <el-button type="primary" size="small" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" size="small" :icon="Delete" @click="handleDelete(row)">删除</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 添加设备对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="添加摄像头"
      width="500px"
    >
      <el-form :model="deviceForm" label-width="100px">
        <el-form-item label="设备名称">
          <el-input v-model="deviceForm.name" />
        </el-form-item>
        <el-form-item label="设备类型">
          <el-select v-model="deviceForm.type" placeholder="请选择设备类型">
            <el-option label="监控摄像头" value="camera" />
            <el-option label="AI摄像头" value="ai-camera" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联地点">
          <el-input v-model="deviceForm.location" />
        </el-form-item>
        <el-form-item label="设备技能">
          <el-select
            v-model="deviceForm.skills"
            multiple
            placeholder="请选择设备技能"
          >
            <el-option label="未带安全帽检测" value="helmet" />
            <el-option label="未穿工服检测" value="uniform" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAddDevice">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 配置技能对话框 -->
    <el-dialog
      v-model="skillDialogVisible"
      title="配置技能"
      width="650px"
    >
      <el-form :model="skillForm" label-width="100px">
        <el-form-item label="选择技能" required>
          <el-select v-model="skillForm.selectedSkill" placeholder="请选择技能">
            <el-option
              v-for="option in skillOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="预警等级" required>
          <el-select v-model="skillForm.alarmLevel" placeholder="请选择预警等级">
            <el-option
              v-for="level in alarmLevels"
              :key="level.value"
              :label="level.label"
              :value="level.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="技能状态" required>
          <el-switch v-model="skillForm.isEnabled" />
        </el-form-item>

        <el-form-item label="运行时段" required>
          <div v-for="(range, index) in skillForm.timeRanges" :key="index" class="time-range">
            <el-time-picker
              v-model="range.start"
              format="HH:mm"
              placeholder="开始时间"
            />
            <span class="range-separator">-</span>
            <el-time-picker
              v-model="range.end"
              format="HH:mm"
              placeholder="结束时间"
            />
            <el-button 
              v-if="index > 0"
              type="danger" 
              circle 
              size="small"
              @click="removeTimeRange(index)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
          <el-button 
            v-if="skillForm.timeRanges.length < 3"
            type="primary" 
            link 
            @click="addTimeRange"
          >
            + 添加时间 ({{ skillForm.timeRanges.length }}/3)
          </el-button>
        </el-form-item>

        <el-form-item label="抽帧频率" required>
          <div class="frequency-input">
            <span>每</span>
            <el-input-number 
              v-model="skillForm.frequency.seconds" 
              :min="1" 
              controls-position="right"
            />
            <span>秒</span>
            <span class="frequency-separator">抽取</span>
            <el-input-number 
              v-model="skillForm.frequency.frames" 
              :min="1" 
              controls-position="right"
            />
            <span>帧</span>
          </div>
          <div class="frequency-hint">支持设置多秒1帧1秒多帧，不支持多秒多帧设置</div>
        </el-form-item>

        <el-form-item label="电子围栏">
          <div class="fence-upload">
            <span>{{ skillForm.images.length }}/1</span>
            <el-button type="primary">去添加</el-button>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="skillDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveSkillConfig">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.camera-management {
  display: flex;
  height: 100%;  // 确保整个容器占满高度
  
  .device-tree {
    width: 250px;
    padding: 20px;
    border-right: 1px solid #dcdfe6;
    height: 100vh;  // 让分界线占满整个视窗高度
    box-sizing: border-box;  // 确保padding不会增加总宽度
    
    .tree-title {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 500;
    }
    
    .el-input {
      margin-bottom: 20px;
    }
  }

  .device-list {
    flex: 1;
    padding: 20px;

    .operation-bar {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;

      .left-operations {
        display: flex;
        gap: 10px;
      }

      .right-operations {
        display: flex;
        gap: 10px;
        align-items: center;
      }
    }
  }

  .custom-tree-node {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}

.time-range {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  
  .el-time-picker {
    width: 150px;
  }
}

.range-separator {
  margin: 0 8px;
  color: #606266;
}

.frequency-input {
  display: flex;
  align-items: center;
  gap: 10px;

  .el-input-number {
    width: 100px;
  }
}

.frequency-hint {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}

.fence-upload {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
