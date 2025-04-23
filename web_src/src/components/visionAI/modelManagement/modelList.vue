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
        <el-button type="success" class="refresh-button" @click="handleRefresh" :loading="refreshLoading">
          <i class="el-icon-refresh"></i>刷新列表
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
      <el-table-column label="使用状态" width="100" align="center" header-align="center">
        <template slot-scope="{ row }">
          <el-tag :type="row.status === 'using' ? 'success' : 'info'">
            {{ row.status === 'using' ? '使用中' : '未使用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="加载状态" width="100" align="center" header-align="center">
        <template slot-scope="{ row }">
          <el-tag :type="row.loadStatus === 'loaded' ? 'primary' : 'warning'">
            {{ row.loadStatus === 'loaded' ? '已加载' : '未加载' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="version" label="版本" width="80" align="center" header-align="center" />
      <el-table-column prop="skill" label="相关技能" min-width="200" align="center" header-align="center" />
      <el-table-column label="操作" width="200" fixed="right" align="center" header-align="center">
        <template slot-scope="{ row }">
          <div class="operation-buttons">
            <!-- 加载/卸载按钮 -->
            <template v-if="row.loadStatus === 'loaded'">
              <el-tooltip content="卸载模型" placement="top">
                <div class="custom-icon-button unload-button" @click="handleUnload(row)" :class="{ 'is-loading': row.isLoading }">
                  <div v-if="!row.isLoading" class="icon-container">
                    <div class="icon-square"></div>
                  </div>
                  <i v-else class="el-icon-loading"></i>
                </div>
              </el-tooltip>
            </template>
            <template v-else>
              <el-tooltip content="加载模型" placement="top">
                <div class="custom-icon-button load-button" @click="handleLoad(row)" :class="{ 'is-loading': row.isLoading }">
                  <div v-if="!row.isLoading" class="icon-container">
                    <div class="icon-triangle"></div>
                  </div>
                  <i v-else class="el-icon-loading"></i>
                </div>
              </el-tooltip>
            </template>
            
            <!-- 其他操作按钮 -->
            <div class="text-buttons">
              <el-tooltip content="查看详情" placement="top">
                <div class="operation-btn details-btn" @click="handleDetail(row)">
                  <i class="el-icon-view"></i>
                </div>
              </el-tooltip>
              <el-tooltip content="编辑模型" placement="top">
                <div class="operation-btn edit-btn" @click="handleEdit(row)">
                  <i class="el-icon-edit"></i>
                </div>
              </el-tooltip>
              <el-tooltip content="删除模型" placement="top">
                <div 
                  class="operation-btn delete-btn" 
                  :class="{ 'disabled-btn': row.status === 'using' }"
                  @click="row.status !== 'using' && handleDelete(row)"
                >
                  <i class="el-icon-delete"></i>
                </div>
              </el-tooltip>
            </div>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 模型详情对话框 -->
    <el-dialog
      :visible.sync="detailDialogVisible"
      title="模型详情"
      width="700px"
      :close-on-click-modal="false"
      custom-class="model-detail-dialog"
      :append-to-body="true"
    >
      <div class="model-detail-content">
        <!-- 基本信息卡片 -->
        <el-card class="detail-card info-card" shadow="never" :body-style="{padding: '0'}">
          <div slot="header" class="card-header">
            <span>基本信息</span>
          </div>
          <div class="info-content">
            <div class="info-item">
              <span class="info-label">模型名称：</span>
              <span class="info-value">{{ detailForm.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">模型ID：</span>
              <span class="info-value model-id">{{ detailForm.id }}</span>
            </div>
            <div class="info-row">
              <div class="info-item half-width">
                <span class="info-label">使用状态：</span>
                <el-tag :type="detailForm.status === 'using' ? 'success' : 'info'" size="small">
                  {{ detailForm.status === 'using' ? '使用中' : '未使用' }}
                </el-tag>
              </div>
              <div class="info-item half-width">
                <span class="info-label">加载状态：</span>
                <el-tag :type="detailForm.loadStatus === 'loaded' ? 'primary' : 'warning'" size="small">
                  {{ detailForm.loadStatus === 'loaded' ? '已加载' : '未加载' }}
                </el-tag>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item half-width">
                <span class="info-label">版本：</span>
                <span class="info-value">v{{ detailForm.version }}</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item half-width">
                <span class="info-label">创建时间：</span>
                <span class="info-value">{{ detailForm.createTime || '2023-06-15 14:30:25' }}</span>
              </div>
              <div class="info-item half-width">
                <span class="info-label">更新时间：</span>
                <span class="info-value">{{ detailForm.updateTime || '2023-08-20 09:45:12' }}</span>
              </div>
            </div>
            <div class="info-item">
              <span class="info-label">相关描述：</span>
              <span class="info-value desc-value">{{ detailForm.description || '该模型基于深度学习技术，针对特定场景优化，支持多尺度特征融合和高精度目标检测。' }}</span>
            </div>
          </div>
        </el-card>

        <!-- 相关技能信息 -->
        <div class="related-skills-section">
          <el-card class="detail-card skills-card" shadow="never" :body-style="{padding: '0'}">
            <div slot="header" class="card-header">
              <span>相关技能</span>
              <el-tag type="success" size="small">{{ relatedSkills.length }}</el-tag>
            </div>
            <div v-if="relatedSkills.length === 0" class="no-skills">
              <i class="el-icon-warning-outline"></i> 暂无相关技能
            </div>
            <div v-else class="skills-scroll-container">
              <div v-for="(skill, index) in relatedSkills" :key="index" class="skill-card">
                <div class="skill-header">
                  <span class="skill-name">{{ skill.zhName }}</span>
                </div>
                <div class="skill-info">
                  <div class="skill-item">
                    <span class="label">类型：</span>
                    <span>{{ skill.type }}</span>
                  </div>
                  <div class="skill-item skill-desc">
                    <span class="label">描述：</span>
                    <span class="desc-content">{{ skill.description }}</span>
                  </div>
                </div>
                <div class="skill-status">
                  <el-tag 
                    size="mini" 
                    :type="skill.enabled ? 'success' : 'info'"
                    class="status-tag"
                  >
                    {{ skill.enabled ? '已启用' : '未启用' }}
                  </el-tag>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

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
      
      // 刷新按钮加载状态
      refreshLoading: false,
      
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
      },
      
      // 详情模型对话框
      detailDialogVisible: false,
      detailForm: {
        id: '',
        name: '',
        version: 1,
        status: '',
        loadStatus: '',
        skill: '',
        createTime: '',
        updateTime: '',
        description: ''
      },
      // 相关技能列表
      relatedSkills: []
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
          status: item.status,
          loadStatus: item.loadStatus || this.getRandomLoadStatus()
        }))
      }
      
      // 返回模拟数据
      return [
        {
          id: '4726e1c153624df9996e5779839...',
          name: '通道遮蔽检测',
          status: 'using',
          loadStatus: 'loaded',
          version: 2,
          skill: '输电通道压板检测 (v1)'
        },
        {
          id: '14464624a0bd4a9e8d944e140f1...',
          name: '垃圾堆积分割模型',
          status: 'using',
          loadStatus: 'loaded',
          version: 1,
          skill: 'laji_seg_851_v1_0_0_0518 (v1)'
        },
        {
          id: '292637b4d54f43006e06e3eb2a5...',
          name: '通道遮蔽检测',
          status: 'unused',
          loadStatus: 'unloaded',
          version: 1,
          skill: '-'
        },
        {
          id: '362a7ee57b244ec8bee55cc2fb1...',
          name: '烟火检测',
          status: 'using',
          loadStatus: 'loaded',
          version: 1,
          skill: 'firesmoke_v3.0.5.1 (v1)'
        },
        {
          id: '20672fc4465e41fe80e656e43fb7...',
          name: '运输车检测模型',
          status: 'using',
          loadStatus: 'loaded',
          version: 3,
          skill: 'anquandai_detect_851_v1_0_1_05...'
        },
        {
          id: 'df79ed383526140338b209327b7...',
          name: '安全带检测模型',
          status: 'using',
          loadStatus: 'loaded',
          version: 2,
          skill: 'belt_detect_v2.0.1'
        },
        {
          id: 'e882a770482a4ef89d944e140f1...',
          name: '人员聚集检测',
          status: 'unused',
          loadStatus: 'unloaded',
          version: 1,
          skill: 'crowd_detect_v1.2.0'
        },
        {
          id: 'f992637b4d54f43006e06e3eb2a...',
          name: '安全帽检测',
          status: 'using',
          loadStatus: 'loaded',
          version: 2,
          skill: 'helmet_detect_v2.1.0'
        },
        {
          id: 'a462a7ee57b244ec8bee55cc2fb...',
          name: '车辆识别模型',
          status: 'using',
          loadStatus: 'unloaded',
          version: 3,
          skill: 'vehicle_recognition_v3.0.1'
        },
        {
          id: 'b20672fc4465e41fe80e656e43f...',
          name: '人脸识别模型',
          status: 'unused',
          loadStatus: 'unloaded',
          version: 1,
          skill: 'face_recognition_v1.0.0'
        },
        {
          id: 'c4726e1c153624df9996e577983...',
          name: '行为分析模型',
          status: 'using',
          loadStatus: 'loaded',
          version: 2,
          skill: 'behavior_analysis_v2.1.0'
        },
        {
          id: 'd14464624a0bd4a9e8d944e140f...',
          name: '物品遗留检测',
          status: 'using',
          loadStatus: 'loaded',
          version: 1,
          skill: 'object_abandon_v1.0.5'
        },
        {
          id: 'e292637b4d54f43006e06e3eb2a...',
          name: '越界检测模型',
          status: 'unused',
          loadStatus: 'unloaded',
          version: 1,
          skill: 'boundary_cross_v1.1.0'
        },
        {
          id: 'f362a7ee57b244ec8bee55cc2fb...',
          name: '烟雾检测模型',
          status: 'using',
          loadStatus: 'loaded',
          version: 2,
          skill: 'smoke_detect_v2.0.3'
        },
        {
          id: 'g20672fc4465e41fe80e656e43f...',
          name: '车牌识别模型',
          status: 'using',
          loadStatus: 'loaded',
          version: 3,
          skill: 'plate_recognition_v3.1.0'
        },
        {
          id: 'h4726e1c153624df9996e577983...',
          name: '姿态估计模型',
          status: 'unused',
          loadStatus: 'unloaded',
          version: 1,
          skill: 'pose_estimation_v1.0.2'
        },
        {
          id: 'i14464624a0bd4a9e8d944e140f...',
          name: '目标跟踪模型',
          status: 'using',
          loadStatus: 'loaded',
          version: 2,
          skill: 'object_tracking_v2.1.1'
        },
        {
          id: 'j292637b4d54f43006e06e3eb2a...',
          name: '场景分类模型',
          status: 'using',
          loadStatus: 'unloaded',
          version: 1,
          skill: 'scene_classification_v1.0.0'
        },
        {
          id: 'k362a7ee57b244ec8bee55cc2fb...',
          name: '人群密度检测',
          status: 'unused',
          loadStatus: 'unloaded',
          version: 1,
          skill: 'crowd_density_v1.2.1'
        },
        {
          id: 'l20672fc4465e41fe80e656e43f...',
          name: '手势识别模型',
          status: 'using',
          loadStatus: 'loaded',
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
    },

    // 处理详情操作
    handleDetail(row) {
      this.detailForm = {
        id: row.id,
        name: row.name,
        version: row.version,
        status: row.status,
        loadStatus: row.loadStatus,
        skill: row.skill,
        createTime: '2023-06-15 14:30:25', // 模拟数据
        updateTime: '2023-08-20 09:45:12', // 模拟数据
        description: `${row.name}模型基于深度学习技术，针对${row.name.replace('模型', '').replace('检测', '')}场景优化，支持高精度识别与检测。`
      }
      
      // 获取相关技能信息
      this.getRelatedSkills(row)
      
      this.detailDialogVisible = true
    },
    
    // 获取相关技能信息
    getRelatedSkills(model) {
      // 这里模拟从后端获取数据的过程
      this.loading = true
      
      // 模拟异步获取数据
      setTimeout(() => {
        if (model.status === 'using' && model.skill !== '-') {
          // 如果模型正在使用中，则生成1-3个相关技能
          const skillCount = Math.floor(Math.random() * 3) + 1
          this.relatedSkills = Array(skillCount).fill(null).map((_, index) => {
            const skillName = model.skill.split(' ')[0] || `${model.name}技能`
            const zhName = this.getChineseName(model.name, index)
            
            return {
              id: `skill_${Math.random().toString(36).substring(2, 10)}`,
              name: `${skillName}_${index + 1}`,
              zhName: zhName,
              version: model.version,
              createTime: '2023-07-18 10:25:36',
              type: this.getSkillType(model.name),
              description: this.getSkillDescription(zhName, model.name),
              enabled: Math.random() > 0.3 // 随机生成启用状态，大概70%概率为已启用
            }
          })
        } else {
          // 如果模型未使用，则没有相关技能
          this.relatedSkills = []
        }
        
        this.loading = false
      }, 500)
    },
    
    // 获取技能中文名（模拟数据）
    getChineseName(modelName, index) {
      const baseNames = {
        '通道遮蔽检测': '输电通道压板检测',
        '垃圾堆积分割模型': '垃圾分类识别',
        '烟火检测': '火灾烟雾侦测',
        '运输车检测模型': '建筑车辆监测',
        '安全带检测模型': '人员安全带监测',
        '人员聚集检测': '人员聚集预警',
        '安全帽检测': '安全帽佩戴监测',
        '车辆识别模型': '车辆类型识别',
        '人脸识别模型': '人脸身份识别',
        '行为分析模型': '异常行为分析',
        '物品遗留检测': '遗留物检测预警',
        '越界检测模型': '区域入侵监测',
        '烟雾检测模型': '烟雾火灾预警',
        '车牌识别模型': '车牌号码识别',
        '姿态估计模型': '人体姿态分析',
        '目标跟踪模型': '运动目标追踪',
        '场景分类模型': '场景环境识别',
        '人群密度检测': '人群拥堵监测',
        '手势识别模型': '手势交互识别'
      }
      
      // 查找匹配的中文名
      for (const key in baseNames) {
        if (modelName.includes(key.replace('模型', ''))) {
          // 如果有多个技能，在名称后添加编号
          if (index > 0) {
            return `${baseNames[key]}_${index + 1}`
          }
          return baseNames[key]
        }
      }
      
      // 默认返回
      return `${modelName.replace('模型', '')}技能${index + 1}`
    },
    
    // 获取技能类型（模拟数据）
    getSkillType(modelName) {
      const typeMap = {
        '检测': '目标检测',
        '分割': '图像分割',
        '识别': '图像识别',
        '分类': '图像分类',
        '跟踪': '目标跟踪',
        '估计': '姿态估计',
        '分析': '行为分析'
      }
      
      // 根据模型名称中的关键词确定类型
      for (const key in typeMap) {
        if (modelName.includes(key)) {
          return typeMap[key]
        }
      }
      
      // 默认类型
      return '智能分析'
    },
    
    // 获取技能描述（模拟数据）
    getSkillDescription(skillName, modelName) {
      const descriptions = [
        `${skillName}支持实时检测场景中的目标，适用于各种光照和天气条件。`,
        `该技能基于深度学习算法，可以精确分析${modelName.replace('模型', '')}场景，支持多种场景应用。`,
        `${skillName}采用先进的视觉算法，具有高精度、低误报特性，适合7x24小时监控系统部署。`,
        `该技能经过大量真实场景训练，能够适应复杂环境变化，提供稳定可靠的识别结果。`
      ]
      
      // 随机返回一个描述
      return descriptions[Math.floor(Math.random() * descriptions.length)]
    },
    
    // 生成随机文件大小（模拟数据）
    getRandomFileSize() {
      const size = Math.floor(Math.random() * 900) + 100
      return `${size}.${Math.floor(Math.random() * 9)}MB`
    },
    
    // 生成随机框架信息（模拟数据）
    getRandomFramework() {
      const frameworks = [
        'PyTorch 1.10',
        'TensorFlow 2.6',
        'ONNX Runtime 1.8',
        'MindSpore 1.5',
        'PaddlePaddle 2.2'
      ]
      return frameworks[Math.floor(Math.random() * frameworks.length)]
    },
    
    // 生成随机应用场景（模拟数据）
    getRandomScenario(modelName) {
      const baseScenarios = {
        '通道遮蔽检测': '电力巡检、输电线路监控',
        '垃圾堆积分割': '城市环境管理、卫生监测',
        '烟火检测': '森林防火、工业安全',
        '运输车检测': '道路监控、物流管理',
        '安全带检测': '交通安全、驾驶行为监控',
        '人员聚集检测': '公共安全、人流密度监控',
        '安全帽检测': '工地安全、施工现场监管',
        '车辆识别': '交通管理、停车场系统',
        '人脸识别': '门禁系统、考勤管理',
        '行为分析': '异常行为识别、安防监控',
        '物品遗留检测': '公共场所安全、遗失物品监测',
        '越界检测': '周界防护、区域安全',
        '烟雾检测': '火灾预警、工业安全',
        '车牌识别': '交通管理、停车场系统',
        '姿态估计': '人体行为分析、运动跟踪',
        '目标跟踪': '视频监控、运动目标追踪',
        '场景分类': '图像内容识别、环境感知',
        '人群密度检测': '人流监控、公共安全',
        '手势识别': '人机交互、行为控制'
      }
      
      // 尝试匹配模型名称中的关键词
      for (const key in baseScenarios) {
        if (modelName.includes(key)) {
          return baseScenarios[key]
        }
      }
      
      // 如果没有匹配到，返回默认值
      return '安防监控、智能分析、视觉识别'
    },
    
    // 获取随机加载状态（用于模拟数据）
    getRandomLoadStatus() {
      return Math.random() > 0.3 ? 'loaded' : 'unloaded'
    },

    // 处理加载模型
    async handleLoad(row) {
      // 设置加载中状态
      const index = this.tableData.findIndex(item => item.id === row.id)
      if (index !== -1) {
        this.$set(this.tableData[index], 'isLoading', true)
      }
      
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // 更新状态
        const updatedData = [...this.tableData]
        if (index !== -1) {
          updatedData[index].loadStatus = 'loaded'
          updatedData[index].isLoading = false
          this.tableData = updatedData
          this.saveTableData(updatedData)
        }
        
        this.$message.success(`${row.name} 加载成功`)
      } catch (error) {
        this.$message.error(`加载失败: ${error.message || '未知错误'}`)
        // 重置加载状态
        if (index !== -1) {
          this.$set(this.tableData[index], 'isLoading', false)
        }
      }
    },
    
    // 处理卸载模型
    async handleUnload(row) {
      // 设置加载中状态
      const index = this.tableData.findIndex(item => item.id === row.id)
      if (index !== -1) {
        this.$set(this.tableData[index], 'isLoading', true)
      }
      
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 更新状态
        const updatedData = [...this.tableData]
        if (index !== -1) {
          updatedData[index].loadStatus = 'unloaded'
          updatedData[index].isLoading = false
          this.tableData = updatedData
          this.saveTableData(updatedData)
        }
        
        this.$message.success(`${row.name} 卸载成功`)
      } catch (error) {
        this.$message.error(`卸载失败: ${error.message || '未知错误'}`)
        // 重置加载状态
        if (index !== -1) {
          this.$set(this.tableData[index], 'isLoading', false)
        }
      }
    },

    // 处理刷新列表
    async handleRefresh() {
      this.refreshLoading = true
      
      // 显示提示信息
      const loadingMessage = this.$message({
        message: '正在刷新模型列表...',
        type: 'info',
        duration: 0
      })
      
      try {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 1200))
        
        // 重新获取数据（这里模拟获取新数据）
        this.tableData = this.initTableData().map(item => ({
          ...item,
          // 随机更新一些状态，模拟刷新效果
          loadStatus: Math.random() > 0.7 ? 
            (item.status === 'using' ? 'loaded' : 'unloaded') : 
            item.loadStatus
        }))
        
        // 保存到本地存储
        this.saveTableData(this.tableData)
        
        // 显示成功消息
        loadingMessage.close()
        this.$message({
          message: '模型列表刷新成功',
          type: 'success'
        })
        
        // 重置分页到第一页
        this.pagination.currentPage = 1
      } catch (error) {
        // 显示错误消息
        loadingMessage.close()
        this.$message.error('列表刷新失败，请重试')
        console.error('刷新列表错误:', error)
      } finally {
        this.refreshLoading = false
      }
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

