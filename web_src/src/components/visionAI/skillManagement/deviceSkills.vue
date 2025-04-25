<template>
  <div class="device-skills-container">
    <!-- 顶部搜索和筛选区域 -->
    <div class="filter-section">
      <div class="toolbar">
        <div class="left-controls">
          <el-button type="primary" icon="el-icon-plus" size="small" @click="handleImportSkill">导入技能</el-button>
          <el-button type="danger" icon="el-icon-delete" size="small" :disabled="!selectedSkills.length" @click="handleBatchDelete">批量删除</el-button>
          <el-button type="info" icon="el-icon-check" size="small" @click="selectAllCurrentPage">选择本页</el-button>
        </div>
        
        <div class="right-controls">
          <div class="filter-item">
            <span class="filter-label">状态:</span>
            <el-select 
              v-model="tempFilterStatus" 
              placeholder="选择状态"
              clearable
              size="small"
              @change="handleFilterChange"
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
              @change="handleFilterChange"
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
            @keyup.enter.native="handleEnterSearch"
            @clear="clearSearch"
          >
            <i slot="prefix" class="el-icon-search"></i>
          </el-input>
          <el-button 
            class="refresh-btn" 
            size="small" 
            icon="el-icon-refresh" 
            @click="fetchSkills"
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
            >
              <div class="selection-overlay" v-if="isSelected(skill.id)"></div>
              <div 
                class="selection-mark" 
                :class="{'selected': isSelected(skill.id)}"
                @click.stop="toggleSelect(skill)" 
                title="选择此技能"
              >
                <i class="el-icon-check" v-if="isSelected(skill.id)"></i>
              </div>
              <div class="skill-thumbnail">
                <img src="/static/logo.png" class="thumbnail-img" alt="技能图标">
              </div>
              <div class="skill-info">
                <h3 class="skill-title">{{ skill.name }}</h3>
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
        :total="filteredSkills.length"
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
    <el-dialog title="技能详情" :visible.sync="detailsDialogVisible" width="50%" :close-on-click-modal="false">
      <div v-if="currentSkill" class="skill-details">
        <div class="skill-header">
          <img src="/static/logo.png" alt="技能图标" class="skill-logo">
          <div class="skill-title">
            <h2>{{ currentSkill.name }}</h2>
            <div class="skill-subtitle">
              <el-tag :type="currentSkill.status === 'published' ? 'success' : 'info'" size="medium" class="status-tag">
                {{ currentSkill.status === 'published' ? '已发布' : '未发布' }}
              </el-tag>
              <span class="version">版本 v{{ currentSkill.version ? parseFloat(currentSkill.version.replace('v', '')).toFixed(1) : '2.0' }}</span>
            </div>
          </div>
        </div>
        
        <el-divider></el-divider>
        
        <div class="skill-info-section">
          <div class="info-row">
            <div class="info-item half-width">
              <span class="info-label">技能类型：</span>
              <span class="info-value">{{ currentSkill.type }}</span>
            </div>
            <div class="info-item half-width">
              <span class="info-label">关联设备数：</span>
              <span class="info-value">{{ currentSkill.deviceCount }}</span>
            </div>
          </div>
          
          <div class="info-row">
            <div class="info-item half-width">
              <span class="info-label">创建时间：</span>
              <span class="info-value">{{ currentSkill.createTime || '2023-06-15 10:30:00' }}</span>
            </div>
            <div class="info-item half-width">
              <span class="info-label">最后更新：</span>
              <span class="info-value">{{ currentSkill.updateTime || '2023-07-20 15:45:22' }}</span>
            </div>
          </div>
          
          <div class="info-row">
            <div class="info-item">
              <span class="info-label">模型：</span>
              <div class="info-value model-tags">
                <el-tag 
                  size="medium" 
                  type="info" 
                  v-for="(model, index) in currentSkill.models || ['yolo11_coco']" 
                  :key="index"
                  class="model-tag"
                >
                  {{ model }}
                </el-tag>
              </div>
            </div>
          </div>
          
          <div class="info-row">
            <div class="info-item description-item">
              <span class="info-label">技能描述：</span>
              <span class="info-value">
                {{ currentSkill.description || '这是一个AI视觉分析技能，可以识别和分析视频中的特定目标。' }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailsDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="editSkill">编辑</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
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

      // 分页配置
      currentPage: 1,
      pageSize: 12,
      total: 0,

      // 对话框控制
      importDialogVisible: false,
      detailsDialogVisible: false,
      currentSkill: null, // 当前查看详情的技能

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
      importing: false // 导入中状态
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
      return this.skillsList.filter(skill => {
        const matchStatus = !this.filterStatus || skill.status === this.filterStatus
        const matchType = !this.filterType || skill.type === this.filterType
        const matchQuery = !this.searchQuery || 
          skill.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        return matchStatus && matchType && matchQuery
      })
    },

    // 计算当前页显示的数据
    displaySkills() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredSkills.slice(start, end)
    },

    // 当前页所有技能ID
    currentPageSkillIds() {
      return this.displaySkills.map(skill => skill.id)
    }
  },

  mounted() {
    this.fetchSkills()
    // 设置默认每页显示12条数据
    this.pageSize = 12
  },

  methods: {
    // 重置筛选条件
    resetFilters() {
      this.tempSearchQuery = ''
      this.tempFilterStatus = ''
      this.tempFilterType = ''
      this.searchQuery = ''
      this.filterStatus = ''
      this.filterType = ''
      this.currentPage = 1
    },

    // 处理搜索
    handleSearch() {
      // 将临时变量的值复制到实际用于过滤的变量
      this.searchQuery = this.tempSearchQuery
      this.filterStatus = this.tempFilterStatus
      this.filterType = this.tempFilterType
      this.currentPage = 1 // 重置页码
    },

    // 获取技能列表数据
    async fetchSkills() {
      try {
        this.$message({
          message: '正在刷新数据...',
          type: 'info',
          duration: 1000
        });

        // 重置搜索和筛选条件
        this.tempSearchQuery = ''
        this.tempFilterStatus = ''
        this.tempFilterType = ''
        this.searchQuery = ''
        this.filterStatus = ''
        this.filterType = ''
        this.currentPage = 1
        
        // 这里模拟API调用
        const mockData = [
          {
            id: '1',
            name: 'human_attribute_detection',
            version: 'v1.0',
            status: 'published',
            deviceCount: 5,
            type: '人体检测',
            thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)',
            models: ['yolo11_coco']
          },
          {
            id: '2',
            name: 'vehicle_detection',
            version: 'v2.1',
            status: 'published',
            deviceCount: 8,
            type: '车辆检测',
            thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)',
            models: ['vehicle_v1']
          },
          {
            id: '3',
            name: 'face_recognition',
            version: 'v1.5',
            status: 'unpublished',
            deviceCount: 0,
            type: '人脸识别',
            thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)',
            models: ['face_v3']
          },
          {
            id: '4',
            name: 'object_tracking',
            version: 'v2.0',
            status: 'published',
            deviceCount: 12,
            type: '目标跟踪',
            thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)',
            models: ['yolo11_coco', 'yolo11_helmet', 'yolo11_safebelts']
          },
          {
            id: '5',
            name: 'crowd_analysis',
            version: 'v1.2',
            status: 'published',
            deviceCount: 3,
            type: '人群分析',
            thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)',
            models: ['crowd_v2', 'person_counter']
          },
          {
            id: '6',
            name: 'license_plate_recognition',
            version: 'v1.0',
            status: 'unpublished',
            deviceCount: 0,
            type: '车牌识别',
            thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)',
            models: ['lpr_v1']
          },
          {
            id: '7',
            name: 'behavior_analysis',
            version: 'v1.3',
            status: 'published',
            deviceCount: 6,
            type: '行为分析',
            thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)',
            models: ['behavior_v1']
          },
          {
            id: '8',
            name: 'traffic_monitoring',
            version: 'v2.2',
            status: 'published',
            deviceCount: 15,
            type: '交通监控',
            thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)',
            models: ['traffic_v2', 'vehicle_counter']
          },
          {
            id: '9',
            name: 'smoke_detection',
            version: 'v1.0',
            status: 'unpublished',
            deviceCount: 0,
            type: '烟雾检测',
            thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)',
            models: ['smoke_v1']
          },
          {
            id: '10',
            name: 'helmet_detection',
            version: 'v1.1',
            status: 'published',
            deviceCount: 4,
            type: '安全帽检测',
            thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)',
            models: ['yolo11_helmet']
          },
          {
            id: '11',
            name: 'intrusion_detection',
            version: 'v1.4',
            status: 'published',
            deviceCount: 7,
            type: '入侵检测',
            thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)',
            models: ['intrusion_v2']
          },
          {
            id: '12',
            name: 'fire_detection',
            version: 'v1.0',
            status: 'unpublished',
            deviceCount: 0,
            type: '火灾检测',
            thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)',
            models: ['fire_v1']
          },
          {
            id: '13',
            name: 'gesture_recognition',
            version: 'v1.2',
            status: 'published',
            deviceCount: 5,
            type: '手势识别',
            thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)',
            models: ['gesture_v1']
          },
          {
            id: '14',
            name: 'falling_detection',
            version: 'v1.0',
            status: 'published',
            deviceCount: 3,
            type: '跌倒检测',
            thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)',
            models: ['fall_v1', 'pose_estimation']
          },
          {
            id: '15',
            name: 'weapon_detection',
            version: 'v1.1',
            status: 'unpublished',
            deviceCount: 0,
            type: '武器检测',
            thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)',
            models: ['weapon_v1']
          }
        ];

        // 设置总数据量
        this.total = mockData.length;
        this.skillsList = mockData;
        
        // 显示成功消息
        setTimeout(() => {
          this.$message.success('数据刷新成功');
        }, 300);
      } catch (error) {
        console.error('获取技能列表失败:', error)
        this.$message.error('获取技能列表失败')
      }
    },

    // 处理回车按键搜索
    handleEnterSearch() {
      this.handleSearch();
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
      this.currentPage = page
    },

    // 处理每页显示数量改变
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1 // 重置到第一页
    },

    // 查看技能详情
    viewSkillDetails(skill) {
      this.currentSkill = skill
      this.detailsDialogVisible = true
    },

    // 删除技能
    deleteSkill(skill) {
      this.$confirm(`确认删除技能 "${skill.name}" 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 这里添加删除逻辑
        this.skillsList = this.skillsList.filter(item => item.id !== skill.id)
        this.$message.success(`成功删除技能: ${skill.name}`)
        // 若已选择的技能中包含被删除的技能，则从选择列表中移除
        if (this.selectedSkills.includes(skill.id)) {
          this.selectedSkills = this.selectedSkills.filter(id => id !== skill.id)
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    // 检查技能是否被选中
    isSelected(skillId) {
      return this.selectedSkills.includes(skillId)
    },

    // 切换选择状态
    toggleSelect(skill) {
      const index = this.selectedSkills.indexOf(skill.id)
      if (index > -1) {
        this.selectedSkills.splice(index, 1)
      } else {
        this.selectedSkills.push(skill.id)
      }
    },

    // 选择当前页所有技能
    selectAllCurrentPage() {
      const currentIds = this.currentPageSkillIds
      const newSelected = [...this.selectedSkills]
      
      // 检查当前页是否已全选
      const allSelected = currentIds.every(id => this.selectedSkills.includes(id))
      
      if (allSelected) {
        // 如果已全选，则取消选择当前页所有技能
        this.selectedSkills = this.selectedSkills.filter(id => !currentIds.includes(id))
      } else {
        // 如果未全选，则选择当前页所有未选择的技能
        currentIds.forEach(id => {
          if (!newSelected.includes(id)) {
            newSelected.push(id)
          }
        })
        this.selectedSkills = newSelected
      }
    },

    // 批量删除技能
    handleBatchDelete() {
      if (this.selectedSkills.length === 0) {
        this.$message.warning('请先选择要删除的技能')
        return
      }
      
      this.$confirm(`确认删除选中的 ${this.selectedSkills.length} 个技能吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 这里添加批量删除逻辑
        this.skillsList = this.skillsList.filter(skill => !this.selectedSkills.includes(skill.id))
        this.$message.success(`成功删除 ${this.selectedSkills.length} 个技能`)
        this.selectedSkills = [] // 清空选择
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    // 打开导入技能对话框
    handleImportSkill() {
      this.importDialogVisible = true
    },

    // 处理文件变化
    handleFileChange(file) {
      if (file.raw) {
        // 检查文件类型
        if (file.raw.type !== 'application/json') {
          this.$message.error('只能上传JSON文件!');
          this.fileList = [];
          return;
        }
        // 检查文件大小
        if (file.raw.size / 1024 > 500) {
          this.$message.error('文件大小不能超过500KB!');
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
      this.$refs.importForm.validate(valid => {
        if (valid) {
          this.importing = true;
          
          // 这里模拟导入过程
          setTimeout(() => {
            // 创建新技能对象
            const newSkill = {
              id: Date.now().toString(), // 生成唯一ID
              name: this.importForm.name,
              version: this.importForm.version,
              status: this.importForm.status,
              deviceCount: 0,
              type: this.importForm.type,
              description: this.importForm.description,
              createTime: new Date().toISOString().replace('T', ' ').substr(0, 19),
              updateTime: new Date().toISOString().replace('T', ' ').substr(0, 19)
            };
            
            // 添加到列表
            this.skillsList.unshift(newSkill);
            
            this.$message.success('技能导入成功');
            this.importDialogVisible = false;
            this.importing = false;
            
            // 重置表单
            this.$refs.importForm.resetFields();
            this.importForm = {
              name: '',
              version: '',
              type: '',
              status: 'published',
              description: '',
              file: null
            };
            this.fileList = [];
          }, 1500);
        } else {
          return false;
        }
      });
    },

    // 编辑技能
    editSkill() {
      this.$message.info(`编辑技能: ${this.currentSkill.name}`)
      this.detailsDialogVisible = false
      // 这里可以添加跳转到编辑页面的逻辑
    },

    // 添加模型处理相关方法
    getModelTitle(models) {
      if (!models || models.length === 0) {
        return '-';
      }
      return models.join(', ');
    }
  }
}
</script>

<style scoped>
.device-skills-container {
  padding: 20px;
}

.filter-section {
  margin-bottom: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.left-controls {
  display: flex;
  align-items: center;
}

.left-controls .el-button {
  margin-right: 10px;
}

.right-controls {
  display: flex;
  align-items: center;
}

.filter-item {
  display: flex;
  align-items: center;
  margin-right: 15px;
}

.filter-label {
  margin-right: 8px;
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
}

.filter-item .el-select {
  width: 130px;
}

.search-input {
  width: 220px;
  margin-right: 10px;
}

.grid-view-btn, .list-view-btn, .refresh-btn {
  padding: 7px 10px;
  margin-left: 5px;
  color: #606266;
  background-color: #fff;
  border: 1px solid #dcdfe6;
}

.skills-grid {
  margin-bottom: 20px;
}

.skills-grid .el-row {
  display: flex;
  flex-wrap: wrap;
}

.skill-col {
  margin-bottom: 20px;
}

.skill-card-wrapper {
  height: 100%;
}

.skills-grid .skill-card {
  height: 100%;
  margin-bottom: 0;
  cursor: pointer;
  transition: transform 0.3s ease;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
}

.skills-grid .skill-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}

.skills-grid .skill-card.selected {
  border: 1px solid #409EFF;
  box-shadow: 0 8px 15px rgba(64,158,255,0.1);
}

.skills-grid .skill-card .selection-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(64, 158, 255, 0.05);
  z-index: 1;
}

.skills-grid .skill-card .selection-mark {
  position: absolute;
  top: 6px;
  left: 6px;
  width: 20px;
  height: 20px;
  border-radius: 3px;
  background-color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(220, 220, 220, 0.8);
  color: #c0c4cc;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  cursor: pointer;
  transition: all 0.3s ease;
}

.skills-grid .skill-card .selection-mark.selected {
  background-color: rgba(64, 158, 255, 0.15);
  border-color: rgba(64, 158, 255, 0.3);
  color: #409EFF;
}

.skills-grid .skill-card .selection-mark:hover {
  background-color: rgba(64, 158, 255, 0.1);
  border-color: rgba(64, 158, 255, 0.2);
  color: #409EFF;
}

.skills-grid .skill-card .skill-thumbnail {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9比例 */
  background-color: #f5f7fa;
}

.skills-grid .skill-card .skill-thumbnail .thumbnail-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 10px;
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
  padding: 12px;
  text-align: left;
}

