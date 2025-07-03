<template>
  <div class="app-settings-container">
    <!-- 只保留顶部标题卡片 -->
    <div class="page-header">
      <h2 class="page-title">应用设置（监测预警）</h2>
    </div>
    
    <!-- 下面内容直接平铺，无main-card卡片包裹 -->
    <div class="settings-tabs">
      <el-tabs type="border-card" class="custom-tabs">
        <el-tab-pane label="技能设置">
          <div class="search-section">
            <el-form :inline="true" class="search-form">
              <el-form-item>
                <el-input
                  placeholder="请输入技能名称搜索"
                  v-model="searchKeyword"
                  class="search-input"
                  suffix-icon="el-icon-search"
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
              :data="filteredSkillList"
              style="width: 100%"
              stripe
              height="500px"
              class="custom-table"
              row-key="id">
              <el-table-column
                prop="skillName"
                label="技能名称"
                width="180"
                align="center">
              </el-table-column>
              <el-table-column
                prop="skillStatus"
                label="技能状态"
                width="100"
                align="center">
                <template slot-scope="scope">
                  <div class="skill-status">
                    <el-switch
                      v-model="scope.row.isEnabled"
                      active-color="#3b82f6">
                    </el-switch>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                prop="deviceCount"
                label="运行设备数/部署数"
                align="center">
              </el-table-column>
              <el-table-column
                prop="callbackPeriod"
                label="预警周期 (s)"
                align="center">
              </el-table-column>
              <el-table-column
                prop="callbackUrl"
                label="回调地址"
                align="center">
              </el-table-column>
              <el-table-column
                label="操作"
                width="120"
                align="center">
                <template slot-scope="scope">
                  <div class="operation-buttons">
                    <el-button
                      size="mini"
                      type="text"
                      @click="handleEdit(scope.row)"
                      class="operation-btn config-btn">更多设置</el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
            
            <!-- 分页器 -->
            <div class="pagination-container">
              <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="currentPage"
                :page-sizes="[10, 20, 30, 50]"
                :page-size="pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="totalSkills">
              </el-pagination>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="预警设置">
          <el-tabs type="card" class="warning-tabs">
            <el-tab-pane label="预警等级">
              <div class="warning-level-settings">
                <div class="settings-desc-card">
                  <p class="settings-desc">为不同等级的预警设置不同的通知方式</p>
                </div>
                <div class="settings-form-card">
                  <el-form :model="warningLevelForm" label-width="120px">
                    <el-form-item label="高级预警">
                      <el-checkbox-group v-model="warningLevelForm.highLevel">
                        <el-checkbox label="短信通知"></el-checkbox>
                        <el-checkbox label="邮件通知"></el-checkbox>
                        <el-checkbox label="系统通知"></el-checkbox>
                        <el-checkbox label="微信通知"></el-checkbox>
                      </el-checkbox-group>
                    </el-form-item>
                    <el-form-item label="中级预警">
                      <el-checkbox-group v-model="warningLevelForm.mediumLevel">
                        <el-checkbox label="短信通知"></el-checkbox>
                        <el-checkbox label="邮件通知"></el-checkbox>
                        <el-checkbox label="系统通知"></el-checkbox>
                        <el-checkbox label="微信通知"></el-checkbox>
                      </el-checkbox-group>
                    </el-form-item>
                    <el-form-item label="低级预警">
                      <el-checkbox-group v-model="warningLevelForm.lowLevel">
                        <el-checkbox label="短信通知"></el-checkbox>
                        <el-checkbox label="邮件通知"></el-checkbox>
                        <el-checkbox label="系统通知"></el-checkbox>
                        <el-checkbox label="微信通知"></el-checkbox>
                      </el-checkbox-group>
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="saveWarningLevelSettings">保存设置</el-button>
                    </el-form-item>
                  </el-form>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="预警合并">
              <div class="warning-merge-settings">
                <div class="settings-desc-card">
                  <p class="settings-desc">对平台预警的展示进行配置，将同一时间段同类型预警合并展示</p>
                </div>
                <div class="settings-form-card">
                  <el-form :model="warningMergeForm" label-width="180px">
                    <el-form-item label="预警合并功能">
                      <el-switch
                        v-model="warningMergeForm.enabled"
                        active-text="开启"
                        inactive-text="关闭"
                        active-color="#3b82f6">
                      </el-switch>
                    </el-form-item>
                    <el-form-item label="预警合并时间(分钟)" v-if="warningMergeForm.enabled">
                      <el-slider
                        v-model="warningMergeForm.mergeTime"
                        :min="1"
                        :max="60"
                        :step="1"
                        show-input>
                      </el-slider>
                    </el-form-item>
                    <el-form-item label="预警合并方式" v-if="warningMergeForm.enabled">
                      <el-radio-group v-model="warningMergeForm.mergeType">
                        <el-radio :label="1">按技能类型合并</el-radio>
                        <el-radio :label="2">按设备合并</el-radio>
                        <el-radio :label="3">按区域合并</el-radio>
                      </el-radio-group>
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="saveWarningMergeSettings">保存设置</el-button>
                    </el-form-item>
                  </el-form>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="预警发布">
              <div class="warning-publish-settings">
                <div class="settings-desc-card">
                  <p class="settings-desc">支持将预警推送至 C 端地图（仅对政府客户开放）</p>
                </div>
                <div class="settings-form-card">
                  <el-form :model="warningPublishForm" label-width="150px">
                    <el-form-item label="预警发布功能">
                      <el-switch
                        v-model="warningPublishForm.enabled"
                        active-text="开启"
                        inactive-text="关闭"
                        active-color="#3b82f6">
                      </el-switch>
                    </el-form-item>
                    <el-form-item label="发布平台" v-if="warningPublishForm.enabled">
                      <el-select v-model="warningPublishForm.platform" placeholder="请选择">
                        <el-option label="政务地图" value="gov_map"></el-option>
                        <el-option label="城市大脑" value="city_brain"></el-option>
                        <el-option label="智慧城市平台" value="smart_city"></el-option>
                      </el-select>
                    </el-form-item>
                    <el-form-item label="API密钥" v-if="warningPublishForm.enabled">
                      <el-input v-model="warningPublishForm.apiKey" placeholder="请输入API密钥"></el-input>
                    </el-form-item>
                    <el-form-item label="发布URL" v-if="warningPublishForm.enabled">
                      <el-input v-model="warningPublishForm.publishUrl" placeholder="请输入发布URL"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="saveWarningPublishSettings">保存设置</el-button>
                    </el-form-item>
                  </el-form>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <!-- 技能设置弹窗 -->
    <el-dialog title="技能详细设置" :visible.sync="dialogVisible" width="40%" class="config-dialog">
      <div class="config-form">
        <el-form :model="currentSkill" label-width="120px">
          <el-form-item label="技能名称">
            <el-input v-model="currentSkill.skillName" disabled></el-input>
          </el-form-item>
          <el-form-item label="技能状态">
            <el-switch
              v-model="currentSkill.isEnabled"
              active-color="#3b82f6">
            </el-switch>
          </el-form-item>
          <el-form-item label="预警周期 (秒)">
            <el-input-number 
              v-model="currentSkill.callbackPeriod" 
              :min="0" 
              :step="1"
              controls-position="right">
            </el-input-number>
          </el-form-item>
          <el-form-item label="回调地址">
            <el-input 
              v-model="currentSkill.callbackUrl" 
              placeholder="请输入回调URL"
              clearable>
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelEdit">取 消</el-button>
        <el-button type="primary" @click="saveSkillSettings">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ApplicationSettings',
  data() {
    return {
      searchKeyword: '',
      currentPage: 1,
      pageSize: 10,
      totalSkills: 0,
      skillList: [
        {
          id: 1,
          skillName: '室内打手机',
          isEnabled: false,
          deviceCount: '-',
          callbackPeriod: '-',
          callbackUrl: '-'
        },
        {
          id: 2,
          skillName: '未穿救生衣',
          isEnabled: false,
          deviceCount: '-',
          callbackPeriod: '-',
          callbackUrl: '-'
        },
        {
          id: 3,
          skillName: '打电话',
          isEnabled: false,
          deviceCount: '-',
          callbackPeriod: '-',
          callbackUrl: '-'
        },
        {
          id: 4,
          skillName: '玩手机',
          isEnabled: false,
          deviceCount: '-',
          callbackPeriod: '-',
          callbackUrl: '-'
        },
        {
          id: 5,
          skillName: '人员徘徊',
          isEnabled: false,
          deviceCount: '-',
          callbackPeriod: '-',
          callbackUrl: '-'
        },
        {
          id: 6,
          skillName: '皮带跑偏',
          isEnabled: true,
          deviceCount: '0/1',
          callbackPeriod: '30',
          callbackUrl: 'http://api.example.com/callback/belt'
        },
        {
          id: 7,
          skillName: '漂浮物检测',
          isEnabled: false,
          deviceCount: '0/1',
          callbackPeriod: '60',
          callbackUrl: 'http://api.example.com/callback/floating'
        },
        {
          id: 8,
          skillName: '游泳检测',
          isEnabled: true,
          deviceCount: '0/1',
          callbackPeriod: '15',
          callbackUrl: 'http://api.example.com/callback/swimming'
        },
        {
          id: 9,
          skillName: '钓鱼检测',
          isEnabled: true,
          deviceCount: '0/1',
          callbackPeriod: '45',
          callbackUrl: 'http://api.example.com/callback/fishing'
        },
        {
          id: 10,
          skillName: '黑臭水体',
          isEnabled: false,
          deviceCount: '0/1',
          callbackPeriod: '120',
          callbackUrl: 'http://api.example.com/callback/water'
        }
      ],
      dialogVisible: false,
      currentSkill: {},
      
      // 预警等级设置
      warningLevelForm: {
        highLevel: ['短信通知', '邮件通知', '系统通知'],
        mediumLevel: ['邮件通知', '系统通知'],
        lowLevel: ['系统通知']
      },
      
      // 预警合并设置
      warningMergeForm: {
        enabled: true,
        mergeTime: 5,
        mergeType: 1
      },
      
      // 预警发布设置
      warningPublishForm: {
        enabled: false,
        platform: '',
        apiKey: '',
        publishUrl: ''
      }
    }
  },
  computed: {
    filteredSkillList() {
      if (!this.searchKeyword) {
        return this.skillList
      }
      return this.skillList.filter(item => 
        item.skillName.toLowerCase().includes(this.searchKeyword.toLowerCase())
      )
    }
  },
  mounted() {
    this.totalSkills = this.skillList.length
  },
  methods: {
    handleSearch() {
      // 搜索逻辑
    },
    refreshData() {
      // 刷新数据逻辑
    },
    handleSizeChange(val) {
      this.pageSize = val
    },
    handleCurrentChange(val) {
      this.currentPage = val
    },
    handleEdit(row) {
      // 深拷贝行数据，避免直接修改列表数据
      this.currentSkill = JSON.parse(JSON.stringify(row))
      
      // 处理预警周期数据
      if (this.currentSkill.callbackPeriod === '-') {
        this.currentSkill.callbackPeriod = 30
      } else if (typeof this.currentSkill.callbackPeriod === 'string') {
        this.currentSkill.callbackPeriod = parseInt(this.currentSkill.callbackPeriod) || 30
      }
      
      // 处理回调地址数据
      if (this.currentSkill.callbackUrl === '-') {
        this.currentSkill.callbackUrl = ''
      }
      
      this.dialogVisible = true
    },
    cancelEdit() {
      this.dialogVisible = false
      this.currentSkill = {}
    },
    saveSkillSettings() {
      // 这里应该添加保存技能设置的API调用
      // 此处模拟API调用
      const index = this.skillList.findIndex(item => item.id === this.currentSkill.id)
      if (index !== -1) {
        // 确保数值类型正确
        if (typeof this.currentSkill.callbackPeriod === 'string' && this.currentSkill.callbackPeriod !== '-') {
          this.currentSkill.callbackPeriod = parseInt(this.currentSkill.callbackPeriod) || 0
        }
        
        // 深拷贝当前编辑的技能对象
        const updatedSkill = JSON.parse(JSON.stringify(this.currentSkill))
        
        // 确保callbackPeriod是字符串类型，与原数据格式一致
        updatedSkill.callbackPeriod = updatedSkill.callbackPeriod.toString()
        
        // 如果回调地址为空，设置为"-"
        if (!updatedSkill.callbackUrl) {
          updatedSkill.callbackUrl = '-'
        }
        
        // 更新列表中的对应项
        this.$set(this.skillList, index, updatedSkill)
        
        // 提示更新成功
        this.$message({
          type: 'success',
          message: '技能设置保存成功'
        })
      } else {
        this.$message({
          type: 'error',
          message: '未找到技能信息，保存失败'
        })
      }
      this.dialogVisible = false
    },
    saveWarningLevelSettings() {
      // 这里应该添加保存预警等级设置的API调用
      this.$message({
        type: 'success',
        message: '预警等级设置保存成功'
      })
    },
    saveWarningMergeSettings() {
      // 这里应该添加保存预警合并设置的API调用
      this.$message({
        type: 'success',
        message: '预警合并设置保存成功'
      })
    },
    saveWarningPublishSettings() {
      // 这里应该添加保存预警发布设置的API调用
      this.$message({
        type: 'success',
        message: '预警发布设置保存成功'
      })
    }
  }
}
</script>

