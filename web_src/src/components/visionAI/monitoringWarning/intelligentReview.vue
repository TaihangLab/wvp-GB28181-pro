<template>
  <div class="intelligent-review-container">
    <!-- 主内容卡片 -->
    <div class="main-card">
      <!-- 搜索区域 -->
      <div class="search-section">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="技能名称">
            <el-input 
              v-model="searchForm.skillName" 
              placeholder="请输入技能名称检索" 
              clearable 
              style="width: 200px;"
              @keyup.enter.native="handleSearch">
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
            <el-button icon="el-icon-refresh" @click="refreshData">刷新</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 分隔线 -->
      <el-divider class="section-divider"></el-divider>

      <!-- 数据表格区域 -->
      <div class="table-section">
      <el-table 
        :data="tableData" 
        v-loading="loading" 
        stripe 
        border 
        height="616px"
        style="width: 100%"
        row-key="id">
        
        <el-table-column prop="skillName" label="技能名称" width="350" align="center">
        </el-table-column>
        
        <el-table-column prop="skillType" label="技能类型" width="120" align="center">
        </el-table-column>
        
        <el-table-column prop="status" label="启用状态" width="100" align="center">
          <template slot-scope="scope">
            <el-switch 
              v-model="scope.row.status" 
              active-color="#13ce66" 
              inactive-color="#ff4949"
              @change="handleStatusChange(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        
        <el-table-column prop="environment" label="适用环境" align="center">
        </el-table-column>
        
        <el-table-column prop="reviewTaskCount" label="复判任务数" width="120" align="center">
          <template slot-scope="scope">
            <el-tag type="info">{{ scope.row.reviewTaskCount }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button 
              type="primary" 
              size="mini" 
              @click="handleConfig(scope.row)">
              配置
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页器 -->
      <div class="pagination-container">
        <div class="pagination-info">
          <span class="data-summary">
            共 <strong>{{ total }}</strong> 条数据，
            当前显示第 <strong>{{ (currentPage - 1) * pageSize + 1 }}</strong> - 
            <strong>{{ Math.min(currentPage * pageSize, total) }}</strong> 条，
            共 <strong>{{ Math.ceil(total / pageSize) }}</strong> 页
          </span>
        </div>
        
        <div class="pagination-controls">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next"
            :total="total">
          </el-pagination>
          
          <div class="jump-controls">
            <span>跳至</span>
            <el-input
              v-model="jumpPage"
              size="mini"
              style="width: 60px; margin: 0 8px;"
              @keyup.enter.native="handleJumpToPage"
              :min="1"
              :max="Math.ceil(total / pageSize)"
              type="number"
              placeholder="页码">
            </el-input>
            <span>页</span>
            <el-button 
              type="primary" 
              size="mini" 
              @click="handleJumpToPage"
              :disabled="!jumpPage || jumpPage < 1 || jumpPage > Math.ceil(total / pageSize)">
              GO
            </el-button>
            <el-button 
              type="text" 
              size="mini" 
              @click="goToLastPage"
              style="margin-left: 12px;">
              末页
            </el-button>
          </div>
        </div>
      </div>
      </div>
    </div>

    <!-- 配置对话框 -->
    <el-dialog 
      :title="`配置复判任务（${configForm.skillName}）`"
      :visible.sync="configDialogVisible" 
      width="40%"
      :close-on-click-modal="false"
      class="config-dialog">
      
      <div class="config-form">
        <el-form :model="configForm" ref="configForm" label-width="100px">
          <el-form-item label="技能选择：">
            <div class="select-wrapper">
              <el-select 
                v-model="configForm.selectedSkill" 
                placeholder="请选择技能"
                style="width: 100%;"
                multiple
                collapse-tags
                filterable
                :max-collapse-tags="3">
                <el-option 
                  v-for="skill in allSkillOptions" 
                  :key="skill.id" 
                  :label="skill.skillName" 
                  :value="skill.skillName">
                </el-option>
              </el-select>
              <i 
                v-if="configForm.selectedSkill.length > 0"
                class="el-icon-circle-close clear-icon"
                @click="clearAllSkills"
                title="清空所有选择">
              </i>
            </div>
          </el-form-item>
          
          <!-- 已选技能展示区域 -->
          <el-form-item label="" v-if="configForm.selectedSkill.length > 0">
            <div class="selected-skills-container">
              <div class="selected-skills-list">
                <div 
                  v-for="(skill, index) in configForm.selectedSkill" 
                  :key="skill"
                  class="skill-tag"
                  :style="getSkillTagStyle(skill)">
                  <span class="skill-name">{{ skill }}</span>
                  <i 
                    class="el-icon-close remove-icon"
                    @click="removeSkill(index)">
                  </i>
                </div>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="configDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveConfig">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'IntelligentReview',
  data() {
    return {
      loading: false,
      searchForm: {
        skillName: ''
      },
      // 全量数据存储
      allData: [],
      // 过滤后的数据（用于搜索）
      filteredData: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
      configDialogVisible: false,
      configForm: {
        skillName: '',
        selectedSkill: [],
        threshold: 50,
        frequency: 'realtime',
        autoReview: true
      },
      jumpPage: '',
      allSkillOptions: []
    }
  },
  computed: {
    // 当前页面显示的数据
    tableData() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      const result = this.filteredData.slice(start, end)
      
      // 开发环境下的调试信息
      if (process.env.NODE_ENV === 'development') {
        console.log(`分页信息: 当前页${this.currentPage}, 每页${this.pageSize}条, 总共${this.total}条`)
        console.log(`显示范围: ${start + 1}-${Math.min(end, this.total)}, 实际返回${result.length}条数据`)
      }
      
      return result
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
    // 初始化数据
    initData() {
      // 矿山安全智能技能基础数据
      const baseData = [
        {
          skillName: '安全帽佩戴检测',
          skillType: '计算机视觉',
          status: true,
          environment: '检测工作人员是否正确佩戴安全帽，识别未佩戴或佩戴不规范的情况，确保作业安全',
          reviewTaskCount: 45,
          id: 1
        },
        {
          skillName: '工作服规范检测',
          skillType: '计算机视觉',
          status: true,
          environment: '识别工作人员是否按规定穿着工作服，检测服装颜色、款式是否符合安全规范',
          reviewTaskCount: 32,
          id: 2
        },
        {
          skillName: '烟火检测预警',
          skillType: '多模态大模型',
          status: true,
          environment: '实时监测作业区域烟火情况，检测吸烟行为和火源，预防火灾事故发生',
          reviewTaskCount: 28,
          id: 3
        },
        {
          skillName: '车辆违规检测',
          skillType: '计算机视觉',
          status: false,
          environment: '监控厂区车辆是否按规定路线行驶，检测违规停车、超速等行为',
          reviewTaskCount: 0,
          id: 4
        },
        {
          skillName: '人员闯入检测',
          skillType: '深度学习',
          status: true,
          environment: '监测危险区域是否有人员违规闯入，保障作业区域安全',
          reviewTaskCount: 18,
          id: 5
        },
        {
          skillName: '设备异常状态识别',
          skillType: '多模态大模型',
          status: true,
          environment: '识别生产设备运行状态，检测设备异常、故障等情况，及时预警',
          reviewTaskCount: 67,
          id: 6
        },
        {
          skillName: '危险操作行为检测',
          skillType: '行为识别',
          status: true,
          environment: '识别工作人员的危险操作行为，如违规作业、不安全姿势等',
          reviewTaskCount: 23,
          id: 7
        },
        {
          skillName: '有毒气体泄漏检测',
          skillType: '多模态大模型',
          status: false,
          environment: '检测作业环境中有毒有害气体泄漏情况，及时发出预警信号',
          reviewTaskCount: 0,
          id: 8
        },
        {
          skillName: '防护设备完整性检查',
          skillType: '计算机视觉',
          status: true,
          environment: '检查安全防护设备的完整性和有效性，确保防护措施到位',
          reviewTaskCount: 15,
          id: 9
        },
        {
          skillName: '作业区域人员统计',
          skillType: '深度学习',
          status: true,
          environment: '统计作业区域人员数量，监控人员分布情况，防止人员聚集',
          reviewTaskCount: 41,
          id: 10
        }
      ]
      
      // 生成119条矿山安全智能技能数据
      this.allData = []
      const skillTypes = ['计算机视觉', '深度学习', '多模态大模型', '行为识别', '机器学习', '神经网络']
      const miningSkills = [
        '安全帽佩戴检测', '工作服规范检测', '烟火检测预警', '车辆违规检测', '人员闯入检测',
        '设备异常状态识别', '危险操作行为检测', '有毒气体泄漏检测', '防护设备完整性检查', '作业区域人员统计',
        '矿井通风状态监测', '地下水位监控', '瓦斯浓度检测', '粉尘浓度监测', '噪声等级检测',
        '照明系统检查', '应急通道畅通检测', '消防设施状态检查', '电气设备安全检测', '提升设备运行监控',
        '支护结构稳定性检测', '巷道变形监测', '采煤工作面安全检查', '爆破作业安全监控', '运输带状态检测',
        '井下作业人员定位', '特种作业人员资质检查', '违章指挥行为识别', '疲劳作业检测', '酒精检测',
        '高空作业安全检查', '密闭空间作业监控', '动火作业安全检测', '临时用电安全检查', '吊装作业安全监控'
      ]
      
      const environments = [
        '检测工作人员安全防护用品佩戴情况，确保符合安全作业标准',
        '监控作业区域安全状况，识别潜在安全隐患并及时预警',
        '实时分析作业环境参数，检测异常情况并发出警报',
        '识别违规操作行为，预防安全事故发生',
        '监测设备运行状态，及时发现故障隐患',
        '检查安全防护措施完整性，确保作业安全',
        '分析作业人员行为规范性，识别危险操作',
        '监控环境安全参数，预防职业病危害',
        '检测作业区域人员分布，防止违规聚集',
        '识别特殊作业安全要求，确保规范操作'
      ]
      
      for (let i = 0; i < 119; i++) {
        if (i < baseData.length) {
          this.allData.push({ ...baseData[i] })
        } else {
          this.allData.push({
            skillName: miningSkills[i % miningSkills.length],
            skillType: skillTypes[i % skillTypes.length],
            status: Math.random() > 0.3, // 70%概率启用
            environment: environments[i % environments.length],
            reviewTaskCount: Math.floor(Math.random() * 100),
            id: i + 1
          })
        }
      }
      
      this.allSkillOptions = this.allData.map(item => ({
        id: item.id,
        skillName: item.skillName
      }))
      
      this.loadData()
    },
    
    loadData() {
      this.loading = true
      // 模拟异步加载数据
      setTimeout(() => {
        this.applyFilters()
        this.loading = false
      }, 500)
    },
    
    // 应用搜索过滤
    applyFilters() {
      let filtered = [...this.allData]
      
      // 根据技能名称搜索
      if (this.searchForm.skillName) {
        filtered = filtered.filter(item => 
          item.skillName.toLowerCase().includes(this.searchForm.skillName.toLowerCase())
        )
      }
      
      this.filteredData = filtered
      this.total = filtered.length
      
      // 如果当前页超出范围，重置到第一页
      const maxPage = Math.ceil(this.total / this.pageSize)
      if (this.currentPage > maxPage && maxPage > 0) {
        this.currentPage = 1
      }
    },
    handleSearch() {
      console.log('搜索技能:', this.searchForm.skillName)
      this.currentPage = 1
      this.jumpPage = ''
      this.applyFilters()
    },
    resetSearch() {
      this.searchForm.skillName = ''
      this.currentPage = 1
      this.jumpPage = ''
      this.applyFilters()
    },
    refreshData() {
      this.currentPage = 1
      this.jumpPage = ''
      this.loadData()
    },
    handleStatusChange(row) {
      console.log('状态变更:', row.skillName, row.status)
      
      // 更新对应的数据
      const index = this.allData.findIndex(item => item.id === row.id)
      if (index !== -1) {
        this.allData[index].status = row.status
      }
    },
    handleConfig(row) {
      this.configForm = {
        skillName: row.skillName,
        selectedSkill: [row.skillName],
        threshold: 50,
        frequency: 'realtime',
        autoReview: row.status
      }
      this.configDialogVisible = true
    },
    saveConfig() {
      if (!this.configForm.selectedSkill || this.configForm.selectedSkill.length === 0) {
        this.$message.warning('请至少选择一个技能')
        return
      }
      
      console.log('保存配置:', this.configForm)
      const skillCount = this.configForm.selectedSkill.length
      const skillNames = this.configForm.selectedSkill.join('、')
      this.configDialogVisible = false
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.jumpPage = ''
    },
    handleCurrentChange(page) {
      this.currentPage = page
      this.jumpPage = ''
    },
    goToLastPage() {
      const lastPage = Math.ceil(this.total / this.pageSize)
      if (this.currentPage === lastPage) {
        this.$message.info('已在最后一页')
        return
      }
      this.currentPage = lastPage
    },
    handleJumpToPage() {
      const page = parseInt(this.jumpPage)
      const maxPage = Math.ceil(this.total / this.pageSize)
      
      if (!this.jumpPage) {
        this.$message.warning('请输入页码')
        return
      }
      
      if (page < 1 || page > maxPage) {
        this.$message.warning(`页码范围应在 1-${maxPage} 之间`)
        return
      }
      
      if (page === this.currentPage) {
        this.$message.info('已在当前页面')
        return
      }
      
      this.currentPage = page
      this.jumpPage = ''
    },
    selectAllSkills() {
      this.configForm.selectedSkill = this.allSkillOptions.map(skill => skill.skillName)
    },
    clearAllSkills() {
      this.configForm.selectedSkill = []
    },

    removeSkill(index) {
      this.configForm.selectedSkill.splice(index, 1)
    },

    getSkillTagStyle(skill) {
      // 多巴胺风格的明亮配色
      const colors = [
        { bg: '#FF6B6B', border: '#FF6B6B', text: '#FFFFFF' }, // 珊瑚红
        { bg: '#4ECDC4', border: '#4ECDC4', text: '#FFFFFF' }, // 青绿色
        { bg: '#45B7D1', border: '#45B7D1', text: '#FFFFFF' }, // 天蓝色
        { bg: '#96CEB4', border: '#96CEB4', text: '#FFFFFF' }, // 薄荷绿
        { bg: '#FFEAA7', border: '#FFEAA7', text: '#2D3436' }, // 明黄色
        { bg: '#DDA0DD', border: '#DDA0DD', text: '#FFFFFF' }, // 粉紫色
        { bg: '#98D8C8', border: '#98D8C8', text: '#FFFFFF' }, // 海绿色
        { bg: '#F7DC6F', border: '#F7DC6F', text: '#2D3436' }, // 柠檬黄
        { bg: '#BB8FCE', border: '#BB8FCE', text: '#FFFFFF' }, // 紫罗兰
        { bg: '#85C1E9', border: '#85C1E9', text: '#FFFFFF' }, // 淡蓝色
        { bg: '#F8C471', border: '#F8C471', text: '#2D3436' }, // 橙黄色
        { bg: '#82E0AA', border: '#82E0AA', text: '#FFFFFF' }, // 翠绿色
        { bg: '#F1948A', border: '#F1948A', text: '#FFFFFF' }, // 粉红色
        { bg: '#AED6F1', border: '#AED6F1', text: '#2D3436' }, // 浅蓝色
        { bg: '#A9DFBF', border: '#A9DFBF', text: '#FFFFFF' }  // 浅绿色
      ]
      
      // 根据技能名称计算哈希值来确保相同技能总是相同颜色
      let hash = 0
      for (let i = 0; i < skill.length; i++) {
        hash = skill.charCodeAt(i) + ((hash << 5) - hash)
      }
      const colorIndex = Math.abs(hash) % colors.length
      const selectedColor = colors[colorIndex]
      
      return {
        backgroundColor: selectedColor.bg,
        borderColor: selectedColor.border,
        color: selectedColor.text
      }
    }
  }
}
</script>

