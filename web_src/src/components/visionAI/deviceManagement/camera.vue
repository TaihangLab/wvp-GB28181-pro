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

      <!-- 添加设备对话框 -->
      <el-dialog
        :visible.sync="deviceDialogVisible"
        title="添加摄像头"
        width="450px"
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
          <el-button @click="deviceDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAddDevice">确认</el-button>
        </span>
      </el-dialog>

      <!-- 配置技能对话框 -->
      <el-dialog
        title="配置技能"
        :visible.sync="skillDialogVisible"
        width="650px"
        :close-on-click-modal="false"
        @close="handleClose"
      >
      <el-form :model="skillForm" label-width="85px" :rules="rules" ref="skillForm" class="skill-form">
          <el-form-item label="选择技能" required prop="selectedSkill">
            <el-select 
              v-model="skillForm.selectedSkill" 
              placeholder="请选择技能" 
              style="width: 100%"
              popper-class="skill-select"
            >
              <el-option v-for="item in skillOptions" :key="item.value" :label="item.label" :value="item.value"/>
            </el-select>
          </el-form-item>
          
          
          <el-form-item label="预警等级" required prop="alarmLevel">
            <el-select 
              v-model="skillForm.alarmLevel" 
              placeholder="请选择预警等级" 
              style="width: 100%"
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

          <el-form-item label="技能状态" required prop="status">
            <div class="status-wrapper">
              <el-switch v-model="skillForm.status" class="status-switch" />
            </div>
          </el-form-item>
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


          <el-form-item label="电子围栏" style="margin-left: 10px;" >
            <span class="fence-count">0/1</span>
            <el-button type="primary" plain size="small" class="add-fence-btn">去添加</el-button>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="skillDialogVisible = false">取消</el-button>
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
    createTime: '2024-03-20'
  },
  {
    id: '2',
    name: '摄像头01',
    status: 'online',
    location: '中心节点',
    skill: '工服检测 v1',
    createTime: '2024-03-19'
  },
  {
    id: '3',
    name: '消防设备',
    status: 'offline',
    location: '中心节点',
    skill: '未穿工服检测',
    createTime: '2024-03-18'
  },
  {
    id: '4',
    name: '监控设备2',
    status: 'offline',
    location: '中心节点',
    skill: '安全帽检测 v2, 工服检测 v1',
    createTime: '2024-03-17'
  },
  {
    id: '5',
    name: '车牌识别东',
    status: 'online',
    location: '中心节点',
    skill: '车牌识别 v6',
    createTime: '2024-03-16'
  },
  {
    id: '6',
    name: '沪宁高速监控',
    status: 'online',
    location: '中心节点',
    skill: '雨天人车检测 v1',
    createTime: '2024-03-15'
  },
  {
    id: '7',
    name: '水位监测',
    status: 'offline',
    location: '中心节点',
    skill: '水位监测 v1',
    createTime: '2024-03-14'
  },
  {
    id: '8',
    name: '护边检测',
    status: 'online',
    location: '中心节点',
    skill: 'ks_xuangan_detect_851_v1_0',
    createTime: '2024-03-13'
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
      }
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
    name: row.name,
    type: row.type || '',
    location: row.location,
        skills: row.skill ? row.skill.split(',').map(s => s.trim()) : []
      }
      this.deviceDialogVisible = true
    },
    
    // 处理配置技能
    handleConfigSkill(row) {
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
        images: []
      }
      this.skillDialogVisible = true
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
        images: []
      }
    },
    
    // 处理确认配置
    handleConfirm() {
      this.$refs.skillForm.validate((valid) => {
        if (valid) {
  // TODO: 保存配置到后端
          this.$message.success('保存成功')
          this.skillDialogVisible = false
        } else {
          return false
        }
      })
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
</style>
