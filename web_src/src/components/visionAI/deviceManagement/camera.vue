<template>
  <div>
    <div class="camera-management">
      <!-- 左侧设备树 -->
      <div class="device-tree">
        <h3 class="tree-title">设备目录</h3>
        <el-input v-model="searchKeyword" placeholder="输入关键字搜索" prefix-icon="search" />
        <el-tree :data="deviceTree" :props="{ children: 'children', label: 'label' }" default-expand-all
          highlight-current node-key="id" class="custom-tree">
          <template slot-scope="{ node }">
            <span class="custom-tree-node">
              <span>{{ node.label }}</span>
              <el-tag v-if="node.data.status" :type="node.data.status === 'online' ? 'success' : 'danger'" size="small">
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
            <el-input v-model="searchKeyword" placeholder="请输入设备名称搜索" style="width: 200px" clearable>
              <i slot="prefix" style="align-items: center; display: flex; height: 40px;" class="el-icon-search"></i>
            </el-input>
            <el-button type="primary" icon="el-icon-refresh" circle @click="handleRefresh" class="search-button" />
          </div>
        </div>

        <el-table :data="deviceList" style="width: 100%" @selection-change="handleSelectionChange">
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
          <el-table-column label="设备标签" align="center">
            <template slot-scope="{ row }">
              <el-tag v-for="(tag, index) in row.tags" :key="index" :color="getTagColor(tag)" effect="plain" size="mini"
                style="margin: 2px; color: #fff; border-color: transparent;">
                {{ tag }}
              </el-tag>
              <span v-if="!row.tags || row.tags.length === 0">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="skill" label="视频技能" align="center">
            <template slot-scope="{ row }">
              <div v-if="row.skill">
                <div v-for="(skillName, idx) in row.skill.split(',')" :key="idx" class="table-skill-item">
                  <span class="skill-name">{{ skillName.trim() }}</span>
                  <el-tag v-if="row.config && row.config[skillName.trim()]"
                    :type="row.config[skillName.trim()].status ? 'success' : 'info'" size="mini" effect="plain">
                    {{ row.config[skillName.trim()].status ? '已启用' : '已禁用' }}
                  </el-tag>
                </div>
              </div>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="280" align="center">
            <template slot-scope="{ row }">
              <el-button-group>
                <el-button type="primary" size="small" icon="el-icon-setting"
                  @click="handleConfigSkill(row)">配置技能</el-button>
                <el-button type="primary" size="small" icon="el-icon-edit" @click="handleEdit(row)">编辑</el-button>
                <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete(row)">删除</el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <el-pagination :current-page.sync="currentPage" :page-size.sync="pageSize" :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
            @current-change="handleCurrentChange" />
        </div>
      </div>

      <!-- 添加/编辑设备对话框 -->
      <el-dialog :visible.sync="deviceDialogVisible" :title="deviceForm.id ? '编辑摄像头' : '添加摄像头'" width="30%"
        :close-on-click-modal="false" :destroy-on-close="false" :modal-append-to-body="true" :append-to-body="true"
        :show-close="true" :lock-scroll="true" custom-class="device-dialog">
        <el-form :model="deviceForm" label-width="80px" class="skill-form">
          <el-form-item label="设备名称">
            <el-input v-model="deviceForm.name" style="width: 200pt;" />
          </el-form-item>
          <el-form-item label="设备类型">
            <el-select v-model="deviceForm.type" placeholder="请选择设备类型" style="width: 200pt;"
              @change="handleDeviceTypeChange">
              <el-option v-for="item in deviceTypes" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="摄像头">
            <el-select v-model="deviceForm.cameraId" placeholder="请选择摄像头" style="width: 200pt;"
              :disabled="!deviceForm.type">
              <el-option v-for="camera in filteredCameras" :key="camera.id" :label="camera.name" :value="camera.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="关联地点">
            <el-input v-model="deviceForm.location" style="width: 200pt;" />
          </el-form-item>

          <el-form-item label="设备标签">
            <div class="tag-input-container">
              <el-input v-model="tagInputValue" placeholder="输入标签后按回车添加" style="width: 200pt;"
                @keyup.enter.native="addTag">
                <el-button slot="append" icon="el-icon-plus" @click="addTag"></el-button>
              </el-input>
            </div>
            <div class="device-tags" v-if="deviceForm.tags && deviceForm.tags.length > 0">
              <el-tag v-for="(tag, index) in deviceForm.tags" :key="index" :color="getTagColor(tag)" effect="plain"
                closable @close="removeTag(index)" style="margin: 5px 5px 0 0; color: #fff; border-color: transparent;">
                {{ tag }}
              </el-tag>
            </div>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="closeDeviceDialog">取消</el-button>
          <el-button type="primary" @click="confirmAddDevice">确认</el-button>
        </span>
      </el-dialog>

      <!-- 选择技能对话框 -->
      <el-dialog title="选择技能" :visible.sync="skillSelectDialogVisible" width="40%" :close-on-click-modal="false"
        :destroy-on-close="false" :modal-append-to-body="true" :append-to-body="true" :show-close="true"
        :lock-scroll="true" custom-class="skill-select-dialog" center>
        <el-form :model="skillSelectForm" label-width="85px" class="skill-form">
          <el-form-item label="选择技能" required>
            <el-select v-model="skillSelectForm.selectedSkills" placeholder="请选择技能" style="width: 100%" multiple
              popper-class="skill-select">
              <el-option v-for="item in skillOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>

          <!-- 已选技能展示区域 -->
          <div class="selected-skills-container" v-if="skillSelectForm.selectedSkills.length > 0">
            <div class="skills-header">
              <div class="skills-title">已选技能</div>
            </div>
            <div class="skills-grid-wrapper">
              <div class="skills-grid">
                <div v-for="skill in skillSelectForm.selectedSkills" :key="skill" class="skill-square"
                  @click="configureSkill(skill)">
                  <div class="skill-icon">
                    <i :class="getSkillIcon(skill)"></i>
                  </div>
                  <div class="skill-name">{{ skill }}</div>
                  <div class="skill-actions">
                    <el-button class="config-btn" type="primary" circle size="mini" @click.stop="configureSkill(skill)">
                      <i class="el-icon-setting"></i>
                    </el-button>
                    <el-button class="delete-btn" type="danger" circle size="mini"
                      @click.stop="removeSelectedSkill(skill)">
                      <i class="el-icon-delete"></i>
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="closeSkillSelectDialog">取消</el-button>
          <el-button type="primary" @click="confirmSkillSelect">确定</el-button>
        </div>
      </el-dialog>

      <!-- 配置技能对话框 -->
      <el-dialog title="配置技能" :visible.sync="skillDialogVisible" width="55%" :close-on-click-modal="false"
        :destroy-on-close="false" :modal-append-to-body="true" :append-to-body="true" :show-close="true"
        :lock-scroll="true" custom-class="skill-dialog" center @close="handleClose">
        <div class="current-skill-header" v-if="currentSkill">
          <div class="skill-info-wrapper">
            <div class="skill-info-icon" :style="{ background: getSkillGradient(currentSkill) }">
              <i :class="getSkillIcon(currentSkill)"></i>
            </div>
            <div class="skill-info-content">
              <div class="skill-name-row">
                <span class="skill-info-name">{{ currentSkill }}</span>
                <div class="skill-status">
                  <el-switch v-model="skillForm.status" active-color="#67C23A" inactive-color="#909399">
                  </el-switch>
                  <span class="status-text" :class="{ 'status-active': skillForm.status }">
                    {{ skillForm.status ? '已启用' : '已禁用' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <el-form :model="skillForm" label-width="85px" :rules="rules" ref="skillForm" class="skill-form">

          <el-form-item label="预警等级" required prop="alarmLevel">
            <el-select v-model="skillForm.alarmLevel" placeholder="请选择预警等级" style="width: 220px;">
              <el-option v-for="item in alarmLevelOptions" :key="item.value" :label="item.label" :value="item.value">
                <span :style="{ color: item.color }">{{ item.label }}</span>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="抽帧频率" required prop="frequency">
            <div class="frequency-input">
              <span>每</span>
              <el-input-number v-model="skillForm.frequency.seconds" :min="1" :max="99" controls-position="right"
                class="number-input" size="small" />
              <span>秒</span>
              <span>抽取</span>
              <el-input-number v-model="skillForm.frequency.frames" :min="1" :max="99" controls-position="right"
                class="number-input" size="small" />
              <span>帧</span>
              <span class="frequency-tip">支持设置多秒1帧1秒多帧，不支持多秒多帧设置</span>
            </div>
          </el-form-item>

          <el-form-item label="运行时段" required prop="timeRanges">
            <div v-for="(timeRange, index) in skillForm.timeRanges" :key="index" class="time-range">
              <el-time-picker v-model="timeRange.start" placeholder="开始时间" format="HH:mm" class="time-picker" />
              <span class="time-separator">-</span>
              <el-time-picker v-model="timeRange.end" placeholder="结束时间" format="HH:mm" class="time-picker" />
              <el-button type="text" icon="el-icon-delete" @click="removeTimeRange(index)" style="margin-left: 15px;" />
            </div>
            <div class="add-time">
              <el-link type="primary" @click="addTimeRange" :disabled="skillForm.timeRanges.length >= 3"
                class="add-time-link">
                + 添加时间 ({{ skillForm.timeRanges.length }}/3)
              </el-link>
            </div>
          </el-form-item>

          <el-form-item label="电子围栏" required style="margin-left: 0px;margin-top: -15px;">
            <div class="electronic-fence-container">
              <div class="fence-wrapper">
                <div class="fence-preview">
                  <div class="image-editor">
                    <img :src="skillForm.electronicFence.image" alt="围栏图片" class="fence-image"
                      @click="handleImageClick">
                    <div class="fence-polygon"
                      v-if="skillForm.electronicFence.points.length > 0 || skillForm.electronicFence.currentPolygon.length > 0">
                      <svg width="100%" height="100%" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0;">
                        <!-- 所有已完成的围栏 -->
                        <g v-for="(polygon, polyIndex) in skillForm.electronicFence.points"
                          :key="`polygon-${polyIndex}`">
                          <polygon :points="formatPolygonPoints(polygon)" :fill="getPolygonColor(polyIndex)"
                            stroke="#1890ff" stroke-width="2" />
                          <!-- 每个多边形的顶点 -->
                          <circle v-for="(point, pointIndex) in polygon" :key="`point-${polyIndex}-${pointIndex}`"
                            :cx="point.x" :cy="point.y" r="8" fill="#fff" stroke="#1890ff" stroke-width="2"
                            @mousedown.prevent="startDragPoint(polyIndex, pointIndex, $event)"
                            @click.stop="handlePointClick(polyIndex, pointIndex)"
                            :style="getPointStyle(polyIndex, pointIndex)" />
                        </g>

                        <!-- 当前正在绘制的围栏 -->
                        <g
                          v-if="skillForm.electronicFence.isDrawing && skillForm.electronicFence.currentPolygon.length > 0">
                          <polyline v-if="skillForm.electronicFence.currentPolygon.length > 1"
                            :points="formatPolygonPoints(skillForm.electronicFence.currentPolygon)" fill="none"
                            stroke="#f56c6c" stroke-width="2" stroke-dasharray="5,5" />
                          <circle v-for="(point, index) in skillForm.electronicFence.currentPolygon"
                            :key="`current-${index}`" :cx="point.x" :cy="point.y" r="8" fill="#f56c6c" stroke="#fff"
                            stroke-width="2" @click.stop="handleCurrentPointClick(index)" style="cursor: pointer;" />
                        </g>
                      </svg>
                    </div>
                  </div>
                </div>

                <div class="fence-side-panel">
                  <div class="fence-tips">
                    <el-alert title="电子围栏使用说明" type="info" description="在视频画面上绘制多边形区域作为电子围栏。当检测到目标在围栏内/外活动时触发报警。"
                      :closable="false" show-icon />
                  </div>
                  <div class="fence-controls-panel">
                    <el-button-group v-if="!skillForm.electronicFence.isDrawing">
                      <el-button size="small" type="primary" icon="el-icon-edit"
                        @click="startDrawFence">绘制围栏</el-button>
                      <el-button size="small" type="danger" icon="el-icon-delete" @click="clearFence"
                        :disabled="skillForm.electronicFence.points.length === 0">清除围栏</el-button>
                    </el-button-group>
                    <el-button-group v-else>
                      <el-button size="small" type="success" icon="el-icon-check" @click="completeFence"
                        :disabled="skillForm.electronicFence.currentPolygon.length < 3">完成绘制</el-button>
                      <el-button size="small" type="warning" icon="el-icon-close"
                        @click="cancelDrawFence">取消绘制</el-button>
                    </el-button-group>
                  </div>
                </div>
              </div>
            </div>
          </el-form-item>

          <!-- 添加电子围栏的触发模式和灵敏度选项 -->
          <el-form-item label="围栏设置" v-if="skillForm.electronicFence.points.length > 0"
            style="margin-left: 10px; margin-top: 10px;">
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
                <el-slider v-model="skillForm.electronicFence.sensitivity" :min="0" :max="100"
                  :format-tooltip="value => `${value}%`" style="width: 200px;" />
              </div>
            </div>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer" style="margin-top: -30px;">
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
          config: null, // 添加配置字段
          tags: ['电力行业', '监控设备']
        },
        {
          id: '2',
          name: '摄像头01',
          status: 'online',
          location: '中心节点',
          skill: '工服检测 v1',
          createTime: '2024-03-19',
          config: null,
          tags: ['油气行业', '摄像头']
        },
        {
          id: '3',
          name: '消防设备',
          status: 'offline',
          location: '中心节点',
          skill: '未穿工服检测',
          createTime: '2024-03-18',
          config: null,
          tags: ['油气行业', '消防设备']
        },
        {
          id: '4',
          name: '监控设备2',
          status: 'offline',
          location: '中心节点',
          skill: '安全帽检测 v2, 工服检测 v1',
          createTime: '2024-03-17',
          config: null,
          tags: ['电力行业', '监控设备']
        },
        {
          id: '5',
          name: '车牌识别东',
          status: 'online',
          location: '中心节点',
          skill: '车牌识别 v6',
          createTime: '2024-03-16',
          config: null,
          tags: ['电力行业', '车牌识别']
        },
        {
          id: '6',
          name: '沪宁高速监控',
          status: 'online',
          location: '中心节点',
          skill: '雨天人车检测 v1',
          createTime: '2024-03-15',
          config: null,
          tags: ['电力行业', '雨天人车检测']
        },
        {
          id: '7',
          name: '水位监测',
          status: 'offline',
          location: '中心节点',
          skill: '水位监测 v1',
          createTime: '2024-03-14',
          config: null,
          tags: ['电力行业', '水位监测']
        },
        {
          id: '8',
          name: '护边检测',
          status: 'online',
          location: '中心节点',
          skill: 'ks_xuangan_detect_851_v1_0',
          createTime: '2024-03-13',
          config: null,
          tags: ['电力行业', '护边检测']
        }
      ],

      // 原始设备列表数据（用于搜索和刷新）
      originalDeviceList: [],

      // 添加设备对话框
      deviceDialogVisible: false,
      deviceForm: {
        name: '',
        type: '',
        cameraId: '',
        location: '',
        skills: [],
        tags: []
      },

      // 设备类型选项
      deviceTypes: [
        { label: '国标', value: 'gb28181' },
        { label: '推流', value: 'push' },
        { label: '拉流', value: 'pull' }
      ],

      // 摄像头数据列表
      cameras: [
        // 国标摄像头
        { id: 'gb1', name: '国标摄像头1', type: 'gb28181' },
        { id: 'gb2', name: '国标摄像头2', type: 'gb28181' },
        { id: 'gb3', name: '国标摄像头3', type: 'gb28181' },
        { id: 'gb4', name: '国标摄像头4', type: 'gb28181' },
        // 推流摄像头
        { id: 'push1', name: 'RTMP摄像头1', type: 'push' },
        { id: 'push2', name: 'RTMP摄像头2', type: 'push' },
        { id: 'push3', name: 'HTTP摄像头1', type: 'push' },
        // 拉流摄像头
        { id: 'pull1', name: 'RTSP摄像头1', type: 'pull' },
        { id: 'pull2', name: 'RTSP摄像头2', type: 'pull' },
        { id: 'pull3', name: 'HLS摄像头', type: 'pull' },
        { id: 'pull4', name: 'FLV摄像头', type: 'pull' }
      ],

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
        alarmLevel: '二级预警', // 默认预警等级
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
          image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', // 默认空白背景图
          points: [],
          isDrawing: false,
          triggerMode: 'inside',
          sensitivity: 80,
          tempPoints: [],
          draggedPointIndex: -1,
          isDragging: false,
          currentPolygon: []
        },
        images: []
      },

      // 新增：预警等级选项
      alarmLevelOptions: [
        { value: '一级预警', label: '一级预警', color: '#F56C6C' },
        { value: '二级预警', label: '二级预警', color: '#E6A23C' },
        { value: '三级预警', label: '三级预警', color: '#409EFF' },
        { value: '四级预警', label: '四级预警', color: '#67C23A' }
      ],

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
      boundStopDragPoint: null,

      // 新增：标签相关数据
      tagInputValue: '',
      deviceTags: [],

      // 新增：选择技能对话框
      skillSelectDialogVisible: false,
      skillSelectForm: {
        selectedSkills: []
      },

      // 新增：当前选中的技能
      currentSkill: null
    }
  },

  computed: {
    // 根据当前选择的设备类型过滤摄像头列表
    filteredCameras() {
      if (!this.deviceForm.type) {
        return [];
      }
      return this.cameras.filter(camera => camera.type === this.deviceForm.type);
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
    // 处理设备类型变化
    handleDeviceTypeChange() {
      // 重置摄像头选择
      this.deviceForm.cameraId = '';
    },

    // 处理添加设备
    handleAddDevice() {
      this.deviceForm = {
        name: '',
        type: '',
        cameraId: '',
        location: '',
        skills: [],
        tags: []
      };
      this.deviceDialogVisible = true;
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
      // 验证表单
      if (!this.deviceForm.name) {
        this.$message.warning('请输入设备名称');
        return;
      }
      if (!this.deviceForm.type) {
        this.$message.warning('请选择设备类型');
        return;
      }
      if (!this.deviceForm.cameraId) {
        this.$message.warning('请选择摄像头');
        return;
      }

      // 获取所选摄像头的名称
      const selectedCamera = this.cameras.find(camera => camera.id === this.deviceForm.cameraId);
      const cameraName = selectedCamera ? selectedCamera.name : '';

      if (this.deviceForm.id) {
        // 编辑现有设备
        const index = this.deviceList.findIndex(device => device.id === this.deviceForm.id);
        if (index !== -1) {
          // 更新设备信息
          this.deviceList[index].name = this.deviceForm.name;
          this.deviceList[index].type = this.deviceForm.type;
          this.deviceList[index].cameraId = this.deviceForm.cameraId;
          this.deviceList[index].cameraName = cameraName;
          this.deviceList[index].location = this.deviceForm.location;
          this.deviceList[index].tags = [...this.deviceForm.tags]; // 保存标签
          this.$message.success('设备更新成功');
        }
      } else {
        // 添加新设备
        const newId = Date.now().toString(); // 生成临时ID
        const newDevice = {
          id: newId,
          name: this.deviceForm.name,
          status: 'online', // 默认在线
          type: this.deviceForm.type,
          cameraId: this.deviceForm.cameraId,
          cameraName: cameraName,
          location: this.deviceForm.location,
          tags: [...this.deviceForm.tags], // 保存标签
          skill: '',
          createTime: new Date().toISOString().split('T')[0],
          config: null
        };

        // 添加到设备列表
        this.deviceList.unshift(newDevice);
        this.originalDeviceList = [...this.deviceList];
        this.total = this.deviceList.length;
        this.$message.success('设备添加成功');
      }

      // 关闭对话框并重置表单
      this.deviceDialogVisible = false;
      this.deviceForm = {
        name: '',
        type: '',
        cameraId: '',
        location: '',
        skills: [],
        tags: []
      };
      this.tagInputValue = ''; // 清空标签输入值
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
        cameraId: row.cameraId || '',
        location: row.location,
        skills: row.skill ? row.skill.split(',').map(s => s.trim()) : [],
        tags: row.tags || []
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

      // 初始化技能选择表单
      this.skillSelectForm = {
        selectedSkills: row.skill ? row.skill.split(',').map(s => s.trim()) : []
      };

      // 打开选择技能对话框
      this.skillSelectDialogVisible = true;
    },

    // 关闭选择技能对话框
    closeSkillSelectDialog() {
      this.skillSelectDialogVisible = false;
    },

    // 确认选择技能
    confirmSkillSelect() {
      // 检查是否已选择技能
      if (this.skillSelectForm.selectedSkills.length === 0) {
        this.$message.warning('请至少选择一个技能');
        return;
      }

      // 保存选中的技能到设备中
      const deviceIndex = this.deviceList.findIndex(device => device.id === this.currentDeviceId);
      if (deviceIndex !== -1) {
        // 更新设备的技能名称显示
        this.deviceList[deviceIndex].skill = this.skillSelectForm.selectedSkills.join(',');
        this.$message.success('技能选择成功');
      }

      // 关闭选择技能对话框
      this.skillSelectDialogVisible = false;
    },

    // 移除已选技能
    removeSelectedSkill(skill) {
      this.skillSelectForm.selectedSkills = this.skillSelectForm.selectedSkills.filter(s => s !== skill);
    },

    // 配置单个技能
    configureSkill(skill) {
      // 关闭选择技能对话框
      this.skillSelectDialogVisible = false;

      // 初始化技能表单
      this.skillForm = {
        selectedSkill: [skill], // 注意这里是数组
        status: true, // 默认启用
        timeRanges: [{
          start: new Date(2024, 0, 1, 0, 0),
          end: new Date(2024, 0, 1, 23, 59)
        }],
        frequency: {
          seconds: 1,
          frames: 1
        },
        electronicFence: {
          image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', // 默认空白背景图
          points: [],
          isDrawing: false,
          triggerMode: 'inside',
          sensitivity: 80,
          tempPoints: [],
          draggedPointIndex: -1,
          isDragging: false,
          currentPolygon: []
        },
        images: []
      };

      // 当前选中的技能
      this.currentSkill = skill;

      // 查找设备
      const device = this.deviceList.find(d => d.id === this.currentDeviceId);

      // 如果设备已有配置，则加载已有配置
      if (device && device.config) {
        try {
          // 查找当前技能的配置
          const skillConfig = device.config[skill];
          if (skillConfig) {
            this.loadSkillConfig(skillConfig);
          }
        } catch (error) {
          console.error('加载配置失败', error);
        }
      }

      // 打开配置技能对话框
      this.skillDialogVisible = true;
    },

    // 加载技能配置
    loadSkillConfig(config) {
      if (!config) return;
      // 使用深拷贝避免直接引用
      const configCopy = JSON.parse(JSON.stringify(config));

      // 填充表单字段 - 确保正确加载启用状态
      this.skillForm.status = configCopy.status !== undefined ? configCopy.status : true;

      // 加载预警等级
      this.skillForm.alarmLevel = configCopy.alarmLevel || '二级预警';

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
        this.skillForm.electronicFence.image = configCopy.electronicFence.image || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
        this.skillForm.electronicFence.triggerMode = configCopy.electronicFence.triggerMode || 'inside';
        this.skillForm.electronicFence.sensitivity = configCopy.electronicFence.sensitivity || 80;

        // 处理点数据 - 兼容旧格式和新格式
        if (configCopy.electronicFence.points) {
          try {
            // 尝试检测数据格式
            const points = configCopy.electronicFence.points;

            if (Array.isArray(points)) {
              if (points.length === 0) {
                this.skillForm.electronicFence.points = [];
              } else if (Array.isArray(points[0])) {
                // 新格式 - 多边形数组
                this.skillForm.electronicFence.points = points;
              } else if (typeof points[0] === 'object' && points[0].hasOwnProperty('x') && points[0].hasOwnProperty('y')) {
                // 旧格式 - 单个多边形
                this.skillForm.electronicFence.points = [points];
              } else {
                this.skillForm.electronicFence.points = [];
              }
            } else {
              this.skillForm.electronicFence.points = [];
            }
          } catch (error) {
            console.error('处理点数据时出错:', error);
            this.skillForm.electronicFence.points = [];
          }
        } else {
          this.skillForm.electronicFence.points = [];
        }
      }

      // 确保currentPolygon是空数组
      this.skillForm.electronicFence.currentPolygon = [];
    },

    // 处理确认配置
    handleConfirm() {
      this.$refs.skillForm.validate((valid) => {
        if (valid) {
          if (this.currentDeviceId && this.currentSkill) {
            // 构建要保存的配置对象
            const config = this.prepareConfigForSave();

            // 找到当前设备
            const deviceIndex = this.deviceList.findIndex(device => device.id === this.currentDeviceId);
            if (deviceIndex !== -1) {
              // 确保设备有config对象
              if (!this.deviceList[deviceIndex].config) {
                this.$set(this.deviceList[deviceIndex], 'config', {});
              }

              // 为特定技能保存配置
              this.$set(this.deviceList[deviceIndex].config, this.currentSkill, config);

              this.$message.success('保存成功');

              // 更新原始列表
              this.originalDeviceList = [...this.deviceList];

              // 关闭对话框
              this.closeSkillDialog();
            } else {
              this.$message.error('未找到设备，保存失败');
            }
          } else {
            this.$message.error('未指定设备ID或技能，保存失败');
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
        status: this.skillForm.status,
        alarmLevel: this.skillForm.alarmLevel,
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
      if (!points || points.length === 0) {
        return '';
      }
      console.log('格式化点坐标:', points);
      return points.map(point => `${point.x},${point.y}`).join(' ');
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

      // 添加点到当前围栏
      this.skillForm.electronicFence.currentPolygon.push({ x, y });
    },

    // 开始绘制电子围栏
    startDrawFence() {
      if (this.skillForm.electronicFence.isDrawing) {
        this.completeFence(); // 完成绘制
      } else {
        // 开始绘制
        this.skillForm.electronicFence.isDrawing = true;
        this.skillForm.electronicFence.currentPolygon = [];
      }
    },

    // 完成围栏绘制
    completeFence() {
      const currentPolygon = this.skillForm.electronicFence.currentPolygon;

      // 如果点数不足，提示用户
      if (currentPolygon.length < 3) {
        this.$message.warning('电子围栏至少需要3个点');
        return;
      }

      // 如果需要自动闭合多边形（第一个点和最后一个点不同）
      const firstPoint = currentPolygon[0];
      const lastPoint = currentPolygon[currentPolygon.length - 1];

      // 如果首尾点距离较远，自动闭合
      const distance = Math.sqrt(
        Math.pow(firstPoint.x - lastPoint.x, 2) +
        Math.pow(firstPoint.y - lastPoint.y, 2)
      );

      // 创建深拷贝，避免引用问题
      let finalPolygon = JSON.parse(JSON.stringify(currentPolygon));

      // 自动闭合
      if (distance > 10) { // 距离超过10像素则添加闭合点
        finalPolygon.push({ x: firstPoint.x, y: firstPoint.y });
      }

      // 将完成的多边形添加到points数组
      if (!Array.isArray(this.skillForm.electronicFence.points)) {
        // 如果points不是数组，创建新数组
        this.skillForm.electronicFence.points = [];
      }

      // 如果是第一个多边形，直接设置
      if (this.skillForm.electronicFence.points.length === 0) {
        this.skillForm.electronicFence.points = [finalPolygon];
      } else {
        // 否则添加到数组中
        this.skillForm.electronicFence.points.push(finalPolygon);
      }

      console.log('完成绘制，当前points:', this.skillForm.electronicFence.points);

      // 清空当前多边形并完成绘制
      this.skillForm.electronicFence.currentPolygon = [];
      this.skillForm.electronicFence.isDrawing = false;

      this.$message.success('电子围栏绘制完成，可继续添加更多围栏');
    },

    // 清除电子围栏
    clearFence() {
      this.$confirm('确定要清除当前绘制的所有电子围栏吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.skillForm.electronicFence.points = [];
        this.skillForm.electronicFence.currentPolygon = [];
        this.skillForm.electronicFence.isDrawing = false;
      }).catch(() => { });
    },

    // 取消绘制电子围栏
    cancelDrawFence() {
      this.skillForm.electronicFence.isDrawing = false;
      this.skillForm.electronicFence.currentPolygon = [];
    },

    // 获取多边形颜色
    getPolygonColor(index) {
      // 为不同的多边形设置不同的颜色
      const colors = [
        'rgba(24, 144, 255, 0.2)',
        'rgba(82, 196, 26, 0.2)',
        'rgba(250, 173, 20, 0.2)',
        'rgba(245, 34, 45, 0.2)',
        'rgba(114, 46, 209, 0.2)'
      ];
      return colors[index % colors.length];
    },

    // 处理当前绘制多边形的点击事件
    handleCurrentPointClick(index) {
      // 移除当前多边形中的点
      if (this.skillForm.electronicFence.isDrawing) {
        this.skillForm.electronicFence.currentPolygon.splice(index, 1);
      }
    },

    // 移除单个点
    handlePointClick(polyIndex, pointIndex) {
      if (this.skillForm.electronicFence.isDrawing) {
        // 在绘制模式下，移除点
        if (this.skillForm.electronicFence.points[polyIndex].length > 3) {
          this.skillForm.electronicFence.points[polyIndex].splice(pointIndex, 1);
        } else {
          this.$message.warning('多边形至少需要3个点，无法继续删除');
        }
      }
    },

    // 开始拖动点
    startDragPoint(polyIndex, pointIndex, event) {
      console.log('开始拖动点', polyIndex, pointIndex);

      // 绘制模式下不允许拖动
      if (this.skillForm.electronicFence.isDrawing) {
        return;
      }

      // 设置拖动状态
      this.skillForm.electronicFence.draggedPointIndex = pointIndex;
      this.skillForm.electronicFence.draggedPolyIndex = polyIndex;
      this.skillForm.electronicFence.isDragging = true;

      // 绑定事件处理器到实例方法
      this.boundDragPoint = this.dragPoint.bind(this);
      this.boundStopDragPoint = this.stopDragPoint.bind(this);

      // 添加鼠标移动和抬起事件监听
      document.addEventListener('mousemove', this.boundDragPoint);
      document.addEventListener('mouseup', this.boundStopDragPoint);
    },

    // 拖动点
    dragPoint(event) {
      if (!this.skillForm.electronicFence.isDragging) {
        return;
      }

      const polyIndex = this.skillForm.electronicFence.draggedPolyIndex;
      const pointIndex = this.skillForm.electronicFence.draggedPointIndex;

      if (polyIndex === -1 || pointIndex === -1) {
        return;
      }

      console.log('拖动点', polyIndex, pointIndex);

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
      this.$set(this.skillForm.electronicFence.points[polyIndex], pointIndex, { x, y });
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
      this.skillForm.electronicFence.draggedPolyIndex = -1;
    },

    // 获取点的样式
    getPointStyle(polyIndex, pointIndex) {
      const isDragging = this.skillForm.electronicFence.draggedPolyIndex === polyIndex &&
        this.skillForm.electronicFence.draggedPointIndex === pointIndex;
      return {
        cursor: this.skillForm.electronicFence.isDrawing ? 'pointer' : 'move',
        filter: isDragging ? 'drop-shadow(0 0 4px rgba(24, 144, 255, 0.8))' : 'none'
      };
    },

    // 关闭设备对话框
    closeDeviceDialog() {
      console.log('手动关闭设备对话框');
      this.deviceDialogVisible = false;
      this.deviceForm = {
        name: '',
        type: '',
        cameraId: '',
        location: '',
        skills: [],
        tags: []
      };
    },

    // 关闭技能对话框
    closeSkillDialog() {
      this.skillDialogVisible = false;

      // 重新打开选择技能对话框
      this.skillSelectDialogVisible = true;
    },

    // 新增：添加标签
    addTag() {
      if (this.tagInputValue.trim() !== '') {
        this.deviceForm.tags.push(this.tagInputValue.trim());
        this.tagInputValue = '';
      }
    },

    // 新增：移除标签
    removeTag(index) {
      this.deviceForm.tags.splice(index, 1);
    },

    // 新增：获取标签颜色
    getTagColor(tag) {
      // 这里根据标签内容生成不同的颜色
      const colors = [
        '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399',  // 基础色
        '#2B87D1', '#41B883', '#D4A017', '#E01F3D', '#606266',  // 深色系
        '#76D0FF', '#95E084', '#FFD666', '#FF9F9F', '#B2B8C2',  // 浅色系
        '#337CCF', '#4CAF50', '#FF9800', '#F44336', '#673AB7',  // Material设计色
        '#1976D2', '#388E3C', '#FFA000', '#D32F2F', '#7B1FA2'   // Material深色
      ];

      // 使用字符串哈希算法生成随机但确定的颜色索引
      const hash = Array.from(tag).reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
      return colors[Math.abs(hash) % colors.length];
    },

    // 添加时间段
    addTimeRange() {
      if (this.skillForm.timeRanges.length < 3) {
        this.skillForm.timeRanges.push({
          start: new Date(2024, 0, 1, 0, 0),
          end: new Date(2024, 0, 1, 23, 59)
        });
      }
    },

    // 处理关闭对话框
    handleClose() {
      // 重置表单
      this.skillForm = {
        selectedSkill: [],
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
          image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', // 默认空白背景图
          points: [],
          isDrawing: false,
          triggerMode: 'inside',
          sensitivity: 80,
          tempPoints: [],
          draggedPointIndex: -1,
          isDragging: false,
          currentPolygon: []
        },
        images: []
      };

      // 清除当前技能
      this.currentSkill = null;

      // 重新打开选择技能对话框
      this.skillSelectDialogVisible = true;
    },

    // 获取技能图标
    getSkillIcon(skill) {
      const icons = {
        '未佩戴安全帽 (v7)': 'el-icon-user',
        '管道泄漏 (v2)': 'el-icon-warning',
        '烟雾识别 (v6)': 'el-icon-video-camera',
        '明火识别 (v3)': 'el-icon-bell',
        '人员摔倒 (v1)': 'el-icon-cpu',
        '人员聚集 (v1)': 'el-icon-share',
        '人员离岗 (v2)': 'el-icon-bell',
        '未穿工服 (v3)': 'el-icon-user'
      };
      return icons[skill] || 'el-icon-question';
    },

    // 获取技能渐变色
    getSkillGradient(skill) {
      // 使用与技能方块相同的渐变色逻辑
      if (skill === '未佩戴安全帽 (v7)') {
        return 'linear-gradient(135deg, #409EFF, #1677ff)';
      } else if (skill === '管道泄漏 (v2)') {
        return 'linear-gradient(135deg, #67C23A, #53a11d)';
      } else if (skill === '烟雾识别 (v6)') {
        return 'linear-gradient(135deg, #F56C6C, #e74c4c)';
      } else if (skill === '明火识别 (v3)') {
        return 'linear-gradient(135deg, #E6A23C, #d38b1c)';
      } else if (skill === '人员摔倒 (v1)') {
        return 'linear-gradient(135deg, #409EFF, #1677ff)';
      } else if (skill === '人员聚集 (v1)') {
        return 'linear-gradient(135deg, #909399, #6e7175)';
      } else if (skill === '人员离岗 (v2)') {
        return 'linear-gradient(135deg, #E6A23C, #d38b1c)';
      } else if (skill === '未穿工服 (v3)') {
        return 'linear-gradient(135deg, #F56C6C, #e74c4c)';
      }
      return 'linear-gradient(135deg, #909399, #6e7175)';
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
.custom-tree>>>.el-tree-node__content {
  background-color: #f5f7fa;
}

.custom-tree>>>.el-tree-node.is-current>.el-tree-node__content {
  background-color: #ffffff;
}

.custom-tree>>>.el-tree-node:not(.is-current)>.el-tree-node__content:hover {
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
}

.frequency-input span {
  margin: 0 8px;
  color: #1F2329;
  font-size: 14px;
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

.skill-config-dialog>>>.el-dialog__header {
  padding: 20px;
  border-bottom: 1px solid #EBEEF5;
}

.skill-config-dialog>>>.el-dialog__title {
  font-size: 16px;
  font-weight: 500;
  color: #1F2329;
}

.skill-config-dialog>>>.el-dialog__headerbtn {
  top: 20px;
}

.skill-config-dialog>>>.el-dialog__body {
  padding: 24px 0;
}

.skill-form {
  padding: 0 20px;
}

.skill-form>>>.el-form-item {
  margin-bottom: 24px;
}

.skill-form>>>.el-form-item__label {
  font-size: 14px;
  color: #1F2329;
  font-weight: 600;
  padding-right: 12px;
  text-align: left;
}

.skill-form>>>.el-form-item__content {
  margin-left: 85px !important;
  text-align: left;
}

.skill-form>>>.el-form-item__label::before {
  margin-right: 4px;
  color: #F53F3F;
  font-weight: 600;
}

.status-wrapper {
  text-align: left;
  align-items: center;
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
}

.frequency-input span {
  margin: 0 8px;
  color: #1F2329;
  font-size: 14px;
}

.number-input {
  width: 100px !important;
}

.number-input>>>.el-input__inner {
  line-height: 32px;
  border-radius: 4px;
  padding: 0 8px;
  text-align: left;
}

.frequency-tip {
  color: #909399;
  font-size: 12px;
  line-height: 1.5;
  margin-left: 15px;
  display: inline-block;
  font-style: italic;
}

/* 电子围栏样式 */
.electronic-fence-container {
  width: 100%;
}

.fence-wrapper {
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: flex-start;
  width: 100%;
}

.fence-preview {
  width: 75%;
  aspect-ratio: 16 / 9;
  /* 兼容老浏览器的16:9比例实现 */
  position: relative;
  overflow: hidden;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

/* 增加一个兼容老浏览器的16:9比例实现方式 */
@supports not (aspect-ratio: 16 / 9) {
  .fence-preview {
    height: 0;
    padding-bottom: 42.1875%; /* 75% * 9/16 = 42.1875% */
  }
  
  .fence-side-panel {
    height: 0;
    padding-bottom: 42.1875%;
  }
}

.image-editor {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  background-color: #000000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.fence-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: all;
  user-select: none;
  z-index: 10;
}

.fence-polygon {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
}

.fence-polygon svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
}

.fence-polygon svg circle {
  pointer-events: all !important;
  cursor: move !important;
  z-index: 1000;
}

.fence-controls {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  z-index: 200;
}

.fence-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.fence-side-panel {
  width: 25%;
  aspect-ratio: 16 / 9;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.fence-tips {
  flex-grow: 1;
}

.fence-controls-panel {
  display: flex;
  justify-content: center;
  padding: 10px 0;
}

.fence-controls-panel .el-button-group {
  width: 100%;
  display: flex;
}

.fence-controls-panel .el-button-group .el-button {
  flex: 1;
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

.form-row.three-column {
  justify-content: space-between;
}

.form-row.three-column .form-item-inline {
  flex: 1;
  margin-right: 15px;
}

.form-row.three-column .form-item-inline:last-child {
  margin-right: 0;
}

.form-item-inline {
  margin-right: 15px;
  margin-bottom: 0;
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

.form-row.two-column {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 20px;
}

.form-row.two-column .form-item-inline {
  margin-right: 0;
}

.form-item-inline.status-item {
  margin-left: 40px;
}

/* 修复行内表单项的标签对齐 */
.form-item-inline /deep/ .el-form-item__label {
  width: auto !important;
}

.form-item-inline /deep/ .el-form-item__content {
  margin-left: 0 !important;
}

/* 自定义控制项样式 */
.controls-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 20px;
  gap: 40px;
}

.control-item {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.control-label {
  margin-right: 10px;
  font-size: 14px;
  color: #0c0c0c;
  font-weight: bold;
}

.control-label.required:before {
  content: '*';
  color: #F56C6C;
  margin-right: 4px;
}

/* 设备标签样式 */
.tag-input-container {
  margin-bottom: 8px;
}

.device-tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: 5px;
}

.device-tags .el-tag {
  margin-right: 8px;
  margin-bottom: 8px;
  cursor: default;
}

/* 选择技能和技能状态的同行显示样式 */
.skill-status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.skill-select-container {
  flex: 1;
  margin-right: 20px;
}

.status-container {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.status-text {
  margin-left: 10px;
  font-size: 13px;
  color: #606266;
}

/* 新增选择技能对话框样式 */
.skill-select-dialog {
  border-radius: 4px;
}

.skill-select-dialog>>>.el-dialog__header {
  padding: 20px;
  border-bottom: 1px solid #EBEEF5;
}

.skill-select-dialog>>>.el-dialog__title {
  font-size: 16px;
  font-weight: 500;
  color: #1F2329;
}

.skill-select-dialog>>>.el-dialog__headerbtn {
  top: 20px;
}

.skill-select-dialog>>>.el-dialog__body {
  padding: 24px 0;
}

.skill-select-dialog>>>.el-form-item {
  margin-bottom: 24px;
}

.skill-select-dialog>>>.el-form-item__label {
  font-size: 14px;
  color: #1F2329;
  font-weight: 600;
  padding-right: 12px;
  text-align: left;
}

.skill-select-dialog>>>.el-form-item__content {
  margin-left: 85px !important;
  text-align: left;
}

.skill-select-dialog>>>.el-form-item__label::before {
  margin-right: 4px;
  color: #F53F3F;
  font-weight: 600;
}

.selected-skills-container {
  margin-top: 20px;
  padding: 15px;
  border-radius: 4px;
  background-color: #f9fafc;
  border: 1px solid #ebeef5;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.skills-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.skills-title {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  position: relative;
  padding-left: 10px;
  border-left: 3px solid #409EFF;
}

.skills-grid-wrapper {
  max-height: 230px;
  overflow-y: auto;
  padding-right: 5px;
  width: 100%;
  box-sizing: border-box;
}

.skills-grid-wrapper::-webkit-scrollbar {
  width: 6px;
}

.skills-grid-wrapper::-webkit-scrollbar-thumb {
  background-color: #e0e0e0;
  border-radius: 3px;
}

.skills-grid-wrapper:hover::-webkit-scrollbar-thumb {
  background-color: #c0c0c0;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px 25px;
  padding: 5px 0;
  width: 100%;
  box-sizing: border-box;
  justify-items: center;
}

.skill-square {
  width: 90px;
  height: 100px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 10px;
  position: relative;
  transition: all 0.25s ease-in-out;
  background-color: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin: 0 auto;
}

.skill-square:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-3px);
  border-color: #c6e2ff;
}

.skill-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409EFF, #1677ff);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  box-shadow: 0 2px 6px rgba(22, 119, 255, 0.2);
}

.skill-icon i {
  font-size: 18px;
}

.skill-name {
  font-size: 12px;
  color: #303133;
  text-align: center;
  margin-bottom: 8px;
  max-width: 85px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

.skill-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: 6px;
  background: linear-gradient(to top, rgba(250, 250, 250, 0.9), rgba(250, 250, 250, 0));
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}

.skill-square:hover .skill-actions {
  opacity: 1;
}

.config-btn,
.delete-btn {
  transform: scale(0.8);
  margin: 0 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.config-btn {
  background-color: #409EFF;
  border-color: #409EFF;
}

.delete-btn {
  background-color: #F56C6C;
  border-color: #F56C6C;
}

.current-skill-header {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f8f8f8;
  border-radius: 4px;
  border-left: 3px solid #67C23A;
  display: flex;
  align-items: center;
}

.current-skill-header .el-tag {
  font-size: 14px;
  padding: 6px 10px;
}

/* 优化已选技能卡片样式 */
.skill-square {
  width: 120px;
  height: 120px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 12px;
  position: relative;
  transition: all 0.25s ease-in-out;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin: 0 auto;
}

/* 技能图标更多样式 */
.skill-icon i.el-icon-cpu {
  color: #fff;
}

.skill-icon i.el-icon-warning {
  color: #fff;
}

.skill-icon i.el-icon-video-camera {
  color: #fff;
}

.skill-icon i.el-icon-bell {
  color: #fff;
}

.skill-icon i.el-icon-user {
  color: #fff;
}

.skill-icon i.el-icon-share {
  color: #fff;
}

/* 为不同技能设置不同图标和颜色 */
.skill-square:nth-child(2n) .skill-icon {
  background: linear-gradient(135deg, #67C23A, #53a11d);
  box-shadow: 0 3px 8px rgba(103, 194, 58, 0.2);
}

.skill-square:nth-child(3n) .skill-icon {
  background: linear-gradient(135deg, #F56C6C, #e74c4c);
  box-shadow: 0 3px 8px rgba(245, 108, 108, 0.2);
}

.skill-square:nth-child(4n) .skill-icon {
  background: linear-gradient(135deg, #E6A23C, #d38b1c);
  box-shadow: 0 3px 8px rgba(230, 162, 60, 0.2);
}

.skill-square:nth-child(5n) .skill-icon {
  background: linear-gradient(135deg, #909399, #6e7175);
  box-shadow: 0 3px 8px rgba(144, 147, 153, 0.2);
}

/* 优化技能信息显示 */
.current-skill-header {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 8px;
  border-left: 4px solid #67C23A;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.skill-info-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
}

.skill-info-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.skill-info-icon i {
  font-size: 24px;
}

.skill-info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.skill-name-row {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.skill-info-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-right: 15px;
}

.skill-info-desc {
  font-size: 13px;
  color: #909399;
}

.skill-status {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.status-text {
  font-size: 13px;
  margin-left: 8px;
  color: #909399;
  font-weight: 500;
}

.status-text.status-active {
  color: #67C23A;
}

.status-switch {
  transform: scale(1.1);
}

/* 添加状态开关额外样式 */
.status-switch>>>.el-switch__core {
  width: 48px;
  height: 22px;
  border-radius: 11px;
  border: none;
  transition: all 0.3s;
}

.status-switch>>>.el-switch__core:after {
  width: 18px;
  height: 18px;
  top: 2px;
  left: 2px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
}

.status-switch>>>.el-switch.is-checked .el-switch__core::after {
  margin-left: 20px;
}

.status-switch>>>.el-switch__label {
  font-size: 12px;
  font-weight: 500;
}

.status-switch>>>.el-switch__label.is-active {
  color: #67C23A;
}

.status-switch>>>.el-switch__label--right {
  margin-left: 8px;
}

.status-switch>>>.el-switch__label--left {
  margin-right: 8px;
}

/* 表格中的技能项样式 */
.table-skill-item {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
}

.table-skill-item:last-child {
  margin-bottom: 0;
}

.table-skill-item .skill-name {
  margin-right: 8px;
  font-size: 13px;
}

.table-skill-item .el-tag {
  margin-left: 5px;
  padding: 0 6px;
  height: 20px;
  line-height: 18px;
}

/* 技能状态样式 */
.skill-status {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.skill-status .el-switch>>>.el-switch__core {
  background-color: #909399;
}

.skill-status .el-switch.is-checked>>>.el-switch__core {
  background-color: #67C23A;
}

.skill-status .el-switch>>>.el-switch__core::after {
  left: 2px;
  top: 2px;
  border-radius: 100%;
  transition: all .3s;
  width: 16px;
  height: 16px;
  background-color: #FFFFFF;
}

.skill-status .el-switch.is-checked>>>.el-switch__core::after {
  left: 100%;
  margin-left: -18px;
}

.status-text {
  font-size: 13px;
  margin-left: 8px;
  color: #909399;
  font-weight: 500;
}

.status-text.status-active {
  color: #67C23A;
}

/* 调整抽帧频率和预警等级在同一行的样式 */
.form-row {
  display: flex;
  flex-wrap: nowrap;
  margin-bottom: 5px;
}

.form-item-inline {
  margin-right: 20px;
  flex: 1;
}

.freq-item {
  flex: 3;
}

.alarm-level-item {
  flex: 2;
}

.frequency-tip {
  color: #909399;
  font-size: 12px;
  line-height: 1.5;
  text-align: left;
  margin-bottom: 20px;
  margin-left: 85px;
}
</style>
