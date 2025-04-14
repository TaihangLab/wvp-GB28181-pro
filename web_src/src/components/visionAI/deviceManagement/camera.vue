<template>
  <div>
    <div class="camera-management">
      <!-- 左侧设备树 -->
      <div class="device-tree">
        <h3 class="tree-title">设备目录</h3>
        <el-input
          v-model="searchKeyword"
          placeholder="输入关键字搜索"
          prefix-icon="search"
        />
        <el-tree
          :data="deviceTree"
          :props="{ children: 'children', label: 'label' }"
          default-expand-all
          highlight-current
          node-key="id"
          class="custom-tree"
        >
          <template slot-scope="{ node }">
            <span class="custom-tree-node">
              <span>{{ node.label }}</span>
              <el-tag
                v-if="node.data.status"
                :type="node.data.status === 'online' ? 'success' : 'danger'"
                size="small"
              >
                {{ node.data.status === 'online' ? '在线' : '离线' }}
              </el-tag>
            </span>
          </template>
        </el-tree>
      </div>

      <!-- 右侧设备列表 -->
      <div class="device-list">
        <div class="operation-bar">
          <div class="left-operations">
            <el-button type="primary" @click="handleAddDevice">
              <i class="el-icon-plus"></i>添加摄像头
            </el-button>
            <el-button type="danger" @click="handleBatchDelete" :disabled="selectedDevices.length === 0">
              <i class="el-icon-delete"></i>批量删除
            </el-button>
          </div>
          <div class="right-operations">
            <el-input
              v-model="searchKeyword"
              placeholder="请输入设备名称搜索"
              style="width: 200px"
              clearable
            >
              <i slot="prefix" style="align-items: center; display: flex; height: 40px;" class="el-icon-search"></i>
            </el-input>
            <el-button 
              type="primary" 
              icon="el-icon-refresh" 
              circle 
              @click="handleRefresh"
              class="search-button"
            />
          </div>
        </div>

        <el-table 
          :data="deviceList" 
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column prop="name" label="摄像头名称" align="center" />
          <el-table-column prop="status" label="状态" align="center">
            <template slot-scope="{ row }">
              <el-tag :type="row.status === 'online' ? 'success' : 'danger'">
                {{ row.status === 'online' ? '在线' : '离线' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="location" label="设备来源" align="center" />
          <el-table-column prop="skill" label="视频技能" align="center" />
          <el-table-column label="操作" width="280" align="center">
            <template slot-scope="{ row }">
              <el-button-group>
                <el-button type="primary" size="small" icon="el-icon-setting" @click="handleConfigSkill(row)">配置技能</el-button>
                <el-button type="primary" size="small" icon="el-icon-edit" @click="handleEdit(row)">编辑</el-button>
                <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete(row)">删除</el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <el-pagination
            :current-page.sync="currentPage"
            :page-size.sync="pageSize"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <!-- 添加/编辑设备对话框 -->
      <el-dialog
        :visible.sync="deviceDialogVisible"
        :title="deviceForm.id ? '编辑摄像头' : '添加摄像头'"
        width="450px"
        :close-on-click-modal="false"
        :destroy-on-close="false"
        :modal-append-to-body="true"
        :append-to-body="true"
        :show-close="true"
        :lock-scroll="true"
        custom-class="device-dialog"
      >
        <el-form :model="deviceForm" label-width="80px" class="skill-form">
          <el-form-item label="设备名称">
            <el-input v-model="deviceForm.name" style="width: 200pt;" />
          </el-form-item>
          <el-form-item label="设备类型">
            <el-select v-model="deviceForm.type" placeholder="请选择设备类型" style="width: 200pt;">
              <el-option label="监控摄像头" value="camera" />
              <el-option label="AI摄像头" value="ai-camera" />
            </el-select>
          </el-form-item>
          <el-form-item label="关联地点">
            <el-input v-model="deviceForm.location" style="width: 200pt;"/>
          </el-form-item>
          <el-form-item label="设备技能">
            <el-select
              v-model="deviceForm.skills"
              multiple
              placeholder="请选择设备技能"
              style="width: 200pt;"
            >
              <el-option label="未带安全帽检测" value="helmet" />
              <el-option label="未穿工服检测" value="uniform" />
            </el-select>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="closeDeviceDialog">取消</el-button>
          <el-button type="primary" @click="confirmAddDevice">确认</el-button>
        </span>
      </el-dialog>

      <!-- 配置技能对话框 -->
      <el-dialog
        title="配置技能"
        :visible.sync="skillDialogVisible"
        width="55%"
        :close-on-click-modal="false"
        :destroy-on-close="false"
        :modal-append-to-body="true"
        :append-to-body="true"
        :show-close="true"
        :lock-scroll="true"
        custom-class="skill-dialog"
        center
        @close="handleClose"
      >
      <el-form :model="skillForm" label-width="85px" :rules="rules" ref="skillForm" class="skill-form">
          <div class="form-row">
            <el-form-item label="选择技能" required prop="selectedSkill" class="form-item-inline form-item-skill">
              <el-select 
                v-model="skillForm.selectedSkill" 
                placeholder="请选择技能" 
                style="width: 220px"
                size="small"
                popper-class="skill-select"
              >
                <el-option v-for="item in skillOptions" :key="item.value" :label="item.label" :value="item.value"/>
              </el-select>
            </el-form-item>
            
            <el-form-item label="预警等级" required prop="alarmLevel" class="form-item-inline form-item-level">
              <el-select 
                v-model="skillForm.alarmLevel" 
                placeholder="请选择预警等级" 
                style="width: 140px"
                size="small"
                popper-class="alarm-select"
              >
                <el-option
                    v-for="item in levelOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
              </el-select>
            </el-form-item>

            <el-form-item label="技能状态" required prop="status" class="form-item-inline">
              <div class="status-wrapper">
                <el-switch v-model="skillForm.status" class="status-switch" />
                <span class="status-label" :class="{ 'enabled': skillForm.status, 'disabled': !skillForm.status }"></span>
              </div>
            </el-form-item>
          </div>
          
          <el-form-item label="运行时段" required prop="timeRanges">
            <div v-for="(timeRange, index) in skillForm.timeRanges" :key="index" class="time-range">
              <el-time-picker
                v-model="timeRange.start"
                placeholder="开始时间"
                format="HH:mm"
                class="time-picker"
              />
              <span class="time-separator">-</span>
              <el-time-picker
                v-model="timeRange.end"
                placeholder="结束时间"
                format="HH:mm"
                class="time-picker"
              />
              <el-button type="text" icon="el-icon-delete" @click="removeTimeRange(index)" style="margin-left: 15px;" />
            </div>
            <div class="add-time">
              <el-link 
                type="primary" 
                @click="addTimeRange" 
                :disabled="skillForm.timeRanges.length >= 3"
                class="add-time-link"
              >
                + 添加时间 ({{ skillForm.timeRanges.length }}/3)
              </el-link>
            </div>
          </el-form-item>
          <el-form-item label="抽帧频率" required prop="frequency">
            <div class="frequency-input">
              <span>每</span>
              <el-input-number 
                v-model="skillForm.frequency.seconds" 
                :min="1"
                :max="99"
                controls-position="right"
                class="number-input"
              />
              <span>秒</span>
              <span>抽取</span>
              <el-input-number 
                v-model="skillForm.frequency.frames" 
                :min="1"
                :max="99"
                controls-position="right"
                class="number-input"
              />
              <span>帧</span>
            </div>
            <div class="frequency-tip">支持设置多秒1帧1秒多帧，不支持多秒多帧设置</div>
          </el-form-item>


          <el-form-item label="电子围栏" required style="margin-left: 0px;">
            <div class="electronic-fence-container">
              <div class="fence-wrapper">
                <div class="fence-preview">
                  <div class="video-preview" v-if="!skillForm.electronicFence.image">
                    <div class="preview-placeholder">
                      <i class="el-icon-video-camera"></i>
                      <p>视频预览区域</p>
                    </div>
                  </div>
                  <div class="image-editor" v-else>
                    <img 
                      :src="skillForm.electronicFence.image" 
                      alt="围栏图片" 
                      class="fence-image"
                      @click="handleImageClick"
                    >
                    <div class="fence-polygon" v-if="skillForm.electronicFence.points.length > 0">
                      <svg width="100%" height="100%" style="position: absolute; top: 0; left: 0;">
                        <polygon 
                          :points="formatPolygonPoints(skillForm.electronicFence.points)" 
                          fill="rgba(24, 144, 255, 0.2)" 
                          stroke="#1890ff" 
                          stroke-width="2"
                        />
                        <polyline 
                          v-if="skillForm.electronicFence.isDrawing && skillForm.electronicFence.points.length > 1"
                          :points="formatPolygonPoints(skillForm.electronicFence.points)" 
                          fill="none" 
                          stroke="#1890ff" 
                          stroke-width="2"
                          stroke-dasharray="5,5"
                        />
                        <circle 
                          v-for="(point, index) in skillForm.electronicFence.points" 
                          :key="index"
                          :cx="point.x" 
                          :cy="point.y" 
                          r="6" 
                          fill="#fff" 
                          stroke="#1890ff" 
                          stroke-width="2"
                          @mousedown.prevent="startDragPoint(index, $event)"
                          @click.stop="handlePointClick(index)"
                          :style="getPointStyle(index)"
                        />
                      </svg>
                    </div>
                    <div class="fence-controls" v-if="skillForm.electronicFence.image">
                      <el-button-group v-if="!skillForm.electronicFence.isDrawing">
                        <el-button size="mini" type="primary" icon="el-icon-edit" @click="startDrawFence">绘制围栏</el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete" @click="clearFence" :disabled="skillForm.electronicFence.points.length === 0">清除围栏</el-button>
                      </el-button-group>
                      <el-button-group v-else>
                        <el-button size="mini" type="success" icon="el-icon-check" @click="completeFence" :disabled="skillForm.electronicFence.points.length < 3">完成绘制</el-button>
                        <el-button size="mini" type="warning" icon="el-icon-close" @click="cancelDrawFence">取消绘制</el-button>
                      </el-button-group>
                    </div>
                  </div>
                </div>
                
                <div class="fence-side-panel">
                  <div class="fence-actions">
                    <el-upload
                      action="#"
                      :show-file-list="false"
                      :before-upload="handleFenceImageUpload"
                      accept="image/*"
                      class="fence-upload-btn"
                    >
                      <el-button type="primary" plain size="small" class="action-btn">
                        <i class="el-icon-upload"></i> 上传图片
                      </el-button>
                    </el-upload>
                    <el-button type="success" plain size="small" @click="captureSnapshot" class="action-btn" style="margin-top: 5px;">
                      <i class="el-icon-camera"></i> 拍摄快照
                    </el-button>
                  </div>
                  
                  <div class="fence-tips">
                    <el-alert
                      title="电子围栏使用说明"
                      type="info"
                      description="上传图片或拍摄快照后，可以在图片上绘制多边形区域作为电子围栏。当检测到目标在围栏内/外活动时触发报警。"
                      :closable="false"
                      show-icon
                    />
                  </div>
                </div>
              </div>
            </div>
          </el-form-item>
          
          <!-- 添加电子围栏的触发模式和灵敏度选项 -->
          <el-form-item label="围栏设置" v-if="skillForm.electronicFence.points.length >= 3" style="margin-left: 10px; margin-top: 10px;">
            <div class="fence-settings">
              <div class="setting-item">
                <span class="setting-label">触发模式：</span>
                <el-radio-group v-model="skillForm.electronicFence.triggerMode" size="small">
                  <el-radio-button label="inside">进入围栏触发</el-radio-button>
                  <el-radio-button label="outside">离开围栏触发</el-radio-button>
                </el-radio-group>
              </div>
              <div class="setting-item">
                <span class="setting-label">检测灵敏度：</span>
                <el-slider 
                  v-model="skillForm.electronicFence.sensitivity" 
                  :min="0" 
                  :max="100" 
                  :format-tooltip="value => `${value}%`"
                  style="width: 200px;"
                />
              </div>
            </div>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="closeSkillDialog">取消</el-button>
          <el-button type="primary" @click="handleConfirm">确定</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CameraManagement',
  data() {
    return {
// 设备树数据
      deviceTree: [
  {
    label: '电力行业',
    children: [
      { label: '监控设备1', status: 'online' },
      { label: '监控设备2', status: 'offline' }
    ]
  },
  {
    label: '油气行业',
    children: [
      { label: '摄像头01', status: 'online' },
      { label: '消防设备', status: 'offline' }
    ]
  }
      ],

// 搜索关键词
      searchKeyword: '',

// 设备列表数据
      deviceList: [
  {
    id: '1',
    name: '监控设备1',
    status: 'online',
    location: '中心节点',
    skill: '安全帽检测 v2',
    createTime: '2024-03-20',
    config: null // 添加配置字段
  },
  {
    id: '2',
    name: '摄像头01',
    status: 'online',
    location: '中心节点',
    skill: '工服检测 v1',
    createTime: '2024-03-19',
    config: null
  },
  {
    id: '3',
    name: '消防设备',
    status: 'offline',
    location: '中心节点',
    skill: '未穿工服检测',
    createTime: '2024-03-18',
    config: null
  },
  {
    id: '4',
    name: '监控设备2',
    status: 'offline',
    location: '中心节点',
    skill: '安全帽检测 v2, 工服检测 v1',
    createTime: '2024-03-17',
    config: null
  },
  {
    id: '5',
    name: '车牌识别东',
    status: 'online',
    location: '中心节点',
    skill: '车牌识别 v6',
    createTime: '2024-03-16',
    config: null
  },
  {
    id: '6',
    name: '沪宁高速监控',
    status: 'online',
    location: '中心节点',
    skill: '雨天人车检测 v1',
    createTime: '2024-03-15',
    config: null
  },
  {
    id: '7',
    name: '水位监测',
    status: 'offline',
    location: '中心节点',
    skill: '水位监测 v1',
    createTime: '2024-03-14',
    config: null
  },
  {
    id: '8',
    name: '护边检测',
    status: 'online',
    location: '中心节点',
    skill: 'ks_xuangan_detect_851_v1_0',
    createTime: '2024-03-13',
    config: null
  }
      ],
      
      // 原始设备列表数据（用于搜索和刷新）
      originalDeviceList: [],

// 添加设备对话框
      deviceDialogVisible: false,
      deviceForm: {
  name: '',
  type: '',
  location: '',
  skills: []
      },

// 新增：选中的设备列表
      selectedDevices: [],
      
      // 添加分页相关的数据
      currentPage: 1,
      pageSize: 10,
      total: 0,
      
      // 配置技能对话框
      skillDialogVisible: false,
      skillForm: {
        selectedSkill: '',
        alarmLevel: '',
        status: true,
        timeRanges: [{
          start: new Date(2024, 0, 1, 0, 0),
          end: new Date(2024, 0, 1, 23, 59)
        }],
        frequency: {
          seconds: 1,
          frames: 1
        },
        electronicFence: {
          image: '',
          points: [],
          isDrawing: false,
          triggerMode: 'inside',
          sensitivity: 80,
          tempPoints: [], // 添加临时点数组，用于预览
          draggedPointIndex: -1, // 当前拖动的点索引
          isDragging: false // 是否正在拖动点
        },
        images: []
      },
      
      // 可选技能列表
      skillOptions: [
        { label: '未佩戴安全帽 (v7)', value: '未佩戴安全帽 (v7)' },
        { label: '管道泄漏 (v2)', value: '管道泄漏 (v2)' },
        { label: '烟雾识别 (v6)', value: '烟雾识别 (v6)' },
        { label: '明火识别 (v3)', value: '明火识别 (v3)' },
        { label: '人员摔倒 (v1)', value: '人员摔倒 (v1)' },
        { label: '人员聚集 (v1)', value: '人员聚集 (v1)' },
        { label: '人员离岗 (v2)', value: '人员离岗 (v2)' },
        { label: '未穿工服 (v3)', value: '未穿工服 (v3)' }
      ],
      
      // 预警等级选项
      levelOptions: [
        { label: '四级预警', value: '四级预警' },
        { label: '三级预警', value: '三级预警' },
        { label: '二级预警', value: '二级预警' },
        { label: '一级预警', value: '一级预警' }
      ],
      
      // 当前正在配置的设备ID
      currentDeviceId: null,
      
      // 配置技能表单验证规则
      rules: {
        selectedSkill: [
          { required: true, message: '请选择技能', trigger: 'change' }
        ],
        alarmLevel: [
          { required: true, message: '请选择预警等级', trigger: 'change' }
        ],
        timeRanges: [
          { required: true, message: '请设置运行时段', trigger: 'change' }
        ],
        frequency: [
          { required: true, message: '请设置抽帧频率', trigger: 'change' }
        ]
      },
      
      // 拖动事件绑定引用
      boundDragPoint: null,
      boundStopDragPoint: null
    }
  },
  
  created() {
    this.originalDeviceList = [...this.deviceList]
    this.total = this.deviceList.length
  },
  
  watch: {
    searchKeyword(newValue) {
      if (!newValue) {
        // 如果搜索关键词为空，恢复原始数据
        this.deviceList = [...this.originalDeviceList]
      } else {
        // 根据关键词过滤设备列表
        this.deviceList = this.originalDeviceList.filter(device => 
          device.name.toLowerCase().includes(newValue.toLowerCase()) ||
          device.skill.toLowerCase().includes(newValue.toLowerCase()) ||
          device.location.toLowerCase().includes(newValue.toLowerCase())
        )
      }
    }
  },
  
  methods: {
    // 处理添加设备
    handleAddDevice() {
      this.deviceDialogVisible = true
    },

// 新增：表格选择变化处理
    handleSelectionChange(selection) {
      this.selectedDevices = selection.map(item => item.id)
    },

// 新增：批量删除处理
    handleBatchDelete() {
      if (this.selectedDevices.length === 0) {
        this.$message.warning('请选择要删除的设备')
    return
  }
  
      this.$confirm(
        `确认删除选中的 ${this.selectedDevices.length} 个设备吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 从设备列表中移除选中的设备
        this.deviceList = this.deviceList.filter(
          device => !this.selectedDevices.includes(device.id)
    )
        this.selectedDevices = []
        this.$message.success('删除成功')
  }).catch(() => {
    // 用户点击取消，不做操作
  })
    },

// 确认添加设备
    confirmAddDevice() {
  // TODO: 处理设备添加逻辑
      this.deviceDialogVisible = false
    },

// 处理页码改变
    handleCurrentChange(val) {
      this.currentPage = val
    },

// 处理每页条数改变
    handleSizeChange(val) {
      this.pageSize = val
    },

// 刷新功能实现
    handleRefresh() {
  // 恢复原始数据
      this.deviceList = [...this.originalDeviceList]
  // 清空搜索关键词
      this.searchKeyword = ''
  // 重置分页
      this.currentPage = 1
      this.$message.success('刷新成功')
    },

// 处理编辑设备
    handleEdit(row) {
      // 打开编辑对话框，并填充当前设备数据
      this.deviceForm = {
        id: row.id, // 保存ID以区分编辑还是新增
        name: row.name,
        type: row.type || '',
        location: row.location,
        skills: row.skill ? row.skill.split(',').map(s => s.trim()) : []
      };
      
      // 使用nextTick确保DOM更新后再显示对话框
      this.$nextTick(() => {
        this.deviceDialogVisible = true;
        console.log('打开编辑对话框');
      });
    },
    
    // 处理配置技能
    handleConfigSkill(row) {
      // 设置当前设备ID，用于后续保存
      this.currentDeviceId = row.id;
      
      // 初始化技能表单
      this.skillForm = {
        selectedSkill: '未佩戴安全帽 (v7)',
        alarmLevel: '四级预警',
        status: true,
        timeRanges: [{
          start: new Date(2024, 0, 1, 0, 0),
          end: new Date(2024, 0, 1, 23, 59)
        }],
        frequency: {
          seconds: 1,
          frames: 1
        },
        electronicFence: {
          image: '',
          points: [],
          isDrawing: false,
          triggerMode: 'inside',
          sensitivity: 80,
          tempPoints: [],
          draggedPointIndex: -1,
          isDragging: false
        },
        images: []
      };
      
      // 如果设备已有配置，则加载已有配置
      if (row.config) {
        try {
          this.loadExistingConfig(row.config);
        } catch (error) {
          console.error('加载配置失败', error);
        }
      }
      
      // 使用nextTick确保DOM更新后再显示对话框
      this.$nextTick(() => {
        this.skillDialogVisible = true;
        console.log('打开配置技能对话框');
      });
    },

    // 加载已有配置
    loadExistingConfig(config) {
      if (!config) return;
      
      // 使用深拷贝避免直接引用
      const configCopy = JSON.parse(JSON.stringify(config));
      
      // 填充表单字段
      this.skillForm.selectedSkill = configCopy.selectedSkill || this.skillForm.selectedSkill;
      this.skillForm.alarmLevel = configCopy.alarmLevel || this.skillForm.alarmLevel;
      this.skillForm.status = configCopy.status !== undefined ? configCopy.status : this.skillForm.status;
      
      // 时间段
      if (configCopy.timeRanges && configCopy.timeRanges.length > 0) {
        this.skillForm.timeRanges = configCopy.timeRanges.map(range => ({
          start: range.start ? new Date(range.start) : new Date(2024, 0, 1, 0, 0),
          end: range.end ? new Date(range.end) : new Date(2024, 0, 1, 23, 59)
        }));
      }
      
      // 抽帧频率
      if (configCopy.frequency) {
        this.skillForm.frequency = configCopy.frequency;
      }
      
      // 电子围栏
      if (configCopy.electronicFence) {
        this.skillForm.electronicFence.image = configCopy.electronicFence.image || '';
        this.skillForm.electronicFence.points = configCopy.electronicFence.points || [];
        this.skillForm.electronicFence.triggerMode = configCopy.electronicFence.triggerMode || 'inside';
        this.skillForm.electronicFence.sensitivity = configCopy.electronicFence.sensitivity || 80;
      }
    },

// 添加时间段
    addTimeRange() {
      if (this.skillForm.timeRanges.length < 3) {
        this.skillForm.timeRanges.push({
      start: '00:00',
      end: '23:59'
    })
  }
    },
    
    // 处理关闭对话框
    handleClose() {
      console.log('对话框关闭，重置表单');
      // 重置表单
      this.skillForm = {
        selectedSkill: '',
        alarmLevel: '',
        status: true,
        timeRanges: [{
          start: new Date(2024, 0, 1, 0, 0),
          end: new Date(2024, 0, 1, 23, 59)
        }],
        frequency: {
          seconds: 1,
          frames: 1
        },
        electronicFence: {
          image: '',
          points: [],
          isDrawing: false,
          triggerMode: 'inside',
          sensitivity: 80,
          tempPoints: [],
          draggedPointIndex: -1,
          isDragging: false
        },
        images: []
      };
      
      // 清除当前设备ID
      this.currentDeviceId = null;
    },
    
    // 处理确认配置
    handleConfirm() {
      this.$refs.skillForm.validate((valid) => {
        if (valid) {
          if (this.currentDeviceId) {
            // 构建要保存的配置对象
            const config = this.prepareConfigForSave();
            
            // 找到当前设备并保存配置
            const deviceIndex = this.deviceList.findIndex(device => device.id === this.currentDeviceId);
            if (deviceIndex !== -1) {
              this.$set(this.deviceList[deviceIndex], 'config', config);
              
              // 更新设备的技能名称显示
              this.deviceList[deviceIndex].skill = this.skillForm.selectedSkill;
              
              this.$message.success('保存成功');
              console.log('保存的电子围栏配置:', config.electronicFence);
              
              // 更新原始列表
              this.originalDeviceList = [...this.deviceList];
              
              // 关闭对话框
              this.closeSkillDialog();
            } else {
              this.$message.error('未找到设备，保存失败');
            }
          } else {
            this.$message.error('未指定设备ID，保存失败');
          }
        } else {
          return false;
        }
      });
    },
    
    // 准备保存的配置数据
    prepareConfigForSave() {
      // 创建一个深拷贝，避免引用原始对象
      const config = JSON.parse(JSON.stringify({
        selectedSkill: this.skillForm.selectedSkill,
        alarmLevel: this.skillForm.alarmLevel,
        status: this.skillForm.status,
        timeRanges: this.skillForm.timeRanges.map(range => ({
          start: range.start instanceof Date ? range.start.toISOString() : range.start,
          end: range.end instanceof Date ? range.end.toISOString() : range.end
        })),
        frequency: this.skillForm.frequency,
        electronicFence: {
          image: this.skillForm.electronicFence.image,
          points: this.skillForm.electronicFence.points,
          triggerMode: this.skillForm.electronicFence.triggerMode,
          sensitivity: this.skillForm.electronicFence.sensitivity
        }
      }));
      
      return config;
    },

// 处理删除单个设备
    handleDelete(row) {
      this.$confirm(
    `确认删除设备 ${row.name} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
        this.deviceList = this.deviceList.filter(device => device.id !== row.id)
        this.$message.success('删除成功')
  }).catch(() => {
    // 用户点击取消，不做操作
  })
    },
    
    // 处理移除时间段
    removeTimeRange(index) {
      if (this.skillForm.timeRanges.length > 1) {
        this.skillForm.timeRanges.splice(index, 1);
      } else {
        this.$message.warning('至少保留一个时间段');
      }
    },
    
    // 格式化多边形点坐标为SVG格式
    formatPolygonPoints(points) {
      return points.map(point => `${point.x},${point.y}`).join(' ');
    },
    
    // 处理上传电子围栏图片
    handleFenceImageUpload(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.skillForm.electronicFence.image = e.target.result;
        this.skillForm.electronicFence.points = [];
      };
      reader.readAsDataURL(file);
      return false; // 阻止自动上传
    },
    
    // 拍摄快照
    captureSnapshot() {
      // 模拟拍摄快照，实际应用中需要调用摄像头API
      this.$message.info('已拍摄快照，实际应用中需调用摄像头API');
      // 演示用，使用示例图片
      this.skillForm.electronicFence.image = 'https://img.alicdn.com/imgextra/i4/O1CN01sjwb8s1jrJWEFhxnJ_!!6000000004601-2-tps-1076-717.png';
      this.skillForm.electronicFence.points = [];
    },
    
    // 处理图片点击事件，添加电子围栏点
    handleImageClick(event) {
      if (!this.skillForm.electronicFence.isDrawing) {
        return;
      }
      
      // 获取点击坐标相对于图片的位置
      const rect = event.target.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // 添加点到围栏
      this.skillForm.electronicFence.points.push({ x, y });
      
      // 如果点数超过10个，自动完成绘制
      if (this.skillForm.electronicFence.points.length >= 10) {
        this.completeFence(); // 完成绘制
      } else {
        // 显示用户添加的点数提示
        this.$message.info(`已添加 ${this.skillForm.electronicFence.points.length} 个点，至少需要3个点才能形成有效围栏`);
      }
    },

    // 开始绘制电子围栏
    startDrawFence() {
      if (this.skillForm.electronicFence.isDrawing) {
        this.completeFence(); // 完成绘制
      } else {
        // 开始绘制
        this.skillForm.electronicFence.isDrawing = true;
        this.skillForm.electronicFence.points = [];
        this.$message.info('请在图片上点击添加围栏顶点，至少需要3个点');
      }
    },
    
    // 完成围栏绘制
    completeFence() {
      // 如果点数不足，提示用户
      if (this.skillForm.electronicFence.points.length < 3) {
        this.$message.warning('电子围栏至少需要3个点');
        return;
      }
      
      // 如果需要自动闭合多边形（第一个点和最后一个点不同）
      const points = this.skillForm.electronicFence.points;
      const firstPoint = points[0];
      const lastPoint = points[points.length - 1];
      
      // 如果首尾点距离较远，自动闭合
      const distance = Math.sqrt(
        Math.pow(firstPoint.x - lastPoint.x, 2) + 
        Math.pow(firstPoint.y - lastPoint.y, 2)
      );
      
      if (distance > 10) { // 距离超过10像素则添加闭合点
        points.push({ x: firstPoint.x, y: firstPoint.y });
      }
      
      // 完成绘制
      this.skillForm.electronicFence.isDrawing = false;
      this.$message.success('电子围栏绘制完成');
    },
    
    // 清除电子围栏
    clearFence() {
      this.$confirm('确定要清除当前绘制的电子围栏吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.skillForm.electronicFence.points = [];
        this.skillForm.electronicFence.isDrawing = false;
      }).catch(() => {});
    },
    
    // 取消绘制电子围栏
    cancelDrawFence() {
      this.skillForm.electronicFence.isDrawing = false;
      this.skillForm.electronicFence.points = [];
      this.$message.info('已取消绘制');
    },
    
    // 移除单个点
    removePoint(index) {
      if (this.skillForm.electronicFence.isDrawing) {
        this.skillForm.electronicFence.points.splice(index, 1);
      }
    },
    
    // 关闭设备对话框
    closeDeviceDialog() {
      console.log('手动关闭设备对话框');
      this.deviceDialogVisible = false;
      this.deviceForm = {
        name: '',
        type: '',
        location: '',
        skills: []
      };
    },
    
    // 关闭技能对话框
    closeSkillDialog() {
      console.log('手动关闭技能对话框');
      this.skillDialogVisible = false;
      this.handleClose(); // 确保清理表单
    },

    // 开始拖动点
    startDragPoint(index, event) {
      console.log('开始拖动点', index);
      
      // 绘制模式下不允许拖动
      if (this.skillForm.electronicFence.isDrawing) {
        return;
      }
      
      // 设置拖动状态
      this.skillForm.electronicFence.draggedPointIndex = index;
      this.skillForm.electronicFence.isDragging = true;
      
      // 绑定事件处理器到实例方法
      this.boundDragPoint = this.dragPoint.bind(this);
      this.boundStopDragPoint = this.stopDragPoint.bind(this);
      
      // 添加鼠标移动和抬起事件监听
      document.addEventListener('mousemove', this.boundDragPoint);
      document.addEventListener('mouseup', this.boundStopDragPoint);
      
      this.$message.info('正在调整围栏点位置，松开鼠标完成');
    },
    
    // 拖动点
    dragPoint(event) {
      if (!this.skillForm.electronicFence.isDragging) {
        return;
      }
      
      const index = this.skillForm.electronicFence.draggedPointIndex;
      if (index === -1) {
        return;
      }
      
      console.log('拖动点', index);
      
      // 获取图片元素
      const imgElement = document.querySelector('.fence-image');
      if (!imgElement) {
        return;
      }
      
      // 计算相对于图片的坐标
      const rect = imgElement.getBoundingClientRect();
      let x = event.clientX - rect.left;
      let y = event.clientY - rect.top;
      
      // 限制在图片范围内
      x = Math.max(0, Math.min(rect.width, x));
      y = Math.max(0, Math.min(rect.height, y));
      
      // 使用Vue的响应式更新确保界面更新
      this.$set(this.skillForm.electronicFence.points, index, { x, y });
    },
    
    // 停止拖动点
    stopDragPoint() {
      console.log('停止拖动点');
      
      if (!this.skillForm.electronicFence.isDragging) {
        return;
      }
      
      // 移除事件监听
      document.removeEventListener('mousemove', this.boundDragPoint);
      document.removeEventListener('mouseup', this.boundStopDragPoint);
      
      // 重置拖动状态
      this.skillForm.electronicFence.isDragging = false;
      this.skillForm.electronicFence.draggedPointIndex = -1;
    },
    
    // 处理点击点
    handlePointClick(index) {
      if (this.skillForm.electronicFence.isDrawing) {
        this.removePoint(index);
      }
    },
    
    // 获取点的样式
    getPointStyle(index) {
      const isDragging = this.skillForm.electronicFence.draggedPointIndex === index;
      return {
        cursor: this.skillForm.electronicFence.isDrawing ? 'pointer' : 'move',
        filter: isDragging ? 'drop-shadow(0 0 4px rgba(24, 144, 255, 0.8))' : 'none'
      };
    }
  }
}
</script>

