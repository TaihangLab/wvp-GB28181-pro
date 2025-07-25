<template>
  <div class="knowledge-base-wrapper">
    <div class="knowledge-base">
      <div class="page-container">
        <!-- 头部操作区域 -->
        <div class="header-section">
          <div class="header-left">
            <el-button type="primary" icon="el-icon-plus" @click="createKnowledge">
              创建知识库
            </el-button>
            <el-button @click="batchDelete">
              批量删除
            </el-button>
          </div>

          <div class="header-right">
            <el-input v-model="searchInput" placeholder="请输入知识库名称搜索" class="search-input" @input="handleSearchInput" @keyup.enter="handleSearch">
              <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
            </el-input>

            <el-button icon="el-icon-refresh" class="action-btn" @click="refreshData"></el-button>
          </div>
        </div>

        <!-- 过滤标签 -->
        <div class="filter-tabs">
          <div class="filter-buttons">
            <el-button :type="isAllSelected ? 'primary' : ''" :plain="!isAllSelected"
              @click="selectAll">
              全选
            </el-button>
            <el-button :type="isCurrentPageSelected ? 'primary' : ''" :plain="!isCurrentPageSelected"
              @click="selectCurrentPage">
              选择本页
            </el-button>
          </div>

          <div class="sort-section">
            <span>{{ sortTypeText }}</span>
            <el-button type="text" 
                       :icon="sortOrder === 'desc' ? 'el-icon-caret-bottom' : 'el-icon-caret-top'" 
                       @click="toggleSort"></el-button>
          </div>
        </div>

        <!-- 知识库卡片网格 -->
        <div class="knowledge-container">
          <!-- 加载状态 -->
          <div v-if="loading" class="loading-container" v-loading="loading" element-loading-text="正在加载知识库列表...">
            <div class="loading-placeholder"></div>
          </div>
          
          <!-- 空状态 -->
          <div v-else-if="!loading && knowledgeBases.length === 0" class="empty-state">
            <el-empty description="暂无知识库数据" image-size="120">
              <el-button type="primary" @click="createKnowledge">创建第一个知识库</el-button>
            </el-empty>
          </div>
          
          <!-- 知识库网格 -->
          <div v-else class="knowledge-grid">
            <div v-for="knowledge in paginatedKnowledge" :key="knowledge.id" 
                 class="knowledge-card"
                 @mouseenter="showCardCheckbox(knowledge.id)"
                 @mouseleave="hideCardCheckbox(knowledge.id)"
                 @click="viewKnowledgeDetail(knowledge)">
              
              <!-- 选择框 -->
              <div v-show="cardHoverStates[knowledge.id] || selectedKnowledge.includes(knowledge.id)" 
                   class="card-checkbox"
                   @click.stop>
                <el-checkbox 
                  :value="selectedKnowledge.includes(knowledge.id)"
                  @input="handleKnowledgeSelect(knowledge.id, $event)"></el-checkbox>
              </div>
              
              <div class="card-header">
                <h3 class="knowledge-title">{{ knowledge.name }}</h3>
                <div class="knowledge-id">
                  <span class="id-label">ID</span>
                  <span class="id-value">{{ knowledge.id }}</span>
                </div>
              </div>

              <div class="card-content">
                <p class="knowledge-description" 
                   @mouseenter="showTooltip($event, knowledge.description)" 
                   @mouseleave="hideTooltip">
                  {{ knowledge.description }}
                </p>

                <div class="knowledge-info">
                  <div class="info-row">
                    <span class="label">文档数量</span>
                    <span class="value">{{ knowledge.documentCount }} 个文档</span>
                  </div>

                  <div class="info-row">
                    <span class="label">更新时间</span>
                    <span class="value">{{ knowledge.updateTime }}</span>
                  </div>
                </div>
              </div>

              <div class="card-actions" @click.stop>
                <el-button size="small" @click="editKnowledge(knowledge)">
                  编辑
                </el-button>
                <el-button size="small" @click="deleteKnowledge(knowledge)">
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-section">
          <el-pagination 
            @size-change="handleSizeChange" 
            @current-change="handleCurrentChange" 
            :current-page="currentPage"
            :page-sizes="[12, 24, 48, 96]" 
            :page-size="pageSize" 
            :total="totalCount"
            layout="total, sizes, prev, pager, next, jumper" 
            background>
            <template slot="total">
              <span>共 {{ totalCount }} 条数据</span>
            </template>
          </el-pagination>
        </div>
      </div>
    </div>
    
    <!-- 描述信息悬浮提示框 -->
    <div v-show="tooltipVisible" 
         ref="tooltip"
         class="knowledge-tooltip"
         :style="tooltipStyle">
      {{ tooltipContent }}
    </div>

    <!-- 编辑/创建知识库弹窗 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="editDialogVisible"
      width="600px"
      :before-close="handleEditDialogClose"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      custom-class="edit-knowledge-dialog">
      
      <div class="edit-form-container">
        <el-form
          ref="editForm"
          :model="editForm"
          :rules="editRules"
          label-width="120px"
          class="edit-form">
          
          <el-form-item label="知识库名称" prop="name" required>
            <el-input
              v-model="editForm.name"
              placeholder="请输入知识库名称"
              maxlength="50"
              show-word-limit>
            </el-input>
          </el-form-item>

          <el-form-item label="向量数据库" prop="vectorDatabase" required>
            <el-select
              v-model="editForm.vectorDatabase"
              placeholder="请选择向量数据库"
              style="width: 100%">
              <el-option
                v-for="item in vectorDatabaseOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
                <div class="select-option">
                  <span class="option-label">{{ item.label }}</span>
                  <span class="option-desc">{{ item.description }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="向量模型" prop="vectorModel" required>
            <el-select
              v-model="editForm.vectorModel"
              placeholder="请选择向量模型"
              style="width: 100%">
              <el-option
                v-for="item in vectorModelOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
                <div class="select-option">
                  <span class="option-label">{{ item.label }}</span>
                  <span class="option-desc">{{ item.description }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="知识库描述" prop="description">
            <el-input
              v-model="editForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入知识库描述"
              maxlength="200"
              show-word-limit>
            </el-input>
          </el-form-item>
        </el-form>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="handleEditDialogClose">取消</el-button>
        <el-button type="primary" @click="handleEditSubmit" :loading="submitLoading">
          确定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'KnowledgeBase',
  data() {
    return {
      // 搜索和过滤
      searchInput: '', // 搜索输入框的值
      searchKeyword: '', // 实际执行搜索的关键词
      sortType: 'time', // 'time' 或 'name'
      sortOrder: 'desc', // 'asc' 或 'desc'

      // 分页
      currentPage: 1,
      pageSize: 12,
      totalCount: 0,

      // 选择相关
      selectedKnowledge: [], // 已选中的知识库ID数组
      cardHoverStates: {}, // 卡片悬浮状态

      // tooltip相关
      tooltipVisible: false,
      tooltipContent: '',
      tooltipStyle: {
        left: '0px',
        top: '0px'
      },

      // 知识库数据
      knowledgeBases: [],
      loading: false, // 加载状态
      
      // 搜索防抖
      searchDebounceTimer: null,

      // 编辑弹窗相关
      editDialogVisible: false,
      submitLoading: false,
      currentEditKnowledge: null,
      dialogTitle: '编辑知识库', // 弹窗标题
      editForm: {
        name: '',
        vectorDatabase: '',
        vectorModel: '',
        description: ''
      },
      editRules: {
        name: [
          { required: true, message: '请输入知识库名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        vectorDatabase: [
          { required: true, message: '请选择向量数据库', trigger: 'change' }
        ],
        vectorModel: [
          { required: true, message: '请选择向量模型', trigger: 'change' }
        ],
        description: [
          { max: 200, message: '描述不能超过 200 个字符', trigger: 'blur' }
        ]
      },
      vectorDatabaseOptions: [
        {
          value: 'sxctlab',
          label: 'sxctlab',
          description: '高性能向量数据库'
        },
        {
          value: 'elasticsearch',
          label: 'Elasticsearch',
          description: '分布式搜索引擎'
        },
        {
          value: 'faiss',
          label: 'Faiss',
          description: 'Facebook AI 相似性搜索'
        }
      ],
      vectorModelOptions: [
        {
          value: 'bge',
          label: 'bge',
          description: 'BGE 嵌入模型'
        },
        {
          value: 'text-embedding-ada-002',
          label: 'OpenAI Ada',
          description: 'OpenAI 文本嵌入模型'
        },
        {
          value: 'sentence-transformers',
          label: 'Sentence Transformers',
          description: '语句转换器模型'
        }
      ],

      // 示例数据
      exampleKnowledgeBases: [
        {
          id: '1',
          name: '法规服务',
          description: '包含各类法律法规和服务指南',
          documentCount: 10,
          updateTime: '2024-03-20 14:30:00'
        },
        {
          id: '2',
          name: '综改区助手',
          description: '综合改革示范区相关政策和指南',
          documentCount: 15,
          updateTime: '2024-03-19 16:45:00'
        }
      ]
    }
  },
  computed: {
    // 当前页显示的知识库列表
    paginatedKnowledge() {
      return this.knowledgeBases
    },

    // 是否全部选中
    isAllSelected() {
      return this.knowledgeBases.length > 0 && 
             this.selectedKnowledge.length === this.totalCount &&
             this.knowledgeBases.every(knowledge => this.selectedKnowledge.includes(knowledge.id))
    },

    // 是否当前页全部选中
    isCurrentPageSelected() {
      return this.knowledgeBases.length > 0 && 
             this.knowledgeBases.every(knowledge => this.selectedKnowledge.includes(knowledge.id))
    },

    // 排序类型文本
    sortTypeText() {
      const typeText = this.sortType === 'time' ? '按更新时间排序' : '按名称排序'
      return typeText
    }
  },
  created() {
    // 初始化数据
    this.loadKnowledgeData()
  },
  methods: {
    // 加载知识库数据
    async loadKnowledgeData() {
      try {
        this.loading = true
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        this.knowledgeBases = this.exampleKnowledgeBases
        this.totalCount = this.exampleKnowledgeBases.length
      } catch (error) {
        console.error('加载知识库列表失败:', error)
        this.$message.error('加载知识库列表失败')
      } finally {
        this.loading = false
      }
    },

    // 创建知识库
    createKnowledge() {
      this.dialogTitle = '创建知识库'
      this.currentEditKnowledge = null
      this.editForm = {
        name: '',
        vectorDatabase: '',
        vectorModel: '',
        description: ''
      }
      this.editDialogVisible = true
    },

    // 批量删除
    async batchDelete() {
      if (this.selectedKnowledge.length === 0) {
        this.$message.warning('请先选择要删除的知识库')
        return
      }

      try {
        await this.$confirm(`确认删除选中的 ${this.selectedKnowledge.length} 个知识库吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        this.$message.success('删除成功')
        this.selectedKnowledge = []
        await this.loadKnowledgeData()
      } catch (error) {
        this.$message.info('已取消删除')
      }
    },

    // 搜索相关方法
    handleSearchInput() {
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer)
      }
      this.searchDebounceTimer = setTimeout(() => {
        this.handleSearch()
      }, 300)
    },

    handleSearch() {
      this.currentPage = 1
      this.loadKnowledgeData()
    },

    // 刷新数据
    async refreshData() {
      this.searchInput = ''
      this.currentPage = 1
      await this.loadKnowledgeData()
      this.$message.success('数据已刷新')
    },

    // 排序相关
    toggleSort() {
      if (this.sortOrder === 'desc') {
        this.sortOrder = 'asc'
      } else {
        this.sortType = this.sortType === 'time' ? 'name' : 'time'
        this.sortOrder = 'desc'
      }
      this.loadKnowledgeData()
    },

    // 知识库操作
    viewKnowledgeDetail(knowledge) {
      // 跳转到知识库详情页，传递知识库信息
      this.$router.push({
        path: '/system/knowledge-detail',
        query: {
          id: knowledge.id,
          name: knowledge.name
        }
      })
    },

    editKnowledge(knowledge) {
      this.dialogTitle = '编辑知识库'
      this.currentEditKnowledge = knowledge
      this.editForm = {
        name: knowledge.name,
        vectorDatabase: 'sxctlab', // 默认值，实际应从knowledge对象获取
        vectorModel: 'bge', // 默认值，实际应从knowledge对象获取  
        description: knowledge.description
      }
      this.editDialogVisible = true
    },

    async deleteKnowledge(knowledge) {
      try {
        await this.$confirm('确认删除该知识库吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        this.$message.success('删除成功')
        await this.loadKnowledgeData()
      } catch (error) {
        this.$message.info('已取消删除')
      }
    },

    // 分页方法
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.loadKnowledgeData()
    },

    handleCurrentChange(val) {
      this.currentPage = val
      this.loadKnowledgeData()
    },

    // Tooltip相关方法
    showTooltip(event, content) {
      this.tooltipContent = content
      this.tooltipVisible = true
      
      const rect = event.target.getBoundingClientRect()
      let left = rect.left + rect.width / 2 - 150
      let top = rect.top - 60
      
      if (left < 10) left = 10
      if (left + 300 > window.innerWidth) left = window.innerWidth - 310
      if (top < 10) top = rect.bottom + 10
      
      this.tooltipStyle = {
        left: left + 'px',
        top: top + 'px'
      }
    },

    hideTooltip() {
      this.tooltipVisible = false
      this.tooltipContent = ''
    },

    // 选择相关方法
    showCardCheckbox(knowledgeId) {
      this.$set(this.cardHoverStates, knowledgeId, true)
    },

    hideCardCheckbox(knowledgeId) {
      this.$set(this.cardHoverStates, knowledgeId, false)
    },

    handleKnowledgeSelect(knowledgeId, checked) {
      if (checked) {
        if (!this.selectedKnowledge.includes(knowledgeId)) {
          this.selectedKnowledge.push(knowledgeId)
        }
      } else {
        const index = this.selectedKnowledge.indexOf(knowledgeId)
        if (index > -1) {
          this.selectedKnowledge.splice(index, 1)
        }
      }
    },

    selectAll() {
      if (this.isAllSelected) {
        this.selectedKnowledge = []
      } else {
        this.selectedKnowledge = this.knowledgeBases.map(k => k.id)
      }
    },

    selectCurrentPage() {
      if (this.isCurrentPageSelected) {
        const currentPageIds = this.knowledgeBases.map(k => k.id)
        this.selectedKnowledge = this.selectedKnowledge.filter(id => !currentPageIds.includes(id))
      } else {
        const currentPageIds = this.knowledgeBases.map(k => k.id)
        currentPageIds.forEach(id => {
          if (!this.selectedKnowledge.includes(id)) {
            this.selectedKnowledge.push(id)
          }
        })
      }
    },

    // 编辑弹窗相关方法
    handleEditDialogClose() {
      this.editDialogVisible = false
      this.currentEditKnowledge = null
      this.resetEditForm()
    },

    resetEditForm() {
      this.editForm = {
        name: '',
        vectorDatabase: '',
        vectorModel: '',
        description: ''
      }
      this.dialogTitle = '编辑知识库'
      if (this.$refs.editForm) {
        this.$refs.editForm.clearValidate()
      }
    },

    async handleEditSubmit() {
      try {
        const valid = await this.$refs.editForm.validate()
        if (!valid) return

        this.submitLoading = true
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        if (this.currentEditKnowledge) {
          // 编辑模式
          this.$message.success('知识库信息更新成功')
        } else {
          // 创建模式
          this.$message.success('知识库创建成功')
        }
        
        this.editDialogVisible = false
        this.currentEditKnowledge = null
        this.resetEditForm()
        await this.loadKnowledgeData()
        
      } catch (error) {
        const action = this.currentEditKnowledge ? '更新' : '创建'
        console.error(`${action}知识库失败:`, error)
        this.$message.error(`${action}知识库失败`)
      } finally {
        this.submitLoading = false
      }
    }
  }
}
</script>

<style scoped>
.knowledge-base-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.knowledge-base {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 90vh-10px;
}

.page-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  position: relative;
}

.page-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.05) 50%, transparent 100%);
  z-index: 1;
}

.header-section {
  position: relative;
  z-index: 2;
}

.filter-tabs {
  position: relative;
  z-index: 2;
}

.pagination-section {
  position: relative;
  z-index: 2;
}

/* 头部样式 */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  padding: 12px 24px;
  flex-shrink: 0;
  min-height: 30px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
}

.header-left {
  display: flex;
  gap: 8px;
  align-items: center;
}

.header-left .el-button {
  height: 32px;
  padding: 6px 16px;
  font-size: 14px;
  border-radius: 6px;
  font-weight: 500;
}

.header-left .el-button--primary {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4), 0 2px 4px rgba(30, 64, 175, 0.3);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  font-weight: 600;
  letter-spacing: 0.3px;
}

.header-left .el-button--primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s ease;
}

.header-left .el-button--primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #0891b2 100%);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5), 0 4px 8px rgba(30, 64, 175, 0.4);
  transform: translateY(-2px);
}

.header-left .el-button--primary:hover::before {
  left: 100%;
}

.header-left .el-button--primary:active {
  transform: translateY(0px);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
}

.header-left .el-button:not(.el-button--primary) {
  background: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
  transition: all 0.3s ease;
}

.header-left .el-button:not(.el-button--primary):hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
  color: #1e3a8a;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.header-right .el-select,
.header-right .el-input {
  font-size: 14px;
}

.header-right .el-button {
  height: 30px;
  min-width: 30px;
  padding: 0;
  border-radius: 4px;
}

.search-input {
  width: 220px;
}

.search-input .el-input__inner {
  height: 25px;
  line-height: 25px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  font-size: 13px;
}

.action-btn {
  width: 30px;
  height: 30px;
  padding: 0;
  border: 1px solid #dcdfe6;
  background: white;
  color: #606266;
  border-radius: 4px;
}

/* 过滤标签样式 */
.filter-tabs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  padding: 8px 24px;
  flex-shrink: 0;
  min-height: 15px;
}

.filter-tabs .filter-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
}

.filter-tabs .el-button {
  height: 28px;
  padding: 4px 12px;
  font-size: 13px;
  border-radius: 14px;
  font-weight: 400;
  border: none;
  transition: all 0.2s ease;
}

.filter-tabs .el-button--primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
}

.filter-tabs .el-button.is-plain {
  color: #666;
  background: #f5f5f5;
  border: none;
}

.filter-tabs .el-button.is-plain:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #1e40af;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.15);
}

.filter-tabs .el-button--primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%);
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4);
}

.sort-section {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #666;
  font-size: 13px;
}

.sort-section .el-button {
  color: #3b82f6;
}

.sort-section .el-button:hover {
  color: #1d4ed8;
}

/* 知识库卡片网格 */
.knowledge-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px 24px 24px;
  background: linear-gradient(to bottom, #fafafa 0%, #f5f5f5 100%);
}

.knowledge-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 18px;
}

.knowledge-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  aspect-ratio: 4/3;
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: 280px;
  border: 1px solid #f3f4f6;
  position: relative;
  overflow: hidden;
}

.knowledge-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg,
      rgba(30, 64, 175, 0.08) 0%,
      rgba(59, 130, 246, 0.06) 15%,
      rgba(6, 182, 212, 0.07) 33%,
      rgba(30, 64, 175, 0.03) 50%,
      rgba(255, 255, 255, 0.01) 70%,
      rgba(255, 255, 255, 0) 100%);
  border-radius: 12px;
  pointer-events: none;
  z-index: 1;
}

.knowledge-card > * {
  position: relative;
  z-index: 2;
}

.knowledge-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
  cursor: pointer;
}

.knowledge-card:active {
  transform: translateY(-1px);
}

.card-checkbox {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  transition: all 0.2s ease;
}

.card-checkbox >>> .el-checkbox {
  margin: 0;
}

.card-checkbox >>> .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #3b82f6 !important;
  border-color: #3b82f6 !important;
}

.card-checkbox >>> .el-checkbox__inner:hover {
  border-color: #3b82f6 !important;
}

.card-checkbox >>> .el-checkbox__inner {
  width: 18px !important;
  height: 18px !important;
  border: 2px solid #dcdfe6 !important;
  border-radius: 3px !important;
  background: rgba(255, 255, 255, 0.9) !important;
}

.card-checkbox >>> .el-checkbox__inner::after {
  height: 8px !important;
  left: 5px !important;
  top: 1px !important;
  width: 3px !important;
  border: 2px solid #fff !important;
  border-left: 0 !important;
  border-top: 0 !important;
}

.card-header {
  margin-bottom: 8px;
  flex-shrink: 0;
}

.knowledge-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.knowledge-id {
  font-size: 11px;
  background: transparent;
  padding: 0;
  border-radius: 0;
  display: flex;
  align-items: center;
  text-align: left;
  width: 100%;
  position: relative;
}

.id-label {
  color: #3b82f6;
  font-weight: 500;
  margin-right: 4px;
  background-color: rgba(59, 130, 246, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
}

.id-value {
  color: #9ca3af;
  font-weight: 400;
  flex: 1;
  margin-right: 8px;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-content {
  flex: 1;
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.knowledge-description {
  color: #6b7280;
  font-size: 13px;
  line-height: 1.5;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
  max-height: 39px;
}

.knowledge-tooltip {
  position: fixed !important;
  width: 300px !important;
  max-width: 300px !important;
  padding: 12px 16px !important;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
  border: 2px solid #3b82f6 !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3), 0 2px 8px rgba(30, 64, 175, 0.2) !important;
  color: #1e40af !important;
  font-size: 14px !important;
  font-weight: 400 !important;
  line-height: 1.5 !important;
  white-space: normal !important;
  word-wrap: break-word !important;
  z-index: 999999 !important;
  pointer-events: none !important;
  opacity: 1 !important;
  visibility: visible !important;
}

.knowledge-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
  margin-top: auto;
  margin-bottom: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-start;
}

.label {
  font-size: 12px;
  color: #9ca3af;
  min-width: 60px;
  flex-shrink: 0;
  text-align: left;
}

.value {
  font-size: 12px;
  color: #374151;
}

.card-actions {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  flex-shrink: 0;
  margin-top: 4px;
}

.card-actions .el-button {
  flex: 1;
  min-width: 55px;
  font-size: 12px;
  padding: 6px 8px;
  border-radius: 4px;
  height: 28px;
  background: white !important;
  border: 1px solid #dcdfe6 !important;
  color: #606266 !important;
}

.card-actions .el-button:hover {
  border-color: #3b82f6 !important;
  color: #1e40af !important;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.card-actions .el-button.is-disabled {
  background: #f5f7fa !important;
  border-color: #e4e7ed !important;
  color: #c0c4cc !important;
  cursor: not-allowed !important;
}

.card-actions .el-button.is-disabled:hover {
  background: #f5f7fa !important;
  border-color: #e4e7ed !important;
  color: #c0c4cc !important;
}

/* 分页样式 */
.pagination-section {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  background: white;
  padding: 8px 24px;
  flex-shrink: 0;
  min-height: 48px;
}

/* 覆盖Element UI分页组件样式 */
.pagination-section >>> .el-pagination .el-pager li {
  background: white !important;
  border: 1px solid #dcdfe6 !important;
  color: #606266 !important;
}

.pagination-section >>> .el-pagination .el-pager li:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e40af !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.15);
}

.pagination-section >>> .el-pagination .el-pager li.active {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
  border-color: #3b82f6 !important;
  color: white !important;
  font-weight: 600 !important;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
}

.pagination-section >>> .el-pagination button {
  background: white !important;
  border: 1px solid #dcdfe6 !important;
  color: #606266 !important;
}

.pagination-section >>> .el-pagination button:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e40af !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.15);
}

/* 更强的Element UI样式覆盖 */
.pagination-section >>> .el-pagination .el-pager li.number {
  background-color: white !important;
  border: 1px solid #dcdfe6 !important;
  color: #606266 !important;
}

.pagination-section >>> .el-pagination .el-pager li.number:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e40af !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.15);
}

.pagination-section >>> .el-pagination .el-pager li.number.active {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
  border-color: #3b82f6 !important;
  color: white !important;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
}

.pagination-section >>> .el-pagination .btn-prev,
.pagination-section >>> .el-pagination .btn-next {
  background-color: white !important;
  border: 1px solid #dcdfe6 !important;
  color: #606266 !important;
}

.pagination-section >>> .el-pagination .btn-prev:hover,
.pagination-section >>> .el-pagination .btn-next:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e40af !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.15);
}

.pagination-section >>> .el-pagination .el-select .el-input .el-input__inner {
  border-color: #dcdfe6 !important;
  color: #606266 !important;
}

  .pagination-section >>> .el-pagination .el-select .el-input .el-input__inner:hover {
    border-color: #3b82f6 !important;
  }

  /* 编辑弹窗样式 - 参照 tenantManagement.vue */
  .knowledge-base-wrapper >>> .el-dialog.edit-knowledge-dialog {
    border-radius: 12px !important;
    overflow: hidden !important;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1) !important;
  }

  .knowledge-base-wrapper >>> .el-dialog.edit-knowledge-dialog .el-dialog__header {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
    border-bottom: 1px solid rgba(59, 130, 246, 0.1) !important;
    padding: 16px 20px !important;
  }

  .knowledge-base-wrapper >>> .el-dialog.edit-knowledge-dialog .el-dialog__title {
    color: #1f2937 !important;
    font-weight: 600 !important;
  }

  .knowledge-base-wrapper >>> .el-dialog.edit-knowledge-dialog .el-dialog__close {
    color: #6b7280 !important;
    transition: color 0.3s ease !important;
  }

  .knowledge-base-wrapper >>> .el-dialog.edit-knowledge-dialog .el-dialog__close:hover {
    color: #3b82f6 !important;
  }

  .knowledge-base-wrapper >>> .el-dialog.edit-knowledge-dialog .el-dialog__body {
    padding: 20px !important;
    background: #ffffff !important;
  }

  .knowledge-base-wrapper >>> .el-dialog.edit-knowledge-dialog .el-dialog__footer {
    padding: 10px 20px 20px !important;
    text-align: right !important;
    border-top: 1px solid rgba(59, 130, 246, 0.1) !important;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  }

  /* 表单样式美化 - 与 tenantManagement.vue 保持一致 */
  .knowledge-base-wrapper >>> .el-dialog.edit-knowledge-dialog .el-form-item__label {
    color: #303133 !important;
    font-weight: 500 !important;
  }

  .knowledge-base-wrapper >>> .el-dialog.edit-knowledge-dialog .el-form-item.is-required .el-form-item__label:before {
    content: '*' !important;
    color: #f56c6c !important;
    margin-right: 4px !important;
  }

  .knowledge-base-wrapper >>> .el-dialog.edit-knowledge-dialog .el-input__inner,
  .knowledge-base-wrapper >>> .el-dialog.edit-knowledge-dialog .el-date-editor .el-input__inner,
  .knowledge-base-wrapper >>> .el-dialog.edit-knowledge-dialog .el-select .el-input__inner,
  .knowledge-base-wrapper >>> .el-dialog.edit-knowledge-dialog .el-textarea__inner {
    border: 1px solid #e2e8f0 !important;
    border-radius: 6px !important;
    transition: all 0.3s ease !important;
  }

  .knowledge-base-wrapper >>> .el-dialog.edit-knowledge-dialog .el-input__inner:hover,
  .knowledge-base-wrapper >>> .el-dialog.edit-knowledge-dialog .el-date-editor .el-input__inner:hover,
  .knowledge-base-wrapper >>> .el-dialog.edit-knowledge-dialog .el-select .el-input__inner:hover,
  .knowledge-base-wrapper >>> .el-dialog.edit-knowledge-dialog .el-textarea__inner:hover {
    border-color: #3b82f6 !important;
  }

  .knowledge-base-wrapper >>> .el-dialog.edit-knowledge-dialog .el-input__inner:focus,
  .knowledge-base-wrapper >>> .el-dialog.edit-knowledge-dialog .el-date-editor .el-input__inner:focus,
  .knowledge-base-wrapper >>> .el-dialog.edit-knowledge-dialog .el-select .el-input__inner:focus,
  .knowledge-base-wrapper >>> .el-dialog.edit-knowledge-dialog .el-textarea__inner:focus {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
  }

  /* 下拉框样式优化 */
  .knowledge-base-wrapper >>> .el-dialog.edit-knowledge-dialog .el-select-dropdown {
    border: 1px solid #e2e8f0 !important;
    border-radius: 6px !important;
  }

  .select-option {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 4px 0;
  }

  .option-label {
    font-weight: 600;
    color: #303133;
    font-size: 14px;
  }

  .option-desc {
    font-size: 12px;
    color: #909399;
    font-weight: 400;
  }

  /* 弹框内按钮样式 - 与 tenantManagement.vue 完全一致 */
  .knowledge-base-wrapper >>> .el-dialog.edit-knowledge-dialog .el-button--primary {
    background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
    border: none !important;
    box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3) !important;
    color: white !important;
    font-weight: 500 !important;
    transition: all 0.3s ease !important;
    border-radius: 6px !important;
  }

  .knowledge-base-wrapper >>> .el-dialog.edit-knowledge-dialog .el-button--primary:hover {
    background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%) !important;
    box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4) !important;
    transform: translateY(-1px) !important;
  }

  .knowledge-base-wrapper >>> .el-dialog.edit-knowledge-dialog .el-button:not(.el-button--primary) {
    background: white !important;
    border: 1px solid #d1d5db !important;
    color: #4b5563 !important;
    transition: all 0.3s ease !important;
    border-radius: 6px !important;
  }

  .knowledge-base-wrapper >>> .el-dialog.edit-knowledge-dialog .el-button:not(.el-button--primary):hover {
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
    border-color: #3b82f6 !important;
    color: #1e40af !important;
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2) !important;
  }

/* 加载状态和空状态样式 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  width: 100%;
}

.loading-placeholder {
  width: 100%;
  height: 400px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  width: 100%;
  padding: 40px;
}

.empty-state >>> .el-empty__description {
  color: #909399;
  font-size: 14px;
  margin-bottom: 20px;
}

.empty-state >>> .el-empty__image {
  margin-bottom: 20px;
}

/* 响应式设计 */
@media (max-width: 1600px) {
  .knowledge-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1280px) {
  .knowledge-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1024px) {
  .knowledge-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .knowledge-base {
    padding: 10px;
  }

  .page-container {
    height: calc(100vh - 20px);
  }

  .header-section {
    flex-direction: column;
    gap: 10px;
    padding: 10px 16px;
    min-height: auto;
  }

  .header-right {
    flex-wrap: wrap;
  }

  .knowledge-container {
    padding: 16px;
  }

  .knowledge-grid {
    grid-template-columns: 1fr;
  }

  .filter-tabs {
    flex-direction: column;
    gap: 6px;
    padding: 8px 16px;
    min-height: auto;
  }

  .pagination-section {
    padding: 8px 16px;
    min-height: auto;
  }
}
</style> 