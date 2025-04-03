<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Search, Upload } from '@element-plus/icons-vue'

// 定义表格数据接口
interface ModelItem {
  id: string
  name: string
  status: 'using' | 'unused'
  version: number
  skill: string
}

// 分页参数
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 20  // 设置为实际数据总数
})

// 搜索和筛选条件
const searchForm = reactive({
  keyword: '',
  status: 'all'
})

// 表格数据初始化
const initTableData = () => {
  // 清除之前的数据（开发测试时使用）
  localStorage.removeItem('modelTableData')
  
  const savedData = localStorage.getItem('modelTableData')
  if (savedData) {
    const parsedData = JSON.parse(savedData)
    return parsedData.map((item: any) => ({
      ...item,
      status: item.status as 'using' | 'unused'
    })) as ModelItem[]
  }
  // 返回模拟数据
  return [
    {
      id: '4726e1c153624df9996e5779839...',
      name: '通道遮蔽检测',
      status: 'using' as const,
      version: 2,
      skill: '输电通道压板检测 (v1)'
    },
    {
      id: '14464624a0bd4a9e8d944e140f1...',
      name: '垃圾堆积分割模型',
      status: 'using' as const,
      version: 1,
      skill: 'laji_seg_851_v1_0_0_0518 (v1)'
    },
    {
      id: '292637b4d54f43006e06e3eb2a5...',
      name: '通道遮蔽检测',
      status: 'unused' as const,
      version: 1,
      skill: '-'
    },
    {
      id: '362a7ee57b244ec8bee55cc2fb1...',
      name: '烟火检测',
      status: 'using' as const,
      version: 1,
      skill: 'firesmoke_v3.0.5.1 (v1)'
    },
    {
      id: '20672fc4465e41fe80e656e43fb7...',
      name: '运输车检测模型',
      status: 'using' as const,
      version: 3,
      skill: 'anquandai_detect_851_v1_0_1_05...'
    },
    {
      id: 'df79ed383526140338b209327b7...',
      name: '安全带检测模型',
      status: 'using' as const,
      version: 2,
      skill: 'belt_detect_v2.0.1'
    },
    {
      id: 'e882a770482a4ef89d944e140f1...',
      name: '人员聚集检测',
      status: 'unused' as const,
      version: 1,
      skill: 'crowd_detect_v1.2.0'
    },
    {
      id: 'f992637b4d54f43006e06e3eb2a...',
      name: '安全帽检测',
      status: 'using' as const,
      version: 2,
      skill: 'helmet_detect_v2.1.0'
    },
    {
      id: 'a462a7ee57b244ec8bee55cc2fb...',
      name: '车辆识别模型',
      status: 'using' as const,
      version: 3,
      skill: 'vehicle_recognition_v3.0.1'
    },
    {
      id: 'b20672fc4465e41fe80e656e43f...',
      name: '人脸识别模型',
      status: 'unused' as const,
      version: 1,
      skill: 'face_recognition_v1.0.0'
    },
    {
      id: 'c4726e1c153624df9996e577983...',
      name: '行为分析模型',
      status: 'using' as const,
      version: 2,
      skill: 'behavior_analysis_v2.1.0'
    },
    {
      id: 'd14464624a0bd4a9e8d944e140f...',
      name: '物品遗留检测',
      status: 'using' as const,
      version: 1,
      skill: 'object_abandon_v1.0.5'
    },
    {
      id: 'e292637b4d54f43006e06e3eb2a...',
      name: '越界检测模型',
      status: 'unused' as const,
      version: 1,
      skill: 'boundary_cross_v1.1.0'
    },
    {
      id: 'f362a7ee57b244ec8bee55cc2fb...',
      name: '烟雾检测模型',
      status: 'using' as const,
      version: 2,
      skill: 'smoke_detect_v2.0.3'
    },
    {
      id: 'g20672fc4465e41fe80e656e43f...',
      name: '车牌识别模型',
      status: 'using' as const,
      version: 3,
      skill: 'plate_recognition_v3.1.0'
    },
    {
      id: 'h4726e1c153624df9996e577983...',
      name: '姿态估计模型',
      status: 'unused' as const,
      version: 1,
      skill: 'pose_estimation_v1.0.2'
    },
    {
      id: 'i14464624a0bd4a9e8d944e140f...',
      name: '目标跟踪模型',
      status: 'using' as const,
      version: 2,
      skill: 'object_tracking_v2.1.1'
    },
    {
      id: 'j292637b4d54f43006e06e3eb2a...',
      name: '场景分类模型',
      status: 'using' as const,
      version: 1,
      skill: 'scene_classification_v1.0.0'
    },
    {
      id: 'k362a7ee57b244ec8bee55cc2fb...',
      name: '人群密度检测',
      status: 'unused' as const,
      version: 1,
      skill: 'crowd_density_v1.2.1'
    },
    {
      id: 'l20672fc4465e41fe80e656e43f...',
      name: '手势识别模型',
      status: 'using' as const,
      version: 2,
      skill: 'gesture_recognition_v2.0.0'
    }
  ]
}