/* 模型详情弹窗样式 */
.model-detail-dialog {
  display: flex;
  flex-direction: column;
  margin-top: 5vh !important;
  margin-bottom: 0;
  max-height: 90vh;
}

.model-detail-dialog >>> .el-dialog__header {
  padding: 15px 20px;
  border-bottom: none;
}

.model-detail-dialog >>> .el-dialog__body {
  max-height: calc(85vh - 108px);
  padding: 0 20px 20px;
  overflow: hidden;
}

.model-detail-content {
  padding: 0;
  margin-top: -20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.detail-card {
  margin-top: -20px;
  border-radius: 8px;
  border: none;
}

.detail-card >>> .el-card__header {
  border-bottom: none;
}

.card-header {
  display: flex;
  align-items: center;
  color: #303133;
  font-weight: 600;
  font-size: 16px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px 8px 0 0;
}

.card-header .el-tag {
  margin-left: 10px;
}

.info-content {
  padding: 15px;
  margin-top: -20px;
}

.info-item {
  margin-bottom: 10px;
  display: flex;
  align-items: flex-start;
}

.info-row {
  display: flex;
  margin-bottom: 10px;
}

.half-width {
  width: 50%;
  padding-right: 10px;
}

.info-label {
  color: #606266;
  width: 85px;
  text-align: right;
  margin-right: 15px;
  flex-shrink: 0;
}

.info-value {
  color: #303133;
  word-break: break-all;
  flex: 1;
}

.model-id {
  font-family: monospace;
  font-size: 13px;
  color: #606266;
}

.desc-value {
  line-height: 1.5;
}

.related-skills-section {
  margin-top: 0;
  flex-grow: 0;
  display: flex;
  flex-direction: column;
  height: auto;
  min-height: 180px;
  max-height: 250px;
}

.skills-scroll-container {
  max-height: 120px;
  overflow-y: auto;
  padding: 15px;
  margin-top: -20px;
}

.no-skills {
  text-align: center;
  color: #909399;
  padding: 20px 0;
  font-size: 14px;
}

.no-skills i {
  font-size: 16px;
  margin-right: 5px;
}

.skill-card {
  margin-bottom: 10px;
  border-radius: 6px;
  position: relative;
  height: 110px;
  padding: 12px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.skill-card:last-child {
  margin-bottom: 0;
}

.skill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.skill-name {
  font-weight: 600;
  font-size: 15px;
  color: #303133;
}

.skill-info {
  font-size: 13px;
  color: #606266;
  margin-top: 10px;
}

.skill-item {
  margin-bottom: 8px;
  display: flex;
}

.skill-item .label {
  width: 50px;
  color: #909399;
  flex-shrink: 0;
}

.skill-desc {
  align-items: flex-start;
}

.desc-content {
  line-height: 1.5;
  color: #606266;
}

/* 相关技能状态标签样式 */
.skill-status {
  position: absolute;
  top: 12px;
  right: 12px;
}

.status-tag {
  font-size: 12px;
  border-radius: 10px;
  padding: 0 10px;
  height: 20px;
  line-height: 18px;
}

/* 刷新按钮样式 */
.refresh-button {
  position: relative;
  background: #67C23A !important;
  border-color: #67C23A !important;
  color: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.refresh-button:hover {
  background: #85ce61 !important;
  border-color: #85ce61 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.refresh-button:active {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.refresh-button i {
  margin-right: 5px;
}

/* 操作按钮容器样式 */
.operation-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.text-buttons {
  display: flex;
  gap: 10px;
}

/* 操作按钮样式 */
.operation-btn {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  color: white;
  font-size: 14px;
}

.operation-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.details-btn {
  background-color: #67C23A;
}

.details-btn:hover {
  background-color: #85ce61;
}

.edit-btn {
  background-color: #E6A23C;
}

.edit-btn:hover {
  background-color: #ebb563;
}

.delete-btn {
  background-color: #F56C6C;
}

.delete-btn:hover {
  background-color: #f78989;
}

.disabled-btn {
  opacity: 0.5;
  cursor: not-allowed;
}

.disabled-btn:hover {
  transform: none;
  box-shadow: none;
}

/* 自定义图标按钮样式 */
.custom-icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.custom-icon-button:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.custom-icon-button.is-loading {
  opacity: 0.8;
  pointer-events: none;
}

/* 加载按钮样式 - 播放图标 */
.load-button {
  background: linear-gradient(135deg, #409EFF, #53a8ff);
  border: none;
}

.load-button:hover {
  background: linear-gradient(135deg, #53a8ff, #66b1ff);
}

.icon-container {
  width: 20px;
  height: 20px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-triangle {
  width: 0;
  height: 0;
  border-top: 7px solid transparent;
  border-bottom: 7px solid transparent;
  border-left: 12px solid white;
  margin-left: 2px;
}

/* 卸载按钮样式 - 停止图标 */
.unload-button {
  background: linear-gradient(135deg, #F56C6C, #f78989);
  border: none;
}

.unload-button:hover {
  background: linear-gradient(135deg, #f78989, #f9a7a7);
}

.icon-square {
  width: 12px;
  height: 12px;
  background-color: #fff;
  border-radius: 2px;
}
</style>
