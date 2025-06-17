<template>
  <div class="device-skills-container">
    <!-- 顶部搜索和筛选区域 -->
    <div class="filter-section">
      <div class="toolbar">
        <div class="left-controls">
          <el-button type="primary" icon="el-icon-plus" size="small" @click="handleImportSkill">导入技能</el-button>
          <el-button type="danger" icon="el-icon-delete" size="small" :disabled="!selectedSkills.length" @click="handleBatchDelete">批量删除</el-button>
          <el-button type="info" icon="el-icon-check" size="small" @click="selectAllCurrentPage">选择本页</el-button>
          <el-button type="success" icon="el-icon-refresh-right" size="small" @click="handleReloadSkillClasses" :loading="reloading">加载技能</el-button>
        </div>
        
        <div class="right-controls">
          <div class="filter-item">
            <span class="filter-label">状态:</span>
            <el-select 
              v-model="tempFilterStatus" 
              placeholder="选择状态"
              clearable
              size="small"
              @change="debounceSearch"
            >
              <el-option label="已发布" value="published" />
              <el-option label="未发布" value="unpublished" />
            </el-select>
          </div>
          
          <div class="filter-item">
            <span class="filter-label">技能类型:</span>
            <el-select 
              v-model="tempFilterType" 
              placeholder="选择类型"
              clearable
              size="small"
              @change="debounceSearch"
            >
              <el-option 
                v-for="type in skillTypes" 
                :key="type" 
                :label="type" 
                :value="type"
              />
            </el-select>
          </div>

          <el-input
            v-model="tempSearchQuery"
            placeholder="请输入技能名称搜索"
            clearable
            size="small"
            class="search-input"
            @input="debounceSearch"
            @clear="clearSearch"
          >
            <i slot="prefix" class="el-icon-search"></i>
          </el-input>
          <el-button 
            class="refresh-btn" 
            size="small" 
            icon="el-icon-refresh-left" 
            @click="handleRefreshData"
            :loading="refreshing"
            title="刷新数据"
          ></el-button>
        </div>
      </div>
    </div>

    <!-- 技能列表卡片区域 -->
    <div class="skills-grid">
      <el-row :gutter="15" type="flex" justify="start">
        <el-col
          v-for="skill in displaySkills"
          :key="skill.id"
          :xs="12"
          :sm="8"
          :md="6"
          :lg="4"
          class="skill-col"
        >
          <div class="skill-card-wrapper">
            <el-card 
              class="skill-card" 
              :body-style="{ padding: '0px' }"
              shadow="hover" 
              :class="{ 'selected': isSelected(skill.id) }" 
              @click.native="viewSkillDetails(skill)"
              @mouseenter.native="showCardCheckbox(skill.id)"
              @mouseleave.native="hideCardCheckbox(skill.id)"
            >
              <div class="selection-overlay" v-if="isSelected(skill.id)"></div>
              
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
              <div class="skill-thumbnail">
                <img :src="skill.image_url || '/static/logo.png'" class="thumbnail-img" alt="技能图标">
              </div>
              <div class="skill-info">
                <h3 class="skill-title">{{ skill.name_zh }}</h3>
                <div class="version-line">
                  <el-tag 
                    size="mini" 
                    :type="skill.status === 'published' ? 'success' : 'info'" 
                    class="status-mini-tag"
                  >
                    {{ skill.status === 'published' ? '已发布' : '未发布' }}
                  </el-tag>
                  <span class="version-text">版本 {{ skill.version }}</span>
                </div>
                <div class="info-line">
                  <span class="info-item">类型：{{ skill.type }}</span>
                  <span class="info-item">关联设备：{{ skill.deviceCount }}</span>
                </div>
                <p class="model-info">
                  模型：
                  <span class="model-name" :title="getModelTitle(skill.models)">
                    <template v-if="skill.models && skill.models.length > 0">
                      {{ skill.models[0] }}
                      <template v-if="skill.models.length > 1">
                        , {{ skill.models[1] }}
                        <span v-if="skill.models.length > 2" class="model-more">...</span>
                      </template>
                    </template>
                    <template v-else>-</template>
                  </span>
                </p>
              </div>
            </el-card>
          </div>
        </el-col>
      </el-row>
    </div>
  
    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        :current-page.sync="currentPage"
        :page-size.sync="pageSize"
        :total="total"
        :page-sizes="[12, 24, 36]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 导入技能对话框 -->
    <el-dialog title="导入技能" :visible.sync="importDialogVisible" width="40%">
      <el-form :model="importForm" ref="importForm" label-width="100px" :rules="importRules">
        <el-form-item label="技能名称" prop="name">
          <el-input v-model="importForm.name" placeholder="请输入技能名称"></el-input>
        </el-form-item>
        <el-form-item label="版本" prop="version">
          <el-input v-model="importForm.version" placeholder="请输入版本号，如v1.0"></el-input>
        </el-form-item>
        <el-form-item label="技能类型" prop="type">
          <el-select v-model="importForm.type" placeholder="请选择技能类型" style="width: 100%">
            <el-option label="人体检测" value="人体检测" />
            <el-option label="车辆检测" value="车辆检测" />
            <el-option label="人脸识别" value="人脸识别" />
            <el-option label="目标跟踪" value="目标跟踪" />
            <el-option label="人群分析" value="人群分析" />
            <el-option label="车牌识别" value="车牌识别" />
            <el-option label="行为分析" value="行为分析" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="importForm.status">
            <el-radio label="published">
              <span class="status-radio published">已发布</span>
            </el-radio>
            <el-radio label="unpublished">
              <span class="status-radio unpublished">未发布</span>
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="技能描述" prop="description">
          <el-input type="textarea" v-model="importForm.description" rows="3" placeholder="请输入技能描述"></el-input>
        </el-form-item>
        <el-form-item label="技能文件" prop="file">
          <el-upload
            class="upload-demo"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :limit="1"
            :file-list="fileList"
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">只能上传json文件，且不超过500kb</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmImport" :loading="importing">确定</el-button>
      </span>
    </el-dialog>

    <!-- 技能详情对话框 -->
    <el-dialog :title="isEditing ? '编辑技能' : '技能详情'" :visible.sync="detailsDialogVisible" width="50%" :close-on-click-modal="false">
      <div v-if="currentSkill" class="skill-details">
        <el-form v-if="isEditing" :model="editForm" ref="editForm" label-width="0">
          <div class="skill-header">
            <div class="skill-image-upload">
              <el-upload
                class="avatar-uploader"
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleImageChange"
              >
                <img v-if="imageUrl" :src="imageUrl" class="avatar" alt="技能图标">
                <img v-else :src="currentSkill.image_url || '/static/logo.png'" class="avatar" alt="技能图标">
                <div class="upload-mask">
                  <i class="el-icon-plus"></i>
                  <span>更换图片</span>
                </div>
              </el-upload>
            </div>
            <div class="skill-title">
              <el-input 
                v-model="editForm.name_zh" 
                placeholder="请输入技能名称" 
                class="name-edit-input"
                :rules="[
                  { required: true, message: '请输入技能名称', trigger: 'blur' },
                  { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
                ]"
              ></el-input>
              <div class="skill-subtitle">
                <el-tag :type="currentSkill.status === 'published' ? 'success' : 'info'" size="medium" class="status-inline-tag">
                  {{ currentSkill.status === 'published' ? '已发布' : '未发布' }}
                </el-tag>
                <span class="version-edit">
                  版本 <el-input v-model="editForm.version" class="version-input" placeholder="请输入版本号"></el-input>
                </span>
              </div>
            </div>
          </div>
          
          <el-divider></el-divider>
          
          <div class="skill-info-section">
            <div class="info-card">
              <div class="info-card-header">
                <i class="el-icon-info"></i>
                <span>基本信息</span>
              </div>
              <div class="info-card-content">
                <div class="info-row">
                  <div class="info-item half-width">
                    <span class="info-label">技能类型：</span>
                    <span class="info-value">{{ currentSkill.type }}</span>
                  </div>
                  <div class="info-item half-width">
                    <span class="info-label">关联设备：</span>
                    <span class="info-value clickable" @click="showDevicesList">{{ currentSkill.deviceCount }}</span>
                  </div>
                </div>
                
                <div class="info-row">
                  <div class="info-item half-width">
                    <span class="info-label">创建时间：</span>
                    <span class="info-value">{{ currentSkill.createTime || '-' }}</span>
                  </div>
                  <div class="info-item half-width">
                    <span class="info-label">最后更新：</span>
                    <span class="info-value">{{ currentSkill.updateTime || '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="info-card">
              <div class="info-card-header">
                <i class="el-icon-cpu"></i>
                <span>使用模型</span>
              </div>
              <div class="info-card-content">
                <div class="info-row">
                  <div class="info-item">
                    <div class="model-tags">
                      <el-tag 
                        size="medium" 
                        type="info" 
                        v-for="(model, index) in currentSkill.models" 
                        :key="index"
                        class="model-tag"
                      >
                        {{ model }}
                      </el-tag>
                      <span v-if="!currentSkill.models || !currentSkill.models.length" class="no-data">暂无模型信息</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="info-card">
              <div class="info-card-header">
                <i class="el-icon-document"></i>
                <span>技能描述</span>
              </div>
              <div class="info-card-content">
                <div class="info-row">
                  <div class="info-item description-item">
                    <el-input 
                      type="textarea" 
                      v-model="editForm.description" 
                      :rows="4" 
                      placeholder="请输入技能描述"
                      class="description-edit-input"
                    ></el-input>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="info-card" v-if="currentSkill.aiTasks && currentSkill.aiTasks.length > 0">
              <div class="info-card-header">
                <i class="el-icon-s-operation"></i>
                <span>AI任务列表</span>
              </div>
              <div class="info-card-content">
                <div class="skill-instances-container">
                  <div class="instances-wrapper">
                    <div class="instance-item" 
                      v-for="task in currentSkill.aiTasks" 
                      :key="task.id">
                      <div class="instance-header">
                        <h4>{{ task.name }}</h4>
                        <el-tag :type="task.status ? 'success' : 'info'" size="mini" class="status-tag">
                          {{ task.status ? '运行中' : '已停止' }}
                        </el-tag>
                      </div>
                      <div class="instance-info">
                        <div class="info-row-small">
                          <span class="info-label-small">关联摄像头：</span>
                          <span class="info-value-small">{{ task.camera_info ? task.camera_info.name : '-' }}</span>
                        </div>
                        <div class="info-row-small">
                          <span class="info-label-small">摄像头位置：</span>
                          <span class="info-value-small">{{ task.camera_info ? task.camera_info.location : '-' }}</span>
                        </div>
                        <div class="info-row-small">
                          <span class="info-label-small">创建时间：</span>
                          <span class="info-value-small">{{ formatDateTime(task.created_at) }}</span>
                        </div>
                        <div class="info-row-small">
                          <span class="info-label-small">更新时间：</span>
                          <span class="info-value-small">{{ formatDateTime(task.updated_at) }}</span>
                        </div>
                      </div>
                      <div class="instance-desc">
                        <p :title="task.description">
                          {{ task.description || '暂无任务描述' }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-form>
        
        <div v-else>
          <div class="skill-header">
            <img :src="currentSkill.image_url || '/static/logo.png'" alt="技能图标" class="skill-logo">
            <div class="skill-title">
              <h2>{{ currentSkill.name_zh }}</h2>
              <div class="skill-subtitle">
                <el-tag :type="currentSkill.status === 'published' ? 'success' : 'info'" size="medium" class="status-inline-tag">
                  {{ currentSkill.status === 'published' ? '已发布' : '未发布' }}
                </el-tag>
                <span class="version">版本 {{ currentSkill.version }}</span>
              </div>
            </div>
          </div>
          
          <el-divider></el-divider>
          
          <div class="skill-info-section">
            <div class="info-card">
              <div class="info-card-header">
                <i class="el-icon-info"></i>
                <span>基本信息</span>
              </div>
              <div class="info-card-content">
                <div class="info-row">
                  <div class="info-item half-width">
                    <span class="info-label">技能类型：</span>
                    <span class="info-value">{{ currentSkill.type }}</span>
                  </div>
                  <div class="info-item half-width">
                    <span class="info-label">关联设备：</span>
                    <span class="info-value clickable" @click="showDevicesList">{{ currentSkill.deviceCount }}</span>
                  </div>
                </div>
                
                <div class="info-row">
                  <div class="info-item half-width">
                    <span class="info-label">创建时间：</span>
                    <span class="info-value">{{ currentSkill.createTime || '-' }}</span>
                  </div>
                  <div class="info-item half-width">
                    <span class="info-label">最后更新：</span>
                    <span class="info-value">{{ currentSkill.updateTime || '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="info-card">
              <div class="info-card-header">
                <i class="el-icon-cpu"></i>
                <span>使用模型</span>
              </div>
              <div class="info-card-content">
                <div class="info-row">
                  <div class="info-item">
                    <div class="model-tags">
                      <el-tag 
                        size="medium" 
                        type="info" 
                        v-for="(model, index) in currentSkill.models" 
                        :key="index"
                        class="model-tag"
                      >
                        {{ model }}
                      </el-tag>
                      <span v-if="!currentSkill.models || !currentSkill.models.length" class="no-data">暂无模型信息</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="info-card">
              <div class="info-card-header">
                <i class="el-icon-document"></i>
                <span>技能描述</span>
              </div>
              <div class="info-card-content">
                <div class="info-row">
                  <div class="info-item description-item">
                    <span class="info-value description-content">
                      {{ currentSkill.description || '暂无描述信息' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="info-card" v-if="currentSkill.aiTasks && currentSkill.aiTasks.length > 0">
              <div class="info-card-header">
                <i class="el-icon-s-operation"></i>
                <span>AI任务列表</span>
              </div>
              <div class="info-card-content">
                <div class="skill-instances-container">
                  <div class="instances-wrapper">
                    <div class="instance-item" 
                      v-for="task in currentSkill.aiTasks" 
                      :key="task.id">
                      <div class="instance-header">
                        <h4>{{ task.name }}</h4>
                        <el-tag :type="task.status ? 'success' : 'info'" size="mini" class="status-tag">
                          {{ task.status ? '运行中' : '已停止' }}
                        </el-tag>
                      </div>
                      <div class="instance-info">
                        <div class="info-row-small">
                          <span class="info-label-small">关联摄像头：</span>
                          <span class="info-value-small">{{ task.camera_info ? task.camera_info.name : '-' }}</span>
                        </div>
                        <div class="info-row-small">
                          <span class="info-label-small">摄像头位置：</span>
                          <span class="info-value-small">{{ task.camera_info ? task.camera_info.location : '-' }}</span>
                        </div>
                        <div class="info-row-small">
                          <span class="info-label-small">创建时间：</span>
                          <span class="info-value-small">{{ formatDateTime(task.created_at) }}</span>
                        </div>
                        <div class="info-row-small">
                          <span class="info-label-small">更新时间：</span>
                          <span class="info-value-small">{{ formatDateTime(task.updated_at) }}</span>
                        </div>
                      </div>
                      <div class="instance-desc">
                        <p :title="task.description">
                          {{ task.description || '暂无任务描述' }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelEdit">{{ isEditing ? '取消' : '关闭' }}</el-button>
        <el-button v-if="!isEditing" type="primary" @click="startEditing">编辑</el-button>
        <el-button v-else type="primary" @click="saveChanges" :loading="editing">保存</el-button>
      </span>
    </el-dialog>

    <!-- 关联设备列表弹框 -->
    <el-dialog
      :visible.sync="devicesDialogVisible"
      width="40%"
      :close-on-click-modal="true"
      append-to-body
      custom-class="devices-dialog"
      :title="deviceDialogTitle"
      :show-close="true"
    >
      <div class="devices-list-container">
        <el-table
          v-loading="loadingDevices"
          :data="relatedDevices"
          style="width: 100%; background-color: #ffffff;"
          max-height="400"
          :header-cell-style="{background:'#f5f7fa',color:'#303133', fontWeight: '500', textAlign: 'center'}"
          :cell-style="{textAlign: 'center', backgroundColor: '#ffffff'}"
          :row-style="{backgroundColor: '#ffffff'}"
          :row-class-name="tableRowClassName"
        >
          <el-table-column
            prop="name"
            label="设备名称"
            width="160"
            align="center">
          </el-table-column>
          <el-table-column
            prop="id"
            label="设备ID"
            min-width="220"
            align="center">
            <template slot-scope="scope">
              {{ scope.row.id }}
            </template>
          </el-table-column>
          <el-table-column
            prop="location"
            label="位置"
            min-width="120"
            align="center">
          </el-table-column>
          <el-table-column
            prop="status"
            label="状态"
            width="80"
            align="center">
            <template slot-scope="scope">
              <el-tag :type="scope.row.status ? 'success' : 'info'" size="mini" effect="light">
                {{ scope.row.status ? '在线' : '离线' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="relatedDevices.length === 0 && !loadingDevices" class="no-devices-tip">
          <i class="el-icon-info"></i>
          <span>暂无关联设备</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { skillAPI } from '@/components/service/VisionAIService.js';

export default {
  name: 'DeviceSkills',
  
  data() {
    return {
      // 搜索和筛选条件
      tempSearchQuery: '',
      tempFilterStatus: '',
      tempFilterType: '',
      // 实际用于过滤的条件
      searchQuery: '',
      filterStatus: '',
      filterType: '',

      // 技能列表数据
      skillsList: [],
      selectedSkills: [], // 已选择的技能ID
      cardHoverStates: {}, // 卡片悬停状态

      // 分页配置
      currentPage: 1,
      pageSize: 12,
      total: 0,

      // 对话框控制
      importDialogVisible: false,
      detailsDialogVisible: false,
      currentSkill: null, // 当前查看详情的技能

      // 搜索防抖定时器
      searchTimer: null,
      
      // 导入相关
      importForm: {
        name: '',
        version: '',
        type: '',
        status: 'published',
        description: '',
        file: null
      },
      importRules: {
        name: [
          { required: true, message: '请输入技能名称', trigger: 'blur' },
          { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
        ],
        version: [
          { required: true, message: '请输入版本号', trigger: 'blur' },
          { pattern: /^v\d+\.\d+$/, message: '版本号格式为vX.X', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择技能类型', trigger: 'change' }
        ],
        file: [
          { required: true, message: '请上传技能文件', trigger: 'change' }
        ]
      },
      fileList: [],
      importing: false, // 导入中状态
      loading: false,   // 数据加载状态
      reloading: false, // 热加载状态
      refreshing: false, // 刷新状态

      // 编辑相关
      editForm: {
        name_zh: '',
        description: '',
        image_url: '',
        version: ''
      },
      editRules: {
        name_zh: [
          { required: true, message: '请输入技能名称', trigger: 'blur' },
          { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入技能描述', trigger: 'blur' }
        ],
        version: [
          { required: true, message: '请输入版本号', trigger: 'blur' },
          { pattern: /^v\d+\.\d+$/, message: '版本号格式为vX.X', trigger: 'blur' }
        ]
      },
      imageUrl: '',
      imageFile: null, // 存储用户上传的图片文件对象
      editing: false,
      isEditing: false,

      // 关联设备相关
      devicesDialogVisible: false,
      relatedDevices: [],
      loadingDevices: false,
      deviceDialogTitle: '关联设备列表',
      currentInstance: null,
    }
  },

  computed: {
    // 获取所有技能类型选项
    skillTypes() {
      const types = new Set(this.skillsList.map(skill => skill.type))
      return Array.from(types)
    },

    // 筛选后的技能列表
    filteredSkills() {
      // 由于现在使用服务器端分页和筛选，这个计算属性直接返回skillsList
      return this.skillsList;
    },

    // 计算当前页显示的数据
    displaySkills() {
      return this.skillsList;
    },

    // 当前页所有技能ID
    currentPageSkillIds() {
      // 由于当前页的数据直接从服务器获取，直接返回skillsList中的ID
      return this.skillsList.map(skill => skill.id);
    }
  },

  mounted() {
    this.fetchSkills();
    // 设置默认每页显示12条数据
    this.pageSize = 12;
  },

  methods: {
    // 重置筛选条件
    resetFilters() {
      this.tempSearchQuery = '';
      this.tempFilterStatus = '';
      this.tempFilterType = '';
      this.searchQuery = '';
      this.filterStatus = '';
      this.filterType = '';
      this.currentPage = 1;
      // 重置后自动刷新数据
      this.fetchSkills();
    },

    // 处理搜索
    handleSearch() {
      // 将临时变量的值复制到实际用于过滤的变量
      this.searchQuery = this.tempSearchQuery;
      this.filterStatus = this.tempFilterStatus;
      this.filterType = this.tempFilterType;
      this.currentPage = 1; // 重置页码
      this.fetchSkills(); // 重新获取数据
    },
    
    // 防抖搜索处理，避免频繁请求
    debounceSearch() {
      // 如果已有定时器，清除它
      if(this.searchTimer) {
        clearTimeout(this.searchTimer);
      }
      
      // 设置新的定时器，300毫秒后执行搜索
      this.searchTimer = setTimeout(() => {
        this.handleSearch();
      }, 300);
    },

    // 获取技能列表数据
    async fetchSkills() {
      try {
        this.loading = true;
        // 删除数据加载中的消息提示
        // this.$message({
        //   message: '正在获取数据...',
        //   type: 'info',
        //   duration: 1000
        // });

        // 准备查询参数
        const params = {
          page: this.currentPage,
          limit: this.pageSize
        };
        
        // 添加搜索和筛选条件
        if (this.searchQuery) {
          params.name = this.searchQuery;
        }
        
        if (this.filterType) {
          params.type = this.filterType;
        }
        
        if (this.filterStatus) {
          params.status = this.filterStatus;
        }
        
        // 调用API获取技能列表
        const response = await skillAPI.getSkillList(params);
        
        if (response.data.code === 0) {
          this.processSkillsData(response.data.data);
          // 更新总数和分页信息
          this.total = response.data.total;
          // 删除数据获取成功的消息提示
          // this.$message.success('数据获取成功');
        } else {
          this.$message.error(response.data.msg || '获取技能列表失败');
        }
      } catch (error) {
        console.error('获取技能列表失败:', error);
        this.$message.error('获取技能列表失败，请检查网络连接');
      } finally {
        this.loading = false;
      }
    },

    // 处理API返回的技能数据
    processSkillsData(skillsData) {
      if (!Array.isArray(skillsData)) {
        this.skillsList = [];
        this.total = 0;
        return;
      }
      
      // 转换API数据格式为组件所需格式
      this.skillsList = skillsData.map(skill => {
        // 计算关联设备总数
        const deviceCount = skill.total_device_count || 0;

        // 获取模型信息
        const models = skill.model_info ? skill.model_info.map(model => model[1]) : [];
        
        return {
          id: skill.id,
          name: skill.name,
          name_zh: skill.name_zh,
          type: skill.type,
          version: skill.version,
          description: skill.description,
          image_url: skill.image_url,
          status: skill.status ? 'published' : 'unpublished',
          deviceCount: deviceCount,
          models: models,
          createTime: skill.created_at,
          updateTime: skill.updated_at,
        };
      });
      
      // 设置总数据量
      this.total = this.skillsList.length;
    },

    // 查看技能详情
    async viewSkillDetails(skill) {
      try {
        // 加载详细数据
        const response = await skillAPI.getSkillDetail(skill.id);
        if (response.data.code === 0) {
          this.currentSkill = {
            ...skill,
            aiTasks: response.data.data.ai_tasks || [],
            deviceCount: response.data.data.total_device_count || 0,
            models: response.data.data.model_info ? response.data.data.model_info.map(model => model[1]) : []
          };

          this.detailsDialogVisible = true;
        } else {
          // 保留错误信息但简化
          this.$message.error('获取技能详情失败');
        }
      } catch (error) {
        console.error('获取技能详情失败:', error);
        // 简化重复的错误提示
        this.$message.error('获取技能详情失败');
      }
    },

    // 删除技能
    deleteSkill(skill) {
      this.$confirm(`确认删除技能 "${skill.name_zh}" 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await skillAPI.deleteSkill(skill.id);
          
          if (response.data.code === 0) {
            this.skillsList = this.skillsList.filter(item => item.id !== skill.id);
            // 删除成功提示仍需保留，因为这是重要操作
            this.$message.success(`成功删除技能: ${skill.name_zh}`);
            
            // 若已选择的技能中包含被删除的技能，则从选择列表中移除
            if (this.selectedSkills.includes(skill.id)) {
              this.selectedSkills = this.selectedSkills.filter(id => id !== skill.id);
            }
          } else {
            this.$message.error(response.data.msg || '删除技能失败');
          }
        } catch (error) {
          console.error('删除技能失败:', error);
          this.$message.error('删除技能失败');
        }
      }).catch(() => {
        // 删除取消删除的提示
        // this.$message.info('已取消删除');
      });
    },

    // 检查技能是否被选中
    isSelected(skillId) {
      return this.selectedSkills.includes(skillId);
    },

    // 切换选择状态
    toggleSelect(skill) {
      const index = this.selectedSkills.indexOf(skill.id);
      if (index > -1) {
        this.selectedSkills.splice(index, 1);
      } else {
        this.selectedSkills.push(skill.id);
      }
    },

    // 选择当前页所有技能
    selectAllCurrentPage() {
      const currentIds = this.currentPageSkillIds;
      const newSelected = [...this.selectedSkills];
      
      // 检查当前页是否已全选
      const allSelected = currentIds.every(id => this.selectedSkills.includes(id));
      
      if (allSelected) {
        // 如果已全选，则取消选择当前页所有技能
        this.selectedSkills = this.selectedSkills.filter(id => !currentIds.includes(id));
      } else {
        // 如果未全选，则选择当前页所有未选择的技能
        currentIds.forEach(id => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        this.selectedSkills = newSelected;
      }
    },

    // 批量删除技能
    handleBatchDelete() {
      if (this.selectedSkills.length === 0) {
        this.$message.warning('请先选择要删除的技能');
        return;
      }
      
      this.$confirm(`确认删除选中的 ${this.selectedSkills.length} 个技能吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await skillAPI.batchDeleteSkills(this.selectedSkills);
          
          if (response.data.success) {
            // 处理成功与失败的情况
            const successCount = response.data.detail.success.length;
            const failedCount = response.data.detail.failed.length;
            
            // 从列表中移除成功删除的技能
            const successIds = response.data.detail.success;
            this.skillsList = this.skillsList.filter(skill => !successIds.includes(skill.id));
            
            // 从选择列表中移除所有操作的技能ID
            this.selectedSkills = [];
            
            // 显示结果信息
            if (failedCount > 0) {
              // 有删除失败的情况
              this.$message({
                type: 'warning',
                message: response.data.message || `成功删除 ${successCount} 个技能，失败 ${failedCount} 个`
              });
              
              // 只显示一条汇总失败信息，而不是每一个都显示
              if (failedCount > 0) {
                this.$message.error(`${failedCount}个技能删除失败，请查看控制台了解详情`);
                console.error('删除失败技能列表:', response.data.detail.failed);
              }
            } else {
              // 全部删除成功
              this.$message.success(response.data.message || `成功删除 ${successCount} 个技能`);
            }
            
            // 刷新技能列表
            this.fetchSkills();
          } else {
            this.$message.error(response.data.message || '批量删除技能失败');
          }
        } catch (error) {
          console.error('批量删除技能失败:', error);
          this.$message.error('批量删除技能失败');
        }
      }).catch(() => {
        // 删除取消删除的提示
        // this.$message.info('已取消删除');
      });
    },

    // 打开导入技能对话框
    handleImportSkill() {
      this.importDialogVisible = true;
    },

    // 处理文件变化
    handleFileChange(file) {
      if (file.raw) {
        // 检查文件类型
        if (file.raw.type !== 'application/json') {
          this.$message.error('只能上传JSON文件');
          this.fileList = [];
          return;
        }
        // 检查文件大小
        if (file.raw.size / 1024 > 500) {
          this.$message.error('文件大小不能超过500KB');
          this.fileList = [];
          return;
        }
        this.importForm.file = file.raw;
        this.fileList = [file];
      } else {
        this.importForm.file = null;
        this.fileList = [];
      }
    },

    // 确认导入
    confirmImport() {
      this.$refs.importForm.validate(async valid => {
        if (valid) {
          this.importing = true;
          
          try {
            // 读取文件内容
            const reader = new FileReader();
            reader.readAsText(this.importForm.file);
            
            reader.onload = async (event) => {
              try {
                const fileContent = JSON.parse(event.target.result);
                
                // 创建导入数据对象
                const importData = {
                  name: this.importForm.name,
                  name_zh: this.importForm.name, // 可能需要根据实际API调整
                  version: this.importForm.version,
                  type: this.importForm.type,
                  description: this.importForm.description,
                  status: this.importForm.status === 'published',
                  skill_data: fileContent
                };
                
                // 调用API导入技能
                const response = await skillAPI.importSkill(importData);
                
                if (response.data.code === 0) {
                  this.$message.success('技能导入成功');
                  this.importDialogVisible = false;
                  
                  // 重新获取技能列表
                  this.fetchSkills();
                } else {
                  this.$message.error(response.data.msg || '技能导入失败');
                }
              } catch (error) {
                console.error('解析文件内容失败:', error);
                this.$message.error('文件格式错误，请检查JSON格式');
              } finally {
                this.importing = false;
              }
            };
            
            reader.onerror = () => {
              this.$message.error('读取文件失败');
              this.importing = false;
            };
          } catch (error) {
            console.error('导入技能失败:', error);
            this.$message.error('导入失败');
            this.importing = false;
          }
        } else {
          return false;
        }
      });
    },

    // 编辑技能
    startEditing() {
      this.isEditing = true;
      this.editForm = {
        name_zh: this.currentSkill.name_zh,
        description: this.currentSkill.description,
        image_url: this.currentSkill.image_url,
        version: this.currentSkill.version
      };
    },

    // 处理图片变化
    handleImageChange(file) {
      if (file.raw) {
        // 检查文件类型
        if (!['image/jpeg', 'image/png'].includes(file.raw.type)) {
          this.$message.error('只能上传jpg/png图片');
          this.imageUrl = '';
          this.imageFile = null;
          return;
        }
        // 检查文件大小
        if (file.raw.size / 1024 > 2048) {
          this.$message.error('图片大小不能超过2MB');
          this.imageUrl = '';
          this.imageFile = null;
          return;
        }
        
        // 保存文件对象以便后续上传
        this.imageFile = file.raw;
        
        // 创建临时URL用于预览
        this.imageUrl = URL.createObjectURL(file.raw);
        
        console.log('已选择图片:', this.imageFile.name, '大小:', this.imageFile.size, '类型:', this.imageFile.type);
        
        // 删除已选择图片但尚未保存的提示
        // this.$message.info('已选择图片，点击保存按钮上传');
      } else {
        this.imageFile = null;
        this.imageUrl = '';
      }
    },

    // 确认编辑技能
    saveChanges() {
      this.$refs.editForm.validate(async valid => {
        if (valid) {
          this.editing = true;
          
          try {
            // 首先更新技能基本信息
            const response = await skillAPI.updateSkill(this.currentSkill.id, {
              name_zh: this.editForm.name_zh,
              description: this.editForm.description,
              version: this.editForm.version
            });
            
            if (response.data.code === 0) {
              // 如果有新上传的图片，调用图片上传API
              if (this.imageFile) {
                try {
                  console.log('准备上传图片:', this.imageFile.name, this.imageFile.size, this.imageFile.type);
                  
                  const imageResponse = await skillAPI.uploadSkillImage(this.currentSkill.id, this.imageFile);
                  console.log('图片上传响应:', imageResponse.data);
                  
                  if (imageResponse.data.code === 0) {
                    // 如果上传成功，更新图片URL
                    if (imageResponse.data.data && imageResponse.data.data.image_url) {
                      this.currentSkill.image_url = imageResponse.data.data.image_url;
                      console.log('图片URL已更新:', this.currentSkill.image_url);
                    } else {
                      console.warn('响应中缺少图片URL:', imageResponse.data);
                      // 如果响应中没有图片URL，但上传成功，我们可以刷新技能详情以获取最新数据
                      this.refreshSkillDetail();
                    }
                  } else {
                    console.error('图片上传失败:', imageResponse.data);
                    this.$message.warning('技能信息已更新，但图片上传失败：' + (imageResponse.data.msg || '未知错误'));
                  }
                } catch (imageError) {
                  console.error('上传技能图片失败:', imageError);
                  this.$message.warning('技能信息已更新，但图片上传失败，请检查网络连接和服务器状态');
                }
              }
              
              this.$message.success('技能编辑成功');
              
              // 更新当前技能的数据
              this.currentSkill.name_zh = this.editForm.name_zh;
              this.currentSkill.description = this.editForm.description;
              this.currentSkill.version = this.editForm.version;
              
              // 切换回详情模式
              this.isEditing = false;
              
              // 刷新技能列表（在后台进行，不影响用户查看详情）
              this.fetchSkills();
            } else {
              this.$message.error(response.data.msg || '技能编辑失败');
            }
          } catch (error) {
            console.error('编辑技能失败:', error);
            this.$message.error('编辑技能失败');
          } finally {
            this.editing = false;
            // 清除临时图片文件和URL
            this.imageFile = null;
          }
        } else {
          return false;
        }
      });
    },

    // 刷新当前技能详情
    async refreshSkillDetail() {
      if (!this.currentSkill || !this.currentSkill.id) return;
      
      try {
        const response = await skillAPI.getSkillDetail(this.currentSkill.id);
        
        if (response.data.code === 0) {
          // 更新当前技能的所有数据
          const skill = response.data.data;
          this.currentSkill = {
            ...this.currentSkill,
            name_zh: skill.name_zh,
            description: skill.description,
            image_url: skill.image_url,
            aiTasks: skill.ai_tasks || [],
            deviceCount: skill.total_device_count || 0,
            models: skill.model_info ? skill.model_info.map(model => model[1]) : []
          };
          
          console.log('技能详情已刷新:', this.currentSkill);
          // 不再显示刷新成功的提示
        }
        // 不显示刷新失败的提示，静默处理
      } catch (error) {
        console.error('刷新技能详情失败:', error);
        // 不显示错误提示
      }
    },

    // 取消编辑
    cancelEdit() {
      if (this.isEditing) {
        this.isEditing = false;
        // 重置图片URL和文件
        this.imageUrl = '';
        this.imageFile = null;
      } else {
        this.detailsDialogVisible = false;
      }
    },

    // 添加模型处理相关方法
    getModelTitle(models) {
      if (!models || models.length === 0) {
        return '-';
      }
      return models.join(', ');
    },

    // 表格行样式
    tableRowClassName({row, rowIndex}) {
      return rowIndex % 2 === 0 ? '' : 'row-striped';
    },
    
    // 显示关联设备列表
    async showDevicesList() {
      // 设置对话框标题
      this.deviceDialogTitle = `${this.currentSkill.name_zh}`;
      this.devicesDialogVisible = true;
      this.loadingDevices = true;
      this.relatedDevices = [];
      
      try {
        // 获取关联设备列表
        const response = await skillAPI.getSkillDevices(this.currentSkill.id);
        
        if (response.data.code === 0) {
          // 处理设备数据
          this.relatedDevices = response.data.data;
          // 不需要再次映射，因为在VisionAIService.js中已经处理好了数据格式
        } else {
          this.$message.error(response.data.msg || '获取关联设备失败');
        }
      } catch (error) {
        console.error('获取关联设备失败:', error);
        this.$message.error('获取关联设备列表失败，请检查网络连接');
      } finally {
        this.loadingDevices = false;
      }
    },
    
    // 清空搜索内容
    clearSearch() {
      this.tempSearchQuery = '';
      this.handleSearch();
    },

    // 筛选器变化时自动搜索
    handleFilterChange() {
      this.handleSearch();
    },

    // 处理页码改变
    handleCurrentChange(page) {
      this.currentPage = page;
      this.fetchSkills();
    },

    // 处理每页显示数量改变
    handleSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1; // 重置到第一页
      this.fetchSkills();
    },

    // 处理刷新数据按钮点击
    async handleRefreshData() {
      try {
        this.refreshing = true;
        this.$message({
          message: '正在刷新数据...',
          type: 'info',
          duration: 1000
        });
        
        await this.fetchSkills();
        
        this.$message.success('数据刷新成功');
      } catch (error) {
        console.error('刷新数据失败:', error);
        this.$message.error('刷新数据失败，请检查网络连接');
      } finally {
        this.refreshing = false;
      }
    },

    // 热加载技能类
    async handleReloadSkillClasses() {
      try {
        this.reloading = true;
        this.$message({
          message: '正在加载技能...',
          type: 'info',
          duration: 1000
        });

        const response = await skillAPI.reloadSkillClasses();
        
        if (response.data.code === 0) {
          this.$message.success('技能加载成功');
          // 重新获取技能列表
          this.fetchSkills();
        } else {
          this.$message.error(response.data.msg || '技能加载失败');
        }
      } catch (error) {
        console.error('加载技能失败:', error);
        this.$message.error('加载技能失败，请检查网络连接');
      } finally {
        this.reloading = false;
      }
    },

    // 格式化日期时间
    formatDateTime(dateTimeStr) {
      if (!dateTimeStr) return '-';
      
      try {
        const date = new Date(dateTimeStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      } catch (error) {
        console.error('日期格式化失败:', error);
        return dateTimeStr;
      }
    },

    // 显示技能实例关联的设备列表
    async showInstanceDevices(instance) {
      // 设置对话框标题
      this.deviceDialogTitle = `${instance.name} - 关联设备`;
      this.devicesDialogVisible = true;
      this.loadingDevices = true;
      this.relatedDevices = [];
      this.currentInstance = instance;
      
      try {
        // 获取技能实例关联设备列表
        const response = await skillAPI.getSkillInstanceDevices(instance.id);
        
        if (response.data.code === 0) {
          // 处理设备数据
          this.relatedDevices = response.data.data;
          // 不需要再次映射，因为在VisionAIService.js中已经处理好了数据格式
        } else {
          this.$message.error(response.data.msg || '获取关联设备失败');
        }
      } catch (error) {
        console.error('获取技能实例关联设备失败:', error);
        this.$message.error('获取关联设备列表失败，请检查网络连接');
      } finally {
        this.loadingDevices = false;
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
  }
}
</script>

<style scoped>
.device-skills-container {
  padding: 20px;
  background-color: #f5f5f5;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.filter-section {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  padding: 12px 24px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  border: 1px solid rgba(59, 130, 246, 0.1);
  position: relative;
  overflow: hidden;
  flex-shrink: 0; /* 防止收缩 */
}



.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  position: relative;
  z-index: 2;
}

.left-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.left-controls .el-button {
  height: 32px;
  padding: 6px 16px;
  font-size: 14px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
  margin-right: 0;
}

.left-controls .el-button--primary {
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

.left-controls .el-button--primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s ease;
}

.left-controls .el-button--primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #0891b2 100%);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5), 0 4px 8px rgba(30, 64, 175, 0.4);
  transform: translateY(-2px);
}

.left-controls .el-button--primary:hover::before {
  left: 100%;
}

.left-controls .el-button:not(.el-button--primary) {
  background: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
}

.left-controls .el-button:not(.el-button--primary):hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
  color: #1e3a8a;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
}

.right-controls {
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

.grid-view-btn, .list-view-btn, .refresh-btn {
  padding: 7px 10px;
  margin-left: 0;
  color: #606266;
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.grid-view-btn:hover, .list-view-btn:hover, .refresh-btn:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
  color: #1e40af;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.skills-grid {
  margin-bottom: 20px;
  padding: 20px;
  background: linear-gradient(to bottom, #fafafa 0%, #f5f5f5 100%);
  border-radius: 16px;
  flex: 1; /* 占据剩余空间 */
  overflow-y: auto; /* 添加垂直滚动条 */
  overflow-x: hidden; /* 隐藏水平滚动条 */
  min-height: 0; /* 确保flex子元素可以收缩 */
}

.skills-grid .el-row {
  display: flex;
  flex-wrap: wrap;
}

/* 自定义滚动条样式 */
.skills-grid::-webkit-scrollbar {
  width: 8px;
}

.skills-grid::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.skills-grid::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.skills-grid::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Firefox 滚动条样式 */
.skills-grid {
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 rgba(0, 0, 0, 0.05);
}

.skill-col {
  margin-bottom: 18px;
}

.skill-card-wrapper {
  height: 100%;
}

.skills-grid .skill-card {
  height: 100%;
  margin-bottom: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}



.skills-grid .skill-card > * {
  position: relative;
  z-index: 2;
}

.skills-grid .skill-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.skills-grid .skill-card.selected {
  border: 1px solid #3b82f6;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
}

.skills-grid .skill-card .selection-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(59, 130, 246, 0.05);
  z-index: 1;
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

.skills-grid .skill-card .skill-thumbnail {
  position: relative;
  width: 100%;
  padding-top: 63%; 
  background-color: #f5f7fa;
}

.skills-grid .skill-card .skill-thumbnail .thumbnail-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  padding: 0;
}

.skills-grid .skill-card .skill-thumbnail .status-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 3px 6px;
  border-radius: 3px;
  font-size: 12px;
  color: white;
  z-index: 1;
}

.skills-grid .skill-card .skill-thumbnail .status-badge.published {
  background-color: #67c23a;
}

.skills-grid .skill-card .skill-thumbnail .status-badge.unpublished {
  background-color: #909399;
}

.skills-grid .skill-card .skill-info {
  padding: 14px;
  text-align: left;
  min-height: 100px; /* 为63%图片高度设置合适的内容最小高度 */
}

.skills-grid .skill-card .skill-info h3.skill-title {
  margin: 0 0 11px;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  color: #333;
  line-height: 1.3;
}

.version-line {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin: 9px 0 13px;
}

.status-mini-tag {
  padding: 2px 8px;
  height: 20px;
  line-height: 16px;
  margin-right: 6px;
  border-radius: 10px;
  font-weight: 500;
  font-size: 11px;
}

.status-mini-tag.el-tag--success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-color: #10b981;
  color: white;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
}

.status-mini-tag.el-tag--info {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  border-color: #6b7280;
  color: white;
  box-shadow: 0 2px 4px rgba(107, 114, 128, 0.3);
}

.version-text {
  font-size: 12px;
  color: #606266;
}

.skills-grid .skill-card .skill-info p {
  margin: 5px 0;
  color: #666;
  font-size: 12px;
  text-align: left;
}

.skills-grid .skill-card .skill-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 8px;
  border-top: 1px solid #f0f0f0;
  padding-top: 6px;
}

.skills-grid .skill-card .skill-actions .el-button {
  padding: 4px 6px;
  font-size: 12px;
}

.skills-grid .skill-card .skill-actions .el-button+.el-button {
  margin-left: 0;
}

.skills-grid .skill-card .skill-actions .delete-btn {
  color: #F56C6C;
}

.skills-grid .skill-card .skill-actions .el-divider--vertical {
  height: 14px;
  margin: 0 10px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: -20px;
  padding: 20px 0;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  flex-shrink: 0; /* 防止收缩 */
}

/* 深度选择器 */
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

/* 技能详情样式 */
.skill-details {
  padding: 0 20px;
}

.skill-header {
  display: flex;
  align-items: center;
}

.skill-logo {
  width: 80px;
  height: 80px;
  margin-right: 20px;
  object-fit: contain;
}

.skill-title {
  display: flex;
  flex-direction: column;
}

.skill-title h2 {
  margin: 0 0 15px;
  font-size: 24px;
  color: #303133;
}

.skill-subtitle {
  display: flex;
  align-items: center;
  margin-top: 5px;
  flex-wrap: nowrap;
}

.skill-subtitle .status-tag {
  margin-right: 0;
  flex-shrink: 0;
}

.version {
  color: #909399;
  font-size: 14px;
  margin-left: 15px;
  white-space: nowrap;
}

.skill-info-section {
  margin: 20px 0;
}

.info-card {
  margin-bottom: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(59, 130, 246, 0.1);
  background-color: #fff;
  overflow: hidden;
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.info-card-header {
  padding: 12px 15px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
  display: flex;
  align-items: center;
  color: #1e40af;
  font-weight: 600;
  font-size: 15px;
}

.info-card-header i {
  margin-right: 8px;
  color: #3b82f6;
}

.info-card-content {
  padding: 15px;
}

.info-row {
  display: flex;
  margin-bottom: 20px;
  width: 100%;
}

.info-item {
  display: flex;
  align-items: flex-start;
}

.info-item.half-width {
  width: 50%;
}

.info-label {
  font-weight: bold;
  color: #606266;
  min-width: 90px;
}

.info-value {
  color: #303133;
}

.model-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.model-tags .el-tag {
  font-size: 14px;
  padding: 5px 12px;
  margin-right: 0;
  border: 1px solid rgba(59, 130, 246, 0.2);
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #1e40af;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  margin-bottom: 0;
  border-radius: 16px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
}

.description-item {
  width: 100%;
  flex-direction: row;
  align-items: flex-start;
}

.description-content {
  line-height: 1.6;
  white-space: pre-line;
  color: #606266;
}

.model-info {
  margin: 6px 0;
  color: #666;
  font-size: 12px;
  display: flex;
  align-items: flex-start;
  line-height: 1.4;
}

.model-name {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  color: #3b82f6;
  font-weight: 500;
  margin-left: 4px;
}

.model-more {
  color: #909399;
  margin-left: 2px;
  font-weight: normal;
}

/* 技能卡片详情状态标签样式 */
.status-tag.el-tag--success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  border-color: #10b981 !important;
  color: white !important;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3) !important;
}

.status-tag.el-tag--info {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%) !important;
  border-color: #6b7280 !important;
  color: white !important;
  box-shadow: 0 2px 4px rgba(107, 114, 128, 0.3) !important;
}

/* 导入表单中的状态单选按钮样式 */
.status-radio.published {
  color: #10b981;
  font-weight: 500;
}

.status-radio.unpublished {
  color: #6b7280;
  font-weight: 500;
}

.info-line {
  display: flex;
  justify-content: space-between;
  margin: 9px 0;
  font-size: 12px;
  color: #666;
  line-height: 1.3;
}

.info-line .info-item {
  flex: 1;
}

.info-item.full-width {
  width: 100%;
}

.skill-instances-row {
  margin-top: 20px;
  display: block;
  width: 100%;
}

.skill-instances-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

.skill-instances-header .info-label {
  font-weight: bold;
  color: #606266;
  font-size: 16px;
}

.skill-instances-container {
  width: 100%;
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 10px;
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
}

.instances-wrapper {
  display: flex;
  flex-wrap: wrap;
  margin: -10px;
}

.instance-item {
  width: calc(50% - 20px);
  margin: 10px;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  background-color: #fff;
  transition: box-shadow 0.3s;
  box-sizing: border-box;
  position: relative;
}

.instance-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.instance-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 10px;
  padding-right: 70px;
  position: relative;
}

.instance-header h4 {
  margin: 0;
  font-size: 14px;
  color: #333;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.status-tag {
  position: absolute;
  top: 0;
  right: 15px;
  height: 20px;
  line-height: 18px;
  padding: 0 6px;
  z-index: 1;
}

.instance-info {
  display: flex;
  flex-direction: column;
  margin: 8px 0;
  text-align: left;
}

.info-row-small {
  display: flex;
  margin-bottom: 4px;
  justify-content: flex-start;
  text-align: left;
  width: 100%;
}

.info-label-small {
  font-size: 13px;
  color: #909399;
  min-width: 80px;
  text-align: left;
  flex-shrink: 0;
}

.info-value-small {
  font-size: 13px;
  color: #606266;
  text-align: left;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.instance-desc {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  width: 100%;
  text-align: left;
}

.instance-desc p {
  margin: 0;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.skill-instances-title {
  font-weight: bold;
  color: #333;
}

/* 添加编辑技能对话框中的样式代码 */
.avatar-uploader {
  text-align: center;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.upload-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1;
}

.upload-mask i {
  font-size: 24px;
  color: #fff;
}

.upload-mask span {
  margin-top: 10px;
  font-size: 14px;
  color: #fff;
}

.skill-image-upload {
  position: relative;
  width: 80px;
  height: 80px;
  margin-right: 20px;
}

.skill-image-upload .avatar {
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 4px;
}

.skill-image-upload .avatar-uploader {
  display: block;
  width: 100%;
  height: 100%;
}

.skill-image-upload .el-upload {
  display: block;
  width: 100%;
  height: 100%;
  cursor: pointer;
  position: relative;
}

.skill-image-upload .upload-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 4px;
}

.skill-image-upload:hover .upload-mask {
  opacity: 1;
}

.skill-title.edit-mode {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.description-form-item {
  width: 100%;
  margin-bottom: 0;
}

.description-form-item .el-form-item__label {
  font-weight: bold;
  color: #606266;
}

.skill-title.edit-mode .el-form-item {
  margin-bottom: 15px;
}

.upload-mask i {
  font-size: 24px;
  color: #fff;
}

.upload-mask span {
  margin-top: 10px;
  font-size: 12px;
  color: #fff;
}

.el-upload__tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  line-height: 1.2;
}

/* 调整编辑模式下的样式 */
.skill-title.edit-mode .skill-subtitle {
  margin-top: 8px;
  margin-bottom: 10px;
}

/* 添加技能状态标签的行内样式 */
.status-inline-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  height: 24px;
  font-size: 12px;
  border-radius: 12px;
  margin-right: 10px;
  flex-shrink: 0;
  font-weight: 500;
}

.status-inline-tag.el-tag--success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  border-color: #10b981 !important;
  color: white !important;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3) !important;
}

.status-inline-tag.el-tag--info {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%) !important;
  border-color: #6b7280 !important;
  color: white !important;
  box-shadow: 0 2px 4px rgba(107, 114, 128, 0.3) !important;
}

.no-data {
  color: #909399;
  font-size: 14px;
  line-height: 32px;
}

/* 添加编辑模式下的名称和描述输入框样式 */
.name-edit-input .el-input__inner {
  height: 36px;
  font-size: 24px;
  font-weight: 500;
  color: #1e40af;
  border: 1px dashed #3b82f6;
  padding-left: 0;
  background-color: transparent;
  transition: all 0.3s ease;
}

.name-edit-input .el-input__inner:hover,
.name-edit-input .el-input__inner:focus {
  border-color: #1e40af;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.description-edit-input .el-textarea__inner {
  border: 1px dashed #3b82f6;
  background-color: transparent;
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
  transition: all 0.3s ease;
}

.description-edit-input .el-textarea__inner:hover,
.description-edit-input .el-textarea__inner:focus {
  border-color: #1e40af;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* 版本号编辑输入框样式 */
.version-edit {
  display: flex;
  align-items: center;
  color: #6b7280;
  font-size: 14px;
  margin-left: 15px;
  white-space: nowrap;
}

.version-input {
  width: 80px;
  margin-left: 5px;
}

.version-input .el-input__inner {
  height: 24px;
  line-height: 24px;
  padding: 0 8px;
  font-size: 14px;
  border: 1px dashed #3b82f6;
  background-color: transparent;
  transition: all 0.3s ease;
}

.version-input .el-input__inner:hover,
.version-input .el-input__inner:focus {
  border-color: #1e40af;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* 在小屏幕上显示为单列 */
@media screen and (max-width: 768px) {
  .instance-item {
    width: calc(100% - 20px);
  }
}

/* 弹框按钮统一样式 */
.device-skills-container >>> .el-dialog .el-button--primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
  border: none !important;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3) !important;
  color: white !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
}

.device-skills-container >>> .el-dialog .el-button--primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%) !important;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4) !important;
  transform: translateY(-1px) !important;
}