<style scoped>
.intelligent-review-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 100px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.page-title {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.main-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8eaec;
}

.search-section {
  margin-bottom: 0;
}

.search-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-title h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
}

.search-actions {
  display: flex;
  gap: 12px;
}

.search-form {
  margin: 0;
  padding: 8px 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e8eaec;
}

.search-form .el-form-item {
  margin-bottom: 0;
}

.search-form .el-form-item__label {
  color: #5a6c7d;
  font-weight: 500;
}

.section-divider {
  margin: 12px 0;
  border-top: 1px solid #e8eaec;
}

.table-section {
  margin-top: 0;
}

.el-table {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e8eaec;
}

/* 表格固定高度样式优化 */
.el-table .el-table__body-wrapper {
  overflow-y: auto;
}

.el-table .el-table__header-wrapper {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #fafafa;
}

/* 删除表格内部竖线，保留横线和外边框 */
.el-table td,
.el-table th {
  border-right: none !important;
}

/* 删除表格的固定列竖线 */
.el-table .el-table__fixed-right::before,
.el-table .el-table__fixed::before {
  background-color: transparent !important;
}

/* 保留表格的外边框 */
.el-table::before {
  height: 0;
}

/* 调整单元格内边距 */
.el-table .cell {
  padding: 0 16px;
}

