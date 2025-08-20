<template>
  <div>
    <!-- 大模型技能管理对话框 -->
                             <el-dialog
       :title="`摄像头「${selectedCamera.name || ''}」- 大模型技能管理`"
       :visible.sync="dialogVisible"
       width="75%"
       :close-on-click-modal="false"
       :close-on-press-escape="true"
       custom-class="llm-skill-management-dialog"
       center
       @close="handleDialogClose">
      
             <!-- 上半部分：可用大模型技能 -->
       <div class="skill-section">
         <!-- 搜索和筛选工具栏 -->
         <div class="search-toolbar">
           <div class="search-filters">
             <el-input
               v-model="searchKeyword"
               placeholder="请输入技能名称搜索"
               prefix-icon="el-icon-search"
               clearable
               style="width: 200px; margin-right: 10px;"
               @input="handleSearch"
               @clear="handleSearchClear">
             </el-input>
             <el-radio-group v-model="statusFilter" size="small" @change="handleStatusFilter">
               <el-radio-button label="all">全部</el-radio-button>
               <el-radio-button label="published">已发布</el-radio-button>
               <el-radio-button label="draft">草稿</el-radio-button>
             </el-radio-group>
           </div>
           <div class="search-actions">
             <el-button size="small" icon="el-icon-refresh" @click="forceRefreshSkills">刷新</el-button>
           </div>
         </div>

         <!-- 标题和分页区域 -->
         <div class="section-header">
           <div class="section-title">
             <i class="el-icon-magic-stick"></i>
             <span>可用大模型技能</span>
           </div>
           <!-- 分页控件 -->
           <div class="pagination-controls" v-if="skillTotal > skillPageSize">
             <el-pagination
               :current-page="skillCurrentPage"
               :page-size="skillPageSize"
               :page-sizes="[8, 12, 16, 20]"
               layout="total, sizes, prev, pager, next"
               :total="skillTotal"
               @size-change="handleSkillSizeChange"
               @current-change="handleSkillCurrentChange"
               background
               small>
             </el-pagination>
           </div>
         </div>

        <!-- 技能列表 -->
        <div class="skill-list-container">
          <div v-if="skillListLoading" class="skill-loading">
            <i class="el-icon-loading"></i> 正在加载技能列表...
          </div>
          <div v-else-if="skillList.length === 0" class="no-skills">
            <i class="el-icon-info"></i> 暂无可用的大模型技能
          </div>
          <div v-else class="skill-grid">
            <div
              v-for="skill in skillList"
              :key="skill.id"
              class="skill-card"
              @click="selectSkill(skill)">
              <div class="skill-header">
                <div class="skill-icon">
                  <i class="el-icon-magic-stick"></i>
                </div>
                <div class="skill-status">
                  <el-tag
                    size="mini"
                    :type="(skill.status === true || skill.status === 'published') ? 'success' : 'info'">
                    {{ (skill.status === true || skill.status === 'published') ? '已发布' : '草稿' }}
                  </el-tag>
                </div>
              </div>
              <div class="skill-content">
                <div class="skill-name" :title="skill.skill_name || skill.name">{{ skill.skill_name || skill.name }}</div>
                <div class="skill-description" :title="skill.skill_description || skill.description">
                  {{ skill.skill_description || skill.description || '暂无描述' }}
                </div>
                <div class="skill-meta">
                  <span class="skill-type">{{ skill.type || '大模型技能' }}</span>
                  <span class="skill-version" v-if="skill.version">v{{ skill.version }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 下半部分：关联大模型任务 -->
      <div class="related-section">
        <div class="section-header">
          <div class="section-title">
            <i class="el-icon-postcard"></i>
            <span>关联大模型任务 ({{ relatedTasks.length }})</span>
          </div>
          <div class="section-actions">
            <el-button size="small" icon="el-icon-refresh" @click="loadRelatedTasks">刷新</el-button>
          </div>
        </div>

        <!-- 关联任务列表 -->
        <div class="related-tasks-container">
          <div v-if="tasksLoading" class="tasks-loading">
            <i class="el-icon-loading"></i> 正在加载关联任务...
          </div>
          <div v-else-if="relatedTasks.length === 0" class="no-tasks">
            <i class="el-icon-info"></i> 该摄像头暂无关联的大模型任务
          </div>
          <div v-else class="tasks-list">
            <el-card v-for="task in relatedTasks" :key="task.id" class="task-card">
              <div class="task-header">
                <div class="task-info">
                  <div class="task-name">{{ task.name }}</div>
                  <div class="task-skill">{{ task.skill_name || task.skill_class_name }}</div>
                </div>
                <div class="task-status">
                  <el-tag size="mini" :type="task.status ? 'success' : 'info'">
                    {{ task.status ? '运行中' : '已停止' }}
                  </el-tag>
                </div>
              </div>
              <div class="task-content">
                <div class="task-desc">{{ task.description }}</div>
                <div class="task-meta">
                  <span class="task-time">创建时间：{{ formatTime(task.created_at) }}</span>
                  <span class="task-alert">预警等级：{{ getAlertLevelName(task.alert_level) }}</span>
                </div>
              </div>
              <div class="task-actions">
                <el-button type="text" size="mini" @click="editTask(task)">编辑</el-button>
                <el-button type="text" size="mini" @click="viewTask(task)">查看</el-button>
                <el-button type="text" size="mini" style="color: #f56c6c;" @click="deleteTask(task)">删除</el-button>
              </div>
            </el-card>
          </div>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">关闭</el-button>
      </div>
    </el-dialog>

         <!-- 大模型技能配置对话框 -->
           <el-dialog
        :title="(isEditMode ? '编辑大模型任务' : '配置大模型技能') + ' - ' + (selectedSkillData.skill_name || selectedSkillData.name || '')"
        :visible.sync="skillConfigVisible"
       width="65%"
       :close-on-click-modal="false"
       :close-on-press-escape="true"
       custom-class="llm-skill-config-dialog"
       center
       @close="handleConfigClose">
      
      <div v-if="skillDetailLoading" class="skill-detail-loading">
        <i class="el-icon-loading"></i> 正在加载技能详情...
      </div>
      
      <div v-else-if="skillDetail" class="skill-config-container">
        <!-- 技能详情展示 -->
        <div class="skill-detail-header">
          <div class="skill-info">
            <div class="skill-icon-large">
              <i class="el-icon-magic-stick"></i>
            </div>
            <div class="skill-info-content">
              <h3 class="skill-title">{{ skillDetail.skill_name || skillDetail.name }}</h3>
              <p class="skill-desc">{{ skillDetail.skill_description || skillDetail.description || '暂无描述' }}</p>
              <div class="skill-tags">
                <el-tag size="mini" type="primary">{{ skillDetail.type || '大模型技能' }}</el-tag>
                <el-tag size="mini" type="success" v-if="skillDetail.version">v{{ skillDetail.version }}</el-tag>
                <el-tag size="mini" :type="(skillDetail.status === true || skillDetail.status === 'published') ? 'success' : 'info'">
                  {{ (skillDetail.status === true || skillDetail.status === 'published') ? '已发布' : '草稿' }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 配置表单 -->
        <el-form :model="configForm" :rules="configRules" ref="configForm" label-width="100px">
          <el-form-item label="任务名称" prop="taskName">
            <el-input
              v-model="configForm.taskName"
              placeholder="请输入任务名称"
              style="width: 60%"
              :maxlength="50"
              show-word-limit>
            </el-input>
          </el-form-item>

          <el-form-item label="任务描述" prop="taskDescription">
            <el-input
              v-model="configForm.taskDescription"
              type="textarea"
              :rows="3"
              placeholder="请简要描述任务的检测目标和用途"
              style="width: 60%"
              :maxlength="200"
              show-word-limit>
            </el-input>
          </el-form-item>

                     <el-form-item label="抽帧频率" prop="frequency">
             <div class="frequency-config">
               <span>每</span>
               <el-input-number
                 v-model="configForm.frequency.seconds"
                 :min="30"
                 :max="99"
                 controls-position="right"
                 size="small"
                 style="width: 80px; margin: 0 8px;">
               </el-input-number>
               <span>秒抽取</span>
                                                               <el-input-number
                   v-model="configForm.frequency.frames"
                   :min="1"
                   :max="1"
                   controls-position="right"
                   size="small"
                   style="width: 80px; margin: 0 8px;">
                 </el-input-number>
                <span>帧</span>
                                <el-tooltip content="抽帧频率限制：30秒内最多只能抽取1帧（最快30秒1次）" placement="top">
                 <i class="el-icon-question" style="margin-left: 8px; color: #909399; cursor: help;"></i>
               </el-tooltip>
             </div>
           </el-form-item>

          <el-form-item label="预警等级" prop="alertLevel">
            <el-select v-model="configForm.alertLevel" placeholder="请选择预警等级" style="width: 200px;">
              <el-option
                v-for="item in alertLevelOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
                <span :style="{ color: item.color }">{{ item.label }}</span>
              </el-option>
            </el-select>
                         <span class="alert-level-desc" v-if="currentAlertDesc" :style="{ color: currentAlertColor, backgroundColor: currentAlertBgColor }">{{ currentAlertDesc }}</span>
          </el-form-item>

          <el-form-item label="运行时段" prop="timeRanges">
            <div class="time-ranges-config">
              <div v-for="(timeRange, index) in configForm.timeRanges" :key="index" class="time-range-item">
                <el-time-picker
                  v-model="timeRange.start"
                  placeholder="开始时间"
                  format="HH:mm"
                  value-format="HH:mm"
                  style="width: 120px;">
                </el-time-picker>
                <span class="time-separator">-</span>
                <el-time-picker
                  v-model="timeRange.end"
                  placeholder="结束时间"
                  format="HH:mm"
                  value-format="HH:mm"
                  style="width: 120px;">
                </el-time-picker>
                <el-button
                  type="text"
                  icon="el-icon-delete"
                  @click="removeTimeRange(index)"
                  style="margin-left: 10px;">
                </el-button>
              </div>
              <div class="add-time-range">
                <el-button
                  type="text"
                  icon="el-icon-plus"
                  @click="addTimeRange"
                  :disabled="configForm.timeRanges.length >= 3">
                  添加时间段 ({{ configForm.timeRanges.length }}/3)
                </el-button>
              </div>
            </div>
          </el-form-item>

          <el-form-item label="任务状态">
            <el-switch
              v-model="configForm.enabled"
              active-text="启用"
              inactive-text="禁用">
            </el-switch>
          </el-form-item>
        </el-form>
      </div>

              <div slot="footer" class="dialog-footer">
          <el-button @click="cancelSkillConfig">取消</el-button>
          <el-button type="primary" @click="saveConfig" :loading="saveLoading">保存配置</el-button>
        </div>
    </el-dialog>
  </div>
</template>

<script>
import visionAIService from '@/components/service/VisionAIService.js';

export default {
  name: 'ConfigLlm',
  props: {
    // 移除 visible prop，完全内部管理弹窗状态
  },
  data() {
    return {
      // 主对话框状态
      dialogVisible: false,
      
      // 选中的摄像头（从外部传入）
      selectedCamera: {},
      
      // 可用技能相关
      skillList: [],
      skillListLoading: false,
       skillCurrentPage: 1,
       skillPageSize: 8,
       skillTotal: 0,
      searchKeyword: '',
      statusFilter: 'all',
      searchTimer: null,

      // 关联任务相关
      relatedTasks: [],
      tasksLoading: false,

      // 技能配置对话框
      skillConfigVisible: false,
      selectedSkillData: {},
      skillDetail: null,
      skillDetailLoading: false,
      saveLoading: false,
      
      // 编辑模式标识
      isEditMode: false,
      editingTaskId: null,

                           // 配置表单
        configForm: {
          taskName: '',
          taskDescription: '',
          frequency: {
            seconds: 30,
            frames: 1
          },
          alertLevel: 0,
          timeRanges: [
            {
              start: '00:00',
              end: '23:59'
            }
          ],
          enabled: true
        },

             // 表单验证规则
       configRules: {
         taskName: [
           { required: true, message: '请输入任务名称', trigger: 'blur' },
           { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
         ],
         taskDescription: [
           { max: 200, message: '描述不能超过 200 个字符', trigger: 'blur' }
         ],
         'frequency.seconds': [
           { required: true, message: '请设置抽帧时间间隔', trigger: 'blur' },
           { type: 'number', min: 30, max: 99, message: '抽帧时间间隔必须在30-99秒之间', trigger: 'blur' }
         ],
                   'frequency.frames': [
            { required: true, message: '请设置抽帧数量', trigger: 'blur' },
            { type: 'number', min: 1, max: 1, message: '抽帧数量必须为1帧', trigger: 'blur' }
          ]
       },

             // 预警等级选项
       alertLevelOptions: [
         { value: 1, label: '一级预警', color: '#F53F3F', desc: '紧急情况，立即响应' },
         { value: 2, label: '二级预警', color: '#F56C6C', desc: '严重异常，立即处理' },
         { value: 3, label: '三级预警', color: '#E6A23C', desc: '一般异常，需要处理' },
         { value: 4, label: '四级预警', color: '#67C23A', desc: '轻微异常，建议关注' },
         { value: 0, label: '默认等级', color: '#909399', desc: '系统默认预警等级' }
       ]
    };
  },
  computed: {
    currentAlertDesc() {
      const level = this.alertLevelOptions.find(item => item.value === this.configForm.alertLevel);
      return level ? level.desc : '';
    },
    currentAlertColor() {
      const level = this.alertLevelOptions.find(item => item.value === this.configForm.alertLevel);
      return level ? level.color : '#67c23a';
    },
    currentAlertBgColor() {
      const level = this.alertLevelOptions.find(item => item.value === this.configForm.alertLevel);
      if (level) {
        // 根据预警等级生成对应的背景色
        const color = level.color;
        // 将颜色转换为rgba格式，透明度为0.1
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.1)`;
      }
      return 'rgba(103, 194, 58, 0.1)';
    }
  },
      // 移除 watch，不再监听外部状态
  beforeDestroy() {
    // 清理搜索定时器，避免内存泄漏
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
      this.searchTimer = null;
    }
    
    // 重置所有数据
    this.resetData();
  },
     methods: {
     // 对外提供的打开弹窗方法
     open(camera) {
       if (!camera || !camera.id) {
         this.$message.error('请选择有效的摄像头');
         return;
       }
       
       // 设置选中的摄像头
       this.selectedCamera = camera;
       
       // 打开弹窗
       this.dialogVisible = true;
       
       // 加载数据
       this.loadSkillList();
       this.loadRelatedTasks();
     },

     // 关闭弹窗（内部方法）
     close() {
       this.dialogVisible = false;
       this.resetData();
       // 触发关闭事件，让父组件知道弹窗已关闭
       this.$emit('closed');
     },

     // 加载技能列表
    async loadSkillList() {
      // 防止重复加载
      if (this.skillListLoading) {
        console.log('技能列表正在加载中，跳过重复请求');
        return;
      }
      
      this.skillListLoading = true;
      try {
        const params = {
          page: this.skillCurrentPage,
          limit: this.skillPageSize
        };

        // 添加搜索参数（API需要name参数）
        if (this.searchKeyword && this.searchKeyword.trim()) {
          params.name = this.searchKeyword.trim();
        }

        // 添加状态过滤参数
        if (this.statusFilter !== 'all') {
          params.status = this.statusFilter === 'published' ? true : false;
        }

        console.log('发送技能列表API请求，参数:', params);
        const response = await visionAIService.skillAPI.getLlmSkillList(params);
        console.log('技能列表API完整响应:', response);
        console.log('响应数据结构:', response.data);
        
        // 兼容多种可能的响应格式
        if (response.data) {
          let skillsData = [];
          let total = 0;
          
          // 检查不同的数据结构
          if (response.data.success === true) {
            // 大模型技能API格式: {success: true, data: [], total: 12}
            if (Array.isArray(response.data.data)) {
              skillsData = response.data.data;
              total = response.data.total || skillsData.length;
            }
          } else if (response.data.code === 0) {
            // 标准格式: {code: 0, data: {skills: [], total: 0}}
            if (response.data.data && response.data.data.skills) {
              skillsData = response.data.data.skills;
              total = response.data.data.total || skillsData.length;
            } else if (response.data.data && Array.isArray(response.data.data)) {
              // 数据直接在data字段中: {code: 0, data: []}
              skillsData = response.data.data;
              total = response.data.total || skillsData.length;
            }
          } else if (Array.isArray(response.data)) {
            // 直接返回数组: []
            skillsData = response.data;
            total = skillsData.length;
          } else if (response.data.skills) {
            // 技能直接在根级别: {skills: [], total: 0}
            skillsData = response.data.skills;
            total = response.data.total || skillsData.length;
          }
          
          console.log('解析后的技能数据:', skillsData);
          console.log('技能总数:', total);
          console.log('当前页:', this.skillCurrentPage);
          console.log('每页条数:', this.skillPageSize);
          
          this.skillList = skillsData;
          this.skillTotal = total;
          
          if (skillsData.length === 0) {
            console.warn('未获取到任何技能数据');
          }
        } else {
          console.error('无法解析技能数据，响应格式不符合预期');
          this.$message.error('获取技能列表失败：数据格式不正确');
        }
      } catch (error) {
        console.error('获取技能列表失败:', error);
        this.$message.error('获取技能列表失败: ' + (error.message || '未知错误'));
      } finally {
        this.skillListLoading = false;
      }
    },

    // 搜索处理（优化防抖逻辑）
    handleSearch() {
      // 清除之前的定时器
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
        this.searchTimer = null;
      }
      
      // 重置到第一页
      this.skillCurrentPage = 1;
      
      // 设置新的定时器，300ms后执行搜索
      this.searchTimer = setTimeout(() => {
        this.loadSkillList();
        this.searchTimer = null;
      }, 300);
    },

    // 处理搜索清空
    handleSearchClear() {
      // 清除定时器
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
        this.searchTimer = null;
      }
      
      this.searchKeyword = '';
      this.skillCurrentPage = 1;
      this.loadSkillList();
    },

    // 状态筛选
    handleStatusFilter() {
      this.skillCurrentPage = 1;
      this.loadSkillList();
    },

    // 分页处理
    handleSkillSizeChange(newSize) {
      this.skillPageSize = newSize;
      this.skillCurrentPage = 1;
      this.loadSkillList();
    },

    handleSkillCurrentChange(newPage) {
      this.skillCurrentPage = newPage;
      this.loadSkillList();
    },

    // 选择技能（直接配置）
    async selectSkill(skill) {
      this.selectedSkillData = skill;
      
      // 清除编辑模式标识（这是创建新任务）
      this.isEditMode = false;
      this.editingTaskId = null;
      
      this.skillConfigVisible = true;
      
      // 直接使用技能列表中的数据
      this.skillDetail = skill;
      
      // 初始化配置表单
      this.initConfigForm(skill);
    },

    // 加载关联任务
    async loadRelatedTasks() {
      if (!this.selectedCamera || !this.selectedCamera.id) {
        return;
      }

      this.tasksLoading = true;
      try {
        // 调用API获取大模型任务列表
        const response = await visionAIService.skillAPI.getLlmTaskList();
        console.log('大模型任务列表响应:', response.data);
        
        let allTasks = [];
        if (response.data) {
          if (response.data.success === true) {
            // 大模型技能API格式: {success: true, data: [], total: 12}
            if (Array.isArray(response.data.data)) {
              allTasks = response.data.data;
            }
          } else if (response.data.code === 0) {
            // 标准格式: {code: 0, data: {tasks: [], total: 0}}
            if (response.data.data && response.data.data.tasks) {
              allTasks = response.data.data.tasks;
            } else if (response.data.data && Array.isArray(response.data.data)) {
              allTasks = response.data.data;
            }
          } else if (Array.isArray(response.data)) {
            // 直接返回数组: []
            allTasks = response.data;
          }
        }

        // 过滤出与当前摄像头相关的大模型任务
        this.relatedTasks = allTasks.filter(task => {
          return task.camera_id === this.selectedCamera.id;
        });

        console.log('关联的大模型任务:', this.relatedTasks);
      } catch (error) {
        console.error('获取关联任务失败:', error);
        this.relatedTasks = [];
      } finally {
        this.tasksLoading = false;
      }
    },

    // 加载技能详情
    async loadSkillDetail(skillId) {
      this.skillDetailLoading = true;
      try {
        const response = await visionAIService.skillAPI.getLlmSkillDetail(skillId);
        console.log('技能详情API响应:', response.data);
        
        // 兼容不同的响应格式
        if (response.data) {
          if (response.data.success === true) {
            // 大模型技能API格式: {success: true, data: {...}}
            this.skillDetail = response.data.data || response.data;
          } else if (response.data.code === 0) {
            // 标准格式: {code: 0, data: {...}}
            this.skillDetail = response.data.data;
          } else if (response.data.id) {
            // 直接返回技能对象
            this.skillDetail = response.data;
          } else {
            this.$message.error('获取技能详情失败：数据格式不正确');
            return;
          }
          
          console.log('解析后的技能详情:', this.skillDetail);
        } else {
          this.$message.error('获取技能详情失败：响应数据为空');
        }
      } catch (error) {
        console.error('获取技能详情失败:', error);
        this.$message.error('获取技能详情失败: ' + (error.message || '未知错误'));
      } finally {
        this.skillDetailLoading = false;
      }
    },

                   // 初始化配置表单
      initConfigForm(skill) {
        this.configForm = {
          taskName: `${skill.skill_name || skill.name}_${this.selectedCamera.name || ''}`,
          taskDescription: skill.skill_description || skill.description || '',
          frequency: {
            seconds: 30,
            frames: 1
          },
          alertLevel: 0,
          timeRanges: [
            {
              start: '00:00',
              end: '23:59'
            }
          ],
          enabled: true
        };
      },

    // 添加时间段
    addTimeRange() {
      if (this.configForm.timeRanges.length < 3) {
        this.configForm.timeRanges.push({
          start: '00:00',
          end: '23:59'
        });
      }
    },

    // 移除时间段
    removeTimeRange(index) {
      if (this.configForm.timeRanges.length > 1) {
        this.configForm.timeRanges.splice(index, 1);
      }
    },

    // 保存配置
    async saveConfig() {
      try {
        await this.$refs.configForm.validate();
        
        this.saveLoading = true;

                 // 构建任务数据（符合LLMTaskCreate模型）
         const taskData = {
           name: this.configForm.taskName,
           description: this.configForm.taskDescription,
           skill_id: this.selectedSkillData.skill_id || this.selectedSkillData.id,
           camera_id: this.selectedCamera.id,
           frame_rate: this.configForm.frequency.seconds,  // 每多少秒处理一次
           status: this.configForm.enabled,
           alert_level: this.configForm.alertLevel,
           running_period: {
             enabled: true,
             periods: this.configForm.timeRanges.map(range => ({
               start: range.start,
               end: range.end
             }))
           }
         };

        console.log(this.isEditMode ? '更新大模型技能任务:' : '创建大模型技能任务:', taskData);

        // 根据模式调用不同的API
        let response;
        if (this.isEditMode && this.editingTaskId) {
          // 编辑模式：调用更新API
          response = await visionAIService.skillAPI.updateLlmTask(this.editingTaskId, taskData);
        } else {
          // 创建模式：调用创建API
          response = await visionAIService.skillAPI.createLlmTask(taskData);
        }
        
        // 检查不同的响应格式
        let isSuccess = false;
        if (response.data) {
          if (response.data.success === true || response.data.code === 0 || response.data.id) {
            isSuccess = true;
          }
        }
        
         if (isSuccess) {
           const successMessage = this.isEditMode ? '更新大模型任务成功' : '配置大模型技能成功';
           this.$message.success(successMessage);
           // 关闭配置弹窗
           this.closeConfigDialog();
           // 重新加载关联任务
           this.loadRelatedTasks();
           // 触发配置成功事件
           this.$emit('config-success');
         } else {
           const errorPrefix = this.isEditMode ? '更新失败' : '配置失败';
           this.$message.error(errorPrefix + ': ' + (response.data && response.data.message ? response.data.message : '未知错误'));
         }
      } catch (error) {
        console.error('配置大模型技能失败:', error);
        this.$message.error('配置失败: ' + (error.message || '表单验证失败'));
      } finally {
        this.saveLoading = false;
      }
    },

    // 任务操作方法
    editTask(task) {
      // 编辑任务 - 可以复用现有的配置对话框
      this.selectedSkillData = {
        skill_id: task.skill_id,  // LLM任务使用skill_id字段
        skill_name: task.skill_name,
        skill_description: task.description
      };
      this.skillDetail = this.selectedSkillData;
      
      // 处理运行时段配置
      let timeRanges = [{ start: '00:00', end: '23:59' }]; // 默认全天
      if (task.running_period && task.running_period.periods && Array.isArray(task.running_period.periods)) {
        timeRanges = task.running_period.periods.map(period => ({
          start: period.start || '00:00',
          end: period.end || '23:59'
        }));
      }
      
             // 填充表单数据
       this.configForm = {
         taskName: task.name,
         taskDescription: task.description,
         frequency: {
           seconds: Math.max(30, task.frame_rate || 30), // 使用frame_rate字段，确保最少30秒
           frames: 1  // 固定为1帧，30秒内最多只能抽取1次
         },
         alertLevel: task.alert_level !== undefined ? task.alert_level : 0, // 使用任务的预警等级
         timeRanges: timeRanges,
         enabled: task.status
       };
      
      // 设置编辑模式
      this.isEditMode = true;
      this.editingTaskId = task.id;
      
      this.skillConfigVisible = true;
    },

         viewTask(task) {
       // 查看任务详情
       const alertLevelNames = {
         1: '一级预警',
         2: '二级预警', 
         3: '三级预警',
         4: '四级预警',
         0: '默认等级'
       };
       const alertLevelName = alertLevelNames[task.alert_level] || task.alert_level || '未设置';
       
       this.$alert(`
         <div style="text-align: left;">
           <p><strong>任务名称：</strong>${task.name}</p>
           <p><strong>技能名称：</strong>${task.skill_name || task.skill_class_name}</p>
           <p><strong>任务描述：</strong>${task.description || '无'}</p>
           <p><strong>任务状态：</strong>${task.status ? '运行中' : '已停止'}</p>
           <p><strong>预警等级：</strong>${alertLevelName}</p>
           <p><strong>抽帧频率：</strong>每${task.frame_rate || 30}秒处理一次</p>
           <p><strong>创建时间：</strong>${this.formatTime(task.created_at)}</p>
         </div>
       `, '任务详情', {
         dangerouslyUseHTMLString: true,
         confirmButtonText: '确定'
       });
     },

    deleteTask(task) {
      this.$confirm(`确定要删除任务「${task.name}」吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await visionAIService.skillAPI.deleteLlmTask(task.id);
          this.$message.success('删除成功');
          this.loadRelatedTasks(); // 重新加载任务列表
        } catch (error) {
          console.error('删除任务失败:', error);
          this.$message.error('删除失败: ' + (error.message || '未知错误'));
        }
      }).catch(() => {
        // 取消删除
      });
    },

    // 格式化时间
    formatTime(time) {
      if (!time) return '未知';
      try {
        return new Date(time).toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        return time;
      }
    },

    // 获取预警等级名称
    getAlertLevelName(level) {
      const alertLevelNames = {
        1: '一级预警',
        2: '二级预警', 
        3: '三级预警',
        4: '四级预警',
        0: '默认等级'
      };
      return alertLevelNames[level] || '未设置';
    },

     // 关闭配置对话框
     handleConfigClose() {
       this.closeConfigDialog();
     },

     // 取消技能配置 - 取消按钮点击处理
     cancelSkillConfig() {
       this.closeConfigDialog();
     },

     // 统一的配置弹窗关闭方法
     closeConfigDialog() {
       this.skillConfigVisible = false;
       // 重置表单
       this.$nextTick(() => {
         if (this.$refs.configForm) {
           this.$refs.configForm.resetFields();
         }
       });
       // 清理配置相关数据
       this.selectedSkillData = {};
       this.skillDetail = null;
       this.skillDetailLoading = false;
       this.saveLoading = false;
       
       // 清除编辑模式标识
       this.isEditMode = false;
       this.editingTaskId = null;
     },

     // 关闭主对话框
     handleDialogClose() {
       this.close();
     },

     // 关闭对话框 - 底部按钮点击处理  
     closeDialog() {
       this.close();
     },

    // 强制刷新技能列表
    forceRefreshSkills() {
      // 清空当前数据
      this.skillList = [];
      this.skillTotal = 0;
      this.skillCurrentPage = 1;
      
      // 清除搜索状态
      this.searchKeyword = '';
      this.statusFilter = 'all';
      
      // 重新加载
      this.loadSkillList();
    },

     // 重置数据
     resetData() {
       // 清理搜索定时器
       if (this.searchTimer) {
         clearTimeout(this.searchTimer);
         this.searchTimer = null;
       }
       
       // 重置搜索和分页状态
       this.searchKeyword = '';
       this.statusFilter = 'all';
       this.skillCurrentPage = 1;
       this.skillPageSize = 8;
       
       // 清空数据
       this.skillList = [];
       this.skillTotal = 0;
       this.relatedTasks = [];
       
       // 重置加载状态
       this.skillListLoading = false;
       this.tasksLoading = false;
       
       // 清空选中的摄像头
       this.selectedCamera = {};
       
       // 确保配置弹窗也关闭
       if (this.skillConfigVisible) {
         this.closeConfigDialog();
       }
     }
  }
};
</script>