// 表格数据
const tableData = ref<ModelItem[]>(initTableData())

// 保存数据到本地存储
const saveTableData = (data: ModelItem[]) => {
  localStorage.setItem('modelTableData', JSON.stringify(data))
}

const multipleSelection = ref<ModelItem[]>([])

// 表格加载状态
const loading = ref(false)

// 导入模型对话框
const importDialogVisible = ref(false)
const importForm = reactive({
  name: '',
  file: null as File | null,
  version: 1,
  skill: ''
})

// 编辑模型对话框
const editDialogVisible = ref(false)
const editForm = reactive({
  id: '',
  name: '',
  version: 1,
  skill: ''
})

// 处理表格选择
const handleSelectionChange = (val: ModelItem[]) => {
  multipleSelection.value = val
}

// 处理删除操作
const handleDelete = async (row: ModelItem) => {
  if (row.status === 'using') {
    ElMessage.warning('使用中的模型不能删除')
    return
  }

  try {
    await ElMessageBox.confirm('确认删除该模型吗？此操作不可恢复', '警告', {
      type: 'warning',
      confirmButtonText: '确认',
      cancelButtonText: '取消'
    })
    
    loading.value = true
    // TODO: 调用删除API
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 从表格数据中移除并保存
    const newData = tableData.value.filter(item => item.id !== row.id)
    tableData.value = newData
    saveTableData(newData)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  } finally {
    loading.value = false
  }
}