<style scoped>
/* 删除main-card相关样式 */
.app-settings-container {
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
  font-size: 20px;
  font-weight: 600;
}

/* 搜索区域样式 */
.search-section {
  margin-bottom: 0;
  position: relative;
  z-index: 2;
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

.search-input {
  width: 300px;
  margin-right: 10px;
}

/* 分隔线样式 */
.section-divider {
  margin: 12px 0;
  border-top: 1px solid #ebeef5;
}

/* 表格区域样式 */
.table-section {
  margin-top: 0;
  position: relative;
  z-index: 2;
}

/* 表格样式 */
.custom-table {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

/* 删除表格内部竖线，保留横线和外边框 */
.app-settings-container >>> .el-table td,
.app-settings-container >>> .el-table th {
  border-right: none !important;
}

/* 表格标题样式 */
.app-settings-container >>> .el-table th {
  background: #f5f7fa !important;
  color: #303133 !important;
  font-weight: 500 !important;
  border-bottom: 1px solid #ebeef5 !important;
}

/* 表格悬停效果 */
.app-settings-container >>> .el-table .el-table__body tr:hover > td {
  background: #f5f7fa !important;
}

/* 表格斑马纹样式 */
.app-settings-container >>> .el-table--striped .el-table__body tr.el-table__row--striped td {
  background-color: #fafafa;
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
  min-width: 60px !important;
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

/* 分页器样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 10px;
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

.pagination-container >>> .el-pagination .el-pager li:hover {
  border-color: #3b82f6;
  color: #1e40af;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.pagination-container >>> .el-pagination .el-pager li.active {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border-color: #3b82f6;
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
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

/* 标签页样式 */
.custom-tabs {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.custom-tabs >>> .el-tabs__header {
  margin: 0;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
}

.custom-tabs >>> .el-tabs__nav-wrap {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.custom-tabs >>> .el-tabs__item {
  color: #4b5563;
  font-weight: 500;
  transition: all 0.3s ease;
}

.custom-tabs >>> .el-tabs__item:hover {
  color: #3b82f6;
}

.custom-tabs >>> .el-tabs__item.is-active {
  color: #1e40af;
  font-weight: 600;
}

.custom-tabs >>> .el-tabs__active-bar {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  height: 3px;
}

/* 预警设置标签页样式 */
.warning-tabs {
  margin-top: 20px;
}

.warning-tabs >>> .el-tabs__header {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 20px;
}

.warning-tabs >>> .el-tabs__nav-wrap {
  background: transparent;
}

.warning-tabs >>> .el-tabs__nav {
  display: flex !important;
  flex-direction: row !important;
}

.warning-tabs >>> .el-tabs__item {
  height: 44px;
  line-height: 44px;
  font-size: 16px;
  font-weight: 500;
  box-sizing: border-box;
  align-items: center;
  /* 不设置display:flex，保持横向排列 */
}

.warning-tabs >>> .el-tabs__item:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
}

.warning-tabs >>> .el-tabs__item.is-active {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  border-color: #3b82f6;
}

/* 设置区域样式 */
.warning-level-settings,
.warning-merge-settings,
.warning-publish-settings {
  padding: 20px 0;
}

.settings-desc-card {
  background: linear-gradient(135deg, #ecf5ff 0%, #dbeafe 100%);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.settings-desc {
  color: #4b5563;
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.settings-form-card {
  background: white;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 开关样式 */
.skill-status {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.app-settings-container >>> .el-switch__core {
  background-color: #dcdfe6;
  border-color: #dcdfe6;
  transition: all 0.3s ease;
}

.app-settings-container >>> .el-switch.is-checked .el-switch__core {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-color: #10b981;
}

/* 按钮样式 */
.app-settings-container >>> .el-button--primary {
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
  transition: all 0.3s ease;
}

.app-settings-container >>> .el-button--primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #0891b2 100%);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5), 0 4px 8px rgba(30, 64, 175, 0.4);
  transform: translateY(-2px);
}

.app-settings-container >>> .el-button:not(.el-button--primary) {
  background: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.app-settings-container >>> .el-button:not(.el-button--primary):hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
  color: #1e3a8a;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
}

/* 输入框样式 */
.app-settings-container >>> .el-input__inner {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.app-settings-container >>> .el-input__inner:hover {
  border-color: #3b82f6;
}

.app-settings-container >>> .el-input__inner:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* 选择框样式 */
.app-settings-container >>> .el-select .el-input__inner {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.app-settings-container >>> .el-select .el-input__inner:hover {
  border-color: #3b82f6;
}

.app-settings-container >>> .el-select .el-input__inner:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* 复选框样式 */
.app-settings-container >>> .el-checkbox__input.is-checked .el-checkbox__inner {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border-color: #3b82f6;
}

.app-settings-container >>> .el-checkbox__input.is-checked + .el-checkbox__label {
  color: #1e40af;
}

/* 单选框样式 */
.app-settings-container >>> .el-radio__input.is-checked .el-radio__inner {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border-color: #3b82f6;
}

.app-settings-container >>> .el-radio__input.is-checked + .el-radio__label {
  color: #1e40af;
}

/* 滑块样式 */
.app-settings-container >>> .el-slider__runway {
  border-radius: 10px;
  background-color: #e5e7eb;
}

.app-settings-container >>> .el-slider__bar {
  background: linear-gradient(90deg, #3b82f6, #1e40af);
  border-radius: 10px;
}

.app-settings-container >>> .el-slider__button {
  border: 2px solid #3b82f6;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
}

/* 对话框样式 */
.config-dialog >>> .el-dialog {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.config-dialog >>> .el-dialog__header {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1) !important;
  padding: 16px 20px !important;
  position: relative;
}

.config-dialog >>> .el-dialog__title {
  color: #1e40af !important;
  font-weight: 600 !important;
}

.config-dialog >>> .el-dialog__close {
  color: #6b7280 !important;
  transition: color 0.3s ease !important;
}

.config-dialog >>> .el-dialog__close:hover {
  color: #3b82f6 !important;
}

.config-dialog >>> .el-dialog__body {
  padding: 20px !important;
  background: #ffffff !important;
}

.config-dialog >>> .el-dialog__footer {
  padding: 10px 20px 20px 20px !important;
  border-top: 1px solid rgba(59, 130, 246, 0.1) !important;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
}

/* 表单样式 */
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

/* 对话框按钮样式 */
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

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .app-settings-container {
    padding: 12px;
  }
  
  .page-header {
    padding: 12px 16px;
    border-radius: 8px;
  }
  
  .page-title {
    font-size: 18px;
  }
  
  .search-form {
    flex-direction: column;
    padding: 16px;
  }
  
  .search-input {
    width: 100%;
    margin-right: 0;
    margin-bottom: 12px;
  }
  
  .pagination-container {
    padding: 16px 12px;
    margin-left: -12px;
    margin-right: -12px;
    border-radius: 8px;
  }
  
  .settings-desc-card,
  .settings-form-card {
    padding: 16px;
  }
  
  .warning-level-settings,
  .warning-merge-settings,
  .warning-publish-settings {
    padding: 16px 0;
  }
  
  .warning-tabs >>> .el-tabs__item {
    height: 36px;
    line-height: 36px;
    font-size: 14px;
  }
}
</style>
