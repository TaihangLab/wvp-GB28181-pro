<template>
  <div class="multimodal-llm-skills-wrapper">
    <div class="multimodal-llm-skills">
      <div class="page-container">
        <!-- 头部操作区域 -->
        <div class="header-section">
          <div class="header-left">
            <el-button type="primary" icon="el-icon-plus" @click="createSkill">
              创建技能
            </el-button>
            <el-button 
              icon="el-icon-delete" 
              :disabled="selectedSkills.length === 0"
              :loading="batchDeleting"
              @click="batchDelete">
              {{ batchDeleting ? '删除中...' : '批量删除' }}
            </el-button>
          </div>

          <div class="header-right">
            <el-select 
              v-model="filterStatus" 
              placeholder="技能状态" 
              class="select-status" 
              clearable 
              @change="handleFilter">
              <el-option label="已发布" value="enabled"></el-option>
              <el-option label="未发布" value="disabled"></el-option>
            </el-select>
            
            <el-select 
              v-model="filterType" 
              placeholder="技能类型" 
              class="select-type" 
              clearable 
              @change="handleFilter">
              <el-option label="多模态检测" value="multimodal_detection">
                <span style="float: left">多模态检测</span>
                <span style="float: right; color: #8492a6; font-size: 13px">检测分析</span>
              </el-option>
              <el-option label="多模态分析" value="multimodal_analysis">
                <span style="float: left">多模态分析</span>
                <span style="float: right; color: #8492a6; font-size: 13px">综合分析</span>
              </el-option>
              <el-option label="多模态复判" value="multimodal_review">
                <span style="float: left">多模态复判</span>
                <span style="float: right; color: #8492a6; font-size: 13px">二次复判</span>
              </el-option>
            </el-select>

            <el-input 
              v-model="searchInput" 
              placeholder="搜索技能名称或描述" 
              class="search-input" 
              @keyup.enter="handleSearch"
              clearable>
              <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
            </el-input>

            <el-button icon="el-icon-refresh" class="action-btn" @click="refreshData"></el-button>
          </div>
        </div>

        <!-- 过滤和排序 -->
        <div class="filter-tabs">
          <div class="filter-buttons">
            <el-button 
              :type="isAllSelected ? 'primary' : ''" 
              :plain="!isAllSelected"
              @click="selectAll">
              全选
            </el-button>
            <el-button 
              :type="isCurrentPageSelected ? 'primary' : ''" 
              :plain="!isCurrentPageSelected"
              @click="selectCurrentPage">
              选择本页
            </el-button>
          </div>

          <div class="sort-section">
            <span>{{ sortTypeText }}</span>
            <el-button 
              type="text" 
              :icon="sortOrder === 'desc' ? 'el-icon-caret-bottom' : 'el-icon-caret-top'" 
              @click="toggleSort">
            </el-button>
          </div>
        </div>

        <!-- 技能卡片网格 -->
        <div class="skills-container">
          <!-- 加载状态 -->
          <div v-if="loading" class="loading-container">
            <el-loading 
              :loading="loading"
              text="正在加载技能列表..."
              spinner="el-icon-loading"
              background="rgba(255, 255, 255, 0.8)">
            </el-loading>
          </div>
          
          <!-- 空状态 -->
          <div v-else-if="!loading && skills.length === 0" class="empty-container">
            <div class="empty-content">
              <i class="el-icon-document-remove empty-icon"></i>
              <div class="empty-text">暂无技能数据</div>
              <div class="empty-tips">
                {{ searchKeyword ? '请尝试调整搜索条件' : '点击"创建技能"开始创建您的第一个多模态技能' }}
              </div>
              <el-button v-if="!searchKeyword" type="primary" @click="createSkill" class="empty-action">
                <i class="el-icon-plus"></i>
                创建技能
              </el-button>
            </div>
          </div>
          
          <!-- 技能卡片列表 -->
          <div v-else class="skills-grid">
            <div 
              v-for="skill in paginatedSkills" 
              :key="skill.id" 
              class="skill-card"
              @mouseenter="showCardCheckbox(skill.id)"
              @mouseleave="hideCardCheckbox(skill.id)"
              @click="showSkillDetail(skill)">
              
              <!-- 选择框 -->
              <div 
                v-show="cardHoverStates[skill.id] || selectedSkills.includes(skill.id)" 
                class="card-checkbox"
                @click.stop>
                <el-checkbox 
                  :value="selectedSkills.includes(skill.id)"
                  @input="handleSkillSelect(skill.id, $event)">
                </el-checkbox>
              </div>
              
              <!-- 技能类型标识 -->
              <div class="skill-type-badge">
                <div class="skill-type-text">多模态大模型</div>
                <div class="skill-type-glow"></div>
              </div>
              
              <!-- 技能图片 -->
              <div class="skill-image">
                <img :src="skill.image_url || '/static/logo.png'" alt="技能图片" />
              </div>
              
              <div class="card-header">
                <h3 class="skill-title">{{ skill.name }}</h3>
              </div>

              <div class="card-content">
                <div class="status-row">
                  <div class="status-item">
                    <i class="el-icon-circle-check status-icon"></i>
                    <span class="status-label">状态</span>
                    <el-tag size="mini" :type="skill.status === 'enabled' ? 'success' : 'info'">
                      {{ skill.status === 'enabled' ? '已发布' : '未发布' }}
                    </el-tag>
                  </div>
                  <div class="device-item">
                    <i class="el-icon-link device-icon"></i>
                    <span class="device-label">关联设备</span>
                    <span class="device-count">{{ skill.deviceCount || 0 }} 台</span>
                  </div>
                </div>
                <div class="model-row">
                  <i class="el-icon-cpu model-icon"></i>
                  <span class="model-label">技能类型</span>
                  <el-tag size="mini" :type="getSkillTypeTagType(skill.type)">
                    {{ getSkillTypeDisplayName(skill.type) }}
                  </el-tag>
                </div>
                <div class="tag-row" v-if="skill.tags">
                  <i class="el-icon-price-tag tag-icon"></i>
                  <span class="tag-label">技能标签</span>
                  <el-tag size="mini" type="warning">
                    {{ skill.tags }}
                  </el-tag>
                </div>
              </div>

              <div class="card-actions" @click.stop>
                <el-button size="small" @click="editSkill(skill)">编辑</el-button>
                <el-button 
                  size="small" 
                  :loading="skillStatusLoading[skill.id]"
                  :type="skill.status === 'enabled' ? 'warning' : 'success'"
                  @click="toggleSkillStatus(skill)">
                  {{ skill.status === 'enabled' ? '下架' : '发布' }}
                </el-button>
                <el-button size="small" @click="deleteSkill(skill)">删除</el-button>
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

          <el-button type="primary" class="go-button" @click="goToPage">GO</el-button>
        </div>
      </div>
    </div>
    
    <!-- 描述信息悬浮提示框 -->
    <div 
      v-show="tooltipVisible" 
      ref="tooltip"
      class="skill-tooltip"
      :style="tooltipStyle">
      {{ tooltipContent }}
    </div>

    <!-- 创建技能弹窗 -->
    <llm-skill-create-dialog 
      ref="createSkillDialog" 
      @confirm="handleCreateConfirm">
    </llm-skill-create-dialog>
    
    <!-- 编辑技能对话框 -->
    <el-dialog 
      title="编辑技能"
      :visible.sync="skillDialogVisible"
      width="60%"
      @close="resetSkillForm">
      <el-form 
        :model="skillForm" 
        :rules="skillRules" 
        ref="skillForm" 
        label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="技能名称" prop="name">
              <el-input v-model="skillForm.name" placeholder="请输入技能名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模型类型" prop="model">
              <el-select v-model="skillForm.model" placeholder="选择模型类型" style="width: 100%">
                <el-option label="GPT-4V" value="gpt-4v"></el-option>
                <el-option label="Claude-3" value="claude-3"></el-option>
                <el-option label="Gemini Pro Vision" value="gemini-pro-vision"></el-option>
                <el-option label="自定义模型" value="custom"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="技能描述" prop="description">
          <el-input 
            type="textarea" 
            v-model="skillForm.description" 
            :rows="3"
            placeholder="请输入技能描述">
          </el-input>
        </el-form-item>

        <el-form-item label="系统提示词" prop="systemPrompt">
          <el-input 
            type="textarea" 
            v-model="skillForm.systemPrompt" 
            :rows="4"
            placeholder="请输入系统提示词，定义AI的角色和任务">
          </el-input>
        </el-form-item>

        <el-form-item label="用户提示词模板" prop="userPromptTemplate">
          <el-input 
            type="textarea" 
            v-model="skillForm.userPromptTemplate" 
            :rows="3"
            placeholder="请输入用户提示词模板，支持变量替换">
          </el-input>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="最大Token数" prop="maxTokens">
              <el-input-number 
                v-model="skillForm.maxTokens" 
                :min="1" 
                :max="4096" 
                style="width: 100%">
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="温度参数" prop="temperature">
              <el-input-number 
                v-model="skillForm.temperature" 
                :min="0" 
                :max="2" 
                :step="0.1" 
                style="width: 100%">
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态" prop="status">
              <el-select v-model="skillForm.status" style="width: 100%">
                <el-option label="已发布" value="enabled"></el-option>
                <el-option label="未发布" value="disabled"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="skillDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSkill" :loading="saving">保存</el-button>
      </span>
    </el-dialog>



    <!-- 设备列表弹窗 -->
    <el-dialog
      title="关联设备列表"
      :visible.sync="deviceListVisible"
      width="800px"
      :close-on-click-modal="false"
      custom-class="fixed-height-device-dialog">
      <div class="device-list-container">
        <div class="device-list-header">
          <span class="skill-name">{{ currentSkill.name }}</span>
          <span class="device-count">共 {{ deviceList.length }} 台设备</span>
        </div>
        <div class="device-table-scroll-wrapper">
          <el-table 
            :data="deviceList" 
            style="width: 100%" 
            stripe
            height="380">
            <el-table-column prop="name" label="设备名称" width="230">
              <template slot-scope="scope">
                <div class="device-name">
                  <i class="el-icon-monitor"></i>
                  <span>{{ scope.row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="id" label="设备ID" width="140">
              <template slot-scope="scope">
                <span class="device-id">{{ scope.row.id }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="location" label="位置" width="200">
              <template slot-scope="scope">
                <div class="device-location">
                  <i class="el-icon-location-outline"></i>
                  <span>{{ scope.row.location }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag 
                  size="small" 
                  :type="scope.row.status === 'online' ? 'success' : scope.row.status === 'offline' ? 'danger' : 'warning'">
                  {{ getDeviceStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template slot-scope="scope">
                <el-button size="mini" type="text" @click="viewDevice(scope.row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>

    <!-- 技能详情弹窗 -->
    <el-dialog
      title="技能详情"
      :visible.sync="detailDialogVisible"
      width="900px"
      :close-on-click-modal="false">
      <div class="detail-content" v-loading="detailLoading" element-loading-text="正在加载技能详情...">
        <div v-if="!detailLoading">
          <!-- 头部信息 -->
          <div class="detail-header">
            <div class="header-content">
              <div class="detail-image">
                <img :src="detailSkill.iconUrl || '/static/logo.png'" alt="技能图标" />
              </div>
              <div class="header-info">
                <div class="title-row">
                  <h3 class="detail-title">{{ detailSkill.name }}</h3>
                  <div class="skill-type-tag">多模态大模型</div>
                </div>
                <div class="meta-row">
                  <div class="id-badge">
                    <i class="el-icon-postcard"></i>
                    <span>{{ detailSkill.skillId }}</span>
                  </div>
                  <div class="status-badge" :class="detailSkill.status === 'enabled' ? 'published' : 'unpublished'">
                    <i class="el-icon-circle-check"></i>
                    <span>{{ detailSkill.status === 'enabled' ? '已发布' : '未发布' }}</span>
                  </div>
                  <div class="version-badge">
                    <i class="el-icon-medal"></i>
                    <span>v{{ detailSkill.version }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 详细信息 -->
          <div class="detail-info-section">
            <!-- 基本信息 -->
            <div class="info-group">
              <h4 class="group-title">
                <i class="el-icon-info"></i>
                基本信息
              </h4>
              <div class="info-grid">
                <div class="info-item">
                  <i class="el-icon-cpu item-icon"></i>
                  <span class="item-label">技能类型</span>
                  <el-tag size="small" :type="getSkillTypeTagType(detailSkill.type)">
                    {{ getSkillTypeDisplayName(detailSkill.type) }}
                  </el-tag>
                </div>
                <div class="info-item" v-if="detailSkill.scenario">
                  <i class="el-icon-view item-icon"></i>
                  <span class="item-label">应用场景</span>
                  <span class="item-value">{{ getScenarioDisplayName(detailSkill.scenario) }}</span>
                </div>
                <div class="info-item" v-if="detailSkill.tags">
                  <i class="el-icon-price-tag item-icon"></i>
                  <span class="item-label">技能标签</span>
                  <span class="item-value">{{ detailSkill.tags }}</span>
                </div>
                <div class="info-item clickable-item" @click="showDeviceList(detailSkill)">
                  <i class="el-icon-link item-icon"></i>
                  <span class="item-label">关联设备</span>
                  <span class="item-value">{{ detailSkill.deviceCount || 0 }} 台</span>
                  <i class="el-icon-arrow-right item-arrow"></i>
                </div>
                <div class="info-item">
                  <i class="el-icon-date item-icon"></i>
                  <span class="item-label">创建时间</span>
                  <span class="item-value">{{ detailSkill.createdAt }}</span>
                </div>
                <div class="info-item">
                  <i class="el-icon-refresh item-icon"></i>
                  <span class="item-label">最后更新</span>
                  <span class="item-value">{{ detailSkill.updatedAt }}</span>
                </div>
              </div>
            </div>

            <!-- 技能描述 -->
            <div class="info-group">
              <h4 class="group-title">
                <i class="el-icon-document"></i>
                技能描述
              </h4>
              <div class="description-content">
                {{ detailSkill.description }}
              </div>
            </div>

            <!-- 提示词模板 -->
            <div class="info-group" v-if="detailSkill.promptTemplate">
              <h4 class="group-title">
                <i class="el-icon-chat-line-square"></i>
                提示词模板
              </h4>
              <div class="prompt-template-content">
                <pre class="prompt-template">{{ detailSkill.promptTemplate }}</pre>
              </div>
            </div>

            <!-- 输出参数 -->
            <div class="info-group" v-if="detailSkill.outputParameters && detailSkill.outputParameters.length > 0">
              <h4 class="group-title">
                <i class="el-icon-data-line"></i>
                输出参数
              </h4>
              <div class="output-params-content">
                <el-table :data="detailSkill.outputParameters" style="width: 100%" size="small">
                  <el-table-column prop="name" label="参数名称" width="150">
                    <template slot-scope="scope">
                      <el-tag size="mini" type="info">{{ scope.row.name }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="type" label="数据类型" width="100">
                    <template slot-scope="scope">
                      <span class="param-type">{{ scope.row.type }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="description" label="参数描述">
                    <template slot-scope="scope">
                      <span>{{ scope.row.description || '暂无描述' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="required" label="是否必填" width="80">
                    <template slot-scope="scope">
                      <el-tag size="mini" :type="scope.row.required ? 'warning' : 'info'">
                        {{ scope.row.required ? '必填' : '可选' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>

            <!-- 预警条件 -->
            <div class="info-group" v-if="detailSkill.alertConditions">
              <h4 class="group-title">
                <i class="el-icon-warning"></i>
                预警条件
              </h4>
              <div class="alert-conditions-content">
                <div class="condition-summary">
                  <span>当满足</span>
                  <el-tag size="small" type="primary">
                    {{ getRelationDisplayName(detailSkill.alertConditions.global_relation) }}
                  </el-tag>
                  <span>条件组时触发预警</span>
                </div>
                <div class="condition-groups" v-if="detailSkill.alertConditions.condition_groups">
                  <div 
                    v-for="(group, index) in detailSkill.alertConditions.condition_groups" 
                    :key="index"
                    class="condition-group">
                    <div class="group-header">
                      <span>条件组 {{ index + 1 }} ({{ getRelationDisplayName(group.relation) }})</span>
                    </div>
                    <div class="conditions-list">
                      <div 
                        v-for="(condition, condIndex) in group.conditions" 
                        :key="condIndex"
                        class="condition-item">
                        <span class="condition-field">{{ condition.field }}</span>
                        <span class="condition-operator">{{ getOperatorDisplayName(condition.operator) }}</span>
                        <span class="condition-value" v-if="condition.value !== undefined && condition.value !== ''">{{ condition.value }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 关联任务 -->
            <div class="info-group" v-if="detailSkill.tasks && detailSkill.tasks.length > 0">
              <h4 class="group-title">
                <i class="el-icon-s-operation"></i>
                关联任务
              </h4>
              <div class="related-tasks-content">
                <el-table :data="detailSkill.tasks" style="width: 100%" size="small">
                  <el-table-column prop="id" label="任务ID" width="80"></el-table-column>
                  <el-table-column prop="name" label="任务名称" width="200"></el-table-column>
                  <el-table-column prop="status" label="状态" width="100">
                    <template slot-scope="scope">
                      <el-tag size="mini" :type="scope.row.status ? 'success' : 'info'">
                        {{ scope.row.status ? '运行中' : '已停止' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="medium" @click="detailDialogVisible = false">关闭</el-button>
        <el-button size="medium" type="primary" @click="editSkill(detailSkill)">编辑技能</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import LlmSkillCreateDialog from './LlmSkillCreateDialog.vue'
import { skillAPI } from '@/components/service/VisionAIService.js'

export default {
  name: 'MultimodalLlmSkills',
  components: {
    LlmSkillCreateDialog
  },
  data() {
    return {
      // 搜索和过滤
      searchInput: '',
      searchKeyword: '',
      filterStatus: '',
      filterType: '',
      sortType: 'time', // 'time' 或 'name'
      sortOrder: 'desc', // 'asc' 或 'desc'

      // 分页
      currentPage: 1,
      pageSize: 12,
      totalCount: 0,

      // 复制按钮显示状态
      copyButtonVisible: {},

      // 选择相关
      selectedSkills: [],
      cardHoverStates: {},

      // tooltip相关
      tooltipVisible: false,
      tooltipContent: '',
      tooltipStyle: {
        left: '0px',
        top: '0px'
      },

      // 对话框
      skillDialogVisible: false,
      editingSkill: null,
      saving: false,

      // 表单数据
      skillForm: {
        name: '',
        model: '',
        description: '',
        systemPrompt: '',
        userPromptTemplate: '',
        maxTokens: 1000,
        temperature: 0.7,
        status: 'enabled'
      },

      // 表单验证规则
      skillRules: {
        name: [
          { required: true, message: '请输入技能名称', trigger: 'blur' }
        ],
        model: [
          { required: true, message: '请选择模型类型', trigger: 'change' }
        ],
        description: [
          { required: true, message: '请输入技能描述', trigger: 'blur' }
        ],
        systemPrompt: [
          { required: true, message: '请输入系统提示词', trigger: 'blur' }
        ]
      },



      // 数据加载状态
      loading: false,
      skillStatusLoading: {}, // 跟踪每个技能的发布/下架loading状态
      batchDeleting: false, // 批量删除loading状态

      // 技能数据
      skills: [],

      detailDialogVisible: false,
      detailSkill: {},

      // 设备列表相关
      deviceListVisible: false,
      currentSkill: {},
      deviceList: [],

      detailLoading: false
    }
  },
  computed: {
    // 分页后的技能列表（现在直接使用从API获取的数据）
    paginatedSkills() {
      return this.skills
    },

    // 排序类型文本
    sortTypeText() {
      return this.sortType === 'name' ? '按名称排序' : '按更新时间排序'
    },

    // 是否全选
    isAllSelected() {
      return this.selectedSkills.length === this.skills.length && this.skills.length > 0
    },

    // 是否选择当前页
    isCurrentPageSelected() {
      return this.paginatedSkills.every(skill => this.selectedSkills.includes(skill.id)) && this.paginatedSkills.length > 0
    }
  },
  methods: {
    // 搜索
    handleSearch() {
      this.searchKeyword = this.searchInput
      this.currentPage = 1
      this.loadSkillList()
    },

    // 过滤
    handleFilter() {
      this.currentPage = 1
      this.loadSkillList()
    },

    // 刷新数据
    refreshData() {
      this.loadSkillList()
    },

    // 加载技能列表
    async loadSkillList() {
      this.loading = true
      try {
        // 构建查询参数
        const params = {
          page: this.currentPage,
          limit: this.pageSize
        }

        // 添加搜索条件
        if (this.searchKeyword && this.searchKeyword.trim()) {
          params.name = this.searchKeyword.trim()
        }

        // 添加状态过滤
        if (this.filterStatus) {
          params.status = this.filterStatus === 'enabled'
        }

        // 添加技能类型过滤
        if (this.filterType) {
          params.type_filter = this.filterType
        }

        console.log('加载多模态技能列表，参数:', params)

        const response = await skillAPI.getLlmSkillList(params)
        
        if (response.data && response.data.success) {
          // 修复数据解析：技能数组直接在 response.data.data 中
          const skillList = response.data.data || []
          
          // 处理技能列表数据
          this.skills = skillList.map(skill => ({
            id: skill.id,
            skillId: skill.skill_id,
            name: skill.skill_name,
            description: skill.skill_description || '暂无描述',
            model: this.mapModelType(skill.llm_provider || 'custom'),
            status: skill.status ? 'enabled' : 'disabled',
            type: skill.type || 'multimodal_analysis', // 技能类型
            tags: (skill.skill_tags || []).join(', ') || '未分类',
            scenario: skill.application_scenario,
            accuracy: 0, // 暂时设为0，后续可能从统计接口获取
            callCount: 0, // 暂时设为0，后续可能从统计接口获取
            deviceCount: 0, // 暂时设为0，后续可能从统计接口获取
            systemPrompt: skill.system_prompt || '',
            userPromptTemplate: skill.prompt_template || '',
            maxTokens: skill.max_tokens || 1000,
            temperature: skill.temperature || 0.7,
            createdAt: this.formatDateTime(skill.created_at),
            updatedAt: this.formatDateTime(skill.updated_at),
            image_url: skill.skill_icon_url || '/static/logo.png' // 直接使用后端返回的临时访问URL
          }))

          // 更新总数和分页信息
          this.totalCount = response.data.total || 0
          
          console.log('技能列表加载成功:', this.skills.length, '条记录')
          this.$message.success(`加载成功，共 ${this.totalCount} 条记录`)
          
        } else {
          throw new Error('获取技能列表失败')
        }

      } catch (error) {
        console.error('加载技能列表失败:', error)
        
        // 根据错误类型显示不同的错误信息
        if (error.response && error.response.status === 404) {
          this.$message.error('技能列表接口不存在，请检查后端服务')
        } else if (error.response && error.response.status >= 500) {
          this.$message.error('服务器内部错误，请稍后重试')
        } else if (error.message.includes('网络')) {
          this.$message.error('网络连接失败，请检查网络设置')
        } else {
          this.$message.error('加载技能列表失败，请重试')
        }
        
        // 失败时显示空列表
        this.skills = []
        this.totalCount = 0
        
      } finally {
        this.loading = false
      }
    },

    // 映射模型类型
    mapModelType(llmProvider) {
      const typeMap = {
        'openai': 'gpt-4v',
        'claude': 'claude-3', 
        'gemini': 'gemini-pro-vision',
        'custom': 'custom'
      }
      return typeMap[llmProvider] || 'custom'
    },

    // 格式化日期时间
    formatDateTime(dateString) {
      if (!dateString) return '未知'
      
      try {
        const date = new Date(dateString)
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).replace(/\//g, '-')
      } catch (error) {
        console.warn('日期格式化失败:', dateString, error)
        return dateString
      }
    },

    // 获取技能图标URL
    getSkillIconUrl(skillIcon) {
      if (!skillIcon) return '/static/logo.png'
      
      // 如果是完整URL，直接返回
      if (skillIcon.startsWith('http')) {
        return skillIcon
      }
      
      // 否则拼接MinIO URL
      return `/api/v1/llm-skills/skill-icon/${skillIcon}`
    },

    // 排序切换
    toggleSort() {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
    },

    // 全选
    selectAll() {
      if (this.isAllSelected) {
        this.selectedSkills = []
      } else {
        this.selectedSkills = [...this.skills.map(skill => skill.id)]
      }
    },

    // 选择当前页
    selectCurrentPage() {
      if (this.isCurrentPageSelected) {
        this.selectedSkills = this.selectedSkills.filter(id => 
          !this.paginatedSkills.some(skill => skill.id === id)
        )
      } else {
        const currentPageIds = this.paginatedSkills.map(skill => skill.id)
        this.selectedSkills = [...new Set([...this.selectedSkills, ...currentPageIds])]
      }
    },

    // 技能选择
    handleSkillSelect(skillId, checked) {
      if (checked) {
        if (!this.selectedSkills.includes(skillId)) {
          this.selectedSkills.push(skillId)
        }
      } else {
        const index = this.selectedSkills.indexOf(skillId)
        if (index > -1) {
          this.selectedSkills.splice(index, 1)
        }
      }
    },

    // 显示卡片复选框
    showCardCheckbox(skillId) {
      this.$set(this.cardHoverStates, skillId, true)
    },

    // 隐藏卡片复选框
    hideCardCheckbox(skillId) {
      this.$set(this.cardHoverStates, skillId, false)
    },

    // 显示复制按钮
    showCopyButton(skillId) {
      this.$set(this.copyButtonVisible, skillId, true)
    },

    // 隐藏复制按钮
    hideCopyButton(skillId) {
      this.$set(this.copyButtonVisible, skillId, false)
    },

    // 复制到剪贴板
    copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
        this.$message.success('已复制到剪贴板')
      })
    },

    // 显示tooltip
    showTooltip(event, content) {
      this.tooltipContent = content
      this.tooltipVisible = true
      this.$nextTick(() => {
        const rect = event.target.getBoundingClientRect()
        this.tooltipStyle = {
          left: rect.left + 'px',
          top: (rect.bottom + 5) + 'px'
        }
      })
    },

    // 隐藏tooltip
    hideTooltip() {
      this.tooltipVisible = false
    },

    // 分页处理
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.loadSkillList()
    },

    handleCurrentChange(val) {
      this.currentPage = val
      this.loadSkillList()
    },

    // 获取状态类
    getStatusClass(status) {
      const statusMap = {
        'enabled': 'enabled',
        'disabled': 'disabled'
      }
      return statusMap[status] || 'disabled'
    },

    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        'enabled': '已发布',
        'disabled': '未发布'
      }
      return statusMap[status] || '未知'
    },

    // 获取模型标签类型
    getModelTagType(model) {
      const typeMap = {
        'gpt-4v': 'success',
        'claude-3': 'primary',
        'gemini-pro-vision': 'warning',
        'custom': 'info'
      }
      return typeMap[model] || 'info'
    },

    // 获取模型显示名称
    getModelDisplayName(model) {
      const nameMap = {
        'gpt-4v': 'GPT-4V',
        'claude-3': 'Claude-3',
        'gemini-pro-vision': 'Gemini Pro Vision',
        'custom': '自定义模型'
      }
      return nameMap[model] || model
    },

    // 获取技能类型标签类型
    getSkillTypeTagType(type) {
      const typeMap = {
        'multimodal_detection': 'success',
        'multimodal_analysis': 'primary', 
        'multimodal_review': 'warning'
      }
      return typeMap[type] || 'primary'
    },

    // 获取技能类型显示名称
    getSkillTypeDisplayName(type) {
      const nameMap = {
        'multimodal_detection': '多模态检测',
        'multimodal_analysis': '多模态分析',
        'multimodal_review': '多模态复判'
      }
      return nameMap[type] || type
    },

    // 获取应用场景显示名称
    getScenarioDisplayName(scenario) {
      const nameMap = {
        'video_analysis': '视频分析',
        'image_processing': '图片处理',
        'real_time_monitoring': '实时监控',
        'batch_processing': '批量处理'
      }
      return nameMap[scenario] || scenario
    },

    // 获取关系类型显示名称
    getRelationDisplayName(relation) {
      const nameMap = {
        'and': '且（全部满足）',
        'or': '或（任意满足）',
        'not': '非（全不满足）',
        'all': '且（全部满足）',
        'any': '或（任意满足）'
      }
      return nameMap[relation] || relation
    },

    // 获取操作符显示名称
    getOperatorDisplayName(operator) {
      const nameMap = {
        'eq': '等于',
        'ne': '不等于',
        'gt': '大于',
        'lt': '小于',
        'gte': '大于等于',
        'lte': '小于等于',
        'contains': '包含',
        'not_contains': '不包含',
        'is_empty': '为空',
        'is_not_empty': '不为空'
      }
      return nameMap[operator] || operator
    },

    // 创建技能
    createSkill() {
      this.$refs.createSkillDialog.show()
    },
    
    // 处理创建确认
    handleCreateConfirm(skillInfo) {
      // 将技能信息存储到本地存储，用于详细页面获取
      localStorage.setItem('tempSkillInfo', JSON.stringify(skillInfo))
      
      // 跳转到详细创建页面
      this.$router.push({
        path: '/skillManage/multimodalCreateDetail',
        params: { skillInfo }
      })
    },

    // 当从详细页面返回时，刷新列表数据
    onRouteBack() {
      // 清除临时数据
      localStorage.removeItem('tempSkillInfo')
      // 刷新技能列表
      this.loadSkillList()
    },

    // 编辑技能
    editSkill(skill) {
      // 获取技能详情数据并跳转到编辑页面
      this.detailLoading = true
      
      skillAPI.getLlmSkillDetail(skill.id)
        .then(response => {
          if (response.data && response.data.success) {
            const skillDetail = response.data.data
            
            // 构造编辑数据，包含基础信息和详细配置
            const editData = {
              // 基础信息
              id: skillDetail.id,
              name: skillDetail.skill_name,
              skillId: skillDetail.skill_id,
              scenario: skillDetail.application_scenario === 'video_analysis' ? 'vision' : 'image',
              tags: (skillDetail.skill_tags || []).join(', ') || '',
              description: skillDetail.skill_description || '',
              iconUrl: skillDetail.skill_icon_url || '/static/logo.png',
              skillIcon: skillDetail.skill_icon || null,
              // 详细配置
              promptTemplate: skillDetail.prompt_template || '',
              outputParameters: skillDetail.output_parameters || [],
              alertConditions: skillDetail.alert_conditions || null,
              globalRelation: skillDetail.alert_conditions && skillDetail.alert_conditions.global_relation || 'and',
              conditionGroups: skillDetail.alert_conditions && skillDetail.alert_conditions.condition_groups || []
            }
            
            // 存储到localStorage供编辑页面使用
            localStorage.setItem('editSkillInfo', JSON.stringify(editData))
            
            // 打开编辑对话框（基础信息）
            this.$refs.createSkillDialog.showEdit(editData)
          } else {
            this.$message.error('获取技能详情失败')
          }
        })
        .catch(error => {
          console.error('获取技能详情失败:', error)
          this.$message.error('获取技能详情失败')
        })
        .finally(() => {
          this.detailLoading = false
        })
    },

    // 重置表单
    resetSkillForm() {
      this.skillForm = {
        name: '',
        model: '',
        description: '',
        systemPrompt: '',
        userPromptTemplate: '',
        maxTokens: 1000,
        temperature: 0.7,
        status: 'enabled'
      }
    },

    // 保存技能
    saveSkill() {
      this.$refs.skillForm.validate((valid) => {
        if (valid) {
          this.saving = true
          
          // 模拟保存操作
          setTimeout(() => {
            if (this.editingSkill) {
              // 编辑模式
              const index = this.skills.findIndex(s => s.id === this.editingSkill.id)
              if (index > -1) {
                this.skills.splice(index, 1, {
                  ...this.editingSkill,
                  ...this.skillForm,
                  updatedAt: new Date().toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                  }).replace(/\//g, '-')
                })
              }
              this.$message.success('技能更新成功')
            } else {
              // 创建模式
              const currentTime = new Date().toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              }).replace(/\//g, '-')
              
              const newSkill = {
                ...this.skillForm,
                id: 'skill_' + Date.now(),
                accuracy: 0,
                callCount: 0,
                createdAt: currentTime,
                updatedAt: currentTime
              }
              this.skills.unshift(newSkill)
              this.$message.success('技能创建成功')
            }
            
            this.saving = false
            this.skillDialogVisible = false
          }, 1000)
        }
      })
    },

    // 切换技能状态
    async toggleSkillStatus(skill) {
      const action = skill.status === 'enabled' ? '下架' : '发布'
      const actionVerb = skill.status === 'enabled' ? 'unpublish' : 'publish'
      
      try {
        // 确认操作
        await this.$confirm(`确定要${action}这个技能吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        // 设置loading状态
        this.$set(this.skillStatusLoading, skill.id, true)
        
        console.log(`正在${action}技能:`, skill.name, '(ID:', skill.id, ')')
        
        // 调用相应的API
        let response
        if (actionVerb === 'publish') {
          response = await skillAPI.publishLlmSkill(skill.id)
        } else {
          response = await skillAPI.unpublishLlmSkill(skill.id)
        }
        
        if (response.data && response.data.success) {
          // 更新本地状态
          const newStatus = skill.status === 'enabled' ? 'disabled' : 'enabled'
          skill.status = newStatus
          skill.updatedAt = new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }).replace(/\//g, '-')
          
          this.$message.success(`技能已${action}成功`)
        } else {
          throw new Error(`${action}失败`)
        }
        
      } catch (error) {
        if (error === 'cancel') {
          // 用户取消操作
          this.$message.info(`已取消${action}`)
          return
        }
        
        console.error(`${action}技能失败:`, error)
        
        // 根据错误类型显示不同的错误信息
        if (error.response && error.response.data && error.response.data.detail) {
          this.$message.error(`${action}失败: ${error.response.data.detail}`)
        } else if (error.response && error.response.status === 404) {
          this.$message.error('技能不存在或已被删除')
        } else if (error.response && error.response.status >= 500) {
          this.$message.error('服务器内部错误，请稍后重试')
        } else {
          this.$message.error(`${action}技能失败，请重试`)
        }
      } finally {
        // 清除loading状态
        this.$set(this.skillStatusLoading, skill.id, false)
      }
    },



    // 删除技能
    deleteSkill(skill) {
      this.$confirm('确定要删除这个技能吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.skills.findIndex(s => s.id === skill.id)
        if (index > -1) {
          this.skills.splice(index, 1)
          this.$message.success('删除成功')
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    // 批量删除
    async batchDelete() {
      if (this.selectedSkills.length === 0) {
        this.$message.warning('请先选择要删除的技能')
        return
      }

      try {
        // 确认删除操作
        await this.$confirm(`确定要删除选中的 ${this.selectedSkills.length} 个技能吗？`, '批量删除确认', {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning',
          dangerouslyUseHTMLString: true,
          message: `
            <div style="color: #606266; line-height: 1.6;">
              <p style="margin: 0 0 10px 0;">即将删除 <strong style="color: #f56c6c;">${this.selectedSkills.length}</strong> 个技能</p>
              <p style="margin: 0; color: #909399; font-size: 13px;">此操作不可逆，请确认是否继续？</p>
            </div>
          `
        })

        // 设置loading状态
        this.batchDeleting = true

        console.log('正在批量删除技能:', this.selectedSkills)

        // 调用批量删除API
        const response = await skillAPI.batchDeleteLlmSkills(this.selectedSkills)

        if (response.data && response.data.success) {
          // 获取删除结果
          const deleteResult = response.data.data || {}
          const successCount = deleteResult.deleted_count || 0
          const failedCount = deleteResult.failed_count || 0
          const failedSkills = deleteResult.failed_skills || []

          // 从本地列表中移除成功删除的技能
          this.skills = this.skills.filter(skill => !this.selectedSkills.includes(skill.id))
          
          // 清空选中状态
          this.selectedSkills = []

          // 显示删除结果
          if (failedCount === 0) {
            this.$message.success(`批量删除成功，共删除 ${successCount} 个技能`)
          } else {
            // 有部分失败的情况
            let message = `删除完成：成功 ${successCount} 个`
            if (failedCount > 0) {
              message += `，失败 ${failedCount} 个`
              if (failedSkills.length > 0) {
                const failedNames = failedSkills.map(skill => skill.skill_name || skill.name).join('、')
                message += `\n失败的技能：${failedNames}`
              }
            }
            this.$message.warning(message)
          }

          // 刷新技能列表
          this.loadSkillList()

        } else {
          throw new Error('批量删除响应格式异常')
        }

      } catch (error) {
        if (error === 'cancel') {
          // 用户取消操作
          this.$message.info('已取消删除')
          return
        }

        console.error('批量删除技能失败:', error)

        // 根据错误类型显示不同的错误信息
        if (error.response && error.response.data && error.response.data.detail) {
          this.$message.error(`批量删除失败: ${error.response.data.detail}`)
        } else if (error.response && error.response.status === 404) {
          this.$message.error('部分技能不存在或已被删除')
        } else if (error.response && error.response.status >= 500) {
          this.$message.error('服务器内部错误，请稍后重试')
        } else {
          this.$message.error('批量删除失败，请重试')
        }
      } finally {
        // 清除loading状态
        this.batchDeleting = false
      }
    },





    showSkillDetail(skill) {
      if (!skill.id) {
        this.$message.warning('无效的技能ID')
        return
      }

      this.detailLoading = true
      this.detailDialogVisible = true
      
      // 调用API获取技能详情
      skillAPI.getLlmSkillDetail(skill.id)
        .then(response => {
          if (response.data && response.data.success) {
            const skillDetail = response.data.data
            
            // 格式化技能详情数据
            this.detailSkill = {
              id: skillDetail.id,
              skillId: skillDetail.skill_id,
              name: skillDetail.skill_name,
              description: skillDetail.skill_description || '暂无描述',
              status: skillDetail.status ? 'enabled' : 'disabled',
              type: this.mapScenarioToType(skillDetail.application_scenario), // 根据应用场景推断技能类型
              tags: (skillDetail.skill_tags || []).join(', ') || '未分类',
              scenario: skillDetail.application_scenario,
              iconUrl: skillDetail.skill_icon_url || '/static/logo.png',
              promptTemplate: skillDetail.prompt_template || '',
              outputParameters: skillDetail.output_parameters || [],
              alertConditions: skillDetail.alert_conditions || null,
              version: skillDetail.version || '1.0.0',
              createdAt: this.formatDateTime(skillDetail.created_at),
              updatedAt: this.formatDateTime(skillDetail.updated_at),
              tasks: skillDetail.tasks || [],
              // 兼容原有字段
              deviceCount: skill.deviceCount || 0,
              accuracy: skill.accuracy || 0,
              callCount: skill.callCount || 0
            }
            
            console.log('技能详情加载成功:', this.detailSkill)
          } else {
            throw new Error('获取技能详情失败')
          }
        })
        .catch(error => {
          console.error('获取技能详情失败:', error)
          this.$message.error('获取技能详情失败，请重试')
          this.detailDialogVisible = false
        })
        .finally(() => {
          this.detailLoading = false
        })
    },

    // 格式化日期时间
    formatDateTime(dateTimeStr) {
      if (!dateTimeStr) return '未知'
      try {
        const date = new Date(dateTimeStr)
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      } catch (error) {
        return dateTimeStr
      }
    },

    // 显示设备列表
    showDeviceList(skill) {
      this.currentSkill = skill
      this.deviceList = this.generateDeviceList(skill)
      this.deviceListVisible = true
    },

    // 生成模拟设备数据
    generateDeviceList(skill) {
      const deviceCount = skill.deviceCount || 0
      const devices = []
      
             // 根据技能类型生成不同的设备名称和位置
       const deviceConfig = {
         'skill_001': { // 煤矿井下人员安全帽佩戴检测
           namePrefix: '井下安全监控摄像头',
           locations: [
             '1号井口人员进出通道',
             '2号井下主运输巷道',
             '3号井下采煤工作面',
             '4号井下掘进工作面',
             '主井提升机房入口',
             '副井通风机房通道',
             '井下变电所区域',
             '井下水泵房区域',
             '井下材料库房',
             '井下避难硐室入口',
             '井下主要交叉路口',
             '井下设备检修区域'
           ]
         },
         'skill_002': { // 城市道路机动车违停抓拍识别
           namePrefix: '违停抓拍摄像头',
           locations: [
             '人民路消防通道路段',
             '建设大道公交站台',
             '中山路人行横道',
             '解放路学校门口',
             '和平大道医院急救通道',
             '火车站广场禁停区',
             '机场路临时停车区',
             '商业街步行街入口',
             '政府大楼门前广场',
             '体育馆周边道路',
             '文化中心停车区域',
             '高架桥下禁停路段'
           ]
         },
         'skill_003': { // 电子制造业PCB板焊点质量检测
           namePrefix: 'PCB质检摄像头',
           locations: [
             'SMT贴片生产线1号位',
             'SMT贴片生产线2号位',
             '波峰焊接工位A',
             '波峰焊接工位B',
             '手工焊接工作台1',
             '手工焊接工作台2',
             '返修工作台区域',
             'AOI自动光学检测站',
             'ICT在线测试工位',
             '最终质检包装线',
             '来料检验工位',
             '成品抽检工位'
           ]
         },
         'skill_004': { // 中小学校园学生打架斗殴行为识别
           namePrefix: '校园安全监控摄像头',
           locations: [
             '教学楼1号楼梯间',
             '教学楼2号楼梯间',
             '学生宿舍楼下空地',
             '食堂就餐大厅',
             '操场篮球场区域',
             '操场足球场区域',
             '图书馆阅览大厅',
             '实验楼走廊通道',
             '校园主干道路口',
             '学生活动中心',
             '校园后门小路',
             '垃圾站周边区域'
           ]
         },
         'skill_005': { // 科技园区外来访客身份验证与行为监控
           namePrefix: '园区访客监控设备',
           locations: [
             '园区主入口访客登记处',
             'A栋办公楼前台大厅',
             'B栋研发楼门禁通道',
             'C栋实验楼安全通道',
             '地下停车场访客区',
             '园区会议中心入口',
             '园区展示厅参观通道',
             '园区餐厅就餐区域',
             '园区核心技术区入口',
             '园区数据中心门禁',
             '园区后勤服务区',
             '园区周界安全通道'
           ]
         },
                   'skill_006': { // 高速公路货车超载违法检测
            namePrefix: '高速超载检测摄像头',
            locations: [
              'G15高速公路收费站',
              'G25高速公路服务区',
              'G35高速公路检查站',
              'S1省道货车专用道',
              'S2省道超限检测点',
              '京沪高速货车称重点',
              '沪宁高速货车监控点',
              '绕城高速货车限行区',
              '国道G104货车检查站',
              '国道G205超载监测点',
              '港口货运专用通道',
              '物流园区出入口'
            ]
          },
          'skill_007': { // 医院手术室无菌操作规范检测
            namePrefix: '手术室监控摄像头',
            locations: [
              '1号手术室无菌区',
              '2号手术室器械台',
              '3号手术室洗手间',
              '4号手术室准备间',
              '手术室走廊通道',
              '器械消毒室',
              '手术衣更衣室',
              '麻醉准备室',
              '术后恢复室',
              '手术室污物处理区',
              '手术室库房',
              '手术室值班室'
            ]
          },
          'skill_008': { // 化工厂危险品泄漏预警检测
            namePrefix: '化工安全监控摄像头',
            locations: [
              '1号储罐区域',
              '2号储罐区域',
              '主管道阀门区',
              '副管道阀门区',
              '装卸作业平台',
              '化学品仓库',
              '废料处理区',
              '应急处置区',
              '控制室周边',
              '消防设施区',
              '人员疏散通道',
              '环境监测点'
            ]
          },
          'skill_009': { // 银行ATM机异常行为识别
            namePrefix: 'ATM安全监控摄像头',
            locations: [
              '建设银行ATM机',
              '工商银行ATM机',
              '农业银行ATM机',
              '中国银行ATM机',
              '招商银行ATM机',
              '交通银行ATM机',
              '民生银行ATM机',
              '兴业银行ATM机',
              '浦发银行ATM机',
              '中信银行ATM机',
              '光大银行ATM机',
              '华夏银行ATM机'
            ]
          },
          'skill_010': { // 食品加工厂卫生标准合规检测
            namePrefix: '食品安全监控摄像头',
            locations: [
              '原料接收区',
              '清洗消毒区',
              '切配加工区',
              '烹饪加工区',
              '包装封装区',
              '成品储存区',
              '冷藏冷冻区',
              '员工更衣室',
              '洗手消毒区',
              '废料处理区',
              '质检化验室',
              '成品出货区'
            ]
          },
          'skill_011': { // 建筑工地高空作业安全带检测
            namePrefix: '工地安全监控摄像头',
            locations: [
              '1号楼外墙作业面',
              '2号楼外墙作业面',
              '塔吊作业区域',
              '脚手架搭设区',
              '屋面防水作业区',
              '幕墙安装作业区',
              '钢结构焊接区',
              '设备吊装区',
              '高空管道安装区',
              '外立面清洁区',
              '广告牌安装区',
              '天线安装作业区'
            ]
          },
          'skill_012': { // 机场跑道异物入侵检测
            namePrefix: '跑道监控摄像头',
            locations: [
              '01号跑道东段',
              '01号跑道中段',
              '01号跑道西段',
              '02号跑道东段',
              '02号跑道中段',
              '02号跑道西段',
              'A滑行道区域',
              'B滑行道区域',
              'C滑行道区域',
              '停机坪1号区',
              '停机坪2号区',
              '跑道灯光设施区'
            ]
          }
       }
      
      const config = deviceConfig[skill.id] || {
        namePrefix: '智能监控设备',
        locations: ['默认位置']
      }
      
      for (let i = 1; i <= deviceCount; i++) {
        const statuses = ['online', 'offline', 'maintenance']
        
        devices.push({
          id: `DEV_${skill.id.split('_')[1]}_${String(i).padStart(3, '0')}`,
          name: `${config.namePrefix}-${i}`,
          location: config.locations[Math.floor(Math.random() * config.locations.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)]
        })
      }
      
      return devices
    },

    // 获取设备状态文本
    getDeviceStatusText(status) {
      const statusMap = {
        'online': '在线',
        'offline': '离线',
        'maintenance': '维护中'
      }
      return statusMap[status] || '未知'
    },

    // 查看设备详情
    viewDevice(device) {
      this.$message.info(`查看设备：${device.name}`)
      // 这里可以跳转到设备详情页面或打开设备详情弹窗
    },

    // 跳转到指定页面
    goToPage() {
      // 跳转到指定页面逻辑（可以根据需要实现）
    },

    // 根据应用场景映射技能类型
    mapScenarioToType(scenario) {
      const scenarioTypeMap = {
        'video_analysis': 'multimodal_detection',
        'image_processing': 'multimodal_analysis',
        'real_time_monitoring': 'multimodal_detection',
        'batch_processing': 'multimodal_review'
      }
      return scenarioTypeMap[scenario] || 'multimodal_analysis'
    }
  },

  watch: {
    // 监听路由变化，当从创建详情页返回时刷新数据
    '$route'(to, from) {
      if (from.path === '/skillManage/multimodalCreateDetail' && to.path === '/skillManage/multimodalLlmSkills') {
        this.onRouteBack()
      }
    }
  },

  mounted() {
    // 初始化数据
    this.searchKeyword = this.searchInput
  
    // 加载技能列表
    this.loadSkillList()
  }
}
</script>

<style scoped>
.multimodal-llm-skills-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.multimodal-llm-skills {
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

.select-status,
.select-type {
  width: 180px;
}

.select-status .el-input__inner,
.select-type .el-input__inner {
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
  transition: all 0.3s ease;
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
  position: relative;
}

/* 加载状态 */
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  width: 100%;
}

/* 空状态 */
.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  width: 100%;
}

.empty-content {
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 2px dashed #e5e7eb;
  max-width: 400px;
  transition: all 0.3s ease;
}

.empty-content:hover {
  border-color: #3b82f6;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15);
}

.empty-icon {
  font-size: 64px;
  color: #d1d5db;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.empty-content:hover .empty-icon {
  color: #3b82f6;
  transform: scale(1.1);
}

.empty-text {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.empty-tips {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 20px;
  line-height: 1.5;
}

.empty-action {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border: none;
  padding: 10px 24px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.empty-action:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

.skill-card {
  background: white;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  aspect-ratio: 16/19;
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

.skill-type-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 9;
}

.skill-type-text {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  font-size: 9px;
  font-weight: 600;
  padding: 3px 6px;
  border-radius: 6px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  letter-spacing: 0.3px;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.skill-image {
  width: 100%;
  height: 100px;
  overflow: hidden;
  background: #f6f8fa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.skill-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-header {
  margin-bottom: 10px;
  flex-shrink: 0;
}

.skill-title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: normal;
  max-height: 21px;
}



.card-content {
  flex: 1;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  gap: 8px;
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
}

.status-item,
.device-item {
  display: flex;
  align-items: center;
  gap: 3px;
  flex: 1;
  min-width: 0;
}

.status-icon,
.device-icon,
.model-icon {
  color: #3b82f6;
  font-size: 13px;
  flex-shrink: 0;
}

.status-label,
.device-label,
.model-label {
  font-size: 12px;
  color: #9ca3af;
  min-width: fit-content;
  flex-shrink: 0;
  text-align: left;
}

.card-content .device-count {
  font-size: 12px;
  color: #374151;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.model-row {
  display: flex;
  align-items: center;
  gap: 3px;
}

.tag-row {
  display: flex;
  align-items: center;
  gap: 3px;
}

.tag-icon {
  color: #3b82f6;
  font-size: 13px;
  flex-shrink: 0;
}

.tag-label {
  font-size: 12px;
  color: #9ca3af;
  min-width: fit-content;
  white-space: nowrap;
  flex-shrink: 0;
}

.card-actions {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
  flex-shrink: 0;
  margin-top: auto;
}

.card-actions .el-button {
  flex: 1;
  min-width: 45px;
  font-size: 11px;
  padding: 5px 8px;
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

/* 卡片内标签基础样式 */
.skill-card >>> .el-tag {
  font-size: 11px !important;
  padding: 0 8px !important;
  height: 20px !important;
  line-height: 18px !important;
}

.skill-card >>> .el-tag--mini {
  font-size: 11px !important;
  padding: 0 8px !important;
  height: 20px !important;
  line-height: 18px !important;
}

/* 模型类型和技能标签的灰色底框样式 */
.skill-card .model-row .el-tag,
.skill-card .tag-row .el-tag {
  background-color: #f3f4f6 !important;
  border: 1px solid #e5e7eb !important;
  color: #6b7280 !important;
  border-radius: 10px !important;
  font-weight: 500 !important;
}



/* 保持状态标签的原有颜色 */
.status-row .el-tag--success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  border-color: #10b981 !important;
  color: white !important;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3) !important;
}

.status-row .el-tag--info {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%) !important;
  border-color: #6b7280 !important;
  color: white !important;
  box-shadow: 0 2px 4px rgba(107, 114, 128, 0.3) !important;
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
  transition: all 0.3s ease;
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
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
  margin: 0 2px !important;
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
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
  margin: 0 2px !important;
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

/* tooltip */
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

/* 弹框样式 - 与 warningManagement.vue 一致 */
.multimodal-llm-skills-wrapper >>> .el-dialog {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

/* 弹框按钮统一样式 */
.multimodal-llm-skills-wrapper >>> .el-dialog .el-button--primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
  border: none !important;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3) !important;
  color: white !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
}

.multimodal-llm-skills-wrapper >>> .el-dialog .el-button--primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%) !important;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4) !important;
  transform: translateY(-1px) !important;
}

.multimodal-llm-skills-wrapper >>> .el-dialog .el-button--default {
  background: white !important;
  border: 1px solid #d1d5db !important;
  color: #4b5563 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
}

.multimodal-llm-skills-wrapper >>> .el-dialog .el-button--default:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e40af !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2) !important;
}

.multimodal-llm-skills-wrapper >>> .el-dialog .dialog-footer .el-button {
  border-radius: 6px !important;
  font-weight: 500 !important;
  padding: 8px 20px !important;
}

/* 弹框标题样式 */
.multimodal-llm-skills-wrapper >>> .el-dialog__header {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1) !important;
  padding: 16px 20px !important;
}

.multimodal-llm-skills-wrapper >>> .el-dialog__title {
  color: #1f2937 !important;
  font-weight: 600 !important;
}

.multimodal-llm-skills-wrapper >>> .el-dialog__close {
  color: #6b7280 !important;
  transition: color 0.3s ease !important;
}

.multimodal-llm-skills-wrapper >>> .el-dialog__close:hover {
  color: #3b82f6 !important;
}

/* 弹框内容样式 */
.multimodal-llm-skills-wrapper >>> .el-dialog__body {
  padding: 20px !important;
  background: #ffffff !important;
}

/* 上传组件样式优化 */
.multimodal-llm-skills-wrapper >>> .el-upload-dragger {
  border: 2px dashed #d1d5db !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
}

.multimodal-llm-skills-wrapper >>> .el-upload-dragger:hover {
  border-color: #3b82f6 !important;
  background-color: rgba(59, 130, 246, 0.05) !important;
}

.multimodal-llm-skills-wrapper >>> .el-upload-dragger .el-icon-upload {
  color: #3b82f6 !important;
}

.multimodal-llm-skills-wrapper >>> .el-upload__text {
  color: #6b7280 !important;
}

.multimodal-llm-skills-wrapper >>> .el-upload__text em {
  color: #3b82f6 !important;
  font-weight: 500 !important;
}

/* 响应式设计 */
@media (max-width: 1600px) {
  .skills-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (max-width: 1400px) {
  .skills-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1200px) {
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
  .multimodal-llm-skills {
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



/* 详情弹窗优化 */
.detail-content {
  padding: 0;
}

.detail-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-radius: 16px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.detail-image {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  overflow: hidden;
  background: #f6f8fa;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-info {
  flex: 1;
  min-width: 0;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.detail-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e40af;
  line-height: 1.2;
}

.skill-type-tag {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 12px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  flex-shrink: 0;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}

.id-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  padding: 6px 12px;
  border-radius: 10px;
  color: #374151;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0,0,0,0.06);
  transition: all 0.2s ease;
}

.id-badge i {
  color: #6366f1;
  font-size: 13px;
  font-weight: bold;
}

.id-badge span {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  border: 1px solid;
}

.status-badge.published {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  border-color: #86efac;
  color: #166534;
}

.status-badge.published i {
  color: #22c55e;
}

.status-badge.unpublished {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-color: #cbd5e1;
  color: #475569;
}

.status-badge.unpublished i {
  color: #64748b;
}

.detail-info-section {
  gap: 20px;
}

.info-group {
  margin-bottom: 24px;
}

.group-title {
  display: flex;
  align-items: center;
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.group-title i {
  margin-right: 8px;
  color: #1e40af;
  font-size: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 3px solid #e5e7eb;
}

.clickable-item {
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.clickable-item:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-left-color: #3b82f6;
  transform: translateX(2px);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.15);
}

.item-arrow {
  margin-left: auto;
  color: #9ca3af;
  font-size: 12px;
  transition: all 0.2s ease;
}

.clickable-item:hover .item-arrow {
  color: #1e40af;
  transform: translateX(2px);
}

.item-icon {
  color: #3b82f6;
  margin-right: 8px;
  font-size: 14px;
  flex-shrink: 0;
}

.item-label {
  font-size: 13px;
  color: #6b7280;
  margin-right: 8px;
  min-width: 60px;
}

.item-value {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
  flex: 1;
}

.skill-type-highlight {
  background: linear-gradient(135deg, 
    #667eea 0%, 
    #764ba2 25%, 
    #f093fb 50%, 
    #f5576c 75%, 
    #667eea 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  font-size: 15px;
  animation: skillTypeTextFlow 3s ease-in-out infinite;
  text-shadow: 0 0 10px rgba(102, 126, 234, 0.3);
}

@keyframes skillTypeTextFlow {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.description-content {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
  position: relative;
}

.description-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #1e40af);
  border-radius: 10px 10px 0 0;
}

/* 设备列表弹窗样式 */
.fixed-height-device-dialog {
  max-height: 600px !important;
}

.fixed-height-device-dialog >>> .el-dialog {
  margin-top: 5vh !important;
  margin-bottom: 5vh !important;
  max-height: 600px !important;
  display: flex !important;
  flex-direction: column !important;
}

.fixed-height-device-dialog >>> .el-dialog__body {
  padding: 20px !important;
  overflow: hidden !important;
  flex: 1 !important;
}



.device-list-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.device-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-radius: 10px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
  flex-shrink: 0;
}

.device-table-scroll-wrapper {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  overflow: hidden;
}

.device-table-scroll-wrapper >>> .el-table__header-wrapper {
  background: #f8fafc;
  border-bottom: 2px solid #e5e7eb;
}

.device-table-scroll-wrapper >>> .el-table__header {
  background: #f8fafc !important;
}

.device-table-scroll-wrapper >>> .el-table th {
  background: #f8fafc !important;
  color: #374151 !important;
  font-weight: 600 !important;
  font-size: 14px !important;
  border-bottom: 2px solid #e5e7eb !important;
  text-align: center !important;
}

.device-table-scroll-wrapper >>> .el-table td {
  border-bottom: 1px solid #f3f4f6 !important;
  padding: 12px 0 !important;
  text-align: center !important;
}

.device-table-scroll-wrapper >>> .el-table th .cell {
  text-align: center !important;
}

.device-table-scroll-wrapper >>> .el-table td .cell {
  text-align: center !important;
}

.device-table-scroll-wrapper >>> .el-table--striped .el-table__body tr.el-table__row--striped td {
  background-color: #fafbfc !important;
}

.device-table-scroll-wrapper >>> .el-table__body tr:hover td {
  background-color: rgba(59, 130, 246, 0.05) !important;
}

/* 表格内按钮样式 */
.device-list-container >>> .el-button--text {
  color: #3b82f6 !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
}

.device-list-container >>> .el-button--text:hover {
  color: #1e40af !important;
  background-color: rgba(59, 130, 246, 0.1) !important;
}

.skill-name {
  font-size: 16px;
  font-weight: 600;
  color: #1e40af;
}

.device-list-header .device-count {
  font-size: 14px;
  color: #6b7280;
  background: white;
  padding: 4px 12px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.device-name {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  overflow: hidden;
}

.device-name i {
  color: #1e40af;
  font-size: 16px;
  flex-shrink: 0;
}

.device-name span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-id {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  max-width: 100%;
  text-align: center;
}

.device-location {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  overflow: hidden;
}

.device-location i {
  color: #ef4444;
  font-size: 14px;
  flex-shrink: 0;
}

.device-location span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 滚动条美化 */
.device-table-scroll-wrapper >>> .el-table__body-wrapper::-webkit-scrollbar {
  width: 8px;
}

.device-table-scroll-wrapper >>> .el-table__body-wrapper::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.device-table-scroll-wrapper >>> .el-table__body-wrapper::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.device-table-scroll-wrapper >>> .el-table__body-wrapper::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
}

/* 详情弹窗底部按钮 */
.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .page-container {
    max-width: 100%;
    padding: 0 15px;
  }
}

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    gap: 15px;
  }

  .header-right {
    flex-wrap: wrap;
  }

  .skills-grid {
    grid-template-columns: 1fr;
  }

  .search-input {
    width: 200px;
  }
  
  .page-container {
    padding: 0 10px;
  }
}

/* 详情页面新增样式 */
.version-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  color: #166534;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid #bbf7d0;
}

.version-badge i {
  color: #22c55e;
}

.prompt-template-content {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.prompt-template {
  margin: 0;
  padding: 16px;
  background: #1e293b;
  color: #e2e8f0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  border-radius: 0;
  max-height: 300px;
  overflow-y: auto;
}

.output-params-content .el-table {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.output-params-content .el-table th {
  background: #f8fafc !important;
  color: #374151 !important;
  font-weight: 600 !important;
  border-bottom: 2px solid #e5e7eb !important;
}

.output-params-content .el-table td {
  border-bottom: 1px solid #f3f4f6 !important;
}

.param-type {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  color: #6b7280;
}

.alert-conditions-content {
  background: #fefdf6;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  padding: 16px;
}

.condition-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #78350f;
  font-weight: 500;
}

.condition-groups {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.condition-group {
  background: white;
  border: 1px solid #fed7aa;
  border-radius: 6px;
  overflow: hidden;
}

.group-header {
  background: #fef3c7;
  padding: 8px 12px;
  border-bottom: 1px solid #fed7aa;
  font-size: 13px;
  font-weight: 600;
  color: #78350f;
}

.conditions-list {
  padding: 12px;
}

.condition-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
}

.condition-item:last-child {
  margin-bottom: 0;
}

.condition-field {
  background: #dbeafe;
  color: #1e40af;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.condition-operator {
  background: #f3e8ff;
  color: #7c3aed;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.condition-value {
  background: #ecfdf5;
  color: #166534;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.related-tasks-content .el-table {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.related-tasks-content .el-table th {
  background: #f8fafc !important;
  color: #374151 !important;
  font-weight: 600 !important;
  border-bottom: 2px solid #e5e7eb !important;
}

.related-tasks-content .el-table td {
  border-bottom: 1px solid #f3f4f6 !important;
}

/* 详情对话框响应式 */
@media (max-width: 768px) {
  .detail-content .el-dialog {
    width: 95% !important;
    margin: 10px auto !important;
  }
  
  .detail-header {
    flex-direction: column;
    text-align: center;
  }
  
  .header-content {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  
  .info-grid {
    grid-template-columns: 1fr !important;
    gap: 12px;
  }
  
  .condition-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .prompt-template {
    font-size: 12px;
    padding: 12px;
  }
}
</style>

<style>
/* 全局MessageBox确认弹框样式 - 与 warningManagement.vue 一致 */
.el-message-box {
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1) !important;
}

.el-message-box__header {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1) !important;
  padding: 16px 20px !important;
}

.el-message-box__title {
  color: #1f2937 !important;
  font-weight: 600 !important;
}

.el-message-box__headerbtn {
  color: #6b7280 !important;
  transition: color 0.3s ease !important;
}

.el-message-box__headerbtn:hover {
  color: #3b82f6 !important;
}

.el-message-box__content {
  padding: 20px !important;
  background: #ffffff !important;
}

.el-message-box__btns {
  padding: 10px 20px 20px !important;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  border-top: 1px solid rgba(59, 130, 246, 0.1) !important;
}

.el-message-box__btns .el-button {
  border-radius: 6px !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  padding: 8px 20px !important;
  margin-left: 12px !important;
}

.el-message-box__btns .el-button--primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
  border: none !important;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3) !important;
  color: white !important;
}

.el-message-box__btns .el-button--primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%) !important;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4) !important;
  transform: translateY(-1px) !important;
}

.el-message-box__btns .el-button--default {
  background: white !important;
  border: 1px solid #d1d5db !important;
  color: #4b5563 !important;
  transition: all 0.3s ease !important;
}

.el-message-box__btns .el-button--default:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e40af !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2) !important;
  transform: translateY(-1px) !important;
}
</style>