/* 表格斑马纹样式优化 */
.el-table--striped .el-table__body tr.el-table__row--striped td {
  background-color: #fafbfc;
}

/* 表格悬停效果 */
.el-table .el-table__body tr:hover > td {
  background-color: #f0f9ff !important;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e8eaec;
  background-color: #fafbfc;
  padding: 16px 20px;
  border-radius: 8px;
  margin-left: -24px;
  margin-right: -24px;
  margin-bottom: -24px;
  flex-wrap: wrap;
  gap: 16px;
}

.pagination-info {
  flex: 1;
  min-width: 300px;
}

.data-summary {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.data-summary strong {
  color: #303133;
  font-weight: 600;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.jump-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #606266;
  border-left: 1px solid #e8eaec;
  padding-left: 16px;
}

.config-form {
  padding: 0;
}

.config-form .el-form-item {
  margin-bottom: 22px;
}

.config-form .el-form-item__label {
  color: #606266;
  font-weight: 500;
  font-size: 14px;
  line-height: 32px;
}

.config-form .el-select,
.config-form .el-input {
  width: 100%;
}

/* 多选标签样式优化 */
.config-form .el-select .el-tag {
  margin: 2px 4px 2px 0;
  background-color: #f0f9ff;
  border-color: #b3d8ff;
  color: #409eff;
}

.config-form .el-select .el-tag .el-tag__close {
  color: #409eff;
}

.config-form .el-select .el-tag .el-tag__close:hover {
  background-color: #409eff;
  color: white;
}

/* 多选框高度自适应 */
.config-form .el-select .el-input__inner {
  height: auto;
  min-height: 32px;
  padding: 6px 8px;
}

/* 选择框包装器样式 */
.config-form .select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.config-form .clear-icon {
  position: absolute;
  right: 25px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: #c0c4cc;
  cursor: pointer;
  z-index: 10;
  transition: color 0.2s ease;
  background-color: white;
  border-radius: 50%;
}

.config-form .clear-icon:hover {
  color: #f56c6c;
}

/* 技能操作区域样式 */
.config-form .skill-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  font-size: 12px;
}

