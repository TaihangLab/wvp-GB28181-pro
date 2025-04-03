<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 接口定义
interface WarningArchive {
  id: number
  name: string
  image: string
  deviceName: string
  warningTime: string
  warningLevel: string
}

interface ArchiveInfo {
  name: string
  location: string
  timeRange: string
  createTime: string
  description: string
  image?: string
}

// 预警等级枚举
const WARNING_LEVELS = {
  HIGH: { label: '高危预警', value: 'high', color: '#ff4d4f' },
  MEDIUM: { label: '中度预警', value: 'medium', color: '#faad14' },
  LOW: { label: '低危预警', value: 'low', color: '#52c41a' }
} as const

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 档案基本信息
const archiveInfo = ref<ArchiveInfo>({
  name: '厂区A10车间预警档案',
  location: '厂区A10车间',
  timeRange: '2023-01-01 00:00:00-2023-06-30 23:59:59',
  createTime: '2023-06-05 15:49:04',
  description: '-',
  image: getPreviewImage()
})

// 列表相关
const allArchiveList = ref<WarningArchive[]>([])
const archiveList = ref<WarningArchive[]>([])
const selectedRows = ref<number[]>([])
const selectAll = ref(false)

// 详情弹框
const detailDialogVisible = ref(false)
const currentDetail = ref<WarningArchive | null>(null)

// 编辑相关
const isEditing = ref(false)
const editingArchive = ref<ArchiveInfo | null>(null)

// 添加预警对话框
const showAddDialog = ref(false)
const newArchive = reactive({
  name: '',
  deviceName: '',
  warningLevel: '',
  description: ''
})

// 编辑档案表单
const editForm = reactive<ArchiveInfo>({
  name: '',
  location: '',
  timeRange: '',
  createTime: '',
  description: '',
  image: ''
})

// 添加预警表单
const addForm = reactive({
  name: '',
  deviceName: '',
  warningLevel: '',
  description: ''
})

// 对话框控制
const editDialogVisible = ref(false)
const addDialogVisible = ref(false)

// 获取预览图片URL
function getPreviewImage() {
  // 这里返回一个实际的图片URL，可以是本地资源或远程URL
  return '/src/assets/images/preview.jpg'
}

// 生成模拟数据
function generateMockData() {
  const data: WarningArchive[] = []
  const devices = [
    '固牛EWT05928机器前',
    '降盐水泵废水站',
    '东15风机',
    '齐心爱A20储产',
    'EF两区特检测区10社'
  ]
  
  for (let i = 1; i <= 100; i++) {
    const randomLevel = Math.floor(Math.random() * 3)
    const level = ['high', 'medium', 'low'][randomLevel]
    const deviceIndex = Math.floor(Math.random() * devices.length)
    
    const startTime = new Date(2023, 5, Math.floor(Math.random() * 30), 
                              Math.floor(Math.random() * 24), 
                              Math.floor(Math.random() * 60))
    const endTime = new Date(startTime.getTime() + Math.floor(Math.random() * 300000))
    
    data.push({
      id: i,
      name: ['烟火检测', '安全帽识别', '工服识别', '安全帽识别', '玻璃运输车打卡'][i % 5],
      image: getPreviewImage(),
      deviceName: devices[deviceIndex],
      warningTime: `${startTime.toLocaleString()}-${endTime.toLocaleString()}`,
      warningLevel: level
    })
  }
  return data
}

// 更新页面数据
function updatePageData() {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  archiveList.value = allArchiveList.value.slice(start, end)
  pagination.total = allArchiveList.value.length
}

// 页码改变
function handleCurrentChange(page: number) {
  pagination.currentPage = page
  updatePageData()
}

// 每页条数改变
function handleSizeChange(size: number) {
  pagination.pageSize = size
  pagination.currentPage = 1
  updatePageData()
}

// 表格选择事件
function handleSelectionChange(selection: WarningArchive[]) {
  selectedRows.value = selection.map(item => item.id)
  selectAll.value = selection.length === archiveList.value.length
}

// 查看详情
function showDetail(record: WarningArchive) {
  currentDetail.value = record
  detailDialogVisible.value = true
}

// 删除档案
async function deleteArchive(id: number) {
  try {
    await ElMessageBox.confirm('确定要删除该预警档案吗？', '提示', {
      type: 'warning'
    })
    allArchiveList.value = allArchiveList.value.filter(item => item.id !== id)
    updatePageData()
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}

// 批量删除
async function batchDelete() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的记录')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 条记录吗？`, 
      '批量删除', 
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    allArchiveList.value = allArchiveList.value.filter(
      item => !selectedRows.value.includes(item.id)
    )
    updatePageData()
    selectedRows.value = []
    selectAll.value = false
    ElMessage.success('批量删除成功')
  } catch {
    // 用户取消删除
  }
}

// 编辑档案信息
function handleEdit() {
  isEditing.value = true
  editingArchive.value = { ...archiveInfo.value }
}