<style scoped>
/* 主对话框样式 */
.llm-skill-management-dialog {
  border-radius: 16px;
  overflow: hidden;
}

.llm-skill-management-dialog .el-dialog__header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 24px 32px;
  border-bottom: none;
}

.llm-skill-management-dialog .el-dialog__title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.llm-skill-management-dialog .el-dialog__headerbtn .el-dialog__close {
  color: rgba(255, 255, 255, 0.8);
  font-size: 20px;
}

.llm-skill-management-dialog .el-dialog__headerbtn .el-dialog__close:hover {
  color: #fff;
}

 .llm-skill-management-dialog .el-dialog__body {
   padding: 24px;
   background: #f8fafe;
 }

.llm-skill-management-dialog .el-dialog__footer {
  background: #fff;
  border-top: 1px solid #ebeef5;
  padding: 20px 32px;
}

/* 技能配置对话框样式 */
.llm-skill-config-dialog {
  border-radius: 16px;
  overflow: hidden;
}

.llm-skill-config-dialog .el-dialog__header {
  background: linear-gradient(135deg, #409eff 0%, #36cfc9 100%);
  color: #fff;
  padding: 24px 32px;
  border-bottom: none;
}

.llm-skill-config-dialog .el-dialog__title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.llm-skill-config-dialog .el-dialog__headerbtn .el-dialog__close {
  color: rgba(255, 255, 255, 0.8);
  font-size: 20px;
}

.llm-skill-config-dialog .el-dialog__headerbtn .el-dialog__close:hover {
  color: #fff;
}

.llm-skill-config-dialog .el-dialog__body {
  padding: 32px;
  background: #f8fafe;
}

.llm-skill-config-dialog .el-dialog__footer {
  background: #fff;
  border-top: 1px solid #ebeef5;
  padding: 20px 32px;
}

 /* 技能区域样式 */
 .skill-section {
   background: #fff;
   border-radius: 12px;
   padding: 20px;
   margin-bottom: 20px;
   box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
   border: 1px solid #e4e7ed;
 }

 /* 搜索工具栏样式 */
 .search-toolbar {
   display: flex;
   justify-content: space-between;
   align-items: center;
   margin-bottom: 20px;
   padding: 16px;
   background: #f8f9fa;
   border-radius: 8px;
   border: 1px solid #e9ecef;
 }

 .search-filters {
   display: flex;
   align-items: center;
   gap: 16px;
 }

 .search-actions {
   display: flex;
   gap: 12px;
 }

 /* 标题和分页区域样式 */
 .section-header {
   display: flex;
   justify-content: space-between;
   align-items: center;
   margin-bottom: 24px;
   padding-bottom: 16px;
   border-bottom: 2px solid #f0f2f5;
 }
 
 .section-title {
   display: flex;
   align-items: center;
   font-size: 18px;
   font-weight: 600;
   color: #303133;
 }
 
 .section-title i {
   margin-right: 8px;
   font-size: 20px;
   color: #667eea;
 }
 
 .pagination-controls {
   flex-shrink: 0;
 }

.skill-list-container {
  min-height: 420px;
  position: relative;
}

.skill-loading, .no-skills {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 320px;
  color: #909399;
  font-size: 14px;
  background: #fafbfc;
  border-radius: 8px;
  border: 2px dashed #e4e7ed;
}

.skill-loading i, .no-skills i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

 .skill-grid {
   display: grid;
   grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
   gap: 16px;
   padding: 8px 0;
 }

 .skill-card {
   background: #fff;
   border: 1px solid #e4e7ed;
   border-radius: 10px;
   padding: 16px;
   cursor: pointer;
   transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
   position: relative;
   overflow: hidden;
 }

.skill-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.skill-card:hover {
  border-color: #667eea;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
  transform: translateY(-4px);
}

.skill-card:hover::before {
  transform: scaleX(1);
}

 .skill-header {
   display: flex;
   justify-content: space-between;
   align-items: flex-start;
   margin-bottom: 12px;
 }

 .skill-icon {
   width: 40px;
   height: 40px;
   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
   border-radius: 10px;
   display: flex;
   align-items: center;
   justify-content: center;
   color: #fff;
   font-size: 18px;
   box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3);
 }