.config-form .skill-actions .el-button--text {
  padding: 0;
  font-size: 12px;
  color: #409eff;
}

.config-form .skill-actions .selected-count {
  color: #909399;
  margin-left: auto;
}

/* 已选技能展示区域样式 */
.config-form .selected-skills-container {
  background-color: #f8f9fa;
  border: 1px solid #e8eaec;
  border-radius: 8px;
  padding: 16px;
  margin-top: 8px;
}

.config-form .selected-skills-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.config-form .selected-skills-header .el-icon-collection-tag {
  color: #409eff;
  font-size: 16px;
}

.config-form .selected-skills-list {
  max-height: 120px;
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: white;
}

/* 滚动条美化 */
.config-form .selected-skills-list::-webkit-scrollbar {
  width: 6px;
}

.config-form .selected-skills-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.config-form .selected-skills-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.config-form .selected-skills-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.config-form .skill-tag {
  display: inline-flex;
  align-items: center;
  background-color: #f0f9ff;
  border: 2px solid #b3d8ff;
  border-radius: 16px;
  padding: 1px 6px;
  font-size: 11px;
  color: #409eff;
  white-space: nowrap;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 
              0 1px 2px rgba(0, 0, 0, 0.06),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  font-weight: 500;
  line-height: 1.2;
  min-height: 20px;
}