.device-skills-container >>> .el-dialog .el-button--default {
  background: white !important;
  border: 1px solid #d1d5db !important;
  color: #4b5563 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
}

.device-skills-container >>> .el-dialog .el-button--default:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e40af !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2) !important;
}

/* 弹框标题样式 */
.device-skills-container >>> .el-dialog__header {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1) !important;
  padding: 16px 20px !important;
}

.device-skills-container >>> .el-dialog__title {
  color: #1f2937 !important;
  font-weight: 600 !important;
}

.device-skills-container >>> .el-dialog__close {
  color: #6b7280 !important;
  transition: color 0.3s ease !important;
}

.device-skills-container >>> .el-dialog__close:hover {
  color: #3b82f6 !important;
}

/* 弹框内容样式 */
.device-skills-container >>> .el-dialog__body {
  padding: 20px !important;
  background: #ffffff !important;
}

/* 上传组件样式优化 */
.device-skills-container >>> .el-upload-dragger {
  border: 2px dashed #d1d5db !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
}

.device-skills-container >>> .el-upload-dragger:hover {
  border-color: #3b82f6 !important;
  background-color: rgba(59, 130, 246, 0.05) !important;
}

.device-skills-container >>> .el-upload-dragger .el-icon-upload {
  color: #3b82f6 !important;
}