// 保存编辑
function handleSave() {
  if (editingArchive.value) {
    archiveInfo.value = { ...editingArchive.value }
    isEditing.value = false
    ElMessage.success('保存成功')
  }
}

// 取消编辑
function handleCancel() {
  isEditing.value = false
  editingArchive.value = null
}

// 添加预警
function handleAdd() {
  addDialogVisible.value = true
}

// 确认添加预警
function confirmAdd() {
  if (!addForm.name || !addForm.deviceName || !addForm.warningLevel) {
    ElMessage.warning('请填写完整信息')
    return
  }

  const newId = Math.max(...allArchiveList.value.map(item => item.id), 0) + 1
  const newWarning: WarningArchive = {
    id: newId,
    name: addForm.name,
    image: getPreviewImage(),
    deviceName: addForm.deviceName,
    warningTime: new Date().toLocaleString(),
    warningLevel: addForm.warningLevel
  }

  allArchiveList.value.unshift(newWarning)
  updatePageData()
  addDialogVisible.value = false
  
  // 重置表单
  Object.assign(addForm, {
    name: '',
    deviceName: '',
    warningLevel: '',
    description: ''
  })
  
  ElMessage.success('添加成功')
}

// 初始化
onMounted(() => {
  allArchiveList.value = generateMockData()
  updatePageData()
})

// 初始化编辑表单
function initEditForm() {
  Object.assign(editForm, {
    name: archiveInfo.value.name,
    location: archiveInfo.value.location,
    timeRange: archiveInfo.value.timeRange,
    createTime: archiveInfo.value.createTime,
    description: archiveInfo.value.description,
    image: archiveInfo.value.image
  })
  editDialogVisible.value = true
}

// 保存编辑
function handleSaveEdit() {
  Object.assign(archiveInfo.value, editForm)
  editDialogVisible.value = false
  ElMessage.success('保存成功')
}
</script>