.skill-status {
  flex-shrink: 0;
}

.skill-content {
  flex: 1;
}

 .skill-name {
   font-size: 15px;
   font-weight: 600;
   color: #303133;
   margin-bottom: 6px;
   line-height: 1.3;
   height: 38px;
   overflow: hidden;
   display: -webkit-box;
   -webkit-line-clamp: 2;
   -webkit-box-orient: vertical;
 }

 .skill-description {
   font-size: 12px;
   color: #606266;
   margin-bottom: 12px;
   line-height: 1.4;
   height: 34px;
   overflow: hidden;
   display: -webkit-box;
   -webkit-line-clamp: 2;
   -webkit-box-orient: vertical;
 }

.skill-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f2f5;
}

.skill-type {
  font-size: 12px;
  color: #909399;
  padding: 4px 8px;
  background: #f0f2f5;
  border-radius: 4px;
}

.skill-version {
  font-size: 12px;
  color: #67c23a;
  font-weight: 600;
  padding: 2px 6px;
  background: rgba(103, 194, 58, 0.1);
  border-radius: 4px;
}

 /* 关联任务区域样式 */
 .related-section {
   background: #fff;
   border-radius: 12px;
   padding: 20px;
   box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
   border: 1px solid #e4e7ed;
 }

.related-tasks-container {
  min-height: 200px;
}