.device-skills-container >>> .el-upload__text {
  color: #6b7280 !important;
}

.device-skills-container >>> .el-upload__text em {
  color: #3b82f6 !important;
  font-weight: 500 !important;
}

/* 关联设备列表样式 */
.clickable {
  cursor: pointer;
  color: inherit;
  transition: color 0.3s;
}

.clickable:hover {
  color: #409EFF;
}

.devices-list-container {
  max-height: 400px;
  margin-top: -20px;
  overflow-y: auto;
  background-color: #ffffff;
  border-radius: 4px;
  padding: 10px;
}

.no-devices-tip {
  color: #909399;
  text-align: center;
  padding: 30px 0;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.no-devices-tip i {
  font-size: 30px;
  color: #409EFF;
  opacity: 0.5;
  margin-bottom: 10px;
}

/* 关联设备列表弹框样式 */
.devices-dialog {
  border-radius: 8px;
  overflow: hidden;
}

.devices-dialog >>> .el-dialog {
  background-color: #ffffff !important;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.devices-dialog >>> .el-dialog__header {
  background-color: #f5f7fa;
  padding: 15px 20px;
  border-bottom: 1px solid #e4e7ed;
}

.devices-dialog >>> .el-dialog__title {
  color: #303133;
  font-weight: 500;
  font-size: 16px;
}

.devices-dialog >>> .el-dialog__body {
  padding: 0;
  background-color: #ffffff;
}

.devices-dialog >>> .el-table {
  background-color: #ffffff;
}

.devices-dialog >>> .el-table th {
  background-color: #f5f7fa !important;
  border-bottom: 1px solid #ebeef5;
  color: #303133 !important;
}

.devices-dialog >>> .el-table td {
  border-bottom: 1px solid #ebeef5;
}

.devices-dialog >>> .el-table--striped .el-table__body tr.el-table__row--striped td {
  background-color: #fafafa;
}

/* 隐藏滚动条但保留滚动功能 */
.devices-dialog >>> * {
  scrollbar-width: none !important;
}

.devices-dialog >>> *::-webkit-scrollbar {
  width: 0 !important;
  display: none;
}

.devices-dialog >>> *::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2) !important;
}

