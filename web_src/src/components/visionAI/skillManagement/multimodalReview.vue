<template>
  <div class="multimodal-review-wrapper">
    <div class="multimodal-review">
      <div class="page-container">
      <!-- 头部操作区域 -->
      <div class="header-section">
        <div class="header-left">
          <el-button type="primary" icon="el-icon-plus" @click="createSkill">
            创建技能
          </el-button>
          <el-button @click="batchImport">
            批量删除
          </el-button>
        </div>

        <div class="header-right">
                  <el-select v-model="selectedProvider" placeholder="请选择技能状态" class="select-provider" clearable @change="handleFilter">
          <el-option label="已上线" value="online"></el-option>
          <el-option label="未上线" value="offline"></el-option>
        </el-select>
        
        <el-select v-model="selectedCategory" placeholder="请选择技能分类" class="select-category" clearable @change="handleFilter">
          <el-option label="事件检测" value="事件检测"></el-option>
          <el-option label="安全" value="安全"></el-option>
          <el-option label="质量总站测试-功能" value="质量总站测试-功能"></el-option>
        </el-select>

          <el-input v-model="searchInput" placeholder="请输入技能名称搜索" class="search-input" @keyup.enter="handleSearch">
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

      <!-- 技能卡片网格 -->
      <div class="skills-container">
        <div class="skills-grid">
          <div v-for="skill in paginatedSkills" :key="skill.id" 
               class="skill-card"
               @mouseenter="showCardCheckbox(skill.id)"
               @mouseleave="hideCardCheckbox(skill.id)"
               @click="viewSkillDetail(skill)">
            
            <!-- 选择框 -->
            <div v-show="cardHoverStates[skill.id] || selectedSkills.includes(skill.id)" 
                 class="card-checkbox"
                 @click.stop>
              <el-checkbox 
                :value="selectedSkills.includes(skill.id)"
                @input="handleSkillSelect(skill.id, $event)">
              </el-checkbox>
            </div>
            
            <div class="card-header">
              <h3 class="skill-title">{{ skill.name }}</h3>
                          <div class="skill-id" @mouseenter="showCopyButton(skill.id)" @mouseleave="hideCopyButton(skill.id)">
              <span class="id-label">ID</span>
              <span class="id-value">{{ skill.id }}</span>
              <el-button 
                v-show="copyButtonVisible[skill.id]" 
                icon="el-icon-document-copy" 
                class="copy-btn"
                size="mini"
                @click="copyToClipboard(skill.id)">
              </el-button>
            </div>
            </div>

            <div class="card-content">
              <p class="skill-description" 
                 @mouseenter="showTooltip($event, skill.description)" 
                 @mouseleave="hideTooltip">
                {{ skill.description }}
              </p>

              <div class="skill-info">
                <div class="info-row">
                  <span class="label">技能状态</span>
                  <div class="status-indicator">
                    <span class="status-dot" :class="skill.status === 'online' ? 'online' : 'offline'"></span>
                    <span class="status-text">
                      {{ skill.status === 'online' ? '已上线' : '未上线' }}
                    </span>
                  </div>
                </div>

                <div class="info-row">
                  <span class="label">技能分类</span>
                  <el-tag v-for="category in skill.categories" :key="category" size="small" class="category-tag">
                    {{ category }}
                  </el-tag>
                </div>
              </div>
            </div>

            <div class="card-actions" @click.stop>
              <el-button 
                size="small" 
                @click="editSkill(skill)"
                :disabled="skill.status === 'online'"
                :title="skill.status === 'online' ? '已上线技能不可编辑' : '编辑技能'">
                编辑
              </el-button>
              <el-button size="small" @click="toggleSkillStatus(skill)">
                {{ skill.status === 'online' ? '下线' : '上线' }}
              </el-button>
              <el-button size="small" @click="copySkill(skill)">复制</el-button>
              <el-button 
                size="small" 
                @click="deleteSkill(skill)"
                :disabled="skill.status === 'online'"
                :title="skill.status === 'online' ? '已上线技能不可删除' : '删除技能'">
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage"
          :page-sizes="[12, 24, 48, 96]" :page-size="pageSize" :total="totalCount"
          layout="total, sizes, prev, pager, next, jumper" background>
          <template slot="total">
            <span>共 {{ totalCount }} 条数据</span>
          </template>
        </el-pagination>

        <el-button type="primary" class="go-button" @click="goToPage">GO</el-button>
      </div>
    </div>
    
    </div>
    
    <!-- 描述信息悬浮提示框 - 移到最外层 -->
    <div v-show="tooltipVisible" 
         ref="tooltip"
         class="skill-tooltip"
         :style="tooltipStyle">
      {{ tooltipContent }}
    </div>
  </div>