.tasks-loading, .no-tasks {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 160px;
  color: #909399;
  font-size: 14px;
  background: #fafbfc;
  border-radius: 8px;
  border: 2px dashed #e4e7ed;
}

.tasks-loading i, .no-tasks i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.tasks-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.task-card {
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid #e4e7ed;
}

.task-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.task-card .el-card__body {
  padding: 16px;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.task-info {
  flex: 1;
}

.task-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
  line-height: 1.4;
}

.task-skill {
  font-size: 12px;
  color: #909399;
}

.task-status {
  flex-shrink: 0;
}

.task-content {
  margin-bottom: 12px;
}

.task-desc {
  font-size: 13px;
  color: #606266;
  line-height: 1.4;
  margin-bottom: 8px;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #909399;
}

.task-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #f0f2f5;
}

/* 技能配置容器样式 */
.skill-config-container {
  max-height: 650px;
  overflow-y: auto;
  padding-right: 8px;
}

.skill-config-container::-webkit-scrollbar {
  width: 6px;
}

.skill-config-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.skill-config-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.skill-config-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.skill-detail-header {
  background: linear-gradient(135deg, #409eff 0%, #36cfc9 100%);
  color: #fff;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
}

.skill-detail-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.skill-detail-header::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -5%;
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
}

.skill-info {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
}

