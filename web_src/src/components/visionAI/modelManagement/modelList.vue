<template>
  <div class="model-list">
    <!-- 操作区域 -->
    <div class="operation-area">
      <div class="left-operations">
        <el-button type="primary" @click="handleImport">
          <i class="el-icon-plus"></i>导入模型
        </el-button>
        <el-button type="danger" @click="handleBatchDelete">
          <i class="el-icon-delete"></i>批量删除
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
          <i slot="prefix" style="align-items: center; display: flex; height: 40px;" class="el-icon-search"></i>
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
      :visible.sync="importDialogVisible"
      title="导入模型"
      width="650px"
      :close-on-click-modal="false"
    >
      <el-form :model="importForm" label-width="85px" class="skill-form">
        <el-form-item label="模型名称" required>
          <el-input v-model="importForm.name" placeholder="请输入模型名称" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="模型文件" required>
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="file => handleFileChange(file.raw)"
            :limit="1"
          >
            <el-button type="primary" style="margin-left: 0;">选择文件</el-button>
            <div class="el-upload__tip" style="margin-top: 10px; color: #86909C; font-size: 12px;">
              请选择模型文件进行上传
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item label="版本">
          <el-input-number v-model="importForm.version" :min="1" />
        </el-form-item>
        <el-form-item label="相关技能">
          <el-input v-model="importForm.skill" placeholder="请输入相关技能" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmImport">确认导入</el-button>
      </div>
    </el-dialog>

    <!-- 编辑模型对话框 -->
    <el-dialog
      :visible.sync="editDialogVisible"
      title="编辑模型"
      width="650px"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" label-width="85px" class="skill-form">
        <el-form-item label="模型名称" required>
          <el-input v-model="editForm.name" placeholder="请输入模型名称" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="版本" style="">
          <el-input-number v-model="editForm.version" :min="1" class="number-input" />
        </el-form-item>
        <el-form-item label="相关技能">
          <el-input v-model="editForm.skill" placeholder="请输入相关技能" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEdit">确认修改</el-button>
      </div>
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
        <template slot-scope="{ row }">
          <el-tag :type="row.status === 'using' ? 'success' : 'info'">
            {{ row.status === 'using' ? '使用中' : '未使用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="version" label="版本" width="80" align="center" header-align="center" />
      <el-table-column prop="skill" label="相关技能" min-width="200" align="center" header-align="center" />
      <el-table-column label="操作" width="150" fixed="right" align="center" header-align="center">
        <template slot-scope="{ row }">
          <el-button type="text" @click="handleEdit(row)">编辑</el-button>
          <el-button
            type="text"
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
        :current-page.sync="pagination.currentPage"
        :page-size.sync="pagination.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="tableData.length"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModelList',
  data() {
    return {
      // 分页参数
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 20  // 设置为实际数据总数
      },
      
      // 搜索和筛选条件
      searchForm: {
        keyword: '',
        status: 'all'
      },
      
      // 表格数据
      tableData: [],
      
      // 选中的行
      multipleSelection: [],
      
      // 表格加载状态
      loading: false,
      
      // 导入模型对话框
      importDialogVisible: false,
      importForm: {
        name: '',
        file: null,
        version: 1,
        skill: ''
      },
      
      // 编辑模型对话框
      editDialogVisible: false,
      editForm: {
        id: '',
        name: '',
        version: 1,
        skill: ''
      }
    }
  },
  
  computed: {
    // 计算当前页的数据
    currentPageData() {
      const start = (this.pagination.currentPage - 1) * this.pagination.pageSize
      const end = start + this.pagination.pageSize
      return this.tableData.slice(start, end)
    }
  },
  
  created() {
    this.tableData = this.initTableData()
  },
  
  methods: {
    // 表格数据初始化
    initTableData() {
      // 清除之前的数据（开发测试时使用）
      localStorage.removeItem('modelTableData')
      
      const savedData = localStorage.getItem('modelTableData')
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        return parsedData.map(item => ({
          ...item,
          status: item.status
        }))
      }
      
      // 返回模拟数据
      return [
        {
          id: '4726e1c153624df9996e5779839...',
          name: '通道遮蔽检测',
          status: 'using',
          version: 2,
          skill: '输电通道压板检测 (v1)'
        },
        {
          id: '14464624a0bd4a9e8d944e140f1...',
          name: '垃圾堆积分割模型',
          status: 'using',
          version: 1,
          skill: 'laji_seg_851_v1_0_0_0518 (v1)'
        },
        {
          id: '292637b4d54f43006e06e3eb2a5...',
          name: '通道遮蔽检测',
          status: 'unused',
          version: 1,
          skill: '-'
        },
        {
          id: '362a7ee57b244ec8bee55cc2fb1...',
          name: '烟火检测',
          status: 'using',
          version: 1,
          skill: 'firesmoke_v3.0.5.1 (v1)'
        },
        {
          id: '20672fc4465e41fe80e656e43fb7...',
          name: '运输车检测模型',
          status: 'using',
          version: 3,
          skill: 'anquandai_detect_851_v1_0_1_05...'
        },
        {
          id: 'df79ed383526140338b209327b7...',
          name: '安全带检测模型',
          status: 'using',
          version: 2,
          skill: 'belt_detect_v2.0.1'
        },
        {
          id: 'e882a770482a4ef89d944e140f1...',
          name: '人员聚集检测',
          status: 'unused',
          version: 1,
          skill: 'crowd_detect_v1.2.0'
        },
        {
          id: 'f992637b4d54f43006e06e3eb2a...',
          name: '安全帽检测',
          status: 'using',
          version: 2,
          skill: 'helmet_detect_v2.1.0'
        },
        {
          id: 'a462a7ee57b244ec8bee55cc2fb...',
          name: '车辆识别模型',
          status: 'using',
          version: 3,
          skill: 'vehicle_recognition_v3.0.1'
        },
        {
          id: 'b20672fc4465e41fe80e656e43f...',
          name: '人脸识别模型',
          status: 'unused',
          version: 1,
          skill: 'face_recognition_v1.0.0'
        },
        {
          id: 'c4726e1c153624df9996e577983...',
          name: '行为分析模型',
          status: 'using',
          version: 2,
          skill: 'behavior_analysis_v2.1.0'
        },
        {
          id: 'd14464624a0bd4a9e8d944e140f...',
          name: '物品遗留检测',
          status: 'using',
          version: 1,
          skill: 'object_abandon_v1.0.5'
        },
        {
          id: 'e292637b4d54f43006e06e3eb2a...',
          name: '越界检测模型',
          status: 'unused',
          version: 1,
          skill: 'boundary_cross_v1.1.0'
        },
        {
          id: 'f362a7ee57b244ec8bee55cc2fb...',
          name: '烟雾检测模型',
          status: 'using',
          version: 2,
          skill: 'smoke_detect_v2.0.3'
        },
        {
          id: 'g20672fc4465e41fe80e656e43f...',
          name: '车牌识别模型',
          status: 'using',
          version: 3,
          skill: 'plate_recognition_v3.1.0'
        },
        {
          id: 'h4726e1c153624df9996e577983...',
          name: '姿态估计模型',
          status: 'unused',
          version: 1,
          skill: 'pose_estimation_v1.0.2'
        },
        {
          id: 'i14464624a0bd4a9e8d944e140f...',
          name: '目标跟踪模型',
          status: 'using',
          version: 2,
          skill: 'object_tracking_v2.1.1'
        },
        {
          id: 'j292637b4d54f43006e06e3eb2a...',
          name: '场景分类模型',
          status: 'using',
          version: 1,
          skill: 'scene_classification_v1.0.0'
        },
        {
          id: 'k362a7ee57b244ec8bee55cc2fb...',
          name: '人群密度检测',
          status: 'unused',
          version: 1,
          skill: 'crowd_density_v1.2.1'
        },
        {
          id: 'l20672fc4465e41fe80e656e43f...',
          name: '手势识别模型',
          status: 'using',
          version: 2,
          skill: 'gesture_recognition_v2.0.0'
        }
      ]
    },
    
    // 保存数据到本地存储
    saveTableData(data) {
      localStorage.setItem('modelTableData', JSON.stringify(data))
    },
    
    // 处理表格选择
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    
    // 处理删除操作
    async handleDelete(row) {
      if (row.status === 'using') {
        this.$message.warning('使用中的模型不能删除')
        return
      }

      try {
        await this.$confirm('确认删除该模型吗？此操作不可恢复', '警告', {
          type: 'warning',
          confirmButtonText: '确认',
          cancelButtonText: '取消'
        })
        
        this.loading = true
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 从表格数据中移除并保存
        const newData = this.tableData.filter(item => item.id !== row.id)
        this.tableData = newData
        this.saveTableData(newData)
        this.$message.success('删除成功')
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      } finally {
        this.loading = false
      }
    },
    
    // 处理批量删除
    async handleBatchDelete() {
      const selectedItems = this.multipleSelection
      if (selectedItems.length === 0) {
        this.$message.warning('请选择要删除的模型')
        return
      }

      // 检查是否包含使用中的模型
      const usingModels = selectedItems.filter(item => item.status === 'using')
      if (usingModels.length > 0) {
        this.$message.warning('选中的模型中包含使用中的模型，无法删除')
        return
      }

      try {
        await this.$confirm(
          `确认删除选中的 ${selectedItems.length} 个模型吗？此操作不可恢复`,
          '警告',
          {
            type: 'warning',
            confirmButtonText: '确认',
            cancelButtonText: '取消'
          }
        )
        
        this.loading = true
        // 模拟批量删除API调用
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // 从表格数据中移除选中项并保存
        const selectedIds = selectedItems.map(item => item.id)
        const newData = this.tableData.filter(
          item => !selectedIds.includes(item.id)
        )
        this.tableData = newData
        this.saveTableData(newData)
        this.$message.success('批量删除成功')
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('批量删除失败')
        }
      } finally {
        this.loading = false
      }
    },
    
    // 处理文件上传
    handleFileChange(file) {
      this.importForm.file = file
    },
    
    // 处理导入模型
    handleImport() {
      this.importDialogVisible = true
    },
    
    // 确认导入模型
    async confirmImport() {
      if (!this.importForm.name || !this.importForm.file) {
        this.$message.warning('请填写完整信息')
        return
      }

      this.loading = true
      try {
        // 模拟导入API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const newData = [{
          id: Math.random().toString(36).substring(2),
          name: this.importForm.name,
          status: 'unused',
          version: this.importForm.version,
          skill: this.importForm.skill || '-'
        }, ...this.tableData]
        
        this.tableData = newData
        this.saveTableData(newData)
        this.$message.success('导入成功')
        this.importDialogVisible = false
        // 重置表单
        this.importForm.name = ''
        this.importForm.file = null
        this.importForm.version = 1
        this.importForm.skill = ''
      } catch (error) {
        this.$message.error('导入失败')
      } finally {
        this.loading = false
      }
    },
    
    // 处理编辑操作
    handleEdit(row) {
      this.editForm.id = row.id
      this.editForm.name = row.name
      this.editForm.version = row.version
      this.editForm.skill = row.skill
      this.editDialogVisible = true
    },
    
    // 确认编辑
    async confirmEdit() {
      if (!this.editForm.name) {
        this.$message.warning('请填写模型名称')
        return
      }

      this.loading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const index = this.tableData.findIndex(item => item.id === this.editForm.id)
        if (index !== -1) {
          const updatedItem = {
            ...this.tableData[index],
            name: this.editForm.name,
            version: this.editForm.version,
            skill: this.editForm.skill
          }
          this.tableData[index] = updatedItem
          this.saveTableData(this.tableData)
        }

        this.$message.success('编辑成功')
        this.editDialogVisible = false
      } catch (error) {
        this.$message.error('编辑失败')
      } finally {
        this.loading = false
      }
    },
    
    // 处理搜索
    handleSearch() {
      this.loading = true
      
      // 过滤数据
      const filteredData = this.initTableData().filter(item => {
        // 名称搜索
        const matchKeyword = !this.searchForm.keyword || 
          item.name.toLowerCase().includes(this.searchForm.keyword.toLowerCase())
        
        // 状态筛选
        const matchStatus = this.searchForm.status === 'all' || 
          item.status === this.searchForm.status
        
        return matchKeyword && matchStatus
      })
      
      this.tableData = filteredData
      this.pagination.currentPage = 1 // 重置到第一页
      this.loading = false
    },
    
    // 处理分页变化
    handlePageChange(newPage) {
      this.pagination.currentPage = newPage
    },
    
    // 处理每页数量变化
    handleSizeChange(newSize) {
      this.pagination.pageSize = newSize
      this.pagination.currentPage = 1  // 重置到第一页
    }
  }
}
</script>

