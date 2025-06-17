<template>
  <div class="model-list">
    <!-- 操作区域 -->
    <div class="filter-section">
      <div class="toolbar">
        <div class="left-operations">
          <el-button type="primary" icon="el-icon-plus" size="small" @click="handleImport">导入模型</el-button>
          <el-button type="danger" icon="el-icon-delete" size="small" :disabled="!multipleSelection.length" @click="handleBatchDelete">批量删除</el-button>
          <el-button type="success" icon="el-icon-refresh-right" size="small" @click="handleRefresh" :loading="refreshLoading">刷新列表</el-button>
        </div>
        
        <!-- 搜索区域移到右边 -->
        <div class="right-operations">
          <div class="filter-item">
            <span class="filter-label">状态:</span>
            <el-select 
              v-model="searchForm.status" 
              placeholder="全部"
              class="status-select"
              @change="handleSearch"
              size="small"
              clearable
            >
              <el-option label="全部" value="all" />
              <el-option label="使用中" value="using" />
              <el-option label="未使用" value="unused" />
            </el-select>
          </div>
          
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入模型名称"
            class="search-input"
            @input="handleSearch"
            clearable
            @clear="handleSearch"
            size="small"
          >
            <i slot="prefix" style="align-items: center; display: flex; height: 32px;" class="el-icon-search"></i>
          </el-input>
          
          <el-button 
            class="refresh-btn" 
            size="small" 
            icon="el-icon-refresh-left" 
            @click="handleRefresh"
            :loading="refreshLoading"
            title="刷新数据"
          ></el-button>
        </div>
      </div>
    </div>

    <!-- 导入模型对话框 -->
    <el-dialog
      :visible.sync="importDialogVisible"
      title="导入模型"
      width="650px"
      :close-on-click-modal="false"
      custom-class="tech-dialog"
    >
      <el-form :model="importForm" label-width="85px" class="tech-form">
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
          <el-input 
            v-model="importForm.version" 
            placeholder="请输入版本号" 
            style="width: 40%;"
            class="version-input"
          >
            <template slot="prepend">
              <span class="version-prefix">V</span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="importForm.description" placeholder="请输入模型描述" style="width: 100%;" />
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
      :before-close="cancelEdit"
      custom-class="tech-dialog"
    >
      <el-form :model="editForm" label-width="85px" class="tech-form" :rules="editFormRules" ref="editForm">
        <el-form-item label="模型名称" prop="name" required>
          <el-input v-model="editForm.name" placeholder="请输入模型名称" style="width: 100%;" disabled />
        </el-form-item>
        <div class="form-row">
          <el-form-item label="版本" prop="version" class="half-width-item">
            <el-input 
              v-model="editForm.version" 
              placeholder="请输入版本号" 
              style="width: 100%;" 
              class="version-input"
            >
              <template slot="prepend">
                <span class="version-prefix">V</span>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="使用状态" class="half-width-item status-item-readonly">
            <el-tag :type="editForm.usage_status === 'using' ? 'success' : 'info'" size="medium">
              {{ editForm.usage_status === 'using' ? '使用中' : '未使用' }}
            </el-tag>
          </el-form-item>
        </div>
        <el-form-item label="描述" prop="description">
          <el-input v-model="editForm.description" placeholder="请输入模型描述" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelEdit">取消</el-button>
        <el-button type="primary" @click="confirmEdit" :loading="loading">确认修改</el-button>
      </div>
    </el-dialog>

    <!-- 模型列表 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="currentPageData"
        @selection-change="handleSelectionChange"
        class="tech-table"
        :header-cell-style="{background:'#f5f7fa',color:'#303133', fontWeight: '500', textAlign: 'center'}"
        :cell-style="{textAlign: 'center', backgroundColor: '#ffffff'}"
        :row-style="{backgroundColor: '#ffffff'}"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="name" label="模型名称" min-width="180" align="center" header-align="center" />
        <el-table-column prop="id" label="模型ID" width="180" align="center" header-align="center" />
        <el-table-column label="使用状态" width="100" align="center" header-align="center">
          <template slot-scope="{ row }">
            <el-tag :type="row.usage_status === 'using' ? 'success' : 'info'" class="tech-status-tag">
              {{ row.usage_status === 'using' ? '使用中' : '未使用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="加载状态" width="100" align="center" header-align="center">
          <template slot-scope="{ row }">
            <el-tag :type="row.model_status === 'loaded' ? 'primary' : 'warning'" class="tech-status-tag">
              {{ row.model_status === 'loaded' ? '已加载' : '未加载' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="版本" width="100" align="center" header-align="center">
          <template slot-scope="{ row }">
            <div class="version-badge">
              <i class="el-icon-odometer version-icon"></i>
              <span class="version-text">V{{ formatVersion(row.version) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" align="center" header-align="center" />
        <el-table-column label="操作" width="200" fixed="right" align="center" header-align="center">
          <template slot-scope="{ row }">
            <div class="operation-buttons">
              <!-- 卸载/加载按钮 -->
              <template v-if="row.model_status === 'loaded'">
                <el-button 
                  type="text" 
                  size="small" 
                  @click="handleUnload(row)" 
                  :loading="row.isLoading"
                  class="operation-text-btn unload-text-btn"
                >
                  卸载
                </el-button>
              </template>
              <template v-else>
                <el-button 
                  type="text" 
                  size="small" 
                  @click="handleLoad(row)" 
                  :loading="row.isLoading"
                  class="operation-text-btn load-text-btn"
                >
                  加载
                </el-button>
              </template>
              
              <el-button type="text" size="small" @click="handleDetail(row)" class="operation-text-btn detail-text-btn">详情</el-button>
              <el-button type="text" size="small" @click="handleEdit(row)" class="operation-text-btn edit-text-btn">编辑</el-button>
              <el-button 
                type="text" 
                size="small" 
                @click="handleDelete(row)" 
                :disabled="row.usage_status === 'using'"
                class="operation-text-btn delete-text-btn"
                :class="{ 'disabled-text-btn': row.usage_status === 'using' }"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 模型详情对话框 -->
    <el-dialog
      :visible.sync="detailDialogVisible"
      title="模型详情"
      width="700px"
      :close-on-click-modal="false"
      custom-class="model-detail-dialog tech-dialog"
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
            <div class="info-row">
              <div class="info-item half-width">
                <span class="info-label">模型ID：</span>
                <span class="info-value model-id">{{ detailForm.id }}</span>
              </div>
              <div class="info-item half-width">
                <span class="info-label">版本：</span>
                <div class="version-badge detail-version">
                  <i class="el-icon-odometer version-icon"></i>
                  <span class="version-text">V{{ formatVersion(detailForm.version) }}</span>
                </div>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item half-width">
                <span class="info-label">使用状态：</span>
                <el-tag :type="detailForm.usage_status === 'using' ? 'success' : 'info'" size="small" class="tech-status-tag">
                  {{ detailForm.usage_status === 'using' ? '使用中' : '未使用' }}
                </el-tag>
              </div>
              <div class="info-item half-width">
                <span class="info-label">加载状态：</span>
                <el-tag :type="detailForm.model_status === 'loaded' ? 'primary' : 'warning'" size="small" class="tech-status-tag">
                  {{ detailForm.model_status === 'loaded' ? '已加载' : '未加载' }}
                </el-tag>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item half-width">
                <span class="info-label">创建时间：</span>
                <span class="info-value">{{ detailForm.created_at || '2023-06-15 14:30:25' }}</span>
              </div>
              <div class="info-item half-width">
                <span class="info-label">更新时间：</span>
                <span class="info-value">{{ detailForm.updated_at || '2023-08-20 09:45:12' }}</span>
              </div>
            </div>
            <div class="info-item">
              <span class="info-label">相关描述：</span>
              <span class="info-value desc-value">{{ detailForm.description || '该模型基于深度学习技术，针对特定场景优化，支持多尺度特征融合和高精度目标检测。' }}</span>
            </div>
          </div>
        </el-card>

        <!-- 技能实例信息 -->
        <div class="related-skills-section">
          <el-card class="detail-card skills-card" shadow="never" :body-style="{padding: '0'}">
            <div slot="header" class="card-header">
              <span>技能实例</span>
              <el-tag type="success" size="small" class="tech-status-tag">{{ relatedSkills.length }}</el-tag>
            </div>
            <div v-if="relatedSkills.length === 0" class="no-skills">
              <i class="el-icon-warning-outline"></i> 暂无技能实例
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
                    class="status-tag tech-status-tag"
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
    <div class="pagination">
      <el-pagination
        :current-page.sync="pagination.currentPage"
        :page-size.sync="pagination.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script>
import { modelAPI } from '@/components/service/VisionAIService';

export default {
  name: 'ModelList',
  data() {
    return {
      // 开发环境标志
      isDev: process.env.NODE_ENV === 'development',
      
      // 分页参数
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0  // 设置为接口返回的总数
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
        version: '1.0',
        description: ''
      },
      
      // 编辑模型对话框
      editDialogVisible: false,
      editForm: {
        id: '',
        name: '',
        version: '1.0',
        description: '',
        usage_status: '',
        model_status: ''
      },
      
      // 详情模型对话框
      detailDialogVisible: false,
      detailForm: {
        id: '',
        name: '',
        version: 1,
        usage_status: '',
        model_status: '',
        description: '',
        created_at: '',
        updated_at: ''
      },
      // 相关技能列表
      relatedSkills: [],
      // 编辑表单验证规则
      editFormRules: {
        name: [
          { required: true, message: '请输入模型名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符之间', trigger: 'blur' }
        ],
        version: [
          { required: false, message: '请输入版本号', trigger: 'blur' },
          { 
            validator: (rule, value, callback) => {
              if (value === '' || value === undefined || value === null) {
                callback();
              } else if (!/^\d+(\.\d+)?$/.test(value.toString())) {
                callback(new Error('请输入有效的版本号，如：1 或 1.1'));
              } else {
                callback();
              }
            }, 
            trigger: 'blur' 
          }
        ],
        description: [
          { required: false, message: '请输入模型描述', trigger: 'blur' },
          { max: 200, message: '长度不超过200个字符', trigger: 'blur' }
        ]
      }
    }
  },
  
  computed: {
    // 计算当前页的数据
    currentPageData() {
      return this.tableData
    }
  },
  
  created() {
    // 获取模型列表数据
    this.fetchModelList()
  },
  
  methods: {
    // 从后端获取模型列表数据
    fetchModelList() {
      this.loading = true
      
      // 构建请求参数
      const params = {
        page: this.pagination.currentPage,
        limit: this.pagination.pageSize
      }
      
      // 添加关键词搜索参数
      if (this.searchForm.keyword) {
        params.name = this.searchForm.keyword
      }
      
      // 添加状态筛选参数
      if (this.searchForm.status !== 'all') {
        params.usage_status = this.searchForm.status
      }
      
      // 使用modelAPI服务发送请求
      modelAPI.getModelList(params).then((res) => {
        if (res.data && res.data.code === 0) {
          // 更新数据
          this.tableData = res.data.data || []
          
          // 更新分页信息
          if (res.data.total !== undefined) {
            this.pagination.total = res.data.total
          }
        } else {
          this.$message.error(res.data.msg || '获取模型列表失败')
          this.tableData = []
        }
        this.loading = false
      }).catch((error) => {
        console.error('获取模型列表失败', error)
        this.$message.error('获取模型列表失败: ' + (error.message || '未知错误'))
        this.tableData = []
        this.loading = false
      })
    },
    
    // 处理表格选择
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    
    // 处理删除操作
    handleDelete(row) {
      if (row.usage_status === 'using') {
        this.$message.warning('使用中的模型不能删除')
        return
      }

      this.$confirm('确认删除该模型吗？此操作不可恢复', '警告', {
        type: 'warning',
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        this.loading = true
        
        // 发送删除请求
        modelAPI.deleteModel(row.id).then((res) => {
          if (res.data && res.data.code === 0) {
            // 删除成功后重新获取列表
            this.fetchModelList()
            this.$message.success('删除成功')
          } else {
            this.$message.error(res.data.msg || '删除失败')
            this.loading = false
          }
        }).catch((error) => {
          console.error('删除模型失败', error)
          this.$message.error('删除失败: ' + (error.message || '未知错误'))
          this.loading = false
        })
      }).catch(() => {
        // 用户取消删除，不执行任何操作
      })
    },
    
    // 处理批量删除
    handleBatchDelete() {
      const selectedItems = this.multipleSelection
      if (selectedItems.length === 0) {
        this.$message.warning('请选择要删除的模型')
        return
      }

      // 检查是否包含使用中的模型
      const usingModels = selectedItems.filter(item => item.usage_status === 'using')
      if (usingModels.length > 0) {
        this.$message.warning('选中的模型中包含使用中的模型，无法删除')
        return
      }

      this.$confirm(
        `确认删除选中的 ${selectedItems.length} 个模型吗？此操作不可恢复`,
        '警告',
        {
          type: 'warning',
          confirmButtonText: '确认',
          cancelButtonText: '取消'
        }
      ).then(() => {
        this.loading = true
        
        // 获取所有选中项的ID
        const selectedIds = selectedItems.map(item => item.id)
        
        // 发送批量删除请求
        modelAPI.batchDeleteModels(selectedIds).then((res) => {
          if (res.data && res.data.success) {
            // 删除成功后重新获取列表
            this.fetchModelList()
            
            // 显示成功消息和详细信息
            this.$message.success(res.data.message || '批量删除成功')
            
            // 如果有失败的模型，显示详细信息
            if (res.data.detail && res.data.detail.failed && res.data.detail.failed.length > 0) {
              const failedInfo = res.data.detail.failed.map(item => {
                return `模型ID ${item.id}: ${item.reason}`
              }).join('\n')
              
              this.$notify({
                title: '部分模型删除失败',
                message: failedInfo,
                type: 'warning',
                duration: 10000
              })
            }
          } else {
            this.$message.error(res.data.message || '批量删除失败')
            this.loading = false
          }
        }).catch((error) => {
          console.error('批量删除模型失败', error)
          this.$message.error('批量删除失败: ' + (error.message || '未知错误'))
          this.loading = false
        })
      }).catch(() => {
        // 用户取消删除，不执行任何操作
      })
    },
    
    // 处理文件上传
    handleFileChange(file) {
      this.importForm.file = file
    },
    
    // 处理导入模型
    handleImport() {
      // 重置导入表单
      this.importForm = {
        name: '',
        file: null,
        version: '1.0',
        description: ''
      }
      this.importDialogVisible = true
    },
    
    // 确认导入模型
    confirmImport() {
      if (!this.importForm.name || !this.importForm.file) {
        this.$message.warning('请填写模型名称并选择模型文件')
        return
      }

      this.loading = true
      
      // 创建FormData对象
      const formData = new FormData()
      formData.append('name', this.importForm.name)
      formData.append('version', this.importForm.version.toString())
      formData.append('description', this.importForm.description || '')
      formData.append('file', this.importForm.file)
      
      // 发送导入请求
      modelAPI.importModel(formData).then((res) => {
        if (res.data && res.data.code === 0) {
          // 导入成功后重新获取列表
          this.fetchModelList()
          this.$message.success('导入成功')
          this.importDialogVisible = false
        } else {
          this.$message.error(res.data.msg || '导入失败')
        }
        this.loading = false
      }).catch((error) => {
        console.error('导入模型失败', error)
        this.$message.error('导入失败: ' + (error.message || '未知错误'))
        this.loading = false
      })
    },
    
    // 处理编辑操作
    handleEdit(row) {
      // 深拷贝当前行数据，避免直接修改表格数据
      this.editForm = {
        id: row.id,
        name: row.name,
        version: this.formatVersion(row.version), // 确保版本格式统一
        description: row.description || '', // 处理null或undefined的情况
        usage_status: row.usage_status,
        model_status: row.model_status
      }
      this.editDialogVisible = true
      
      // 使用nextTick等待DOM更新后再获取表单引用
      this.$nextTick(() => {
        if (this.$refs.editForm) {
          this.$refs.editForm.clearValidate()
        }
      })
    },
    
    // 取消编辑
    cancelEdit() {
      this.editDialogVisible = false
      this.$nextTick(() => {
        if (this.$refs.editForm) {
          this.$refs.editForm.resetFields()
        }
      })
    },
    
    // 确认编辑
    confirmEdit() {
      if (!this.$refs.editForm) return
      
      this.$refs.editForm.validate(valid => {
        if (!valid) return
        
        this.loading = true
        
        // 准备更新数据
        const updateData = {
          description: this.editForm.description
        }
        
        // 只有当版本存在时才更新版本
        if (this.editForm.version) {
          // 确保版本号可以是小数形式
          updateData.version = this.editForm.version.toString()
        }
        
        // 发送更新请求
        modelAPI.updateModel(this.editForm.id, updateData).then((res) => {
          if (res.data && res.data.code === 0) {
            // 更新成功后重新获取列表
            this.fetchModelList()
            
            // 关闭对话框
            this.editDialogVisible = false
            
            // 显示成功消息
            this.$message({
              message: '模型编辑成功',
              type: 'success'
            })
          } else {
            this.$message.error(res.data.msg || '编辑失败')
          }
          this.loading = false
        }).catch((error) => {
          console.error('编辑模型失败', error)
          this.$message.error('编辑失败: ' + (error.message || '未知错误'))
          this.loading = false
        })
      })
    },
    
    // 处理搜索
    handleSearch() {
      this.pagination.currentPage = 1 // 重置到第一页
      this.fetchModelList() // 重新获取数据
    },
    
    // 处理分页变化
    handlePageChange(newPage) {
      this.pagination.currentPage = newPage
      this.fetchModelList() // 获取新页的数据
    },
    
    // 处理每页数量变化
    handleSizeChange(newSize) {
      this.pagination.pageSize = newSize
      this.pagination.currentPage = 1  // 重置到第一页
      this.fetchModelList() // 重新获取数据
    },

    // 处理详情操作
    handleDetail(row) {
      this.loading = true
      
      // 获取模型详情
      modelAPI.getModelDetail(row.id).then((res) => {
        if (res.data && res.data.code === 0) {
          // 更新详情表单
          this.detailForm = {
            id: res.data.data.id,
            name: res.data.data.name,
            version: res.data.data.version,
            usage_status: res.data.data.usage_status,
            model_status: res.data.data.model_status,
            description: res.data.data.description || '',
            created_at: res.data.data.created_at,
            updated_at: res.data.data.updated_at
          }
          
          // 更新相关技能列表
          if (res.data.data.skill_classes && res.data.data.skill_classes.skill_classes) {
            this.relatedSkills = res.data.data.skill_classes.skill_classes.map(skill => {
              return {
                id: skill.id,
                zhName: skill.name_zh,
                name: skill.name,
                type: skill.type,
                description: skill.description || '',
                enabled: skill.enabled
              };
            });
          } else {
            this.relatedSkills = [];
          }
          
          this.detailDialogVisible = true
        } else {
          this.$message.error(res.data.msg || '获取模型详情失败')
        }
        this.loading = false
      }).catch((error) => {
        console.error('获取模型详情失败', error)
        this.$message.error('获取模型详情失败: ' + (error.message || '未知错误'))
        this.loading = false
      })
    },
    
    // 处理加载模型
    handleLoad(row) {
      // 设置加载中状态
      const index = this.tableData.findIndex(item => item.id === row.id)
      if (index !== -1) {
        this.$set(this.tableData[index], 'isLoading', true)
      }
      
      // 发送加载请求
      modelAPI.loadModel(row.id).then((res) => {
        if (res.data && res.data.code === 0) {
          // 加载成功后重新获取列表
          this.fetchModelList()
          this.$message.success(`${row.name} 加载成功`)
        } else {
          this.$message.error(res.data.msg || '加载失败')
          // 重置加载状态
          if (index !== -1) {
            this.$set(this.tableData[index], 'isLoading', false)
          }
        }
      }).catch((error) => {
        console.error('加载模型失败', error)
        this.$message.error('加载失败: ' + (error.message || '未知错误'))
        // 重置加载状态
        if (index !== -1) {
          this.$set(this.tableData[index], 'isLoading', false)
        }
      })
    },
    
    // 处理卸载模型
    handleUnload(row) {
      // 设置加载中状态
      const index = this.tableData.findIndex(item => item.id === row.id)
      if (index !== -1) {
        this.$set(this.tableData[index], 'isLoading', true)
      }
      
      // 发送卸载请求
      modelAPI.unloadModel(row.id).then((res) => {
        if (res.data && res.data.code === 0) {
          // 卸载成功后重新获取列表
          this.fetchModelList()
          this.$message.success(`${row.name} 卸载成功`)
        } else {
          this.$message.error(res.data.msg || '卸载失败')
          // 重置加载状态
          if (index !== -1) {
            this.$set(this.tableData[index], 'isLoading', false)
          }
        }
      }).catch((error) => {
        console.error('卸载模型失败', error)
        this.$message.error('卸载失败: ' + (error.message || '未知错误'))
        // 重置加载状态
        if (index !== -1) {
          this.$set(this.tableData[index], 'isLoading', false)
        }
      })
    },

    // 处理刷新列表
    handleRefresh() {
      this.refreshLoading = true
      
      // 显示提示信息
      const loadingMessage = this.$message({
        message: '正在刷新模型列表...',
        type: 'info',
        duration: 0
      })
      
      // 重新获取数据
      this.fetchModelList()
      
      // 定时关闭提示，避免API调用失败时提示不消失
      setTimeout(() => {
        loadingMessage.close()
        if (this.refreshLoading) {
          this.$message({
            message: '模型列表刷新成功',
            type: 'success'
          })
          this.refreshLoading = false
        }
      }, 1000)
    },

    // 格式化版本号
    formatVersion(version) {
      // 确保版本号是字符串
      const versionStr = String(version);
      
      // 如果包含小数点
      if (versionStr.includes('.')) {
        const parts = versionStr.split('.');
        // 返回主版本号和一位小数
        return parts[0] + '.' + (parts[1] || '0');
      } 
      // 如果是整数版本，添加.0
      return versionStr + '.0';
    },


  }
}
</script>

<style scoped>
.model-list {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
}

/* 科技感蓝色主题的过滤区域 */
.filter-section {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  padding: 12px 24px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  border: 1px solid rgba(59, 130, 246, 0.1);
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.filter-section::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(59, 130, 246, 0.03), transparent);
  transform: rotate(0deg);
  animation: shimmer 10s infinite linear;
}

@keyframes shimmer {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  position: relative;
  z-index: 2;
}

.left-operations {
  display: flex;
  align-items: center;
  gap: 8px;
}

.left-operations .el-button {
  height: 32px;
  padding: 6px 16px;
  font-size: 14px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
  margin-right: 0;
}

.left-operations .el-button--primary {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4), 0 2px 4px rgba(30, 64, 175, 0.3);
  position: relative;
  overflow: hidden;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  font-weight: 600;
  letter-spacing: 0.3px;
}

.left-operations .el-button--primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s ease;
}

.left-operations .el-button--primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #0891b2 100%);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5), 0 4px 8px rgba(30, 64, 175, 0.4);
  transform: translateY(-2px);
}

.left-operations .el-button--primary:hover::before {
  left: 100%;
}

.left-operations .el-button--danger {
  background: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
}

.left-operations .el-button--danger:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
  color: #1e3a8a;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
}