// 处理批量删除
const handleBatchDelete = async () => {
  const selectedItems = multipleSelection.value
  if (selectedItems.length === 0) {
    ElMessage.warning('请选择要删除的模型')
    return
  }

  // 检查是否包含使用中的模型
  const usingModels = selectedItems.filter(item => item.status === 'using')
  if (usingModels.length > 0) {
    ElMessage.warning('选中的模型中包含使用中的模型，无法删除')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确认删除选中的 ${selectedItems.length} 个模型吗？此操作不可恢复`,
      '警告',
      {
        type: 'warning',
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }
    )
    
    loading.value = true
    // TODO: 调用批量删除API
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 从表格数据中移除选中项并保存
    const selectedIds = selectedItems.map(item => item.id)
    const newData = tableData.value.filter(
      item => !selectedIds.includes(item.id)
    )
    tableData.value = newData
    saveTableData(newData)
    ElMessage.success('批量删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  } finally {
    loading.value = false
  }
}

// 处理文件上传
const handleFileChange = (file: File) => {
  importForm.file = file
}

// 处理导入模型
const handleImport = () => {
  importDialogVisible.value = true
}

// 确认导入模型
const confirmImport = async () => {
  if (!importForm.name || !importForm.file) {
    ElMessage.warning('请填写完整信息')
    return
  }

  loading.value = true
  try {
    // TODO: 调用导入API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newData = [{
      id: Math.random().toString(36).substring(2),
      name: importForm.name,
      status: 'unused' as const,
      version: importForm.version,
      skill: importForm.skill || '-'
    }, ...tableData.value]
    
    tableData.value = newData
    saveTableData(newData)
    ElMessage.success('导入成功')
    importDialogVisible.value = false
    // 重置表单
    importForm.name = ''
    importForm.file = null
    importForm.version = 1
    importForm.skill = ''
  } catch (error) {
    ElMessage.error('导入失败')
  } finally {
    loading.value = false
  }
}

// 处理编辑操作
const handleEdit = (row: ModelItem) => {
  editForm.id = row.id
  editForm.name = row.name
  editForm.version = row.version
  editForm.skill = row.skill
  editDialogVisible.value = true
}

// 确认编辑
const confirmEdit = async () => {
  if (!editForm.name) {
    ElMessage.warning('请填写模型名称')
    return
  }

  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const index = tableData.value.findIndex(item => item.id === editForm.id)
    if (index !== -1) {
      const updatedItem: ModelItem = {
        ...tableData.value[index],
        name: editForm.name,
        version: editForm.version,
        skill: editForm.skill
      }
      tableData.value[index] = updatedItem
      saveTableData(tableData.value)
    }

    ElMessage.success('编辑成功')
    editDialogVisible.value = false
  } catch (error) {
    ElMessage.error('编辑失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  loading.value = true
  
  // 过滤数据
  const filteredData = initTableData().filter(item => {
    // 名称搜索
    const matchKeyword = !searchForm.keyword || 
      item.name.toLowerCase().includes(searchForm.keyword.toLowerCase())
    
    // 状态筛选
    const matchStatus = searchForm.status === 'all' || 
      item.status === searchForm.status
    
    return matchKeyword && matchStatus
  })
  
  tableData.value = filteredData
  pagination.currentPage = 1 // 重置到第一页
  loading.value = false
}

// 计算当前页的数据
const currentPageData = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return tableData.value.slice(start, end)
})

// 处理分页变化
const handlePageChange = (newPage: number) => {
  pagination.currentPage = newPage
}

// 处理每页数量变化
const handleSizeChange = (newSize: number) => {
  pagination.pageSize = newSize
  pagination.currentPage = 1  // 重置到第一页
}
</script>

<template>
  <div class="model-list">
    <!-- 操作区域 -->
    <div class="operation-area">
      <div class="left-operations">
        <el-button type="primary" @click="handleImport">
          <el-icon><Plus /></el-icon>导入模型
        </el-button>
        <el-button type="danger" @click="handleBatchDelete">
          <el-icon><Delete /></el-icon>批量删除
        </el-button>
      </div>
      
      <!-- 搜索区域移到右边 -->
      <div class="right-operations">
        <el-input
          v-model="searchForm.keyword"
          placeholder="请输入模型名称"
          class="search-input"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select 
          v-model="searchForm.status" 
          placeholder="全部"
          class="status-select"
          @change="handleSearch"
        >
          <el-option label="全部" value="all" />
          <el-option label="使用中" value="using" />
          <el-option label="未使用" value="unused" />
        </el-select>
      </div>
    </div>

    <!-- 导入模型对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="导入模型"
      width="500px"
    >
      <el-form :model="importForm" label-width="80px">
        <el-form-item label="模型名称" required>
          <el-input v-model="importForm.name" placeholder="请输入模型名称" />
        </el-form-item>
        <el-form-item label="模型文件" required>
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="file => handleFileChange(file.raw)"
            :limit="1"
          >
            <template #trigger>
              <el-button type="primary">选择文件</el-button>
            </template>
            <template #tip>
              <div class="el-upload__tip">
                请选择模型文件进行上传
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="版本">
          <el-input-number v-model="importForm.version" :min="1" />
        </el-form-item>
        <el-form-item label="相关技能">
          <el-input v-model="importForm.skill" placeholder="请输入相关技能" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmImport">
            确认导入
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑模型对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑模型"
      width="500px"
    >
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="模型名称" required>
          <el-input v-model="editForm.name" placeholder="请输入模型名称" />
        </el-form-item>
        <el-form-item label="版本">
          <el-input-number v-model="editForm.version" :min="1" />
        </el-form-item>
        <el-form-item label="相关技能">
          <el-input v-model="editForm.skill" placeholder="请输入相关技能" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmEdit">
            确认修改
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 模型列表 -->
    <el-table
      v-loading="loading"
      :data="currentPageData"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="name" label="模型名称" min-width="180" align="center" header-align="center" />
      <el-table-column prop="id" label="模型ID" width="280" align="center" header-align="center" />
      <el-table-column prop="status" label="状态" width="100" align="center" header-align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'using' ? 'success' : 'info'">
            {{ row.status === 'using' ? '使用中' : '未使用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="version" label="版本" width="80" align="center" header-align="center" />
      <el-table-column prop="skill" label="相关技能" min-width="200" align="center" header-align="center" />
      <el-table-column label="操作" width="150" fixed="right" align="center" header-align="center">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button
            link
            type="danger"
            :disabled="row.status === 'using'"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页控件 -->
    <div class="pagination-area">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="tableData.length"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.model-list {
  padding: 20px;

  .operation-area {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .left-operations {
      display: flex;
      gap: 12px;
    }

    .right-operations {
      display: flex;
      gap: 12px;
      
      .search-input {
        width: 200px;
      }

      .status-select {
        width: 120px;
      }
    }
  }

  .pagination-area {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.upload-demo {
  :deep(.el-upload-list) {
    margin-top: 10px;
  }
}
</style>