<style scoped>
.camera-management {
  display: flex;
  height: 100%;
  width: 100%;
}
  
  .device-tree {
    width: 250px;
    padding: 20px;
    border-right: 1px solid #dcdfe6;
  height: calc(100vh - 60px);
  box-sizing: border-box;
  background-color: #f5f7fa;
}
    
    .tree-title {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 500;
    }
    
.device-tree .el-input {
  margin-bottom: 20px;
}

/* 自定义树节点样式 */
.custom-tree >>> .el-tree-node__content {
  background-color: #f5f7fa;
}

.custom-tree >>> .el-tree-node.is-current > .el-tree-node__content {
  background-color: #ffffff;
}

.custom-tree >>> .el-tree-node:not(.is-current) > .el-tree-node__content:hover {
  background-color: #ebeef5;
  }

  .device-list {
    flex: 1;
    padding: 20px;
  background-color: #fff;
}

    .operation-bar {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
}

      .left-operations {
        display: flex;
}

.left-operations .el-button {
  margin-right: 10px;
      }

      .right-operations {
        display: flex;
        align-items: center;
      }

.right-operations .el-input {
  margin-right: 10px;
    }

.search-button {
  margin-left: 8px;
  }

  .custom-tree-node {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

.time-range {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.range-separator {
  margin: 0 10px;
  color: #606266;
}

.delete-time-btn {
  margin-left: 10px;
  padding: 0;
  color: #F56C6C;
}

.add-time-range {
  margin-top: 10px;
}

.frequency-item {
  margin-bottom: 20px;
}

.frequency-input {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  }

.frequency-label {
  margin: 0 8px;
  color: #606266;
}

.frequency-hint {
  color: #909399;
  font-size: 12px;
  line-height: 1.4;
}

.fence-upload {
  display: flex;
  align-items: center;
  gap: 10px;
}

.fence-status {
  color: #606266;
}

/* 调整输入数字框的样式 */
.el-input-number {
  width: 80px;
}

/* 调整开关的样式 */
.el-switch {
  margin-left: 8px;
}

/* 新增配置技能弹窗样式 */
.skill-config-dialog {
  border-radius: 4px;
}

.skill-config-dialog >>> .el-dialog__header {
  padding: 20px;
  border-bottom: 1px solid #EBEEF5;
}

.skill-config-dialog >>> .el-dialog__title {
  font-size: 16px;
  font-weight: 500;
  color: #1F2329;
}

.skill-config-dialog >>> .el-dialog__headerbtn {
  top: 20px;
}

.skill-config-dialog >>> .el-dialog__body {
  padding: 24px 0;
}

.skill-form {
  padding: 0 20px;
}

.skill-form >>> .el-form-item {
  margin-bottom: 24px;
}

.skill-form >>> .el-form-item__label {
  font-size: 14px;
  color: #1F2329;
  font-weight: 600;
  padding-right: 12px;
  text-align: left;
}

.skill-form >>> .el-form-item__content {
  margin-left: 85px !important;
  text-align: left;
}

.skill-form >>> .el-form-item__label::before {
  margin-right: 4px;
  color: #F53F3F;
  font-weight: 600;
}

.status-wrapper {
  text-align: left;
  align-items: center;
}

.status-switch {
  margin-right: auto;
}

.time-range {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.time-picker {
  width: 180px !important;
}

.time-separator {
  margin: 0 8px;
  color: #1F2329;
}

.add-time {
  margin-top: 8px;
  text-align: left;
}

.add-time-link {
  font-size: 14px;
}

.frequency-input {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.frequency-input span {
  margin: 0 8px;
  color: #1F2329;
  font-size: 14px;
}

.number-input {
  width: 100px !important;
}

.number-input >>> .el-input__inner {
  line-height: 32px;
  border-radius: 4px;
  padding: 0 8px;
  text-align: left;
}

.frequency-tip {
  color: #86909C;
  font-size: 12px;
  line-height: 1.5;
  text-align: left;
}

/* 电子围栏样式 */
.electronic-fence-container {
  width: 100%;
}

.fence-wrapper {
  display: flex;
  flex-direction: row;
  gap: 20px;
}

.fence-preview {
  width: 60%;
  height: 240px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.video-preview {
  width: 100%;
  height: 100%;
  background-color: #f2f6fc;
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-placeholder {
  text-align: center;
  color: #909399;
}

.preview-placeholder i {
  font-size: 36px;
  margin-bottom: 10px;
}

.image-editor {
  width: 100%;
  height: 100%;
  position: relative;
}

.fence-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: all;
  user-select: none;
}

.fence-controls {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
}

.fence-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.fence-side-panel {
  width: 40%;
  display: flex;
  flex-direction: column;
}

.fence-tips {
  width: 100%;
}

.fence-upload-btn {
  display: inline-block;
}

.action-btn {
  width: 110px;
  height: 32px;
}

/* 同一行显示的表单项样式 */
.form-row {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  margin-bottom: 20px;
  justify-content: space-between;
  width: 100%;
}

.form-item-inline {
  margin-right: 15px;
  margin-bottom: 0;
}

.form-item-skill {
  flex: 3;
}

.form-item-level {
  flex: 2;
}

.form-item-inline:last-child {
  margin-right: 0;
  flex: 1;
}

/* 修复行内表单项的标签对齐 */
.form-item-inline /deep/ .el-form-item__label {
  width: auto !important;
}

.form-item-inline /deep/ .el-form-item__content {
  margin-left: 0 !important;
  width: auto;
}

/* 围栏设置项样式 */
.fence-settings {
  width: 100%;
}

.setting-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.setting-label {
  min-width: 80px;
  color: #606266;
}

.fence-polygon {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.fence-polygon svg {
  pointer-events: none;
}

.fence-polygon svg circle {
  pointer-events: all !important;
  cursor: move !important;
  z-index: 1000;
}
</style>
