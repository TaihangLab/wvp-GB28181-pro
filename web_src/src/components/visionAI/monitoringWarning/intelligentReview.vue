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
        height="620px"
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
              active-color="#3b82f6" 
              inactive-color="#9ca3af"
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
            <div class="operation-buttons">
              <el-button 
                type="text" 
                size="mini" 
                @click="handleConfig(scope.row)"
                class="operation-btn config-btn">
                配置
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页器 - 简化版 -->
      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
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
    // 简单直接：每次进入页面自动刷新一次（避免状态污染）
    if (!sessionStorage.getItem('intelligentReviewLoaded')) {
      sessionStorage.setItem('intelligentReviewLoaded', 'true')
      window.location.reload()
      return
    }
    
    this.initData()
  },

  beforeDestroy() {
    // 页面销毁时清除标志
    sessionStorage.removeItem('intelligentReviewLoaded')
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
      this.applyFilters()
    },
    resetSearch() {
      this.searchForm.skillName = ''
      this.currentPage = 1
      this.applyFilters()
    },
    refreshData() {
      this.currentPage = 1
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
    },
    handleCurrentChange(page) {
      this.currentPage = page
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
  background: linear-gradient(to bottom, #fafafa 0%, #f5f5f5 100%);
  min-height: calc(100vh - 100px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.1);
  position: relative;
  overflow: hidden;
}



.page-title {
  margin: 0;
  color: #1e40af;
  font-size: 24px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.main-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #ebeef5;
  position: relative;
  overflow: hidden;
}



.search-section {
  margin-bottom: 0;
  position: relative;
  z-index: 2;
}

.search-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-title h3 {
  margin: 0;
  color: #1e40af;
  font-size: 20px;
  font-weight: 600;
}

.search-actions {
  display: flex;
  gap: 12px;
}

.search-form {
  margin: 0;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 12px;
  border: 1px solid #ebeef5;
  position: relative;
}



.search-form .el-form-item {
  margin-bottom: 0;
}

.search-form .el-form-item__label {
  color: #303133;
  font-weight: 500;
}

.search-form >>> .el-input__inner {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.search-form >>> .el-input__inner:hover {
  border-color: #3b82f6;
}

.search-form >>> .el-input__inner:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.search-form >>> .el-button--primary {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4), 0 2px 4px rgba(30, 64, 175, 0.3);
  position: relative;
  overflow: hidden;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  font-weight: 600;
  letter-spacing: 0.3px;
  border-radius: 8px;
}

.search-form >>> .el-button--primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s ease;
}

.search-form >>> .el-button--primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #0891b2 100%);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5), 0 4px 8px rgba(30, 64, 175, 0.4);
  transform: translateY(-2px);
}

.search-form >>> .el-button--primary:hover::before {
  left: 100%;
}

.search-form >>> .el-button:not(.el-button--primary) {
  background: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.search-form >>> .el-button:not(.el-button--primary):hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
  color: #1e3a8a;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
}

.section-divider {
  margin: 12px 0;
  border-top: 1px solid #ebeef5;
}

.table-section {
  margin-top: 0;
  position: relative;
  z-index: 2;
}