.config-form .skill-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15), 
              0 2px 4px rgba(0, 0, 0, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.config-form .skill-tag:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.config-form .skill-name {
  margin-right: 3px;
  font-weight: 500;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

.config-form .remove-icon {
  font-size: 9px;
  color: inherit;
  cursor: pointer;
  border-radius: 50%;
  width: 12px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0.8;
  background-color: rgba(255, 255, 255, 0.2);
  margin-left: 1px;
}

.config-form .remove-icon:hover {
  background-color: rgba(255, 255, 255, 0.3);
  opacity: 1;
  transform: scale(1.1);
}

.config-form .el-slider {
  margin: 16px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-footer .el-button {
  padding: 8px 20px;
  font-size: 14px;
}

.dialog-footer .el-button--primary {
  background-color: #409eff;
  border-color: #409eff;
}

/* 表格样式优化 */
.el-table .el-table__header-wrapper th {
  background-color: #fafafa;
  color: #303133;
  font-weight: 600;
}

.el-tag {
  border-radius: 12px;
  font-weight: 500;
}

/* 按钮样式 */
.el-button--mini {
  border-radius: 4px;
  font-weight: 500;
}

/* 开关样式 */
.el-switch {
  transform: scale(0.9);
}

/* 滑块样式 */
.el-slider {
  margin: 10px 0;
}

.el-slider__runway {
  border-radius: 10px;
}

.el-slider__bar {
  background: linear-gradient(90deg, #409eff, #67c23a);
  border-radius: 10px;
}

.el-slider__button {
  border: 2px solid #409eff;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .intelligent-review-container {
    padding: 12px;
  }
  
  .main-card {
    padding: 16px;
    border-radius: 8px;
  }
  
  .search-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .search-title h3 {
    font-size: 18px;
  }
  
  .search-form {
    flex-direction: column;
  }
  
  .el-form-item {
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .pagination-container {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .pagination-info {
    min-width: auto;
    text-align: center;
  }
  
  .pagination-controls {
    flex-direction: column;
    gap: 12px;
  }
  
  .jump-controls {
    justify-content: center;
    border-left: none;
    border-top: 1px solid #e8eaec;
    padding-left: 0;
    padding-top: 12px;
  }
  
  /* 移动端技能展示区域适配 */
  .config-form .selected-skills-list {
    max-height: 100px;
    gap: 4px;
    padding: 6px;
  }
  
  .config-form .skill-tag {
    font-size: 10px;
    padding: 1px 5px;
    min-height: 18px;
    border-radius: 14px;
  }
  
  .config-form .skill-name {
    margin-right: 2px;
  }
  
  .config-form .remove-icon {
    width: 10px;
    height: 10px;
    font-size: 8px;
  }
  
  /* 移动端技能展示区域适配 */
  .config-form .clear-icon {
    right: 20px;
    font-size: 12px;
  }
}

.config-dialog .el-dialog__header {
  padding: 20px 20px 10px 20px;
  border-bottom: none;
}

.config-dialog .el-dialog__title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.config-dialog .el-dialog__body {
  padding: 10px 20px 20px 20px;
}

.config-dialog .el-dialog__footer {
  padding: 10px 20px 20px 20px;
  border-top: 1px solid #e8eaec;
}

.cost-notice {
  background-color: #ecf5ff;
  border: 1px solid #b3d8ff;
  border-radius: 4px;
  padding: 12px 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.cost-notice .el-icon-info {
  color: #409eff;
  margin-right: 8px;
  margin-top: 2px;
  font-size: 16px;
}

.link-text {
  color: #409eff;
  text-decoration: none;
}

.link-text:hover {
  text-decoration: underline;
}
</style> 