.skills-grid .skill-card .skill-info h3.skill-title {
  margin: 0 0 10px;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  color: #333;
}

.version-line {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin: 8px 0 12px;
}

.status-mini-tag {
  padding: 2px 6px;
  height: 20px;
  line-height: 16px;
  margin-right: 6px;
}

.status-mini-tag.el-tag--success {
  background-color: #67c23a;
  border-color: #67c23a;
  color: white;
}

.status-mini-tag.el-tag--info {
  background-color: #909399;
  border-color: #909399;
  color: white;
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
}

/* 深度选择器 */
.pagination >>> .el-pagination {
  justify-content: center;
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

.skill-title h2 {
  margin: 0 0 15px;
  font-size: 24px;
  color: #303133;
}

.skill-subtitle {
  display: flex;
  align-items: center;
}

.skill-subtitle .el-tag {
  padding: 5px 10px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
}

.version {
  margin-left: 15px;
  color: #909399;
  font-size: 14px;
}

.skill-info-section {
  margin: 20px 0;
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
  padding: 5px 10px;
  margin-right: 0;
  border: 1px solid #e6e6e6;
  background-color: #f5f5f5;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  margin-bottom: 0;
}

.description-item {
  width: 100%;
  flex-direction: row;
  align-items: flex-start;
}

.description-content {
  line-height: 1.8;
  white-space: pre-line;
}

.model-info {
  margin: 3px 0;
  color: #666;
  font-size: 12px;
  display: flex;
  align-items: flex-start;
  line-height: 1.5;
}

.model-name {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  color: #409EFF;
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
  background-color: #67c23a !important;
  border-color: #67c23a !important;
  color: white !important;
}

.status-tag.el-tag--info {
  background-color: #909399 !important;
  border-color: #909399 !important;
  color: white !important;
}

/* 导入表单中的状态单选按钮样式 */
.status-radio.published {
  color: #67c23a;
  font-weight: 500;
}

.status-radio.unpublished {
  color: #909399;
  font-weight: 500;
}

.info-line {
  display: flex;
  justify-content: space-between;
  margin: 8px 0;
  font-size: 12px;
  color: #666;
}

.info-line .info-item {
  flex: 1;
}
</style>