.devices-dialog >>> *::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, 0.1) !important;
}

.devices-dialog >>> *::-ms-scrollbar {
  width: 0 !important;
  display: none;
}

.devices-dialog >>> *::-ms-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2) !important;
}

.devices-dialog >>> *::-ms-scrollbar-track {
  background-color: rgba(0, 0, 0, 0.1) !important;
}

.devices-dialog >>> *::-moz-scrollbar {
  width: 0 !important;
  display: none;
}

.devices-dialog >>> *::-moz-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2) !important;
}

.devices-dialog >>> *::-moz-scrollbar-track {
  background-color: rgba(0, 0, 0, 0.1) !important;
}

/* Firefox */
.devices-list-container,
.devices-dialog >>> .el-table__body-wrapper {
  scrollbar-width: none;
}

/* IE和Edge */
.devices-list-container,
.devices-dialog >>> .el-table__body-wrapper {
  -ms-overflow-style: none;
}

/* 确保表格完全占满容器宽度 */
.devices-dialog >>> .el-table {
  width: 100% !important;
}

/* 表格设置没有水平滚动条 */
.devices-dialog >>> .el-table__body-wrapper {
  overflow-x: hidden;
}

.no-devices-tip {
  color: #909399;
  text-align: center;
  padding: 30px 0;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.no-devices-tip i {
  font-size: 30px;
  color: #409EFF;
  opacity: 0.5;
  margin-bottom: 10px;
}

/* 关联设备列表弹框样式 */
.devices-dialog {
  border-radius: 8px;
  overflow: hidden;
}

/* 整个弹框的背景和边框 */
.devices-dialog >>> .el-dialog {
  background-color: #ffffff !important;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 弹框标题区域 */
.devices-dialog >>> .el-dialog__header {
  background-color: #f5f7fa;
  padding: 15px 20px;
  border-bottom: 1px solid #e4e7ed;
}

/* 弹框标题文字 */
.devices-dialog >>> .el-dialog__title {
  color: #303133;
  font-weight: 500;
  font-size: 16px;
}

/* 弹框内容区域 */
.devices-dialog >>> .el-dialog__body {
  padding: 0;
  background-color: #ffffff;
}

/* 设备列表容器 */
.devices-list-container {
  background-color: #ffffff;
  padding: 10px;
}

/* 表格样式 */
.devices-dialog >>> .el-table {
  background-color: #ffffff;
}

/* 表格单元格和行样式 */
.devices-dialog >>> .el-table td, 
.devices-dialog >>> .el-table th.is-leaf {
  background-color: #ffffff;
  border-bottom: 1px solid #ebeef5;
}

/* 表格表头样式 */
.devices-dialog >>> .el-table th {
  background-color: #f5f7fa !important;
  border-bottom: 1px solid #ebeef5;
  color: #303133 !important;
}

/* 表格行悬浮样式 */
.devices-dialog >>> .el-table--enable-row-hover .el-table__body tr:hover > td {
  background-color: #f5f7fa !important;
}

/* 表格条纹行样式 */
.devices-dialog >>> .el-table--striped .el-table__body tr.el-table__row--striped td {
  background-color: #fafafa;
}

/* 状态标签样式 */
.devices-dialog >>> .el-tag--success {
  background-color: rgba(103, 194, 58, 0.15);
  border-color: rgba(103, 194, 58, 0.3);
  color: #67c23a;
}

.devices-dialog >>> .el-tag--info {
  background-color: rgba(144, 147, 153, 0.15);
  border-color: rgba(144, 147, 153, 0.3);
  color: #5a5e66;
}
</style>