<template>
  <div class="warning-archives">
    <!-- 左侧列表区域 -->
    <div class="archives-list">
      <div class="list-header">
        <h2>预警档案</h2>
        <div class="header-buttons">
          <el-button 
            type="danger" 
            class="batch-delete" 
            @click="batchDelete" 
            :disabled="selectedRows.length === 0">
            批量删除
          </el-button>
          <el-button 
            type="primary" 
            class="add-btn" 
            @click="handleAdd">
            + 添加预警
          </el-button>
        </div>
      </div>
      
      <div class="list-content">
        <el-table 
          :data="archiveList" 
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="序号" width="80" align="center">
            <template #default="scope">
              {{ (pagination.currentPage - 1) * pagination.pageSize + scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column label="预警名称" prop="name" align="center" />
          <el-table-column label="预警图片" align="center">
            <template #default="scope">
              <div class="image-box">
                <span>预警图片</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="设备名称" prop="deviceName" align="center" />
          <el-table-column label="预警时间" prop="warningTime" align="center" />
          <el-table-column label="预警等级" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.warningLevel === 'high' ? 'danger' : 
                            scope.row.warningLevel === 'medium' ? 'warning' : 'success'">
                {{ WARNING_LEVELS[scope.row.warningLevel.toUpperCase()].label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="center">
            <template #default="scope">
              <el-button type="text" @click="showDetail(scope.row)">详情</el-button>
              <el-button type="text" class="delete-btn" @click="deleteArchive(scope.row.id)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </div>

    <!-- 右侧档案信息区域 -->
    <div class="archive-info">
      <div class="info-header">
        <h3>档案基本信息</h3>
        <el-button type="primary" link @click="initEditForm">编辑</el-button>
      </div>
      
      <div class="info-content">
        <div class="preview-image">
          <div class="image-box">
            <span>预览图片</span>
          </div>
        </div>
        
        <div class="info-items">
          <div class="info-item">
            <label>档案名称：</label>
            <span>{{ archiveInfo.name }}</span>
          </div>
          <div class="info-item">
            <label>相关位置：</label>
            <span>{{ archiveInfo.location }}</span>
          </div>
          <div class="info-item">
            <label>档案时间：</label>
            <span>{{ archiveInfo.timeRange }}</span>
          </div>
          <div class="info-item">
            <label>创建时间：</label>
            <span>{{ archiveInfo.createTime }}</span>
          </div>
          <div class="info-item">
            <label>档案描述：</label>
            <span>{{ archiveInfo.description }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情弹框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="预警详情"
      width="600px"
      destroy-on-close
    >
      <div class="warning-detail" v-if="currentDetail">
        <div class="detail-image">
          <div class="image-box">
            <span>预警图片</span>
          </div>
        </div>
        <div class="detail-info">
          <div class="detail-item">
            <label>预警名称：</label>
            <span>{{ currentDetail.name }}</span>
          </div>
          <div class="detail-item">
            <label>设备名称：</label>
            <span>{{ currentDetail.deviceName }}</span>
          </div>
          <div class="detail-item">
            <label>预警时间：</label>
            <span>{{ currentDetail.warningTime }}</span>
          </div>
          <div class="detail-item">
            <label>预警等级：</label>
            <el-tag :type="currentDetail.warningLevel === 'high' ? 'danger' : 
                          currentDetail.warningLevel === 'medium' ? 'warning' : 'success'">
              {{ WARNING_LEVELS[currentDetail.warningLevel.toUpperCase()].label }}
            </el-tag>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 编辑档案信息对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑档案信息"
      width="500px"
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="档案名称">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="相关位置">
          <el-input v-model="editForm.location" />
        </el-form-item>
        <el-form-item label="档案时间">
          <el-input v-model="editForm.timeRange" />
        </el-form-item>
        <el-form-item label="档案描述">
          <el-input
            type="textarea"
            v-model="editForm.description"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveEdit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加预警对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      title="添加预警"
      width="500px"
    >
      <el-form :model="addForm" label-width="100px">
        <el-form-item label="预警名称" required>
          <el-input v-model="addForm.name" />
        </el-form-item>
        <el-form-item label="设备名称" required>
          <el-input v-model="addForm.deviceName" />
        </el-form-item>
        <el-form-item label="预警等级" required>
          <el-select v-model="addForm.warningLevel" style="width: 100%">
            <el-option
              v-for="(level, key) in WARNING_LEVELS"
              :key="key"
              :label="level.label"
              :value="level.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            type="textarea"
            v-model="addForm.description"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAdd">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.warning-archives {
  display: flex;
  gap: 20px;
  padding: 20px;
  height: 100%;
  background: #f5f6fa;
  
  .archives-list {
    flex: 1;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
    
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #eee;
      
      h2 {
        margin: 0;
        flex-grow: 1;
        text-align: left;
      }
      
      .header-buttons {
        display: flex;
        gap: 12px;
      }
      
      .batch-delete {
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        color: white;
        background-color: #ff4d4f;
        cursor: pointer;
        transition: background-color 0.3s;
        
        &:hover {
          background-color: #e03e3e;
        }
      }
      
      .add-btn {
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        color: white;
        background-color: #409eff;
        cursor: pointer;
        transition: background-color 0.3s;
        
        &:hover {
          background-color: #66b1ff;
        }
      }
    }
    
    .list-content {
      .el-table {
        th {
          text-align: center;
        }
      }
      
      .image-box {
        width: 80px;
        height: 60px;
        background: #e6f7ff;
        border: 1px dashed #91d5ff;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #1890ff;
        font-size: 12px;
      }
    }
  }
  
  .archive-info {
    width: 380px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
    
    .info-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #eee;
      
      h3 {
        margin: 0;
        font-size: 16px;
        color: #1a1f3d;
      }
    }
    
    .info-content {
      padding: 24px;
      
      .preview-image {
        margin-bottom: 24px;
        
        .image-box {
          width: 100%;
          height: 200px;
          background: #e6f7ff;
          border: 1px dashed #91d5ff;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1890ff;
          font-size: 12px;
        }
      }
      
      .info-items {
        .info-item {
          margin-bottom: 16px;
          display: flex;
          
          label {
            width: 100px;
            color: #666;
            flex-shrink: 0;
          }
          
          span {
            color: #1a1f3d;
          }
        }
      }
    }
  }
}

.preview-box {
  width: 80px;
  height: 60px;
  background: #e6f7ff;
  border: 1px dashed #91d5ff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1890ff;
  font-size: 12px;
}

.delete-btn {
  color: #ff4d4f !important;
}

:deep(.el-table) {
  .el-table__header {
    background: #f5f6fa;
  }
  
  th {
    background: #f5f6fa !important;
    font-weight: 500;
    color: #1a1f3d;
  }
}

.pagination {
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
  
  :deep(.el-pagination) {
    justify-content: flex-end;
    
    .el-pagination__total {
      margin-right: 16px;
    }
    
    .el-pagination__sizes {
      margin-right: 16px;
    }
  }
}

.warning-detail {
  .detail-image {
    margin-bottom: 20px;
    
    .image-box {
      width: 100%;
      height: 300px;
      background: #e6f7ff;
      border: 1px dashed #91d5ff;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #1890ff;
      font-size: 12px;
    }
  }
  
  .detail-info {
    .detail-item {
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      
      label {
        width: 100px;
        color: #666;
        flex-shrink: 0;
      }
      
      span {
        color: #1a1f3d;
      }
    }
  }
}

.preview-image {
  img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 4px;
  }
}

.info-items {
  .info-item {
    margin-bottom: 16px;
    display: flex;
    
    label {
      width: 100px;
      color: #666;
      flex-shrink: 0;
    }
    
    span {
      color: #1a1f3d;
      flex: 1;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-dialog__body) {
  padding: 20px;
}
</style>