</template>

<script>
import skillDataManager from '@/utils/skillDataManager'

export default {
  name: 'MultimodalReview',
  data() {
    return {
      // 搜索和过滤
      searchInput: '', // 搜索输入框的值
      searchKeyword: '', // 实际执行搜索的关键词
      selectedProvider: '',
      selectedCategory: '',
      sortType: 'time', // 'time' 或 'name'
      sortOrder: 'desc', // 'asc' 或 'desc'

      // 分页
      currentPage: 1,
      pageSize: 12,
      totalCount: 36,

      // 复制按钮显示状态
      copyButtonVisible: {},

      // 选择相关
      selectedSkills: [], // 已选中的技能ID数组
      cardHoverStates: {}, // 卡片悬浮状态

      // tooltip相关
      tooltipVisible: false,
      tooltipContent: '',
      tooltipStyle: {
        left: '0px',
        top: '0px'
      },

      // 技能数据（从数据管理器获取）
      skills: []
    }
  },
  created() {
    // 初始化数据
    this.loadSkillsData()
    
    // 注册数据变化监听器
    this.skillDataListener = (action, data) => {
      this.handleSkillDataChange(action, data)
    }
    skillDataManager.addListener(this.skillDataListener)
  },
  beforeDestroy() {
    // 清理监听器，避免内存泄漏
    if (this.skillDataListener) {
      skillDataManager.removeListener(this.skillDataListener)
    }
  },
  computed: {
    filteredSkills() {
      let filtered = this.skills

      // 关键词搜索
      if (this.searchKeyword) {
        filtered = filtered.filter(skill =>
          skill.name.includes(this.searchKeyword) ||
          skill.description.includes(this.searchKeyword)
        )
      }

      // 技能状态过滤
      if (this.selectedProvider) {
        filtered = filtered.filter(skill => skill.status === this.selectedProvider)
      }

      // 分类过滤
      if (this.selectedCategory) {
        filtered = filtered.filter(skill =>
          skill.categories.includes(this.selectedCategory)
        )
      }

      // 排序
      filtered.sort((a, b) => {
        let comparison = 0
        
        if (this.sortType === 'name') {
          // 按技能名称排序
          comparison = a.name.localeCompare(b.name, 'zh-CN')
        } else {
          // 按创建时间排序（这里用ID作为时间替代，因为ID包含时间戳特征）
          comparison = a.id.localeCompare(b.id)
        }
        
        // 根据排序方向调整结果
        return this.sortOrder === 'desc' ? -comparison : comparison
      })

      // 更新总数
      this.totalCount = filtered.length

      return filtered
    },

    paginatedSkills() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredSkills.slice(start, end)
    },

    // 是否全部选中
    isAllSelected() {
      return this.filteredSkills.length > 0 && 
             this.selectedSkills.length === this.filteredSkills.length &&
             this.filteredSkills.every(skill => this.selectedSkills.includes(skill.id))
    },

    // 是否当前页全部选中
    isCurrentPageSelected() {
      return this.paginatedSkills.length > 0 && 
             this.paginatedSkills.every(skill => this.selectedSkills.includes(skill.id))
    },

    // 排序类型文本
    sortTypeText() {
      const typeText = this.sortType === 'time' ? '按创建时间排序' : '按技能名称排序'
      const orderText = this.sortOrder === 'desc' ? '降序' : '升序'
      return `${typeText}`
    }
  },
  methods: {
    // 数据管理相关方法
    loadSkillsData() {
      // 从数据管理器加载技能数据
      this.skills = skillDataManager.getAllSkills()
      this.totalCount = this.skills.length
    },

    handleSkillDataChange(action, data) {
      // 处理技能数据变化
      switch (action) {
        case 'update':
          // 技能更新时，重新加载数据
          this.loadSkillsData()
          this.$message.success(`技能 "${data.name}" 已更新`)
          break
        case 'add':
          // 新增技能时，重新加载数据
          this.loadSkillsData()
          this.$message.success(`技能 "${data.name}" 已创建`)
          break
        case 'delete':
          // 删除技能时，重新加载数据
          this.loadSkillsData()
          this.$message.success(`技能 "${data.name}" 已删除`)
          break
        case 'batchDelete':
          // 批量删除时，重新加载数据
          this.loadSkillsData()
          this.$message.success(`已删除 ${data.length} 个技能`)
          break
      }
      
      // 清空选择状态
      this.selectedSkills = []
      
      // 检查当前页是否还有数据，如果没有则回到上一页
      if (this.paginatedSkills.length === 0 && this.currentPage > 1) {
        this.currentPage--
      }
    },

    // 头部操作
    createSkill() {
      this.$router.push({
        path: '/skillManage/multimodalReviewCreate'
      })
    },

    batchImport() {
      if (this.selectedSkills.length === 0) {
        this.$message.warning('请先选择要删除的技能')
        return
      }

      // 检查选中的技能中是否有已上线的技能
      const selectedSkillData = this.skills.filter(skill => this.selectedSkills.includes(skill.id))
      const onlineSkills = selectedSkillData.filter(skill => skill.status === 'online')
      
      if (onlineSkills.length > 0) {
        const onlineSkillNames = onlineSkills.map(skill => skill.name).join('、')
        this.$message.warning(`无法删除已上线的技能：${onlineSkillNames}。请先将这些技能下线后再删除。`)
        return
      }

      this.$confirm(`确认删除选中的 ${this.selectedSkills.length} 个技能吗？此操作不可恢复！`, '批量删除', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 使用数据管理器执行批量删除
        skillDataManager.deleteSkills(this.selectedSkills)
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    handleSearch() {
      this.searchKeyword = this.searchInput.trim()
      this.currentPage = 1
    },

    handleFilter() {
      // 筛选条件改变时重置到第一页
      this.currentPage = 1
    },

    refreshData() {
      // 重置所有搜索和筛选条件
      this.searchInput = ''
      this.searchKeyword = ''
      this.selectedProvider = ''
      this.selectedCategory = ''
      
      // 重置排序
      this.sortType = 'time'
      this.sortOrder = 'desc'
      
      // 重置分页
      this.currentPage = 1
      this.pageSize = 12
      
      // 清空选择状态
      this.selectedSkills = []
      this.cardHoverStates = {}
      this.copyButtonVisible = {}
      
      // 隐藏tooltip
      this.tooltipVisible = false
      this.tooltipContent = ''
      
      // 模拟重新加载数据的过程
      const loading = this.$loading({
        lock: true,
        text: '正在刷新数据...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      
      // 模拟网络请求延迟
      setTimeout(() => {
        loading.close()
        this.$message.success('数据已刷新')
      }, 800)
    },

    // 排序切换
    toggleSort() {
      // 第一次点击：切换排序方向
      if (this.sortOrder === 'desc') {
        this.sortOrder = 'asc'
      } else if (this.sortOrder === 'asc') {
        // 第二次点击：切换排序类型并重置为降序
        this.sortType = this.sortType === 'time' ? 'name' : 'time'
        this.sortOrder = 'desc'
      }
    },

    // 卡片操作
    viewSkillDetail(skill) {
      // 跳转到技能详情页面，传递技能ID
      this.$router.push({
        path: '/skillManage/multimodalReviewCreate',
        query: { 
          id: skill.id,
          mode: 'view' // 表示查看模式
        }
      })
    },

    editSkill(skill) {
      // 检查技能状态，已上线的技能不可编辑
      if (skill.status === 'online') {
        this.$message.warning('已上线的技能不可编辑，请先下线后再编辑')
        return
      }
      
      // 跳转到技能编辑页面，传递技能ID
      this.$router.push({
        path: '/skillManage/multimodalReviewCreate',
        query: { 
          id: skill.id,
          mode: 'edit' // 表示编辑模式
        }
      })
    },

    toggleSkillStatus(skill) {
      const newStatus = skill.status === 'online' ? 'offline' : 'online'
      const updatedSkill = { ...skill, status: newStatus }
      
      // 使用数据管理器更新技能状态
      if (skillDataManager.updateSkill(updatedSkill)) {
        this.$message.success(`${skill.name} 已${newStatus === 'online' ? '上线' : '下线'}`)
      } else {
        this.$message.error('状态更新失败')
      }
    },

    copySkill(skill) {
      // 先显示确认提示框
      this.$confirm(
        `复制后将生成一个新的多模态大技能，技能名称后缀自动+1，请确认操作`,
        '复制多模态大模型复判提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          customClass: 'copy-skill-dialog',
          showClose: true,
          showCancelButton: true,
          closeOnClickModal: false,
          closeOnPressEscape: false
        }
      ).then(() => {
        // 用户确认后执行复制操作
        const newSkillName = this.generateCopySkillName(skill.name)
        
        // 创建新技能对象
        const newSkill = {
          ...skill,
          id: skillDataManager.generateSkillId(), // 生成新的ID
          name: newSkillName,
          status: 'offline' // 复制的技能默认为未上线状态
        }
        
        // 添加到数据管理器
        const addedSkill = skillDataManager.addSkill(newSkill)
        
        if (addedSkill) {
          this.$message.success(`技能 "${skill.name}" 已复制为 "${newSkillName}"`)
        } else {
          this.$message.error('复制失败，请重试')
        }
      }).catch(() => {
        this.$message.info('已取消复制')
      })
    },

    // 生成复制技能的名称
    generateCopySkillName(originalName) {
      // 检查名称是否已经有数字后缀（支持多种格式：技能名1、技能名-1、技能名_1、技能名 1等）
      const numberSuffixMatch = originalName.match(/^(.+?)[-_\s]*(\d+)$/)
      
      if (numberSuffixMatch) {
        // 如果已有数字后缀，递增数字
        const baseName = numberSuffixMatch[1].trim()
        const currentNumber = parseInt(numberSuffixMatch[2])
        return this.findAvailableSkillName(baseName, currentNumber + 1)
      } else {
        // 如果没有数字后缀，添加 "1"
        return this.findAvailableSkillName(originalName.trim(), 1)
      }
    },

    // 查找可用的技能名称（避免重复）
    findAvailableSkillName(baseName, startNumber) {
      let counter = startNumber
      let newName = `${baseName}${counter}`
      
      // 检查名称是否已存在
      while (this.skills.some(skill => skill.name === newName)) {
        counter++
        newName = `${baseName}${counter}`
      }
      
      return newName
    },

    deleteSkill(skill) {
      // 检查技能状态，已上线的技能不可删除
      if (skill.status === 'online') {
        this.$message.warning('已上线的技能不可删除，请先下线后再删除')
        return
      }
      
      this.$confirm('确认删除该技能吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 使用数据管理器删除技能
        if (skillDataManager.deleteSkill(skill.id)) {
          // 删除成功的消息会在handleSkillDataChange中显示
        } else {
          this.$message.error('删除失败')
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    // 分页
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
    },

    handleCurrentChange(val) {
      this.currentPage = val
    },

    goToPage() {
      // 跳转到指定页面逻辑
    },

    // 复制功能
    showCopyButton(skillId) {
      this.$set(this.copyButtonVisible, skillId, true)
    },

    hideCopyButton(skillId) {
      this.$set(this.copyButtonVisible, skillId, false)
    },

    async copyToClipboard(text) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text)
          this.$message.success('ID已复制到剪贴板')
        } else {
          // 兼容旧浏览器
          const textArea = document.createElement('textarea')
          textArea.value = text
          textArea.style.position = 'fixed'
          textArea.style.left = '-999999px'
          textArea.style.top = '-999999px'
          document.body.appendChild(textArea)
          textArea.focus()
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          this.$message.success('ID已复制到剪贴板')
        }
      } catch (err) {
        console.error('复制失败:', err)
        this.$message.error('复制失败，请手动复制')
      }
    },

    // Tooltip相关方法
    showTooltip(event, content) {
      this.tooltipContent = content
      this.tooltipVisible = true
      
      // 先设置一个基本位置
      const rect = event.target.getBoundingClientRect()
      let left = rect.left + rect.width / 2 - 150
      let top = rect.top - 60
      
      // 确保不超出屏幕边界
      if (left < 10) left = 10
      if (left + 300 > window.innerWidth) left = window.innerWidth - 310
      if (top < 10) top = rect.bottom + 10
      
      this.tooltipStyle = {
        left: left + 'px',
        top: top + 'px'
      }
      
      this.$nextTick(() => {
        if (!this.$refs.tooltip) return
        
        const tooltipRect = this.$refs.tooltip.getBoundingClientRect()
        
        // 重新计算精确位置
        let left = rect.left + rect.width / 2 - tooltipRect.width / 2
        let top = rect.top - tooltipRect.height - 8
        
        // 边界检查
        const margin = 10
        if (left < margin) {
          left = margin
        } else if (left + tooltipRect.width > window.innerWidth - margin) {
          left = window.innerWidth - tooltipRect.width - margin
        }
        
        if (top < margin) {
          // 如果上方空间不够，显示在下方
          top = rect.bottom + 8
        }
        
        this.tooltipStyle = {
          left: left + 'px',
          top: top + 'px'
        }
      })
    },

    hideTooltip() {
      this.tooltipVisible = false
      this.tooltipContent = ''
    },

    // 选择相关方法
    showCardCheckbox(skillId) {
      this.$set(this.cardHoverStates, skillId, true)
    },

    hideCardCheckbox(skillId) {
      this.$set(this.cardHoverStates, skillId, false)
    },

    handleSkillSelect(skillId, checked) {
      if (checked) {
        // 选中：添加到已选列表
        if (!this.selectedSkills.includes(skillId)) {
          this.selectedSkills.push(skillId)
        }
      } else {
        // 取消选中：从已选列表移除
        const index = this.selectedSkills.indexOf(skillId)
        if (index > -1) {
          this.selectedSkills.splice(index, 1)
        }
      }
    },

    selectAll() {
      if (this.isAllSelected) {
        // 如果已全选，则取消全选
        this.selectedSkills = []
      } else {
        // 选择所有过滤后的技能
        this.selectedSkills = this.filteredSkills.map(skill => skill.id)
      }
    },

    selectCurrentPage() {
      if (this.isCurrentPageSelected) {
        // 如果当前页已全选，则取消当前页选择
        const currentPageIds = this.paginatedSkills.map(skill => skill.id)
        this.selectedSkills = this.selectedSkills.filter(id => !currentPageIds.includes(id))
      } else {
        // 选择当前页所有技能
        const currentPageIds = this.paginatedSkills.map(skill => skill.id)
        currentPageIds.forEach(id => {
          if (!this.selectedSkills.includes(id)) {
            this.selectedSkills.push(id)
          }
        })
      }
    },


  }
}
</script>