.left-operations .el-button--danger:disabled {
  background: #f5f7fa !important;
  border-color: #e4e7ed !important;
  color: #c0c4cc !important;
  box-shadow: none !important;
  transform: none !important;
  opacity: 0.6 !important;
  cursor: not-allowed !important;
}

.left-operations .el-button--danger:disabled:hover {
  background: #f5f7fa !important;
  border-color: #e4e7ed !important;
  color: #c0c4cc !important;
  box-shadow: none !important;
  transform: none !important;
}



.left-operations .el-button--success {
  background: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
}

.left-operations .el-button--success:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
  color: #1e3a8a;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
}

.left-operations .el-button--success:disabled {
  background: #f5f7fa !important;
  border-color: #e4e7ed !important;
  color: #c0c4cc !important;
  box-shadow: none !important;
  transform: none !important;
  opacity: 0.6 !important;
  cursor: not-allowed !important;
}

.left-operations .el-button--success:disabled:hover {
  background: #f5f7fa !important;
  border-color: #e4e7ed !important;
  color: #c0c4cc !important;
  box-shadow: none !important;
  transform: none !important;
}

.right-operations {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-item {
  display: flex;
  align-items: center;
  margin-right: 0;
  gap: 5px;
}

.filter-label {
  font-size: 14px;
  color: #1e40af;
  white-space: nowrap;
  font-weight: 500;
  margin-right: 0;
}

.filter-item .el-select {
  width: 130px;
}

.filter-item .el-select .el-input__inner {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.filter-item .el-select .el-input__inner:hover {
  border-color: #3b82f6;
}

.filter-item .el-select .el-input__inner:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.search-input {
  width: 220px;
  margin-right: 0;
}

.search-input .el-input__inner {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.search-input .el-input__inner:hover {
  border-color: #3b82f6;
}

.search-input .el-input__inner:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.refresh-btn {
  padding: 7px 10px;
  margin-left: 0;
  color: #606266;
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
  color: #1e40af;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

/* 表格容器样式 */
.table-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  border: 1px solid rgba(59, 130, 246, 0.1);
  overflow: hidden;
  flex: 1;
}

/* 科技感表格样式 */
.tech-table {
  border-radius: 16px;
  overflow: hidden;
}

.tech-table >>> .el-table__header-wrapper {
  background: #f5f7fa;
}

.tech-table >>> .el-table th {
  background: #f5f7fa !important;
  color: #303133 !important;
  font-weight: 500 !important;
  border-bottom: 1px solid #ebeef5 !important;
}

.tech-table >>> .el-table--enable-row-hover .el-table__body tr:hover > td {
  background-color: rgba(59, 130, 246, 0.05) !important;
}

.tech-table >>> .el-table__body tr {
  transition: all 0.3s ease;
}

.tech-table >>> .el-table td {
  border-bottom: 1px solid rgba(59, 130, 246, 0.1) !important;
}

/* 科技感状态标签 */
.tech-status-tag.el-tag--success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  border-color: #10b981 !important;
  color: white !important;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3) !important;
  border-radius: 12px !important;
  font-weight: 500 !important;
}

.tech-status-tag.el-tag--info {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%) !important;
  border-color: #6b7280 !important;
  color: white !important;
  box-shadow: 0 2px 4px rgba(107, 114, 128, 0.3) !important;
  border-radius: 12px !important;
  font-weight: 500 !important;
}