<style scoped>
.model-list {
  padding: 20px;
}

  .operation-area {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

    .left-operations {
      display: flex;
}

.left-operations .el-button {
  margin-right: 10px;
    }

    .right-operations {
      display: flex;
  align-items: center;
}
      
.right-operations .search-input {
        width: 200px;
  margin-right: 10px;
      }

.right-operations .status-select {
        width: 120px;
  }

  .pagination-area {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid #E5E6EB;
  text-align: right;
}

.dialog-footer .el-button {
  margin-left: 10px;
  height: 32px;
  padding: 0 16px;
  font-size: 13px;
  border-radius: 4px;
}

.skill-form {
  padding: 0 20px;
}

.skill-form >>> .el-form-item__label {
  font-size: 14px;
  color: #1F2329;
  font-weight: 600;
  padding-right: 12px;
  text-align: right;
}

.skill-form >>> .el-form-item__content {
  margin-left: 85px !important;
  text-align: left;
}

.skill-form >>> .el-form-item__label::before {
  margin-right: 4px;
  color: #F53F3F;
  font-weight: 600;
}

.skill-form >>> .el-form-item {
  margin-bottom: 24px;
}

.number-input {
  width: 160px !important;
}

.number-input >>> .el-input__inner {
  line-height: 32px;
  border-radius: 4px;
  padding: 0 8px;
  text-align: left;
}

/* 深度选择器，确保上传组件样式正确 */
.upload-demo >>> .el-upload-list {
  margin-top: 10px;
}

.upload-demo >>> .el-upload {
  text-align: left;
}
</style>