<style scoped>
.multimodal-review-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.multimodal-review {
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

.select-provider,
.select-category {
  width: 180px;
}

.select-provider .el-input__inner,
.select-category .el-input__inner {
  height: 25px;
  line-height: 25px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  font-size: 8px;
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

.view-btn {
  width: 30px;
  height: 30px;
  padding: 0;
  border: 1px solid #dcdfe6;
  background: white;
  color: #606266;
  border-radius: 4px;
}

.view-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.view-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.view-btn.active:hover {
  background: #1d4ed8;
  border-color: #1d4ed8;
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

/* 技能卡片网格 */
.skills-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px 24px 24px;
  background: linear-gradient(to bottom, #fafafa 0%, #f5f5f5 100%);
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.skill-card {
  background: white;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  aspect-ratio: 16/7;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border: 1px solid #f3f4f6;
  position: relative;
  overflow: hidden;
}

.skill-card::before {
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

.skill-card>* {
  position: relative;
  z-index: 2;
}

.skill-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
  cursor: pointer;
}

.skill-card:active {
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
  margin-bottom: 4px;
  flex-shrink: 0;
}

.skill-title {
  font-size: 17px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 6px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.skill-id {
  font-size: 12px;
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
  font-size: 11px;
}

.id-value {
  color: #9ca3af;
  font-weight: 400;
  flex: 1;
  margin-right: 8px;
}

.copy-btn {
  padding: 2px 4px !important;
  min-height: 20px !important;
  height: 20px !important;
  width: 20px !important;
  min-width: 20px !important;
  border: 1px solid rgba(59, 130, 246, 0.1) !important;
  background: rgba(59, 130, 246, 0.05) !important;
  color: rgba(59, 130, 246, 0.4) !important;
  border-radius: 3px !important;
  transition: all 0.2s ease !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin-left: auto !important;
  flex-shrink: 0 !important;
}

.copy-btn:hover {
  border-color: rgba(59, 130, 246, 0.2) !important;
  color: rgba(59, 130, 246, 0.7) !important;
  background: rgba(59, 130, 246, 0.1) !important;
  transform: scale(1.05) !important;
}

.copy-btn:active {
  transform: scale(0.95) !important;
}

.copy-btn .el-icon-document-copy {
  font-size: 12px !important;
}

.card-content {
  flex: 1;
  margin-bottom: 3px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.skill-description {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.4;
  margin: 0 0 6px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
}

.skill-tooltip {
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



.skill-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex-shrink: 0;
  margin-top: auto;
  margin-bottom: 2px;
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

.category-tag {
  margin-right: 4px;
  background-color: #f5f5f5 !important;
  border-color: #e4e7ed !important;
  color: #606266 !important;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.online {
  background-color: #10b981;
}

.status-dot.offline {
  background-color: #6b7280;
}

.status-text {
  font-size: 12px;
  color: #374151;
}

.card-actions {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
  flex-shrink: 0;
  margin-top: 3px;
}

.card-actions .el-button {
  flex: 1;
  min-width: 50px;
  font-size: 11px;
  padding: 5px 8px;
  border-radius: 4px;
  height: 24px;
  margin-bottom: -5px;
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

.go-button {
  min-width: 60px;
  background: white;
  border: 1px solid #dcdfe6;
  color: #606266;
}

.go-button:hover {
  border-color: #3b82f6;
  color: #1e40af;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
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

/* 自定义复制技能确认对话框样式 */
.copy-skill-dialog .el-message-box {
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
  background: white !important;
  min-width: 420px !important;
}

.copy-skill-dialog .el-message-box__header {
  padding: 20px 20px 10px 20px !important;
  border-bottom: none !important;
  position: relative !important;
}

.copy-skill-dialog .el-message-box__title {
  font-size: 16px !important;
  font-weight: 600 !important;
  color: #303133 !important;
  line-height: 22px !important;
  margin-left: 32px !important;
}

.copy-skill-dialog .el-message-box__content {
  padding: 10px 20px 20px 52px !important;
  color: #606266 !important;
  font-size: 14px !important;
  line-height: 20px !important;
}

.copy-skill-dialog .el-message-box__message {
  margin-left: 0 !important;
}

.copy-skill-dialog .el-message-box__status {
  position: absolute !important;
  top: 20px !important;
  left: 20px !important;
  margin: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 22px !important;
  height: 22px !important;
  background-color: #faad14 !important;
  border-radius: 50% !important;
  box-shadow: 0 2px 4px rgba(250, 173, 20, 0.3) !important;
}

.copy-skill-dialog .el-message-box__status .el-icon-warning {
  color: white !important;
  font-size: 14px !important;
  margin: 0 !important;
}

.copy-skill-dialog .el-message-box__btns {
  padding: 10px 20px 20px 20px !important;
  text-align: right !important;
}

.copy-skill-dialog .el-message-box__btns .el-button {
  padding: 8px 20px !important;
  border-radius: 6px !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  margin-left: 12px !important;
}

.copy-skill-dialog .el-message-box__btns .el-button--default {
  color: #606266 !important;
  border-color: #dcdfe6 !important;
  background-color: #ffffff !important;
}

.copy-skill-dialog .el-message-box__btns .el-button--default:hover {
  color: #3b82f6 !important;
  border-color: #3b82f6 !important;
  background-color: #ffffff !important;
}

.copy-skill-dialog .el-message-box__btns .el-button--primary {
  background-color: #409eff !important;
  border-color: #409eff !important;
  color: #ffffff !important;
}

.copy-skill-dialog .el-message-box__btns .el-button--primary:hover {
  background-color: #66b1ff !important;
  border-color: #66b1ff !important;
}

.copy-skill-dialog .el-message-box__close {
  color: #909399 !important;
  font-size: 16px !important;
  top: 15px !important;
  right: 15px !important;
}

.copy-skill-dialog .el-message-box__close:hover {
  color: #606266 !important;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .skills-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1024px) {
  .skills-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .multimodal-review {
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

  .skills-container {
    padding: 16px;
  }

  .skills-grid {
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