.tech-status-tag.el-tag--primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
  border-color: #3b82f6 !important;
  color: white !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3) !important;
  border-radius: 12px !important;
  font-weight: 500 !important;
}

.tech-status-tag.el-tag--warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
  border-color: #f59e0b !important;
  color: white !important;
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3) !important;
  border-radius: 12px !important;
  font-weight: 500 !important;
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 20px 0;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.pagination >>> .el-pagination {
  justify-content: center;
}

.pagination >>> .el-pagination .el-pager li {
  background: white !important;
  border: 1px solid #dcdfe6 !important;
  color: #606266 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
  margin: 0 2px !important;
}

.pagination >>> .el-pagination .el-pager li:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e40af !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.15);
}

.pagination >>> .el-pagination .el-pager li.active {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
  border-color: #3b82f6 !important;
  color: white !important;
  font-weight: 600 !important;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
}

.pagination >>> .el-pagination button {
  background: white !important;
  border: 1px solid #dcdfe6 !important;
  color: #606266 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
  margin: 0 2px !important;
}

.pagination >>> .el-pagination button:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e40af !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.15);
}

/* 表单布局相关样式 */
.form-row {
  display: flex;
  margin-bottom: 20px;
}

.half-width-item {
  width: 50%;
  margin-bottom: 0 !important;
}

