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
              @click="batchDelete">
              批量删除
            </el-button>
            <el-button icon="el-icon-upload2" @click="importSkill">
              导入技能
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
              v-model="filterModel" 
              placeholder="模型类型" 
              class="select-model" 
              clearable 
              @change="handleFilter">
              <el-option label="GPT-4V" value="gpt-4v"></el-option>
              <el-option label="Claude-3" value="claude-3"></el-option>
              <el-option label="Gemini Pro Vision" value="gemini-pro-vision"></el-option>
              <el-option label="自定义模型" value="custom"></el-option>
            </el-select>
            
            <el-select
              v-model="filterTag"
              placeholder="技能标签"
              class="select-tag"
              clearable
              @change="handleFilter">
              <el-option
                v-for="tag in availableTags"
                :key="tag"
                :label="tag"
                :value="tag">
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
          <div class="skills-grid">
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
                  <span class="model-label">模型类型</span>
                  <el-tag size="mini" :type="getModelTagType(skill.model)">
                    {{ getModelDisplayName(skill.model) }}
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
                  @click="toggleSkillStatus(skill)">
                  {{ skill.status === 'enabled' ? '下架' : '发布' }}
                </el-button>
                <el-button size="small" @click="testSkill(skill)">测试</el-button>
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

    <!-- 技能测试对话框 -->
    <el-dialog 
      title="技能测试"
      :visible.sync="testDialogVisible"
      width="70%">
      <div class="test-container">
        <div class="test-input">
          <h4>输入测试内容</h4>
          <el-upload
            class="upload-demo"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleTestFileChange"
            :limit="1"
            accept="image/*">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将图片拖拽到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">支持jpg、png格式图片</div>
          </el-upload>
          
          <el-input 
            v-model="testQuery"
            type="textarea"
            :rows="3"
            placeholder="请输入测试问题">
          </el-input>
          
          <el-button 
            type="primary" 
            @click="runTest" 
            :loading="testing"
            style="margin-top: 10px;">
            开始测试
          </el-button>
        </div>

        <div class="test-result" v-if="testResult">
          <h4>测试结果</h4>
          <div class="result-content">
            {{ testResult }}
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 设备列表弹窗 -->
    <el-dialog
      title="关联设备列表"
      :visible.sync="deviceListVisible"
      width="800px"
      :close-on-click-modal="false">
      <div class="device-list-container">
        <div class="device-list-header">
          <span class="skill-name">{{ currentSkill.name }}</span>
          <span class="device-count">共 {{ deviceList.length }} 台设备</span>
        </div>
        <el-table :data="deviceList" style="width: 100%" stripe>
          <el-table-column prop="name" label="设备名称" width="200">
            <template slot-scope="scope">
              <div class="device-name">
                <i class="el-icon-monitor"></i>
                <span>{{ scope.row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="id" label="设备ID" width="180">
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
          <el-table-column prop="status" label="状态" width="120">
            <template slot-scope="scope">
              <el-tag 
                size="small" 
                :type="scope.row.status === 'online' ? 'success' : scope.row.status === 'offline' ? 'danger' : 'warning'">
                {{ getDeviceStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template slot-scope="scope">
              <el-button size="mini" type="text" @click="viewDevice(scope.row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deviceListVisible = false">关闭</el-button>
      </span>
    </el-dialog>

    <!-- 技能详情弹窗 -->
    <el-dialog
      title="技能详情"
      :visible.sync="detailDialogVisible"
      width="720px"
      :close-on-click-modal="false">
      <div class="detail-content">
        <!-- 头部信息 -->
        <div class="detail-header">
          <div class="header-content">
            <div class="detail-image">
              <img :src="detailSkill.image_url || '/static/logo.png'" alt="技能图片" />
            </div>
            <div class="header-info">
              <div class="title-row">
                <h3 class="detail-title">{{ detailSkill.name }}</h3>
                <div class="skill-type-tag">多模态大模型</div>
              </div>
              <div class="meta-row">
                <div class="id-badge">
                  <i class="el-icon-postcard"></i>
                  <span>{{ detailSkill.id }}</span>
                </div>
                <div class="status-badge" :class="detailSkill.status === 'enabled' ? 'published' : 'unpublished'">
                  <i class="el-icon-circle-check"></i>
                  <span>{{ detailSkill.status === 'enabled' ? '已发布' : '未发布' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 信息详情 -->
        <div class="detail-info-section">
          <div class="info-group">
            <h4 class="group-title">
              <i class="el-icon-info"></i>
              基本信息
            </h4>
            <div class="info-grid">
              <div class="info-item">
                <i class="el-icon-star-on item-icon"></i>
                <span class="item-label">技能类型</span>
                <span class="item-value skill-type-highlight">多模态大模型</span>
              </div>
              <div class="info-item">
                <i class="el-icon-cpu item-icon"></i>
                <span class="item-label">模型类型</span>
                <span class="item-value">{{ getModelDisplayName(detailSkill.model) }}</span>
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

          <div class="info-group">
            <h4 class="group-title">
              <i class="el-icon-document"></i>
              技能描述
            </h4>
            <div class="description-content">
              {{ detailSkill.description }}
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
      filterModel: '',
      filterTag: '',
      sortType: 'time', // 'time' 或 'name'
      sortOrder: 'desc', // 'asc' 或 'desc'
      
      // 可用标签列表
      availableTags: ['事件检测', '安全监控', '质量检测', '行为识别', '场景分析'],

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
      testDialogVisible: false,
      editingSkill: null,
      saving: false,
      testing: false,

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

      // 测试相关
      testQuery: '',
      testResult: '',
      testFile: null,

      // 技能数据
      skills: [
        {
          id: 'skill_001',
          name: '煤矿井下人员安全帽佩戴检测',
          description: '基于GPT-4V的煤矿井下作业人员安全帽佩戴状态智能识别技能，能够实时检测作业人员是否正确佩戴安全帽，识别安全帽颜色、型号是否符合规范，检测安全帽破损、松动等异常情况，并能区分不同工种人员的安全帽标准要求',
          model: 'gpt-4v',
          status: 'enabled',
          tags: '安全监控',
          accuracy: 97.8,
          callCount: 15234,
          deviceCount: 128,
          systemPrompt: '你是一个煤矿安全监控专家，专门负责检测井下作业人员的安全帽佩戴情况。你需要识别：1）安全帽是否正确佩戴；2）安全帽颜色是否符合工种要求（白色-管理人员，黄色-普通工人，红色-安全员）；3）安全帽是否有破损、变形；4）帽带是否系紧；5）是否存在多人未佩戴的群体性违规。',
          userPromptTemplate: '请仔细分析这张煤矿井下监控画面：{image}。检测画面中所有人员的安全帽佩戴情况，包括：佩戴状态、颜色规范性、破损情况、帽带系紧状态。如发现违规，请详细描述违规人员位置、违规类型和风险等级。',
          maxTokens: 1200,
          temperature: 0.2,
          createdAt: '2024-01-15 14:32:18',
          updatedAt: '2024-01-20 09:45:33'
        },
        {
          id: 'skill_002',
          name: '城市道路机动车违停抓拍识别',
          description: '基于Claude-3的城市道路机动车违法停车智能抓拍识别技能，能够精确识别禁停区域违停、消防通道占用、人行横道违停、公交站台违停等多种违停行为，自动提取车牌号码、车辆类型、违停时长，并生成标准化违法证据链',
          model: 'claude-3',
          status: 'enabled',
          tags: '事件检测',
          accuracy: 94.3,
          callCount: 28756,
          deviceCount: 186,
          systemPrompt: '你是一个交通违法识别专家，专门负责识别机动车违法停车行为。你需要准确判断：1）车辆是否在禁停区域停车；2）是否占用消防通道、盲道、人行横道；3）是否在公交站台、学校门口等特殊区域违停；4）车牌号码识别；5）车辆类型分类；6）违停持续时间评估。',
          userPromptTemplate: '分析这张城市道路监控画面：{image}。识别画面中是否存在机动车违法停车行为，包括：违停位置、车牌号码、车辆类型、违停性质（临时停车/长时间停放）、是否影响交通通行。请提供详细的违法事实描述。',
          maxTokens: 1500,
          temperature: 0.3,
          createdAt: '2024-01-10 16:28:45',
          updatedAt: '2024-01-18 11:22:17'
        },
        {
          id: 'skill_003',
          name: '电子制造业PCB板焊点质量检测',
          description: '基于Gemini Pro Vision的电子制造业PCB电路板焊点质量智能检测技能，能够识别虚焊、漏焊、桥接、焊点偏移、焊料过多/过少等缺陷，检测元器件贴装位置偏差、极性错误，并能对焊点光泽度、形状规整度进行评估',
          model: 'gemini-pro-vision',
          status: 'enabled',
          tags: '质量检测',
          accuracy: 96.7,
          callCount: 45892,
          deviceCount: 89,
          systemPrompt: '你是一个电子制造业质量检测专家，专门负责PCB板焊点质量检测。你需要识别：1）焊点缺陷（虚焊、漏焊、桥接、冷焊）；2）焊料问题（过多、过少、形状不规整）；3）元器件贴装问题（位置偏移、极性错误、缺件）；4）焊点光泽度和表面质量；5）整体焊接工艺水平评估。',
          userPromptTemplate: '请检测这张PCB电路板的焊接质量：{image}。重点检查所有可见焊点的质量状况，包括：焊点完整性、焊料分布、元器件贴装精度、是否存在桥接或虚焊。对发现的缺陷进行分类标注，并评估整体质量等级。',
          maxTokens: 1800,
          temperature: 0.4,
          createdAt: '2024-01-12 10:15:22',
          updatedAt: '2024-01-19 15:38:41'
        },
        {
          id: 'skill_004',
          name: '中小学校园学生打架斗殴行为识别',
          description: '专用于中小学校园安全的学生打架斗殴行为智能识别技能，能够识别学生间的推搡、拳打脚踢、群体冲突等暴力行为，区分正常嬉戏与真实冲突，检测围观起哄、教师介入等相关情况，并能评估冲突激烈程度和紧急程度',
          model: 'gpt-4v',
          status: 'disabled',
          tags: '行为识别',
          accuracy: 89.4,
          callCount: 3456,
          deviceCount: 67,
          systemPrompt: '你是一个校园安全监控专家，专门识别学生打架斗殴行为。你需要准确区分：1）真实的暴力冲突与正常的体育活动、游戏嬉戏；2）冲突的激烈程度（轻微推搡、拳脚相向、使用器械）；3）参与人数（单打独斗、群体冲突）；4）是否有围观起哄；5）教师或保安是否在场介入；6）冲突发生的具体位置。',
          userPromptTemplate: '分析这张校园监控画面：{image}。判断是否存在学生打架斗殴行为，区分正常活动与暴力冲突。如发现冲突，请描述：参与学生数量、冲突激烈程度、发生位置、是否需要紧急介入，并评估事件的严重等级。',
          maxTokens: 1000,
          temperature: 0.5,
          createdAt: '2024-01-08 13:47:56',
          updatedAt: '2024-01-16 08:12:29'
        },
        {
          id: 'skill_005',
          name: '科技园区外来访客身份验证与行为监控',
          description: '基于自定义模型的科技园区外来访客身份验证与行为监控技能，能够识别访客证件佩戴情况、陪同人员身份、访问区域权限匹配，检测可疑拍照录像行为、长时间逗留、偏离预定路线等异常行为，并能识别携带物品的安全性',
          model: 'custom',
          status: 'enabled',
          tags: '场景分析',
          accuracy: 93.6,
          callCount: 18934,
          deviceCount: 156,
          systemPrompt: '你是一个科技园区安全管理专家，专门负责外来访客的身份验证和行为监控。你需要识别：1）访客是否佩戴访客证/临时证件；2）是否有园区员工陪同；3）访客行为是否异常（拍照、录像、长时间逗留）；4）是否进入非授权区域；5）携带物品是否可疑；6）访客着装和行为是否符合商务访问规范。',
          userPromptTemplate: '分析这张科技园区监控画面：{image}。检查画面中的访客身份验证情况和行为表现，包括：证件佩戴、陪同情况、行为是否异常、所在区域是否合规、携带物品情况。如发现异常，请详细描述异常类型和建议处理措施。',
          maxTokens: 1300,
          temperature: 0.3,
          createdAt: '2024-01-05 09:23:14',
          updatedAt: '2024-01-21 16:55:42'
        },
                 {
           id: 'skill_006',
           name: '高速公路货车超载违法检测',
           description: '基于GPT-4V的高速公路货车超载违法智能检测技能，能够通过车辆外观特征判断货车装载状态，识别车厢超高、超宽、货物遗撒、车辆倾斜等超载征象，检测货车轮胎变形程度，并能区分不同货车类型的载重标准',
           model: 'gpt-4v',
           status: 'enabled',
           tags: '事件检测',
           accuracy: 91.2,
           callCount: 12567,
           deviceCount: 78,
           systemPrompt: '你是一个高速公路货车超载检测专家，专门通过视觉特征判断货车是否超载。你需要识别：1）货车车厢是否超高超宽；2）车辆是否明显倾斜或下沉；3）轮胎是否严重变形；4）货物是否有遗撒风险；5）车辆类型和对应的载重标准；6）超载的严重程度评估。',
           userPromptTemplate: '分析这张高速公路监控画面：{image}。检测画面中的货车是否存在超载违法行为，重点观察：车辆外观变化、货厢装载状态、轮胎变形情况、车辆行驶姿态。如发现超载征象，请描述具体表现和超载程度评估。',
           maxTokens: 1100,
           temperature: 0.3,
           createdAt: '2024-01-14 11:45:23',
           updatedAt: '2024-01-22 14:28:56'
         },
         {
           id: 'skill_007',
           name: '医院手术室无菌操作规范检测',
           description: '基于Claude-3的医院手术室无菌操作规范智能监控技能，能够识别医护人员手术服穿戴规范、口罩佩戴、手套更换、器械消毒、无菌区域维护等关键操作，检测交叉感染风险行为，确保手术室无菌环境标准',
           model: 'claude-3',
           status: 'enabled',
           tags: '质量检测',
           accuracy: 98.1,
           callCount: 8934,
           deviceCount: 45,
           systemPrompt: '你是一个医院感染控制专家，专门监控手术室无菌操作规范。你需要识别：1）医护人员手术服、帽子、口罩、手套穿戴是否规范；2）是否正确执行手部消毒程序；3）器械和设备消毒是否到位；4）无菌区域是否被污染；5）人员流动是否符合无菌原则；6）废物处理是否规范。',
           userPromptTemplate: '分析这张手术室监控画面：{image}。检查医护人员的无菌操作规范，包括：防护用品穿戴、消毒程序执行、无菌区域维护、器械处理规范。如发现违规操作，请详细描述违规行为和感染风险等级。',
           maxTokens: 1400,
           temperature: 0.2,
           createdAt: '2024-01-16 08:15:34',
           updatedAt: '2024-01-23 10:42:18'
         },
         {
           id: 'skill_008',
           name: '化工厂危险品泄漏预警检测',
           description: '基于Gemini Pro Vision的化工厂危险品泄漏预警智能检测技能，能够识别管道破损、阀门泄漏、储罐异常、气体扩散、液体渗漏等危险情况，检测防护设备状态、人员撤离情况，并能评估泄漏规模和危险等级',
           model: 'gemini-pro-vision',
           status: 'enabled',
           tags: '安全监控',
           accuracy: 96.4,
           callCount: 6789,
           deviceCount: 156,
           systemPrompt: '你是一个化工安全监控专家，专门识别危险品泄漏和安全隐患。你需要识别：1）管道、阀门、储罐是否有泄漏迹象；2）是否有异常气体或液体扩散；3）安全防护设备是否正常工作；4）现场人员是否采取正确防护措施；5）泄漏规模和扩散范围；6）紧急处置设备是否启动。',
           userPromptTemplate: '分析这张化工厂监控画面：{image}。检测是否存在危险品泄漏或安全隐患，包括：设备状态、泄漏迹象、气体扩散、人员防护、应急响应。如发现异常，请立即描述危险类型、影响范围和紧急程度。',
           maxTokens: 1600,
           temperature: 0.1,
           createdAt: '2024-01-11 15:28:47',
           updatedAt: '2024-01-24 09:33:25'
         },
         {
           id: 'skill_009',
           name: '银行ATM机异常行为识别',
           description: '基于GPT-4V的银行ATM机周边异常行为智能识别技能，能够检测可疑人员长时间逗留、多人聚集、安装可疑设备、遮挡摄像头、暴力破坏等异常行为，识别ATM机设备异常状态和周边环境安全风险',
           model: 'gpt-4v',
           status: 'enabled',
           tags: '行为识别',
           accuracy: 94.7,
           callCount: 23456,
           deviceCount: 234,
           systemPrompt: '你是一个银行安全监控专家，专门识别ATM机周边的异常行为和安全风险。你需要识别：1）可疑人员是否长时间逗留或多次返回；2）是否有人安装可疑设备或遮挡设备；3）是否存在暴力破坏或异常操作；4）ATM机设备状态是否正常；5）周边环境是否存在安全隐患；6）客户操作是否受到干扰或威胁。',
           userPromptTemplate: '分析这张银行ATM机监控画面：{image}。检测ATM机周边是否存在异常行为或安全风险，包括：可疑人员行为、设备异常状态、环境安全隐患、客户安全威胁。如发现异常，请描述具体行为和风险等级。',
           maxTokens: 1200,
           temperature: 0.3,
           createdAt: '2024-01-09 12:56:12',
           updatedAt: '2024-01-25 16:18:39'
         },
         {
           id: 'skill_010',
           name: '食品加工厂卫生标准合规检测',
           description: '基于自定义模型的食品加工厂卫生标准合规智能检测技能，能够识别工作人员卫生防护用品穿戴、食品接触面清洁度、生熟分离执行、温度控制设备状态、虫害防控措施等关键卫生指标',
           model: 'custom',
           status: 'disabled',
           tags: '质量检测',
           accuracy: 92.3,
           callCount: 5678,
           deviceCount: 89,
           systemPrompt: '你是一个食品安全监管专家，专门检查食品加工厂的卫生标准合规情况。你需要识别：1）工作人员是否正确穿戴工作服、帽子、口罩、手套；2）食品接触面和设备清洁度是否达标；3）生熟食品是否严格分离；4）温度控制设备是否正常运行；5）是否存在虫害或污染源；6）废料处理是否规范。',
           userPromptTemplate: '分析这张食品加工厂监控画面：{image}。检查卫生标准合规情况，包括：人员防护、设备清洁、食品安全、环境卫生、温控管理。如发现不合规情况，请详细描述问题和整改建议。',
           maxTokens: 1500,
           temperature: 0.4,
           createdAt: '2024-01-07 14:33:28',
           updatedAt: '2024-01-26 11:47:15'
         },
         {
           id: 'skill_011',
           name: '建筑工地高空作业安全带检测',
           description: '基于Claude-3的建筑工地高空作业安全带佩戴智能检测技能，能够识别高空作业人员安全带、安全帽、防护服穿戴情况，检测安全绳固定点、作业平台护栏、安全网设置等防护措施完整性',
           model: 'claude-3',
           status: 'enabled',
           tags: '安全监控',
           accuracy: 95.8,
           callCount: 18765,
           deviceCount: 167,
           systemPrompt: '你是一个建筑安全监督专家，专门检查高空作业安全防护措施。你需要识别：1）作业人员是否正确佩戴安全带、安全帽；2）安全绳是否正确连接到可靠固定点；3）作业平台护栏是否完整；4）安全网是否正确设置；5）作业人员是否在安全区域内；6）是否存在违规作业行为。',
           userPromptTemplate: '分析这张建筑工地高空作业监控画面：{image}。检查高空作业安全防护措施，包括：安全带佩戴、安全绳连接、护栏设置、安全网布置、作业规范性。如发现安全隐患，请详细描述风险点和紧急程度。',
           maxTokens: 1300,
           temperature: 0.2,
           createdAt: '2024-01-13 09:41:56',
           updatedAt: '2024-01-27 13:22:44'
         },
         {
           id: 'skill_012',
           name: '机场跑道异物入侵检测',
           description: '基于Gemini Pro Vision的机场跑道异物入侵智能检测技能，能够识别跑道上的鸟类、小动物、垃圾、设备残留、人员误入等异物，检测跑道表面损坏、积水、结冰等影响飞行安全的情况',
           model: 'gemini-pro-vision',
           status: 'enabled',
           tags: '事件检测',
           accuracy: 97.9,
           callCount: 34567,
           deviceCount: 78,
           systemPrompt: '你是一个机场跑道安全监控专家，专门识别跑道异物和安全隐患。你需要识别：1）跑道上是否有鸟类、动物或人员误入；2）是否有垃圾、设备残留或其他异物；3）跑道表面是否有损坏、裂缝；4）是否存在积水、结冰或其他气象影响；5）跑道标识和灯光设备是否正常；6）异物的大小和危险程度评估。',
           userPromptTemplate: '分析这张机场跑道监控画面：{image}。检测跑道是否存在异物入侵或安全隐患，包括：生物入侵、异物残留、表面损坏、气象影响、设备状态。如发现异常，请立即描述异物类型、位置和飞行安全影响程度。',
           maxTokens: 1400,
           temperature: 0.1,
           createdAt: '2024-01-18 16:25:33',
           updatedAt: '2024-01-28 08:14:27'
                   }
        ],

      detailDialogVisible: false,
      detailSkill: {},

      // 设备列表相关
      deviceListVisible: false,
      currentSkill: {},
      deviceList: []
    }
  },
  computed: {
    // 过滤后的技能列表
    filteredSkills() {
      let filtered = this.skills.filter(skill => {
        const matchSearch = !this.searchKeyword || 
          skill.name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
          skill.description.toLowerCase().includes(this.searchKeyword.toLowerCase())
        
        const matchStatus = !this.filterStatus || skill.status === this.filterStatus
        const matchModel = !this.filterModel || skill.model === this.filterModel
        const matchTag = !this.filterTag || skill.tags === this.filterTag
        
        return matchSearch && matchStatus && matchModel && matchTag
      })

      // 排序
      if (this.sortType === 'name') {
        filtered.sort((a, b) => {
          const result = a.name.localeCompare(b.name)
          return this.sortOrder === 'asc' ? result : -result
        })
      } else {
        filtered.sort((a, b) => {
          const result = new Date(a.updatedAt) - new Date(b.updatedAt)
          return this.sortOrder === 'asc' ? result : -result
        })
      }

      this.totalCount = filtered.length
      return filtered
    },

    // 分页后的技能列表
    paginatedSkills() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredSkills.slice(start, end)
    },

    // 排序类型文本
    sortTypeText() {
      return this.sortType === 'name' ? '按名称排序' : '按更新时间排序'
    },

    // 是否全选
    isAllSelected() {
      return this.selectedSkills.length === this.filteredSkills.length && this.filteredSkills.length > 0
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
    },

    // 过滤
    handleFilter() {
      this.currentPage = 1
    },

    // 刷新数据
    refreshData() {
      // 模拟数据刷新
      this.$message.success('数据刷新成功')
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
        this.selectedSkills = [...this.filteredSkills.map(skill => skill.id)]
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
    },

    handleCurrentChange(val) {
      this.currentPage = val
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

    // 编辑技能
    editSkill(skill) {
      this.editingSkill = skill
      this.skillForm = { ...skill }
      this.skillDialogVisible = true
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
    toggleSkillStatus(skill) {
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
      this.$message.success(`技能已${newStatus === 'enabled' ? '发布' : '下架'}`)
    },

    // 测试技能
    testSkill(skill) {
      this.testDialogVisible = true
      this.testQuery = ''
      this.testResult = ''
      this.testFile = null
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
    batchDelete() {
      if (this.selectedSkills.length === 0) {
        this.$message.warning('请先选择要删除的技能')
        return
      }

      this.$confirm(`确定要删除选中的 ${this.selectedSkills.length} 个技能吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.skills = this.skills.filter(skill => !this.selectedSkills.includes(skill.id))
        this.selectedSkills = []
        this.$message.success('批量删除成功')
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    // 导入技能
    importSkill() {
      this.$message.info('导入功能开发中...')
    },

    // 处理测试文件上传
    handleTestFileChange(file) {
      this.testFile = file
    },

    // 运行测试
    runTest() {
      if (!this.testQuery && !this.testFile) {
        this.$message.warning('请上传图片或输入测试问题')
        return
      }

      this.testing = true
      
      // 模拟测试
      setTimeout(() => {
        this.testResult = '测试结果：检测到图片中包含一个人和一辆车，场景为城市街道，天气晴朗。人物正在过马路，车辆处于静止状态。未发现安全隐患。'
        this.testing = false
      }, 2000)
    },

    showSkillDetail(skill) {
      this.detailSkill = skill
      this.detailDialogVisible = true
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
    }
  },

  mounted() {
    // 简单直接：每次进入页面自动刷新一次（避免状态污染）
    if (!sessionStorage.getItem('multimodalSkillsLoaded')) {
      sessionStorage.setItem('multimodalSkillsLoaded', 'true')
      window.location.reload()
      return
    }
    
    // 初始化数据
    this.searchKeyword = this.searchInput
  },
  
  beforeDestroy() {
    // 页面销毁时清除标志
    sessionStorage.removeItem('multimodalSkillsLoaded')
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
.select-model,
.select-tag {
  width: 180px;
}

.select-status .el-input__inner,
.select-model .el-input__inner,
.select-tag .el-input__inner {
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

/* 测试对话框 */
.test-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.test-input,
.test-result {
  padding: 15px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

.test-result {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: rgba(59, 130, 246, 0.3);
}

.result-content {
  padding: 12px;
  background: white;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  border: 1px solid rgba(59, 130, 246, 0.1);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
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

.info-grid .info-item:first-child {
  grid-column: 1 / -1;
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
.device-list-container {
  padding: 0;
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
  gap: 8px;
}

.device-name i {
  color: #1e40af;
  font-size: 16px;
}

.device-id {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  color: #374151;
}

.device-location {
  display: flex;
  align-items: center;
  gap: 6px;
}

.device-location i {
  color: #ef4444;
  font-size: 14px;
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
