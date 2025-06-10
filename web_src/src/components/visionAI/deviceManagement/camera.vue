<template>
  <div>
    <div class="camera-management">
      <!-- 左侧标签区域 -->
      <div class="device-tree">
        <!-- 摄像头分类标题 -->
        <h3 class="tree-title location-title">
          <div class="title-container">
            <i class="el-icon-video-camera title-icon"></i>
            <span class="title-text">摄像头分类</span>
          </div>
        </h3>

        <div class="location-filter-container">
          <div
            class="location-item-wrapper"
            @click="filterAllCameraTypes">
            <el-tag
              :color="currentCameraTypeFilter === 0 ? '#409EFF' : '#f5f7fa'"
              :effect="currentCameraTypeFilter === 0 ? 'dark' : 'plain'"
              :style="{ color: currentCameraTypeFilter === 0 ? '#ffffff' : '#333333' }"
              class="location-item location-item-all">
              <i class="el-icon-check" v-if="currentCameraTypeFilter === 0"></i>
              全部类型
            </el-tag>
          </div>
          <div class="locations-grid">
            <!-- 国标摄像头 -->
            <div class="location-item-wrapper" @click="filterByCameraType(1)">
              <el-tag
                :color="currentCameraTypeFilter === 1 ? '#409EFF' : '#f8f9fc'"
                :effect="currentCameraTypeFilter === 1 ? 'dark' : 'plain'"
                :style="{ color: currentCameraTypeFilter === 1 ? '#ffffff' : '#67C23A' }"
                class="location-item">
                <i class="el-icon-check" v-if="currentCameraTypeFilter === 1"></i>
                国标设备
              </el-tag>
            </div>
            <!-- 推流摄像头 -->
            <div class="location-item-wrapper" @click="filterByCameraType(2)">
              <el-tag
                :color="currentCameraTypeFilter === 2 ? '#409EFF' : '#f8f9fc'"
                :effect="currentCameraTypeFilter === 2 ? 'dark' : 'plain'"
                :style="{ color: currentCameraTypeFilter === 2 ? '#ffffff' : '#E6A23C' }"
                class="location-item">
                <i class="el-icon-check" v-if="currentCameraTypeFilter === 2"></i>
                推流设备
              </el-tag>
            </div>
            <!-- 拉流摄像头 -->
            <div class="location-item-wrapper" @click="filterByCameraType(3)">
              <el-tag
                :color="currentCameraTypeFilter === 3 ? '#409EFF' : '#f8f9fc'"
                :effect="currentCameraTypeFilter === 3 ? 'dark' : 'plain'"
                :style="{ color: currentCameraTypeFilter === 3 ? '#ffffff' : '#F56C6C' }"
                class="location-item">
                <i class="el-icon-check" v-if="currentCameraTypeFilter === 3"></i>
                拉流设备
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧设备列表 -->
      <div class="device-list">
        <div class="operation-bar">
          <div class="left-operations">
            <!-- 添加刷新列表按钮 -->
            <el-button type="primary" icon="el-icon-refresh" @click="handleRefresh">刷新列表</el-button>
          </div>
          <div class="right-operations">
            <el-input v-model="searchKeyword" placeholder="请输入设备名称搜索" style="width: 200px" clearable>
              <i slot="prefix" style="align-items: center; display: flex; height: 40px;" class="el-icon-search"></i>
            </el-input>
          </div>
        </div>

        <el-table
          :data="deviceList"
          style="width: 100%"
          v-loading="loading"
          element-loading-text="加载中..."
          empty-text="暂无摄像头数据">
          <el-table-column type="index" label="序号" width="70" align="center" />
          <el-table-column prop="id" label="ID" width="80" align="center" />
          <el-table-column prop="name" label="摄像头名称" width="150" align="center" />
          <el-table-column prop="camera_type" label="类型" width="100" align="center">
            <template slot-scope="{ row }">
              <el-tag size="mini" effect="plain">{{ getCameraTypeText(row.camera_type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template slot-scope="{ row }">
              <el-tag :type="row.status === true ? 'success' : 'danger'">
                <!-- 根据摄像头类型显示不同的状态文字 -->
                <template v-if="row.camera_type === 1">
                  {{ row.status === true ? '在线' : '离线' }}
                </template>
                <template v-else-if="row.camera_type === 2">
                  {{ row.status === true ? '推流中' : '已停止' }}
                </template>
                <template v-else-if="row.camera_type === 3">
                  {{ row.status === true ? '正在拉流' : '尚未拉流' }}
                </template>
                <template v-else>{{ row.status }}
                  {{ row.status === true ? '启用' : '禁用' }}
                </template>
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="location" label="设备来源" width="140" align="center" />
          <el-table-column prop="skill" label="视频技能" min-width="220" align="center">
            <template slot-scope="{ row }">
              <div v-if="row.skill && row.skill !== '-'" class="skill-tags-container">
                <div v-for="(skillName, idx) in row.skill.split(',')" :key="idx" class="skill-tag-item">
                  <span class="skill-name" :style="{color: row.config && row.config[skillName.trim()] && row.config[skillName.trim()].status ? '#67C23A' : '#909399'}">
                    {{ skillName.trim() }}
                  </span>
                </div>
              </div>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" align="center">
            <template slot-scope="{ row }">
              <div class="operation-buttons">
                <el-button type="primary" size="mini" icon="el-icon-setting"
                  @click="handleConfigSkill(row)">配置技能</el-button>
                <el-button type="info" size="mini" icon="el-icon-view"
                  @click="handleViewDetails(row)">查看详情</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <el-pagination :current-page.sync="currentPage" :page-size.sync="pageSize" :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
            @current-change="handleCurrentChange" />
        </div>
      </div>

      <!-- 选择技能对话框 -->
      <el-dialog title="选择技能" :visible.sync="skillSelectDialogVisible" width="55%" :close-on-click-modal="false"
        :destroy-on-close="false" :modal-append-to-body="true" :append-to-body="true" :show-close="true"
        :lock-scroll="true" custom-class="skill-select-dialog" center @close="handleSkillSelectClose">
        <el-form :model="skillSelectForm" class="skill-form">
          <!-- 搜索和筛选工具栏 -->
          <div class="skill-toolbar">
            <div class="skill-search-container">
              <el-input
                v-model="skillSearchKeyword"
                placeholder="请输入技能名称搜索"
                prefix-icon="el-icon-search"
                clearable
                @clear="clearSkillSearch">
              </el-input>
            </div>
            <div class="skill-filter-container">
              <el-radio-group v-model="skillStatusFilter" size="small" @change="filterSkillsByStatus">
                <el-radio-button label="all">全部</el-radio-button>
                <el-radio-button label="true">已启用</el-radio-button>
                <el-radio-button label="false">未启用</el-radio-button>
              </el-radio-group>
            </div>
          </div>

          <!-- 技能选择网格 -->
          <div class="skills-selection-container">
            <div class="skills-header-with-pagination">
              <div class="section-title">可用技能</div>
              <!-- 分页信息显示在标题右侧 -->
              <div v-if="!skillOptionsLoading && skillOptionsTotal > 0" class="skill-pagination-info">
                <span class="pagination-text">
                  共 {{ skillOptionsTotal }} 个{{ skillTotalPages > 1 ? ' | ' + skillCurrentPage + '/' + skillTotalPages + ' 页' : '' }}
                </span>
                <el-pagination
                  v-if="skillOptionsTotal > skillPageSize"
                  :current-page.sync="skillCurrentPage"
                  :page-size.sync="skillPageSize"
                  :page-sizes="[12, 24, 36, 48]"
                  layout="sizes, prev, pager, next"
                  :total="skillOptionsTotal"
                  @size-change="handleSkillSizeChange"
                  @current-change="handleSkillCurrentChange"
                  background
                  small>
                </el-pagination>
              </div>
            </div>

            <div v-if="skillOptionsLoading" class="skills-loading">
              <i class="el-icon-loading"></i> 正在加载技能列表...
          </div>
            <div v-else-if="filteredSkillOptions.length === 0" class="no-skills-tip">
              <i class="el-icon-info"></i> 暂无可用技能
          </div>
            <div v-else class="skills-grid">
              <div
                v-for="skill in filteredSkillOptions"
                :key="skill.id"
                :class="['skill-card', {selected: isSkillSelected(skill.value), disabled: skill.status === false}]"
                @click="skill.status !== false ? toggleSkillSelection(skill.value) : $message.warning('该技能未启用，无法配置')">
                <div class="skill-icon" :style="{ background: getSkillGradient(skill.value) }">
                  <i :class="getSkillIcon(skill.value)"></i>
                </div>
                <div class="skill-card-content">
                  <div class="skill-info">
                    <div class="skill-name-wrapper">
                      <div class="skill-name-container" :title="skill.name_zh">
                        <div class="skill-name">{{ skill.name_zh }}</div>
                        <span v-if="skill.version" class="skill-version">v{{ skill.version }}</span>
                      </div>
                      <div class="skill-eng-name" :title="skill.value">{{ skill.value }}</div>
                    </div>
                  </div>
                  <div class="skill-meta">
                    <span class="skill-type">{{ skill.type }}</span>
                    <el-tag size="mini" :type="skill.status !== false ? 'success' : 'danger'" class="skill-status-tag">
                      {{ skill.status !== false ? '已启用' : '未启用' }}
                    </el-tag>
                  </div>
                </div>
                <div class="skill-selection-mark" v-if="isSkillSelected(skill.value)">
                  <i class="el-icon-check"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- 关联任务展示区域 -->
          <div class="related-tasks-container">
            <div class="skills-header">
              <div class="skills-title">关联任务 ({{ cameraRelatedTasks.length }})</div>
            </div>
            <div v-if="taskLoading" class="task-loading">
              <i class="el-icon-loading"></i> 正在加载关联任务...
            </div>
            <div v-else-if="cameraRelatedTasks.length === 0" class="no-tasks-tip">
              <i class="el-icon-info"></i> 暂无关联任务
            </div>
            <div v-else class="related-tasks-list">
              <el-card v-for="task in cameraRelatedTasks" :key="task.id" class="task-card"
                      @click.native="handleTaskClick(task)">
                <div class="task-header">
                  <div class="task-name">{{ task.name }}</div>
                  <el-tag size="mini" :type="task.status ? 'success' : 'info'" class="task-status-tag">
                    {{ task.status ? '运行中' : '已停止' }}
                  </el-tag>
                </div>
                <div class="task-info">
                  <div class="task-desc">{{ task.description }}</div>
                  <div class="task-alert">
                    <el-tag size="mini" :type="getAlertLevelType(task.alert_level)">
                      {{ getAlertLevelName(task.alert_level) }}
                    </el-tag>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
        </el-form>
                  <div slot="footer" class="dialog-footer">
          <el-button @click="closeSkillSelectDialog">取消</el-button>
          <el-button type="primary" @click="closeSkillSelectDialog">确定</el-button>
        </div>
      </el-dialog>

      <!-- 配置技能对话框 -->
      <el-dialog :title="isUpdateMode ? '更新技能' : '配置技能'" :visible.sync="skillDialogVisible" width="55%" :close-on-click-modal="false"
        :destroy-on-close="false" :modal-append-to-body="true" :append-to-body="true" :show-close="true"
        :lock-scroll="true" custom-class="skill-dialog" center @close="handleClose">
        <div class="current-skill-header" v-if="currentSkill">
          <div class="skill-info-wrapper">
            <div class="skill-info-icon" :style="{ background: getSkillGradient(currentSkill) }">
              <i :class="getSkillIcon(currentSkill)"></i>
            </div>
            <div class="skill-info-content">
              <div class="skill-name-row">
                <span class="skill-info-name">{{ currentSkillInfo.name_zh || currentSkill }}</span>
                <el-tag size="mini" type="info" class="skill-eng-name-tag" v-if="currentSkillInfo.value && currentSkillInfo.value !== currentSkillInfo.name_zh">
                  {{ currentSkillInfo.value }}
                </el-tag>
                <el-tag size="mini" type="success" class="skill-version-tag" v-if="currentSkillInfo.version">
                  v{{ currentSkillInfo.version }}
                </el-tag>
                <el-tag size="mini" effect="plain" class="skill-type-tag" v-if="currentSkillInfo.type">
                  {{ currentSkillInfo.type }}
                </el-tag>
                <el-button type="text" icon="el-icon-setting" @click.stop="showSkillParamsConfig" style="margin-left: 5px;" title="技能参数配置"></el-button>
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
          <el-form-item label="任务名称" prop="name">
            <el-input
              v-model="skillForm.name"
              placeholder="请输入任务名称"
              prefix-icon="el-icon-document-add"
              style="width: 80%; max-width: 500px;"
              :maxlength="50"
              show-word-limit
              clearable
              class="custom-input">
            </el-input>
          </el-form-item>

          <el-form-item label="任务描述" prop="description">
            <el-input
              v-model="skillForm.description"
              placeholder="请简要描述任务的检测目标和用途"
              type="textarea"
              :rows="3"
              style="width: 80%; max-width: 500px;"
              :maxlength="200"
              show-word-limit
              resize="none"
              class="custom-textarea">
            </el-input>
          </el-form-item>

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
                    <img :src="skillForm.electronicFence.image" alt="围栏图片"
                      :class="['fence-image', {'loading': skillForm.electronicFence.imageLoading}]"
                      @click="handleImageClick" @load="handleImageLoad" @error="handleImageError">

                    <!-- 图像加载中的状态显示 -->
                    <div v-if="skillForm.electronicFence.imageLoading" class="fence-image-loading">
                      <i class="el-icon-loading"></i>
                      <p>正在加载图像...</p>
                    </div>

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
                            style="cursor: move; z-index: 100;"
                            title="拖动调整围栏形状" />
                        </g>

                        <!-- 当前正在绘制的围栏 -->
                        <g v-if="skillForm.electronicFence.isDrawing && skillForm.electronicFence.currentPolygon.length > 0">
                          <!-- 添加提示线连接最后一个点和第一个点 -->
                          <polyline v-if="skillForm.electronicFence.currentPolygon.length > 2"
                            :points="`${skillForm.electronicFence.currentPolygon[skillForm.electronicFence.currentPolygon.length-1].x},${skillForm.electronicFence.currentPolygon[skillForm.electronicFence.currentPolygon.length-1].y} ${skillForm.electronicFence.currentPolygon[0].x},${skillForm.electronicFence.currentPolygon[0].y}`"
                            fill="none"
                            stroke="#4caf50"
                            stroke-width="2"
                            stroke-dasharray="5,5" />

                          <polyline v-if="skillForm.electronicFence.currentPolygon.length > 1"
                            :points="formatPolygonPoints(skillForm.electronicFence.currentPolygon)" fill="none"
                            stroke="#f56c6c" stroke-width="2" stroke-dasharray="5,5" />

                          <!-- 非第一个点 -->
                          <circle v-for="(point, index) in skillForm.electronicFence.currentPolygon"
                            v-if="index !== 0"
                            :key="`current-${index}`"
                            :cx="point.x"
                            :cy="point.y"
                            r="8"
                            fill="#f56c6c"
                            stroke="#fff"
                            stroke-width="2"
                            @click.stop="handleCurrentPointClick(index)"
                            style="cursor: pointer;" />

                          <!-- 添加背景圆圈 -->
                          <circle v-if="skillForm.electronicFence.currentPolygon.length > 2"
                            :cx="skillForm.electronicFence.currentPolygon[0].x"
                            :cy="skillForm.electronicFence.currentPolygon[0].y"
                            r="16"
                            fill="none"
                            stroke="#4caf50"
                            stroke-width="2"
                            style="pointer-events: none;" />

                          <!-- 第一个点单独渲染，没有hover效果 -->
                          <circle v-if="skillForm.electronicFence.currentPolygon.length > 0"
                            :cx="skillForm.electronicFence.currentPolygon[0].x"
                            :cy="skillForm.electronicFence.currentPolygon[0].y"
                            r="10"
                            :fill="skillForm.electronicFence.currentPolygon.length > 2 ? '#4caf50' : '#f56c6c'"
                            stroke="#fff"
                            stroke-width="2"
                            @click.stop="skillForm.electronicFence.currentPolygon.length > 2 ? completeFence() : null"
                            style="cursor: pointer; pointer-events: all;"
                            :title="skillForm.electronicFence.currentPolygon.length > 2 ? '点击闭合围栏' : ''" />
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
                <span class="setting-label">触发机制：</span>
                <el-radio-group v-model="skillForm.electronicFence.triggerMode" size="small">
                  <el-radio-button label="inside">围栏内</el-radio-button>
                  <el-radio-button label="outside">围栏外</el-radio-button>
                </el-radio-group>
              </div>

            </div>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="danger" v-if="isUpdateMode" @click="handleDeleteTask">删 除</el-button>
          <el-button type="primary" @click="handleConfirm">确 定</el-button>
        </div>
      </el-dialog>

      <!-- 技能详情对话框 -->
      <el-dialog
        :visible.sync="skillDetailDialogVisible"
        width="40%"
        :close-on-click-modal="false"
        custom-class="skill-params-dialog"
        center>
        <div slot="title" class="dialog-header">
          <div class="dialog-header-content">
            <div class="skill-icon-wrapper">
              <i class="el-icon-setting"></i>
            </div>
            <div class="dialog-title-info">
              <h3 class="dialog-title">技能参数配置</h3>
              <p class="dialog-subtitle" v-if="currentSkillInfo">{{ currentSkillInfo.name_zh || currentSkill }} 参数设置</p>
            </div>
          </div>
        </div>

        <div v-if="skillDetailData && skillDetailData.params" class="skill-params-content">
          <div class="params-overview">
            <div class="overview-card">
              <div class="overview-icon">
                <i class="el-icon-data-board"></i>
              </div>
              <div class="overview-info">
                <div class="overview-title">参数总览</div>
                <div class="overview-stats">
                  <span class="param-count">{{ Object.keys(skillDetailData.params).length }} 个参数</span>
                  <span class="param-types">{{ getParamTypesCount() }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="params-list">
            <div
              v-for="(value, key, index) in skillDetailData.params"
              :key="index"
              class="param-card">
              <div class="param-header">
                <div class="param-info">
                  <div class="param-name">
                    <i :class="getParamTypeIcon(value)"></i>
                    <span class="name-text">{{ key }}</span>
                    <el-tag size="mini" :type="getParamTypeColor(value)" class="param-type-tag">
                      {{ getParamTypeLabel(value) }}{{ Array.isArray(value) ? ` (${value.length}项)` : '' }}
                    </el-tag>
                  </div>
                  <el-tooltip v-if="getParamTooltip(key)" :content="getParamTooltip(key)" placement="top">
                    <i class="el-icon-question param-help"></i>
                  </el-tooltip>
                </div>
              </div>

              <div class="param-content">
                <!-- 根据参数类型显示不同的UI组件 -->
                <template v-if="Array.isArray(value)">
                  <div class="array-param">
                    <div class="array-tags">
                      <el-tag
                        v-for="(item, idx) in value"
                        :key="idx"
                        size="small"
                        type="info"
                        class="array-tag">
                        <i class="el-icon-collection-tag"></i>
                        {{ item }}
                      </el-tag>
                    </div>
                  </div>
                </template>

                <template v-else-if="typeof value === 'boolean'">
                  <div class="boolean-param">
                    <el-select
                      v-model="skillDetailData.params[key]"
                      placeholder="请选择布尔值"
                      class="boolean-select">
                      <el-option
                        :value="true"
                        label="true">
                        <div class="boolean-option">
                          <i class="el-icon-check boolean-icon success"></i>
                          <span class="boolean-text success">true</span>
                        </div>
                      </el-option>
                      <el-option
                        :value="false"
                        label="false">
                        <div class="boolean-option">
                          <i class="el-icon-close boolean-icon danger"></i>
                          <span class="boolean-text danger">false</span>
                        </div>
                      </el-option>
                    </el-select>
                  </div>
                </template>

                <template v-else-if="typeof value === 'object' && value !== null">
                  <div class="object-param">
                    <div class="json-container">
                      <pre class="json-content">{{ JSON.stringify(value, null, 2) }}</pre>
                    </div>
                  </div>
                </template>

                <template v-else-if="typeof value === 'number'">
                  <div class="number-param">
                    <el-input-number
                      v-model="skillDetailData.params[key]"
                      :placeholder="`${isInteger(value) ? '整数' : '小数'}值 (默认: ${value})`"
                      class="number-input"
                      :step="getNumberStep(value)"
                      :precision="getNumberPrecision(value)"
                      :controls-position="'right'">
                    </el-input-number>
                  </div>
                </template>

                <template v-else>
                  <div class="string-param">
                    <el-input
                      v-model="skillDetailData.params[key]"
                      :placeholder="`请输入参数值 (当前${String(value).length}字符)`"
                      class="string-input"
                      :prefix-icon="'el-icon-edit'">
                    </el-input>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="skillDetailData === null" class="skill-params-loading">
          <div class="loading-content">
            <div class="loading-spinner">
              <i class="el-icon-loading"></i>
            </div>
            <div class="loading-text">正在加载技能参数...</div>
            <div class="loading-subtitle">请稍候，正在获取参数配置信息</div>
          </div>
        </div>

        <div v-else class="skill-params-empty">
          <div class="empty-content">
            <div class="empty-icon">
              <i class="el-icon-document-remove"></i>
            </div>
            <div class="empty-title">无可配置参数</div>
            <div class="empty-subtitle">该技能暂无可配置的参数项</div>
          </div>
        </div>

        <div slot="footer" class="dialog-footer">
          <el-button @click="skillDetailDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="saveSkillDetails"
            v-if="skillDetailData && skillDetailData.params">
            保存配置
          </el-button>
        </div>
      </el-dialog>

      <!-- 设备详情对话框 -->
      <el-dialog title="摄像头详情" :visible.sync="deviceDetailDialogVisible" width="60%" :close-on-click-modal="false">
        <div v-if="deviceDetailData" class="device-detail-content">
          <el-descriptions title="基本信息" :column="2" border>
            <el-descriptions-item label="摄像头ID">{{ deviceDetailData.id }}</el-descriptions-item>
            <el-descriptions-item label="摄像头名称">{{ deviceDetailData.name }}</el-descriptions-item>
            <el-descriptions-item label="摄像头状态">
              <el-tag :type="deviceDetailData.status ? 'success' : 'danger'">
                <!-- 根据摄像头类型显示不同的状态文字 -->
                <template v-if="deviceDetailData.camera_type === 1">
                  {{ deviceDetailData.status ? '在线' : '离线' }}
                </template>
                <template v-else-if="deviceDetailData.camera_type === 2">
                  {{ deviceDetailData.status ? '推流中' : '已停止' }}
                </template>
                <template v-else-if="deviceDetailData.camera_type === 3">
                  {{ deviceDetailData.status ? '正在拉流' : '尚未拉流' }}
                </template>
                <template v-else>
                  {{ deviceDetailData.status ? '启用' : '禁用' }}
                </template>
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="设备来源">{{ deviceDetailData.location || '-' }}</el-descriptions-item>
            <el-descriptions-item label="摄像头类型">
              <el-tag>
                {{ getCameraTypeText(deviceDetailData.camera_type) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ deviceDetailData.createTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ deviceDetailData.updateTime || '-' }}</el-descriptions-item>
          </el-descriptions>

          <el-divider content-position="left">设备详细信息</el-divider>

          <div class="device-specific-info">
            <el-descriptions :column="2" border size="small">
              <!-- 动态展示所有设备属性 -->
              <el-descriptions-item
                v-for="(value, key) in getDeviceSpecificInfo(deviceDetailData)"
                :label="formatPropertyLabel(key)"
                :key="key">
                <!-- 根据属性类型显示不同的格式 -->
                <template v-if="typeof value === 'boolean'">
                  {{ value ? '是' : '否' }}
                </template>
                <template v-else-if="key.includes('Longitude') || key.includes('Latitude') && value !== null">
                  {{ Number(value).toFixed(6) }}
                </template>
                <template v-else-if="value === null || value === undefined || value === ''">
                  -
                </template>
                <template v-else>
                  {{ value }}
                </template>
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <el-divider content-position="left">关联技能</el-divider>

          <div v-if="deviceDetailData.skill_names && deviceDetailData.skill_names.length > 0" class="skills-list">
            <el-tag
              v-for="skill in deviceDetailData.skill_names"
              :key="skill"
              effect="plain"
              type="success"
              class="skill-tag">
              {{ skill }}
            </el-tag>
          </div>
          <el-empty v-else description="暂无关联技能"></el-empty>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="deviceDetailDialogVisible = false">关 闭</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import cameraComponent from './cameraComponents/camera.js'
export default cameraComponent
</script>

<style scoped>
@import './cameraComponents/camera.css';
</style>