.el-table {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

/* 表格固定高度样式优化 */
.el-table .el-table__body-wrapper {
  overflow-y: auto;
}

.el-table .el-table__header-wrapper {
  position: sticky;
  top: 0;
  z-index: 10;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
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

/* 删除表格内部所有竖线 */
.el-table .el-table__border-left-patch {
  display: none !important;
}

.el-table .el-table__border-right-patch {
  display: none !important;
}

.el-table .el-table__cell {
  border-right: none !important;
}

/* 彻底删除所有竖线边框 */
.intelligent-review-container >>> .el-table td,
.intelligent-review-container >>> .el-table th {
  border-right: none !important;
}

.intelligent-review-container >>> .el-table--border td:first-child,
.intelligent-review-container >>> .el-table--border th:first-child {
  border-left: none !important;
}

.intelligent-review-container >>> .el-table--border {
  border-left: none !important;
  border-right: none !important;
}

.intelligent-review-container >>> .el-table--border::after {
  display: none !important;
}

.intelligent-review-container >>> .el-table--border::before {
  display: none !important;
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
  background-color: #fafafa;
}

/* 表格悬停效果 */
.el-table .el-table__body tr:hover > td {
  background: #f5f7fa !important;
}

/* 表格样式优化 - 确保灰底黑字 */
.intelligent-review-container >>> .el-table th {
  background: #f5f7fa !important;
  color: #303133 !important;
  font-weight: 500 !important;
  border-bottom: 1px solid #ebeef5 !important;
}

.intelligent-review-container >>> .el-table .el-table__header-wrapper th {
  background: #f5f7fa !important;
  color: #303133 !important;
  font-weight: 500 !important;
  border-bottom: 1px solid #ebeef5 !important;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top:10px;
  padding: 10px 0;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.1);
}

/* 分页器科技感蓝色样式 */
.pagination-container >>> .el-pagination {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination-container >>> .el-pagination .el-pager li {
  min-width: 32px;
  height: 32px;
  line-height: 30px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  color: #4b5563;
  margin: 0 3px;
  transition: all 0.3s ease;
  font-size: 13px;
  font-weight: 500;
  position: relative;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
}

.pagination-container >>> .el-pagination .el-pager li::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(30, 64, 175, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.pagination-container >>> .el-pagination .el-pager li:hover {
  border-color: #3b82f6;
  color: #1e40af;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.pagination-container >>> .el-pagination .el-pager li:hover::before {
  opacity: 1;
}

.pagination-container >>> .el-pagination .el-pager li.active {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border-color: #3b82f6;
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.pagination-container >>> .el-pagination .el-pager li.active::before {
  opacity: 0;
}

.pagination-container >>> .el-pagination button {
  min-width: 32px;
  height: 32px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  color: #4b5563;
  margin: 0 3px;
  transition: all 0.3s ease;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
}

.pagination-container >>> .el-pagination button:hover {
  border-color: #3b82f6;
  color: #1e40af;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.pagination-container >>> .el-pagination button:disabled {
  border-color: #e5e7eb;
  color: #9ca3af;
  background: #f9fafb;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.pagination-container >>> .el-pagination button:disabled:hover {
  transform: none;
  box-shadow: none;
}

.pagination-container >>> .el-pagination .el-pagination__total {
  margin-right: 16px;
  color: #1e40af;
  font-size: 14px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(30, 64, 175, 0.1);
}

.pagination-container >>> .el-pagination .el-pagination__sizes {
  margin-right: 16px;
}

.pagination-container >>> .el-pagination .el-pagination__sizes .el-select .el-input {
  width: 110px;
}

.pagination-container >>> .el-pagination .el-pagination__sizes .el-select .el-input .el-input__inner {
  height: 32px;
  line-height: 32px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  color: #4b5563;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
}

.pagination-container >>> .el-pagination .el-pagination__sizes .el-select .el-input .el-input__inner:hover {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.2);
}

.pagination-container >>> .el-pagination .el-pagination__sizes .el-select .el-input .el-input__inner:focus {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.pagination-container >>> .el-pagination .el-pagination__jump {
  margin-left: 16px;
  color: #4b5563;
  font-size: 14px;
  font-weight: 500;
}

.pagination-container >>> .el-pagination .el-pagination__jump .el-input {
  width: 60px;
  margin: 0 8px;
}

.pagination-container >>> .el-pagination .el-pagination__jump .el-input .el-input__inner {
  height: 32px;
  line-height: 32px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  color: #4b5563;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
}

.pagination-container >>> .el-pagination .el-pagination__jump .el-input .el-input__inner:hover {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.2);
}

.pagination-container >>> .el-pagination .el-pagination__jump .el-input .el-input__inner:focus {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.config-form {
  padding: 0;
}

.config-form .el-form-item {
  margin-bottom: 22px;
}

.config-form .el-form-item__label {
  color: #1e40af;
  font-weight: 600;
  font-size: 14px;
  line-height: 32px;
}

.config-form .el-select,
.config-form .el-input {
  width: 100%;
}

.config-form >>> .el-select .el-input__inner {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.config-form >>> .el-select .el-input__inner:hover {
  border-color: #3b82f6;
}

.config-form >>> .el-select .el-input__inner:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* 多选标签样式优化 */
.config-form .el-select .el-tag {
  margin: 2px 4px 2px 0;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #1e40af;
  border-radius: 12px;
  font-weight: 500;
}

.config-form .el-select .el-tag .el-tag__close {
  color: #3b82f6;
  transition: all 0.3s ease;
}

.config-form .el-select .el-tag .el-tag__close:hover {
  background-color: #3b82f6;
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
  color: #3b82f6;
}

.config-form .skill-actions .selected-count {
  color: #909399;
  margin-left: auto;
}

/* 已选技能展示区域样式 */
.config-form .selected-skills-container {
  background: #f5f7fa;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  padding: 16px;
  margin-top: 8px;
  position: relative;
}



.config-form .selected-skills-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #1e40af;
}

.config-form .selected-skills-header .el-icon-collection-tag {
  color: #3b82f6;
  font-size: 16px;
}

.config-form .selected-skills-list {
  max-height: 120px;
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: white;
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
  background: rgba(59, 130, 246, 0.5);
  border-radius: 3px;
}

.config-form .selected-skills-list::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.7);
}

.config-form .skill-tag {
  display: inline-flex;
  align-items: center;
  border-radius: 16px;
  padding: 1px 6px;
  font-size: 11px;
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
  border-radius: 8px;
  transition: all 0.3s ease;
}

.dialog-footer .el-button--primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border: none;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
  color: white;
  font-weight: 500;
}

.dialog-footer .el-button--primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%);
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