.skill-icon-large {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin-right: 20px;
  backdrop-filter: blur(10px);
}

.skill-info-content {
  flex: 1;
}

.skill-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 8px 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.skill-desc {
  font-size: 14px;
  margin: 0 0 12px 0;
  opacity: 0.9;
  line-height: 1.5;
}

.skill-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.skill-detail-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 300px;
  color: #909399;
  font-size: 14px;
  background: #fafbfc;
  border-radius: 8px;
}

.skill-detail-loading i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

/* 表单样式 */
.frequency-config {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

 .alert-level-desc {
   margin-left: 12px;
   font-size: 12px;
   padding: 4px 8px;
   border-radius: 4px;
   font-weight: 500;
   transition: all 0.3s ease;
 }

.time-ranges-config {
  max-width: 600px;
}

.time-range-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.time-separator {
  margin: 0 12px;
  color: #909399;
  font-weight: 600;
}

.add-time-range {
  margin-top: 8px;
}

/* 对话框底部样式 */
.dialog-footer {
  text-align: right;
  padding: 0;
}

.dialog-footer .el-button {
  min-width: 88px;
  height: 40px;
  border-radius: 8px;
  font-weight: 500;
}

.dialog-footer .el-button--primary {
  background: linear-gradient(135deg, #409eff 0%, #36cfc9 100%);
  border: none;
}

.dialog-footer .el-button--primary:hover {
  background: linear-gradient(135deg, #66b1ff 0%, #5cdbd3 100%);
}

/* 分页样式优化 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f2f5;
}

 /* 响应式设计 */
 @media (max-width: 768px) {
   .skill-grid {
     grid-template-columns: 1fr;
   }
   
   .search-toolbar {
     flex-direction: column;
     gap: 16px;
     align-items: stretch;
   }
   
   .search-filters {
     flex-direction: column;
     gap: 12px;
   }

   .section-header {
     flex-direction: column;
     gap: 16px;
     align-items: stretch;
   }

   .section-title {
     justify-content: center;
   }

   .pagination-controls {
     display: flex;
     justify-content: center;
   }
   
   .tasks-list {
     grid-template-columns: 1fr;
   }
 }
</style>