.half-width-item:first-child {
  padding-right: 10px;
}

.half-width-item:last-child {
  padding-left: 10px;
}

.half-width-item >>> .el-form-item__label {
  width: 85px !important;
}

.half-width-item >>> .el-form-item__content {
  margin-left: 85px !important;
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

.tech-form {
  padding: 0 20px;
}

.tech-form >>> .el-form-item__label {
  font-size: 14px;
  color: #1F2329;
  font-weight: 600;
  padding-right: 12px;
  text-align: right;
}

.tech-form >>> .el-form-item__content {
  margin-left: 85px !important;
  text-align: left;
}

.tech-form >>> .el-form-item__label::before {
  margin-right: 4px;
  color: #F53F3F;
  font-weight: 600;
}

.tech-form >>> .el-form-item {
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
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.1);
  box-shadow: 0 2px 12px 0 rgba(59, 130, 246, 0.1);
  background-color: #fff;
  overflow: hidden;
}

.detail-card >>> .el-card__header {
  border-bottom: none;
}

.card-header {
  display: flex;
  align-items: center;
  color: #1e40af;
  font-weight: 600;
  font-size: 16px;
  padding: 15px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-radius: 8px 8px 0 0;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
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

.status-item {
  width: 33.33%;
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
  gap: 8px;
}

/* 文字按钮样式 */
.operation-text-btn {
  padding: 4px 8px !important;
  margin: 0 !important;
  font-size: 13px !important;
  transition: all 0.3s ease !important;
}

.operation-text-btn.load-text-btn {
  color: #409eff !important;
}

.operation-text-btn.load-text-btn:hover {
  color: #66b1ff !important;
  background-color: rgba(64, 158, 255, 0.1) !important;
}

.operation-text-btn.unload-text-btn {
  color: #f56c6c !important;
}

.operation-text-btn.unload-text-btn:hover {
  color: #f78989 !important;
  background-color: rgba(245, 108, 108, 0.1) !important;
}

.operation-text-btn.detail-text-btn {
  color: #67c23a !important;
}

.operation-text-btn.detail-text-btn:hover {
  color: #85ce61 !important;
  background-color: rgba(103, 194, 58, 0.1) !important;
}

.operation-text-btn.edit-text-btn {
  color: #e6a23c !important;
}

.operation-text-btn.edit-text-btn:hover {
  color: #ebb563 !important;
  background-color: rgba(230, 162, 60, 0.1) !important;
}

.operation-text-btn.delete-text-btn {
  color: #f56c6c !important;
}

.operation-text-btn.delete-text-btn:hover:not(.disabled-text-btn) {
  color: #f78989 !important;
  background-color: rgba(245, 108, 108, 0.1) !important;
}

.operation-text-btn.disabled-text-btn {
  color: #c0c4cc !important;
  cursor: not-allowed !important;
}

.operation-text-btn.disabled-text-btn:hover {
  color: #c0c4cc !important;
  background-color: transparent !important;
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

/* 编辑表单相关样式 */
.status-item-readonly {
  display: flex;
  align-items: center;
}

.status-hint {
  color: #909399;
  font-size: 12px;
  margin-left: 10px;
}

.tech-form >>> .el-form-item__error {
  padding-top: 2px;
}

.number-input >>> .el-input-number__decrease,
.number-input >>> .el-input-number__increase {
  background-color: #f5f7fa;
  border-color: #dcdfe6;
  color: #606266;
}

.number-input >>> .el-input-number__decrease:hover:not(.is-disabled) ~ .el-input .el-input__inner:not(.is-disabled),
.number-input >>> .el-input-number__increase:hover:not(.is-disabled) ~ .el-input .el-input__inner:not(.is-disabled) {
  border-color: #409EFF;
}

.tech-form >>> .el-input:hover .el-input__inner {
  border-color: #409EFF;
}

.tech-form >>> .el-form-item.is-error .el-input__inner,
.tech-form >>> .el-form-item.is-error .el-input__inner:focus,
.tech-form >>> .el-form-item.is-error .el-textarea__inner,
.tech-form >>> .el-form-item.is-error .el-textarea__inner:focus {
  border-color: #F56C6C;
}

/* 编辑对话框内按钮样式优化 */
.dialog-footer .el-button--primary {
  background-color: #409EFF;
  border-color: #409EFF;
}

.dialog-footer .el-button--primary:hover,
.dialog-footer .el-button--primary:focus {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

/* 版本控制样式 */
.version-control {
  display: flex;
  align-items: center;
  width: 160px;
}

.version-btn {
  padding: 8px;
  border-radius: 4px;
}

.version-decrease-btn {
  background-color: #f8f9fb;
  border-color: #dcdfe6;
}

.version-decrease-btn:not([disabled]):hover {
  background-color: #f2f6fc;
  border-color: #c6e2ff;
  color: #409EFF;
}

.version-increase-btn {
  background-color: #f8f9fb;
  border-color: #dcdfe6;
}

.version-increase-btn:hover {
  background-color: #f2f6fc;
  border-color: #c6e2ff;
  color: #409EFF;
}

.version-value {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin: 0 8px;
  min-width: 30px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 5px 8px;
  background-color: #fff;
}

.version-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border-radius: 16px;
  background: linear-gradient(135deg, #f0f5ff, #e6f7ff);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #d9e8ff;
  width: fit-content;
  transition: all 0.3s;
}

.version-badge:hover {
  background: linear-gradient(135deg, #e6f7ff, #d6f0ff);
  box-shadow: 0 3px 6px rgba(24, 144, 255, 0.1);
  transform: translateY(-1px);
}

.version-icon {
  margin-right: 5px;
  color: #1890ff;
  font-size: 15px;
}

.version-text {
  font-size: 13px;
  font-weight: 600;
  color: #1890ff;
  letter-spacing: 0.5px;
  font-family: 'Arial', sans-serif;
}

/* 详情页中的版本号样式 */
.detail-version {
  display: inline-flex;
  margin-top: 1px;
}

/* 表格中的版本号样式 */
.el-table .version-badge {
  margin: 0 auto;
}

/* 版本号输入框样式 */
.version-input >>> .el-input-group__prepend {
  background: linear-gradient(135deg, #f0f5ff, #e6f7ff);
  border-color: #d9e8ff;
  padding: 0 12px;
}

.version-prefix {
  color: #1890ff;
  font-weight: 600;
  font-size: 14px;
  font-family: 'Arial', sans-serif;
}

.version-input >>> .el-input__inner {
  border-color: #d9e8ff;
  transition: all 0.3s;
  font-family: 'Arial', sans-serif;
}

.version-input >>> .el-input__inner:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.version-input >>> .el-input__inner:hover {
  border-color: #1890ff;
}

/* 科技感对话框样式 */
.tech-dialog {
  border-radius: 16px !important;
  overflow: hidden !important;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
  border: 1px solid rgba(59, 130, 246, 0.1) !important;
  box-shadow: 0 10px 40px rgba(59, 130, 246, 0.15) !important;
}

.tech-dialog >>> .el-dialog {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
  border-radius: 16px !important;
  overflow: hidden !important;
}

.tech-dialog >>> .el-dialog__header {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2) !important;
  padding: 20px 24px !important;
}

.tech-dialog >>> .el-dialog__title {
  color: #1e40af !important;
  font-weight: 600 !important;
  font-size: 18px !important;
}

.tech-dialog >>> .el-dialog__close {
  color: #6b7280 !important;
  transition: color 0.3s ease !important;
}

.tech-dialog >>> .el-dialog__close:hover {
  color: #3b82f6 !important;
}

.tech-dialog >>> .el-dialog__body {
  background: #ffffff !important;
  padding: 24px !important;
}

/* 科技感表单样式 */
.tech-form >>> .el-form-item__label {
  color: #1e40af !important;
  font-weight: 600 !important;
}

.tech-form >>> .el-input__inner {
  border: 1px solid #e2e8f0 !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
}

.tech-form >>> .el-input__inner:hover {
  border-color: #3b82f6 !important;
}

.tech-form >>> .el-input__inner:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
}

.tech-form >>> .el-textarea__inner {
  border: 1px solid #e2e8f0 !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
}

.tech-form >>> .el-textarea__inner:hover {
  border-color: #3b82f6 !important;
}

.tech-form >>> .el-textarea__inner:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
}

/* 对话框按钮样式 */
.tech-dialog >>> .el-button--primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4) !important;
  color: white !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
}

.tech-dialog >>> .el-button--primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%) !important;
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5) !important;
  transform: translateY(-2px) !important;
}

.tech-dialog >>> .el-button--default {
  background: white !important;
  border: 1px solid #d1d5db !important;
  color: #4b5563 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
}

.tech-dialog >>> .el-button--default:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e40af !important;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2) !important;
}

/* 上传组件样式 */
.tech-dialog >>> .el-upload-dragger {
  border: 2px dashed #d1d5db !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
}

.tech-dialog >>> .el-upload-dragger:hover {
  border-color: #3b82f6 !important;
  background-color: rgba(59, 130, 246, 0.05) !important;
}

.tech-dialog >>> .el-upload__text {
  color: #6b7280 !important;
}

.tech-dialog >>> .el-upload__text em {
  color: #3b82f6 !important;
  font-weight: 500 !important;
}

/* 加载状态优化 */
.tech-dialog >>> .el-loading-mask {
  background-color: rgba(59, 130, 246, 0.1) !important;
}

.tech-dialog >>> .el-loading-spinner .circular {
  stroke: #3b82f6 !important;
}
</style>