.dialog-footer .el-button:not(.el-button--primary) {
  background: white;
  border: 1px solid #d1d5db;
  color: #4b5563;
}

.dialog-footer .el-button:not(.el-button--primary):hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
  color: #1e40af;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.el-tag {
  border-radius: 12px;
  font-weight: 500;
}

.el-tag--info {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-color: rgba(107, 114, 128, 0.3);
  color: #374151;
}

/* 操作按钮样式 */
.operation-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.operation-btn {
  padding: 4px 8px !important;
  font-size: 12px !important;
  line-height: 1.2 !important;
  border-radius: 4px !important;
  min-width: 40px !important;
  height: 24px !important;
  transition: all 0.3s ease !important;
}

.operation-btn.config-btn {
  color: #606266 !important;
  border: 1px solid #dcdfe6 !important;
  background: transparent !important;
}

.operation-btn.config-btn:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e40af !important;
}

/* 按钮样式 */
.el-button--mini {
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.el-button--primary.el-button--mini {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border: none;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
  color: white;
}

.el-button--primary.el-button--mini:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

/* 开关样式 */
.el-switch {
  transform: scale(0.9);
}

.el-switch >>> .el-switch__core {
  background-color: #dcdfe6;
  border-color: #dcdfe6;
  transition: all 0.3s ease;
}

.el-switch >>> .is-checked .el-switch__core {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-color: #10b981;
}

/* 滑块样式 */
.el-slider {
  margin: 10px 0;
}

.el-slider >>> .el-slider__runway {
  border-radius: 10px;
  background-color: #e5e7eb;
}

.el-slider >>> .el-slider__bar {
  background: linear-gradient(90deg, #3b82f6, #1e40af);
  border-radius: 10px;
}

.el-slider >>> .el-slider__button {
  border: 2px solid #3b82f6;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
}

/* 弹框样式 - 与 warningManagement.vue 一致 */
.intelligent-review-container >>> .el-dialog {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.intelligent-review-container >>> .el-dialog__header {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1) !important;
  padding: 16px 20px !important;
  position: relative;
}



.intelligent-review-container >>> .el-dialog__title {
  color: #1e40af !important;
  font-weight: 600 !important;
}

.intelligent-review-container >>> .el-dialog__close {
  color: #6b7280 !important;
  transition: color 0.3s ease !important;
}

.intelligent-review-container >>> .el-dialog__close:hover {
  color: #3b82f6 !important;
}

/* 弹框内容样式 */
.intelligent-review-container >>> .el-dialog__body {
  padding: 20px !important;
  background: #ffffff !important;
}

.intelligent-review-container >>> .el-dialog__footer {
  padding: 10px 20px 20px 20px !important;
  border-top: 1px solid rgba(59, 130, 246, 0.1) !important;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
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
    padding: 16px 12px;
    margin-left: -12px;
    margin-right: -12px;
    border-radius: 8px;
  }
  
  .pagination-container >>> .el-pagination {
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }
  
  .pagination-container >>> .el-pagination .el-pager li {
    min-width: 28px;
    height: 28px;
    line-height: 26px;
    font-size: 12px;
    margin: 0 1px;
  }
  
  .pagination-container >>> .el-pagination button {
    min-width: 28px;
    height: 28px;
    font-size: 12px;
    margin: 0 1px;
  }
  
  .pagination-container >>> .el-pagination .el-pagination__total {
    margin: 4px 8px 4px 0;
    font-size: 12px;
  }
  
  .pagination-container >>> .el-pagination .el-pagination__sizes {
    margin: 4px 8px;
  }
  
  .pagination-container >>> .el-pagination .el-pagination__sizes .el-select .el-input {
    width: 90px;
  }
  
  .pagination-container >>> .el-pagination .el-pagination__sizes .el-select .el-input .el-input__inner {
    height: 28px;
    line-height: 28px;
    font-size: 12px;
  }
  
  .pagination-container >>> .el-pagination .el-pagination__jump {
    margin: 4px 0 4px 8px;
    font-size: 12px;
  }
  
  .pagination-container >>> .el-pagination .el-pagination__jump .el-input {
    width: 45px;
    margin: 0 6px;
  }
  
  .pagination-container >>> .el-pagination .el-pagination__jump .el-input .el-input__inner {
    height: 28px;
    line-height: 28px;
    font-size: 12px;
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
  color: #1e40af;
}

.config-dialog .el-dialog__body {
  padding: 10px 20px 20px 20px;
}

.config-dialog .el-dialog__footer {
  padding: 10px 20px 20px 20px;
  border-top: 1px solid rgba(59, 130, 246, 0.1);
}

.cost-notice {
  background: linear-gradient(135deg, #ecf5ff 0%, #dbeafe 100%);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.cost-notice .el-icon-info {
  color: #3b82f6;
  margin-right: 8px;
  margin-top: 2px;
  font-size: 16px;
}

.link-text {
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.3s ease;
}

.link-text:hover {
  text-decoration: underline;
  color: #1e40af;
}
</style> 