<template>
  <div class="app-settings-container">
    <div class="page-header">应用设置（监测预警）</div>
    
    <div class="settings-tabs">
      <el-tabs type="border-card">
        <el-tab-pane label="技能设置">
          <div class="search-bar">
            <el-input
              placeholder="请输入技能名称搜索"
              v-model="searchKeyword"
              class="search-input"
              suffix-icon="el-icon-search">
            </el-input>
            <el-button icon="el-icon-refresh" circle></el-button>
          </div>
          
          <el-table
            :data="filteredSkillList"
            style="width: 100%"
            border>
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
                    active-color="#409EFF">
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
                <el-button
                  size="mini"
                  type="text"
                  @click="handleEdit(scope.row)">更多设置</el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="pagination">
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
        </el-tab-pane>
        
        <el-tab-pane label="预警设置">
          <el-tabs type="card">
            <el-tab-pane label="预警等级">
              <div class="warning-level-settings">
                <p class="settings-desc">为不同等级的预警设置不同的通知方式</p>
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
            </el-tab-pane>
            
            <el-tab-pane label="预警合并">
              <div class="warning-merge-settings">
                <p class="settings-desc">对平台预警的展示进行配置，将同一时间段同类型预警合并展示</p>
                <el-form :model="warningMergeForm" label-width="180px">
                  <el-form-item label="预警合并功能">
                    <el-switch
                      v-model="warningMergeForm.enabled"
                      active-text="开启"
                      inactive-text="关闭">
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
            </el-tab-pane>
            
            <el-tab-pane label="预警发布">
              <div class="warning-publish-settings">
                <p class="settings-desc">支持将预警推送至 C 端地图（仅对政府客户开放）</p>
                <el-form :model="warningPublishForm" label-width="150px">
                  <el-form-item label="预警发布功能">
                    <el-switch
                      v-model="warningPublishForm.enabled"
                      active-text="开启"
                      inactive-text="关闭">
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
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <!-- 技能设置弹窗 -->
    <el-dialog title="技能详细设置" :visible.sync="dialogVisible" width="40%">
      <el-form :model="currentSkill" label-width="120px">
        <el-form-item label="技能名称">
          <el-input v-model="currentSkill.skillName" disabled></el-input>
        </el-form-item>
        <el-form-item label="技能状态">
          <el-switch
            v-model="currentSkill.isEnabled"
            active-color="#409EFF">
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
.app-settings-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 120px);
}

.page-header {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
}

.search-bar {
  display: flex;
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
  margin-right: 10px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.settings-desc {
  color: #606266;
  margin-bottom: 20px;
}

.warning-level-settings,
.warning-merge-settings,
.warning-publish-settings {
  padding: 20px 0;
}

.skill-status {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.status-text {
  margin-top: 5px;
  font-size: 12px;
}

.status-text.enabled {
  color: #409EFF;
}

.status-text.disabled {
  color: #909399;
}
</style>
