<template>
  <div>
    <div class="camera-management">
      <!-- 左侧标签区域 -->
      <div class="device-tree">
        <!-- 设备来源标题 -->
        <h3 class="tree-title location-title">
          <div class="title-container">
            <i class="el-icon-location title-icon"></i>
            <span class="title-text">设备来源</span>
          </div>
        </h3>
        
        <div class="location-filter-container">
          <div 
            class="location-item-wrapper" 
            @click="filterAllLocations">
            <el-tag 
              :color="currentLocationFilter === '' ? '#409EFF' : '#f0f2f5'"
              :effect="currentLocationFilter === '' ? 'dark' : 'plain'"
              :class="['location-item all-location-item', currentLocationFilter === '' ? 'active' : '']">
              <i v-if="currentLocationFilter === ''" class="el-icon-check check-icon"></i>
              全部地点
            </el-tag>
          </div>
          <div v-if="uniqueLocations.length === 0" class="no-locations-tip">
            暂无地点数据
          </div>
          <div v-else class="locations-grid">
            <div 
              v-for="location in uniqueLocations" 
              :key="location.name"
              class="location-item-wrapper" 
              @click="filterByLocation(location.name)">
              <el-tag 
                :color="currentLocationFilter === location.name ? '#409EFF' : getLocationColor(location.name)"
                :effect="currentLocationFilter === location.name ? 'dark' : 'plain'"
                :class="['location-item', currentLocationFilter === location.name ? 'location-item-active' : '']">
                <i v-if="currentLocationFilter === location.name" class="el-icon-check check-icon"></i>
                {{ location.name }}
              </el-tag>
            </div>
          </div>
        </div>
        
        <!-- 标签标题 -->
        <h3 class="tree-title">
          <div class="title-container">
            <i class="el-icon-collection-tag title-icon"></i>
            <span class="title-text">设备标签</span>
          </div>
          <div class="title-buttons">
            <el-button 
              type="text" 
              size="mini" 
              icon="el-icon-plus"
              @click="openAddTagDialog"
              class="add-tag-button"
              title="添加标签">
            </el-button>
            <el-tooltip content="清空筛选" placement="top" v-if="currentFilteredTags.length > 0">
              <el-button 
                type="text" 
                size="mini" 
                class="clear-tag-filter"
                @click="clearTagFilter">
                <i class="el-icon-delete"></i>
              </el-button>
            </el-tooltip>
          </div>
        </h3>
        
        <!-- 标签添加按钮 -->
        <div class="tag-add-button-container">
          <el-button 
            type="text" 
            size="mini" 
            class="add-tag-button-alt"
            @click="openAddTagDialog">
            <i class="el-icon-plus"></i> 添加标签
          </el-button>
        </div>
        
        <!-- 选中的标签展示区域 -->
        <div class="filtered-tags-container" v-if="currentFilteredTags.length > 0">
          <div class="filtered-tags-title">
            <div style="display: flex; align-items: center;">
              <i class="el-icon-collection-tag" style="color: #409EFF; margin-right: 5px;"></i>
              <span>已选标签</span>
              <el-tag
                size="mini"
                type="info"
                effect="plain"
                style="margin-left: 5px;">
                {{ currentFilteredTags.length }}
              </el-tag>
            </div>
          </div>
          <div class="filtered-tags-list">
            <el-tag
              v-for="tag in currentFilteredTags"
              :key="tag"
              :color="getTagColor(tag)"
              effect="dark"
              closable
              size="mini"
              @close="removeFilterTag(tag)"
              class="filtered-tag-item">
              {{ tag }}
            </el-tag>
          </div>
          <div class="filter-options" v-if="currentFilteredTags.length > 1">
            <span style="color: #909399; font-size: 12px; margin-right: 10px;">筛选模式：</span>
            <el-radio-group v-model="tagMatchType" size="mini" @change="applyTagFilter">
              <el-radio-button label="all">全部包含</el-radio-button>
              <el-radio-button label="any">任一包含</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        
        <!-- 标签列表区域 -->
        <div class="tags-list-container">
          <el-tooltip 
            v-for="tag in filteredTags" 
            :key="tag.id || tag.name" 
            :content="tag.description || '无详情描述'" 
            placement="right"
            :open-delay="300">
            <div class="tag-item-wrapper">
              <el-tag 
                :color="getTagColor(tag.name)" 
                effect="plain"
                class="tag-item"
                :class="{'tag-selected': currentFilteredTags.includes(tag.name)}"
                @click="toggleFilterTag(tag.name)">
                {{ tag.name }}
                <span v-if="tag.camera_count > 0" class="tag-count">({{ tag.camera_count }})</span>
              </el-tag>
              <div class="tag-actions">
                <el-dropdown trigger="hover" size="mini" placement="bottom-end" @command="handleTagAction($event, tag)">
                  <el-button type="text" size="mini" class="tag-action-btn">
                    <i class="el-icon-more"></i>
                  </el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="edit"><i class="el-icon-edit"></i> 编辑</el-dropdown-item>
                    <el-dropdown-item command="delete" divided><i class="el-icon-delete"></i> 删除</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </div>
          </el-tooltip>
          <div v-if="filteredTags.length === 0" class="no-tags-tip">
            暂无标签
          </div>
        </div>
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

        <el-table 
          :data="deviceList" 
          style="width: 100%" 
          @selection-change="handleSelectionChange"
          v-loading="loading"
          element-loading-text="加载中..."
          empty-text="暂无摄像头数据">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column prop="name" label="摄像头名称" width="180" align="center" />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template slot-scope="{ row }">
              <el-tag :type="row.status === 'online' ? 'success' : 'danger'">
                {{ row.status === 'online' ? '在线' : '离线' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="location" label="设备来源" width="120" align="center" />
          <el-table-column label="设备标签" width="200" align="center">
            <template slot-scope="{ row }">
              <el-tag v-for="(tag, index) in row.tags" :key="index" :color="getTagColor(tag)" effect="plain" size="mini"
                style="margin: 2px; color: #fff; border-color: transparent; display: inline-flex; align-items: center; line-height: 1;">
                {{ tag }}
              </el-tag>
              <span v-if="!row.tags || row.tags.length === 0">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="skill" label="视频技能" min-width="150" align="center">
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
            <el-select 
              v-model="deviceForm.cameraId" 
              placeholder="请选择摄像头" 
              style="width: 100%;"
              :disabled="!deviceForm.type"
              :loading="deviceForm.type === 'gb28181' && gb28181CamerasLoading"
              filterable
              @change="handleCameraChange">
              <template v-if="deviceForm.type === 'gb28181'">
                <!-- 国标设备列表 -->
                <el-option
                  v-for="camera in gb28181Cameras"
                  :key="camera.id"
                  :label="`${camera.name} (${camera.ip})`"
                  :value="camera.id">
                  <div style="display: flex; justify-content: space-between; align-items: center">
                    <span style="font-weight: 500;">{{ camera.name }}</span>
                    <span style="float: right; color: #8492a6; font-size: 12px; display: flex; align-items: center;">
                      <span>{{ camera.ip }}</span>
                      <el-tag 
                        size="mini" 
                        :type="camera.status === 'online' ? 'success' : 'danger'"
                        style="margin-left: 5px;">
                        {{ camera.status === 'online' ? '在线' : '离线' }}
                      </el-tag>
                    </span>
                  </div>
                  <div v-if="camera.manufacturer || camera.model" style="font-size: 12px; color: #909399; margin-top: 4px;">
                    <span v-if="camera.manufacturer">厂商: {{ camera.manufacturer }}</span>
                    <span v-if="camera.model" style="margin-left: 8px;">型号: {{ camera.model }}</span>
                  </div>
                </el-option>
                <!-- 无数据提示 -->
                <el-option
                  v-if="gb28181Cameras.length === 0 && !gb28181CamerasLoading"
                  disabled
                  value=""
                  label="暂无国标设备数据">
                </el-option>
              </template>
              <template v-else>
                <!-- 其他类型摄像头列表 -->
                <el-option
                  v-for="camera in filteredCameras"
                  :key="camera.id"
                  :label="camera.name"
                  :value="camera.id">
                </el-option>
              </template>
            </el-select>
            <!-- 设备信息显示和刷新按钮 -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px;">
              <span v-if="deviceForm.type === 'gb28181'" style="font-size: 12px; color: #909399;">
                {{ gb28181CamerasLoading ? '加载中...' : `共找到 ${gb28181CamerasTotal} 个设备` }}
              </span>
              <el-button 
                v-if="deviceForm.type === 'gb28181'"
                type="text" 
                size="small"
                :loading="gb28181CamerasLoading"
                @click="fetchGb28181Cameras">
                <i class="el-icon-refresh"></i> 刷新列表
              </el-button>
            </div>
          </el-form-item>
          <el-form-item label="关联地点">
            <el-input v-model="deviceForm.location" style="width: 200pt;" />
          </el-form-item>

          <!-- 国标设备特定字段 -->
          <div v-if="deviceForm.type === 'gb28181'">
            <el-form-item label="设备编号">
              <el-input 
                v-model="cameraTypeSpecificFields.deviceId" 
                placeholder="请输入国标设备编号" 
                style="width: 200pt;" 
                :disabled="!!deviceForm.cameraId"
              />
              <div v-if="deviceForm.cameraId" style="margin-top: 5px; font-size: 12px; color: #909399">
                已自动填充设备编号，无需手动输入
              </div>
            </el-form-item>
          </div>

          <!-- 代理流设备特定字段 -->
          <div v-if="deviceForm.type === 'pull'">
            <el-form-item label="应用名称">
              <el-input v-model="cameraTypeSpecificFields.app" placeholder="请输入应用名称" style="width: 200pt;" />
            </el-form-item>
            <el-form-item label="流ID">
              <el-input v-model="cameraTypeSpecificFields.stream" placeholder="请输入流ID" style="width: 200pt;" />
            </el-form-item>
            <el-form-item label="代理ID">
              <el-input v-model="cameraTypeSpecificFields.proxy_id" placeholder="请输入代理ID" style="width: 200pt;" />
            </el-form-item>
          </div>

          <!-- 推流设备特定字段 -->
          <div v-if="deviceForm.type === 'push'">
            <el-form-item label="应用名称">
              <el-input v-model="cameraTypeSpecificFields.app" placeholder="请输入应用名称" style="width: 200pt;" />
            </el-form-item>
            <el-form-item label="流ID">
              <el-input v-model="cameraTypeSpecificFields.stream" placeholder="请输入流ID" style="width: 200pt;" />
            </el-form-item>
            <el-form-item label="推流ID">
              <el-input v-model="cameraTypeSpecificFields.push_id" placeholder="请输入推流ID" style="width: 200pt;" />
            </el-form-item>
          </div>

          <el-form-item label="设备标签">
            <div class="tag-selection-container">
              <!-- 已选标签区域 -->
              <div class="selected-tags-container" v-if="deviceForm.tags && deviceForm.tags.length > 0">
                <div class="selected-tags-header">
                  <div class="collapse-title">
                    <span>已选标签</span>
            </div>
                  <el-link type="danger" :underline="false" v-if="deviceForm.tags.length > 0" @click="clearAllTags">清空</el-link>
                </div>
                <div class="selected-tags-list">
                  <el-tag 
                    v-for="(tag, index) in deviceForm.tags" 
                    :key="index" 
                    :color="getTagColor(tag)" 
                    effect="plain"
                    class="selected-tag-item"
                    closable 
                    @close="removeTag(index)"
                    style="color: #fff; border-color: transparent;">
                {{ tag }}
              </el-tag>
                </div>
              </div>
              <div v-else class="no-tags-selected">
                <i class="el-icon-info"></i> 尚未选择任何标签
              </div>
              
              <!-- 可选标签区域 -->
              <div class="available-tags-container">
                <div class="available-tags-header">
                  <div class="collapse-title">
                    <span>可选标签</span>
                  </div>
                </div>
                <div class="tags-grid">
                  <el-tag
                    v-for="tag in getAvailableTags()"
                    :key="tag.id || tag.name"
                    :color="getTagColor(tag.name)"
                    effect="plain"
                    class="selectable-tag-item"
                    @click="addSelectedTag(tag.name)"
                    style="color: #fff; border-color: transparent; cursor: pointer;">
                    {{ tag.name }}
                    <span v-if="tag.camera_count > 0" class="tag-count">({{ tag.camera_count }})</span>
                  </el-tag>
                  <div v-if="getAvailableTags().length === 0" class="no-tags-tip">
                    所有标签已选择
                  </div>
                </div>
              </div>
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
          <el-form-item label="选择技能" required v-if="!showLeftSkillMenu">
            <el-select v-model="skillSelectForm.selectedSkills" placeholder="请选择技能" style="width: 100%" multiple
              popper-class="skill-select" @change="handleSkillSelectChange">
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

      <!-- 添加编辑标签对话框 -->
      <el-dialog
        :visible.sync="editTagDialogVisible"
        title="编辑标签"
        width="30%"
        :close-on-click-modal="false">
        <el-form :model="editTagForm" label-width="80px">
          <el-form-item label="标签名称" required>
            <el-input v-model="editTagForm.name" placeholder="请输入标签名称"></el-input>
          </el-form-item>
          <el-form-item label="详情描述">
            <el-input 
              v-model="editTagForm.description" 
              type="textarea" 
              :rows="3" 
              placeholder="输入标签详情描述（可选）">
            </el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editTagDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="updateTag">确定</el-button>
        </span>
      </el-dialog>

      <!-- 添加新标签对话框 -->
      <el-dialog
        :visible.sync="addTagDialogVisible"
        title="添加标签"
        width="30%"
        :close-on-click-modal="false">
        <el-form :model="newTagForm" label-width="80px">
          <el-form-item label="标签名称" required>
            <el-input v-model="newTagForm.name" placeholder="请输入标签名称"></el-input>
          </el-form-item>
          <el-form-item label="详情描述">
            <el-input 
              v-model="newTagForm.description" 
              type="textarea" 
              :rows="3" 
              placeholder="输入标签详情描述（可选）">
            </el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addTagDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addNewTag">确定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { cameraAPI } from '@/components/service/VisionAIService.js';
import TagEdit from '@/components/dialog/tagEdit';

export default {
  name: 'CameraManagement',
  components: {
    TagEdit
  },
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

      // 标签搜索关键词
      tagSearchKeyword: '',

      // 当前选中的筛选标签
      currentFilteredTags: [],

      // 标签匹配类型：全部(all)或任意(any)
      tagMatchType: 'all',

      // 设备列表数据
      deviceList: [],

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
      cameras: [], // 改为空数组，将从API获取数据

      // 新增：国标设备列表相关数据
      gb28181Cameras: [],
      gb28181CamerasLoading: false,
      gb28181CamerasTotal: 0,
      gb28181CamerasPage: 1,
      gb28181CamerasPageSize: 20,
      gb28181CamerasQuery: '',
      

      // 新增：选中的设备列表
      selectedDevices: [],

      // 添加分页相关的数据
      currentPage: 1,
      pageSize: 10,
      total: 0,
      loading: false,

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
      currentSkill: null,
      
      // 新增：新标签输入值
      // newTagValue: '',
      // newTagDetail: '',

      cameraTypeSpecificFields: {}, // 新增：类型特定字段
      
      // 新增：已选技能缓存
      selectedSkillCache: [],
      
      // 新增：标记是否是新选择的技能
      isNewSkillSelection: false,
      
      // 新增：标记是否显示左侧技能菜单
      showLeftSkillMenu: false,
      
      // 新增：所有标签列表
      allTags: [],

      // 可折叠面板激活的项
      activeCollapseNames: [], // 默认不展开
      
      // 新增：批量操作结果数据
      /* batchOperationResult: {
        visible: false,
        title: '',
        type: 'success', // 'success', 'warning', 'error'
        message: '',
        successIds: [],
        failedIds: []
      }, */
      
      // 添加编辑标签相关数据
      editTagDialogVisible: false,
      editTagForm: {
        id: null,
        name: '',
        description: ''
      },

      // 添加新标签对话框
      addTagDialogVisible: false,
      newTagForm: {
        name: '',
        description: ''
      },

      // 添加地点筛选相关数据
      currentLocationFilter: '',
      allLocations: [], // 存储所有的地点及其计数
    }
  },

  computed: {
    // 根据当前选择的设备类型过滤摄像头列表
    filteredCameras() {
      if (!this.deviceForm.type) {
        return [];
      }
      
      // 如果是国标设备类型，返回从API获取的国标设备列表
      if (this.deviceForm.type === 'gb28181') {
        return this.gb28181Cameras;
      }
      
      // 对于其他设备类型，使用本地硬编码的摄像头列表
      return this.cameras.filter(camera => camera.type === this.deviceForm.type);
    },

    // 过滤后的标签列表（根据搜索关键词）
    filteredTags() {
      // 过滤掉已经选中的标签
      return this.allTags.filter(tag => !this.currentFilteredTags.includes(tag.name));
    },

    // 唯一标签列表 (保留这个计算属性用于兼容性，但主要使用allTags显示)
    uniqueTags() {
      // 收集所有的标签对象
      const allTags = this.deviceList.flatMap(device => device.tags || []);
      
      // 创建一个映射来存储唯一的标签对象（按名称去重）
      const tagMap = new Map();
      
      allTags.forEach(tag => {
        // 如果标签是字符串类型，转换为对象
        const tagObj = typeof tag === 'string' 
          ? { name: tag, detail: '' } 
          : tag;
        
        // 只保留每个标签名称的第一个实例
        if (!tagMap.has(tagObj.name)) {
          tagMap.set(tagObj.name, tagObj);
        }
      });
      
      // 返回唯一标签对象的数组
      return Array.from(tagMap.values());
    },

    // 唯一地点列表
    uniqueLocations() {
      return this.allLocations;
    },
  },

  created() {
    // 获取摄像头列表
    this.fetchCameraList();
    
    // 获取所有标签列表
    this.fetchAllTags();
    
    // 获取所有地点数据
    this.fetchAllLocations();
    
    // 初始化拉流和推流摄像头模拟数据
    this.initMockCameras();
    
    // 初始化地点筛选为空（显示全部）
    this.currentLocationFilter = '';
  },

  watch: {
    searchKeyword(newValue) {
      if (!newValue) {
        // 如果搜索关键词为空，重新获取摄像头列表数据
        this.fetchCameraList();
      } else {
        // 使用关键词搜索摄像头
        this.fetchCameraList({ name: newValue });
      }
    }
  },

  methods: {
    // 获取摄像头列表数据
    fetchCameraList(params = {}) {
      this.loading = true;
      
      // 合并查询参数
      const queryParams = {
        page: this.currentPage,
        limit: this.pageSize,
        ...params
      };
      
      // 如果搜索关键字匹配标签列表中的标签名称，将其作为标签过滤条件
      if (this.searchKeyword) {
        const matchingTag = this.uniqueTags.find(tag => tag.name === this.searchKeyword);
        if (matchingTag) {
          queryParams.tag = matchingTag.name;
        } else {
          queryParams.name = this.searchKeyword;
        }
      }
      
      // 如果有地点筛选，并且不是通过参数传入的（避免重复添加）
      if (this.currentLocationFilter && !params.location) {
        queryParams.location = this.currentLocationFilter;
      }
      
      // 在发送请求前，打印出请求参数用于调试
      console.log('发送API请求参数:', queryParams);
      
      cameraAPI.getCameraList(queryParams)
        .then(response => {
          if (response.data.code === 0) {
            console.log('API返回数据:', response.data);
            
            // 将获取的摄像头列表转换为前端所需的设备列表格式
            this.deviceList = response.data.data.map(camera => {
              return {
                id: camera.id,
                name: camera.name,
                status: camera.status ? 'online' : 'offline',
                location: camera.location,
                tags: camera.tags || [],
                skill: Array.isArray(camera.skill_names) ? camera.skill_names.join(', ') : '-',
                camera_type: camera.camera_type,
                config: this.buildConfigFromCamera(camera),
                camera_uuid: camera.camera_uuid,
                deviceId: camera.deviceId,
                gb_id: camera.gb_id
              };
            });
            
            // 保存原始数据，用于重置
            this.originalDeviceList = [...this.deviceList];
            
            // 更新总数和分页信息
            this.total = response.data.total || 0;
            
            // 如果筛选后没有数据，给用户提示
            if (this.deviceList.length === 0 && this.currentLocationFilter) {
              this.$message.info(`没有找到地点为"${this.currentLocationFilter}"的设备`);
            }
            
            // 检查当前页是否有数据，如果当前页没有数据且不是第一页，则回到前一页
            if (this.deviceList.length === 0 && this.currentPage > 1 && this.total > 0) {
              this.currentPage -= 1;
              // 重新获取上一页数据
              this.fetchCameraList();
            }
          } else {
            this.$message.error('获取摄像头列表失败：' + (response.data.msg || '未知错误'));
          }
        })
        .catch(error => {
          console.error('获取摄像头列表出错:', error);
          this.$message.error('获取摄像头列表失败：' + (error.message || '服务器错误'));
          
          // 如果获取失败，使用空数组
          this.deviceList = [];
          this.originalDeviceList = [];
          this.total = 0;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    
    // 将摄像头数据转换为配置对象
    buildConfigFromCamera(camera) {
      // 如果不存在技能名称，返回null
      if (!camera.skill_names || camera.skill_names.length === 0) {
        return null;
      }
      
      // 构建配置对象
      const config = {};
      
      // 遍历技能名称，为每个技能创建配置
      camera.skill_names.forEach(skillName => {
        // 创建基本配置
        config[skillName] = {
          status: true, // 默认启用
          alarmLevel: camera.warning_level ? this.getAlarmLevelByValue(camera.warning_level) : '二级预警',
          timeRanges: this.parseRunningPeriod(camera.running_period),
          frequency: {
            seconds: camera.frame_rate || 1,
            frames: 1
          },
          electronicFence: this.parseElectronicFence(camera.electronic_fence)
        };
      });
      
      return config;
    },
    
    // 解析运行时段
    parseRunningPeriod(runningPeriodStr) {
      try {
        // 尝试解析JSON字符串
        const runningPeriod = typeof runningPeriodStr === 'string' ? 
          JSON.parse(runningPeriodStr) : runningPeriodStr;
        
        // 如果是有效对象且包含时间范围
        if (runningPeriod && Array.isArray(runningPeriod.times)) {
          return runningPeriod.times.map(time => ({
            start: new Date(`2024-01-01T${time.start}:00`),
            end: new Date(`2024-01-01T${time.end}:00`)
          }));
        }
      } catch (e) {
        console.error('解析运行时段失败:', e);
      }
      
      // 默认返回全天
      return [{
        start: new Date(2024, 0, 1, 0, 0),
        end: new Date(2024, 0, 1, 23, 59)
      }];
    },
    
    // 解析电子围栏
    parseElectronicFence(fenceStr) {
      try {
        // 尝试解析JSON字符串
        const fence = typeof fenceStr === 'string' ? 
          JSON.parse(fenceStr) : fenceStr;
        
        // 如果是有效对象且包含围栏数据
        if (fence && fence.image) {
          return {
            image: fence.image,
            points: fence.points || [],
            isDrawing: false,
            triggerMode: fence.triggerMode || 'inside',
            sensitivity: fence.sensitivity || 80,
            tempPoints: [],
            draggedPointIndex: -1,
            isDragging: false,
            currentPolygon: []
          };
        }
      } catch (e) {
        console.error('解析电子围栏失败:', e);
      }
      
      // 返回默认围栏配置
      return {
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        points: [],
        isDrawing: false,
        triggerMode: 'inside',
        sensitivity: 80,
        tempPoints: [],
        draggedPointIndex: -1,
        isDragging: false,
        currentPolygon: []
      };
    },
    
    // 根据预警等级值获取预警等级名称
    getAlarmLevelByValue(level) {
      const levelMap = {
        1: '一级预警',
        2: '二级预警',
        3: '三级预警',
        4: '四级预警'
      };
      return levelMap[level] || '二级预警';
    },
    
    // 格式化技能ID为显示名称
    formatSkillIds(skillIds) {
      if (!skillIds || skillIds.length === 0) {
        return '-';
      }
      
      // 这里可以从后端获取技能名称，暂时使用技能ID作为名称
      return skillIds.join(', ');
    },

    // 处理设备类型变化
    handleDeviceTypeChange() {
      console.log('设备类型变更为:', this.deviceForm.type);
      
      // 重置摄像头选择
      this.deviceForm.cameraId = '';
      // 重置类型特定字段
      this.cameraTypeSpecificFields = {};
      
      // 根据设备类型设置默认值
      if (this.deviceForm.type === 'push') {
        this.cameraTypeSpecificFields.app = 'live';
      } else if (this.deviceForm.type === 'pull') {
        this.cameraTypeSpecificFields.app = 'live';
      } else if (this.deviceForm.type === 'gb28181') {
        // 选择国标设备类型时，立即获取国标设备列表
        this.fetchGb28181Cameras();
      }
    },

    // 获取视觉AI平台中的国标设备列表
    fetchGb28181Cameras() {
      console.log('正在获取国标设备列表...');
      this.gb28181CamerasLoading = true;
      
      // 构建请求参数
      const params = {
        page: this.gb28181CamerasPage,
        count: this.gb28181CamerasPageSize
      };
      
      // 如果有查询条件，添加到请求参数中
      if (this.gb28181CamerasQuery) {
        params.query = this.gb28181CamerasQuery;
      }
      
      // 使用VisionAIService中的方法获取国标设备列表
      cameraAPI.getGb28181List(params)
        .then(response => {
          console.log('获取国标设备列表API响应:', response);
          
          let devicesList = [];
          
          // 1. 检查response.data.data是否存在（标准格式）
          if (response.data && response.data.code === 0 && response.data.data) {
            const responseData = response.data.data;
            
            // 检查是否为{devices:[...], total:n}格式
            if (responseData.devices && Array.isArray(responseData.devices)) {
              devicesList = responseData.devices;
              this.gb28181CamerasTotal = responseData.total || devicesList.length;
            } 
            // 检查是否直接为数组格式
            else if (Array.isArray(responseData)) {
              devicesList = responseData;
              this.gb28181CamerasTotal = devicesList.length;
            }
          } 
          // 2. 检查response.data是否直接是期望的格式
          else if (response.data) {
            // 检查是否为{devices:[...], total:n}格式
            if (response.data.devices && Array.isArray(response.data.devices)) {
              devicesList = response.data.devices;
              this.gb28181CamerasTotal = response.data.total || devicesList.length;
            } 
            // 检查是否直接为数组格式
            else if (Array.isArray(response.data)) {
              devicesList = response.data;
              this.gb28181CamerasTotal = devicesList.length;
            }
          }
          
          // 如果找到了设备列表，则处理它们
          if (devicesList.length > 0) {
            console.log('成功获取国标设备列表:', devicesList);
            
            // 更新国标设备列表
            this.gb28181Cameras = devicesList.map(device => {
              // 先打印出每个设备对象的结构，帮助调试
              console.log('处理设备对象:', device);
              
              return {
                id: device.deviceId || device.id || '', // 使用deviceId或id作为设备的唯一标识
                name: device.name || device.deviceId || device.id || '未命名设备', // 如果名称为空，使用设备ID或显示默认名
                type: 'gb28181',
                status: device.onLine === true || device.status === 'online' ? 'online' : 'offline',
                manufacturer: device.manufacturer || '-',
                model: device.model || '-',
                ip: device.ip || device.hostAddress || '-',
                original_data: device.original_data || device
              };
            });
            
            console.log('处理后的国标设备列表:', this.gb28181Cameras);
          } else {
            console.error('获取国标设备列表失败，无法解析返回的数据格式:', response.data);
            this.$message.error('获取国标设备列表失败，无法解析返回的数据格式');
            this.gb28181Cameras = [];
            this.gb28181CamerasTotal = 0;
          }
        })
        .catch(error => {
          console.error('获取国标设备列表出错:', error);
          this.$message.error('获取国标设备列表失败: ' + (error.message || '未知错误'));
          this.gb28181Cameras = [];
          this.gb28181CamerasTotal = 0;
        })
        .finally(() => {
          this.gb28181CamerasLoading = false;
        });
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
      this.cameraTypeSpecificFields = {}; // 清空类型特定字段
      this.deviceDialogVisible = true;
    },

    // 新增：表格选择变化处理
    handleSelectionChange(selection) {
      this.selectedDevices = selection.map(item => item.id)
    },

    // 批量删除处理
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
        // 显示加载状态
        this.loading = true;
        
        // 缓存当前选中的设备ID，用于处理结果
        const selectedIds = [...this.selectedDevices];
        
        console.log('准备删除的设备ID:', selectedIds);
        
        // 调用批量删除API
        cameraAPI.batchDeleteCameras(selectedIds)
          .then(response => {
            // 检查响应数据
            const responseData = response.data;
            console.log('批量删除响应:', responseData); // 调试日志
            
            if (responseData) {
              // 获取操作结果，提供默认值防止缺少某些字段
              const successIds = responseData.success_ids || [];
              const failedIds = responseData.failed_ids || [];
              let successCount = responseData.success_count || successIds.length || 0;
              let failedCount = responseData.failed_count || failedIds.length || 0;
              
              // 如果API未返回成功或失败ID列表，则根据success字段判断
              if (successIds.length === 0 && failedIds.length === 0) {
                if (responseData.success) {
                  // 如果success为true但未提供详细ID，则假定所有ID都成功
                  successCount = selectedIds.length;
                  failedCount = 0;
                } else {
                  // 如果success为false但未提供详细ID，则假定所有ID都失败
                  successCount = 0;
                  failedCount = selectedIds.length;
                }
              }
              
              // 根据结果显示不同类型的消息提示
              if (successCount > 0) {
                if (failedCount === 0) {
                  this.$message.success(`成功删除 ${successCount} 个摄像头`);
                } else {
                  this.$message.warning(`成功删除 ${successCount} 个摄像头，失败 ${failedCount} 个`);
                }
              } else {
                this.$message.error(responseData.message || `批量删除失败，${failedCount} 个摄像头删除失败`);
              }
              
              // 无论结果如何，都刷新列表确保数据同步
              this.fetchCameraList();
            } else {
              this.$message.error('批量删除失败，服务器返回数据异常');
            }
            
            // 清空选中的设备
            this.selectedDevices = [];
          })
          .catch(error => {
            console.error('批量删除出错:', error);
            this.$message.error('批量删除失败：' + (error.message || '服务器错误'));
          })
          .finally(() => {
            this.loading = false;
          });
      }).catch(() => {
        // 用户点击取消，不做操作
      });
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
        this.loading = true;
        
        // 准备更新数据
        const updateData = {
          name: this.deviceForm.name,
          type: this.deviceForm.type,
          camera_uuid: this.deviceForm.cameraId,
          location: this.deviceForm.location,
          tags: [...this.deviceForm.tags]
        };
        
        // 调用API更新摄像头
        cameraAPI.updateCamera(this.deviceForm.id, updateData)
          .then(response => {
            if (response.data.code === 0) {
              // 从响应中获取更新后的摄像头数据
              const updatedCameraData = response.data.data;
              
              // 合并更新的数据和原有数据，确保保留之前的技能配置
        const index = this.deviceList.findIndex(device => device.id === this.deviceForm.id);
        if (index !== -1) {
                const updatedDevice = {
                  ...this.deviceList[index],  // 保留原有数据
                  id: updatedCameraData.id,
                  name: updatedCameraData.name,
                  status: updatedCameraData.status ? 'online' : 'offline',
                  location: updatedCameraData.location,
                  tags: updatedCameraData.tags || [],
                  // 如果返回了skill_names，则使用，否则保留原来的skill值
                  skill: Array.isArray(updatedCameraData.skill_names) 
                    ? updatedCameraData.skill_names.join(', ') 
                    : this.deviceList[index].skill,
                  camera_type: updatedCameraData.camera_type,
                  camera_uuid: updatedCameraData.camera_uuid,
                  deviceId: updatedCameraData.deviceId,
                  gb_id: updatedCameraData.gb_id
                };
                
                // 更新列表中的设备数据
                this.$set(this.deviceList, index, updatedDevice);
                // 更新原始列表
                this.originalDeviceList = [...this.deviceList];
              }
              
          this.$message.success('设备更新成功');
      } else {
              this.$message.error('更新设备失败：' + (response.data.msg || '未知错误'));
            }
          })
          .catch(error => {
            console.error('更新设备出错:', error);
            this.$message.error('更新设备失败：' + (error.message || '服务器错误'));
            
            // 如果API调用失败，手动更新前端数据显示
            const index = this.deviceList.findIndex(device => device.id === this.deviceForm.id);
            if (index !== -1) {
              // 更新设备信息
              this.$set(this.deviceList, index, {
                ...this.deviceList[index],
          name: this.deviceForm.name,
          type: this.deviceForm.type,
          cameraId: this.deviceForm.cameraId,
          cameraName: cameraName,
          location: this.deviceForm.location,
                tags: [...this.deviceForm.tags]
              });
              this.originalDeviceList = [...this.deviceList];
            }
          })
          .finally(() => {
            this.loading = false;
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
            this.cameraTypeSpecificFields = {}; // 清空类型特定字段
            this.tagInputValue = ''; // 清空标签输入值
          });
      } else {
        // 添加新设备
        this.loading = true;
        
        // 准备新设备数据
        let cameraData = {
          name: this.deviceForm.name,
          location: this.deviceForm.location || '',
          status: true, // 默认为在线状态
          tags: [...this.deviceForm.tags],
          camera_type: this.convertCameraType(this.deviceForm.type),
        };

        // 根据摄像头类型添加特定字段
        switch (cameraData.camera_type) {
          case 'gb28181':
            if (this.cameraTypeSpecificFields.deviceId) {
              cameraData.deviceId = this.cameraTypeSpecificFields.deviceId;
              cameraData.gb_id = this.cameraTypeSpecificFields.deviceId; // 通常与deviceId相同
            } else {
              // 如果未提供deviceId，使用所选摄像头ID
              cameraData.deviceId = this.deviceForm.cameraId;
              cameraData.gb_id = this.deviceForm.cameraId;
            }
            break;
          case 'proxy_stream':
            cameraData.app = this.cameraTypeSpecificFields.app || 'live';
            cameraData.stream = this.cameraTypeSpecificFields.stream || this.deviceForm.cameraId;
            cameraData.proxy_id = this.cameraTypeSpecificFields.proxy_id || this.deviceForm.cameraId;
            break;
          case 'push_stream':
            cameraData.app = this.cameraTypeSpecificFields.app || 'live';
            cameraData.stream = this.cameraTypeSpecificFields.stream || this.deviceForm.cameraId;
            cameraData.push_id = this.cameraTypeSpecificFields.push_id || this.deviceForm.cameraId;
            break;
        }
        
        // 调用API添加摄像头
        cameraAPI.addCameraToAI(cameraData)
          .then(response => {
            if (response.data.code === 0) {
              // 添加成功，刷新摄像头列表
              this.fetchCameraList();
        this.$message.success('设备添加成功');
            } else {
              this.$message.error('添加设备失败：' + (response.data.msg || '未知错误'));
              
              // 如果API调用失败但有返回ID，手动添加到前端显示
              if (response.data.data && response.data.data.id) {
                const newId = response.data.data.id;
                this.addDeviceToList(newId, cameraData, cameraName);
              }
            }
          })
          .catch(error => {
            console.error('添加设备出错:', error);
            this.$message.error('添加设备失败：' + (error.message || '服务器错误'));
            
            // 如果API调用失败，生成临时ID并手动添加到前端显示
            const newId = Date.now().toString();
            this.addDeviceToList(newId, cameraData, cameraName);
          })
          .finally(() => {
            this.loading = false;
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
            this.cameraTypeSpecificFields = {}; // 清空类型特定字段
      this.tagInputValue = ''; // 清空标签输入值
          });
      }
    },
    
    // 将设备类型转换为API所需的camera_type格式
    convertCameraType(type) {
      const typeMap = {
        'gb28181': 'gb28181',
        'push': 'push_stream',
        'pull': 'proxy_stream'
      };
      return typeMap[type] || type;
    },
    
    // 辅助方法：添加设备到列表中
    addDeviceToList(id, deviceData, cameraName) {
      const newDevice = {
        id: id,
        name: deviceData.name,
        status: deviceData.status ? 'online' : 'offline',
        type: this.deviceForm.type,
        cameraId: deviceData.deviceId || deviceData.proxy_id || deviceData.push_id || deviceData.camera_uuid,
        cameraName: cameraName,
        location: deviceData.location,
        tags: deviceData.tags || [],
        skill: '',
        createTime: new Date().toISOString().split('T')[0],
        config: null,
        camera_type: deviceData.camera_type,
        deviceId: deviceData.deviceId,
        gb_id: deviceData.gb_id,
        app: deviceData.app,
        stream: deviceData.stream,
        proxy_id: deviceData.proxy_id,
        push_id: deviceData.push_id
      };

      // 添加到设备列表
      this.deviceList.unshift(newDevice);
      this.originalDeviceList = [...this.deviceList];
      this.total = this.deviceList.length;
    },

    // 处理页码改变
    handleCurrentChange(val) {
      this.currentPage = val;
      this.fetchCameraList();
    },

    // 处理每页条数改变
    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
      this.fetchCameraList();
    },

    // 刷新功能实现
    handleRefresh() {
      // 清空搜索关键词
      this.searchKeyword = '';
      
      // 保存当前地点筛选
      const currentLocation = this.currentLocationFilter;
      
      // 重置分页
      this.currentPage = 1;
      
      // 根据当前筛选状态重新获取摄像头列表
      if (currentLocation) {
        this.fetchCameraList({ location: currentLocation });
      } else {
        this.fetchCameraList();
      }
      
      // 重新获取标签列表
      this.fetchAllTags();
      
      this.$message.success('刷新成功');
    },
    
    // 添加刷新所有数据的方法（包括地点数据）
    refreshAllData() {
      // 清空搜索关键词
      this.searchKeyword = '';
      // 清空地点筛选
      this.currentLocationFilter = '';
      // 重置分页
      this.currentPage = 1;
      // 重新获取摄像头列表
      this.fetchCameraList();
      // 重新获取标签列表
      this.fetchAllTags();
      // 重新获取所有地点数据
      this.fetchAllLocations();
      this.$message.success('所有数据刷新成功');
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

      // 初始化技能选择表单和缓存
      const currentSkills = row.skill ? row.skill.split(',').map(s => s.trim()) : [];
      this.skillSelectForm = {
        selectedSkills: [...currentSkills]
      };
      this.selectedSkillCache = [...currentSkills];

      // 打开选择技能对话框
      this.skillSelectDialogVisible = true;
    },

    // 关闭选择技能对话框
    closeSkillSelectDialog() {
      this.skillSelectDialogVisible = false;
    },

    // 确认选择技能
    confirmSkillSelect() {
      // 检查是否有重复技能
      const uniqueSkills = [...new Set(this.selectedSkillCache)];
      if (uniqueSkills.length < this.selectedSkillCache.length) {
        this.$message.warning('技能列表中存在重复技能，已自动去重');
        this.selectedSkillCache = uniqueSkills;
        this.skillSelectForm.selectedSkills = [...uniqueSkills];
      }

      // 检查是否已选择技能
      if (this.selectedSkillCache.length === 0) {
        this.$message.warning('请至少选择一个技能');
        return;
      }

      // 保存选中的技能到设备中
      const deviceIndex = this.deviceList.findIndex(device => device.id === this.currentDeviceId);
      if (deviceIndex !== -1) {
        // 获取当前设备
        const currentDevice = this.deviceList[deviceIndex];
        const skillNames = this.selectedSkillCache;
        
        // 准备更新数据
        const updateData = {
          skill_names: skillNames
        };
        
        // 显示加载状态
        this.loading = true;
        
        // 调用API更新摄像头技能
        cameraAPI.updateCamera(this.currentDeviceId, updateData)
          .then(response => {
            if (response.data.code === 0) {
              // 从响应中获取更新后的摄像头数据
              const updatedCameraData = response.data.data;
              
              // 合并更新的数据和原有数据，确保保留之前的配置
              const updatedDevice = {
                ...this.deviceList[deviceIndex],  // 保留原有数据
                id: updatedCameraData.id,
                name: updatedCameraData.name,
                status: updatedCameraData.status ? 'online' : 'offline',
                location: updatedCameraData.location,
                tags: updatedCameraData.tags || [],
                // 使用新的技能名称
                skill: Array.isArray(updatedCameraData.skill_names) 
                  ? updatedCameraData.skill_names.join(', ') 
                  : skillNames.join(', '),
                camera_type: updatedCameraData.camera_type,
                camera_uuid: updatedCameraData.camera_uuid,
                deviceId: updatedCameraData.deviceId,
                gb_id: updatedCameraData.gb_id
              };
              
              // 更新列表中的设备数据
              this.$set(this.deviceList, deviceIndex, updatedDevice);
              // 更新原始列表
              this.originalDeviceList = [...this.deviceList];
              
        this.$message.success('技能选择成功');
            } else {
              this.$message.error('更新技能失败：' + (response.data.msg || '未知错误'));
              
              // 如果API调用失败，仅在前端更新显示
              this.updateDeviceSkillDisplay(deviceIndex, skillNames);
      }
          })
          .catch(error => {
            console.error('更新技能出错:', error);
            this.$message.error('更新技能失败：' + (error.message || '服务器错误'));

            // 在前端更新显示
            this.updateDeviceSkillDisplay(deviceIndex, skillNames);
          })
          .finally(() => {
            this.loading = false;
      // 关闭选择技能对话框
      this.skillSelectDialogVisible = false;
          });
      } else {
        this.$message.error('未找到设备，保存失败');
        this.skillSelectDialogVisible = false;
      }
    },
    
    // 更新设备技能显示
    updateDeviceSkillDisplay(deviceIndex, skillNames) {
      // 更新设备的技能名称显示
      this.$set(this.deviceList[deviceIndex], 'skill', skillNames.join(', '));
      // 更新原始列表
      this.originalDeviceList = [...this.deviceList];
    },

    // 移除已选技能
    removeSelectedSkill(skill) {
      this.skillSelectForm.selectedSkills = this.skillSelectForm.selectedSkills.filter(s => s !== skill);
      this.selectedSkillCache = this.selectedSkillCache.filter(s => s !== skill);
    },

    // 配置单个技能
    configureSkill(skill, isNewSelection = true) {
      // 手动关闭下拉选择框
      document.body.click(); // 触发全局点击，关闭任何打开的下拉菜单
      
      
      // 延迟一点打开弹框，确保下拉框已关闭
      setTimeout(() => {
        // 隐藏选择技能对话框，但不关闭
      this.skillSelectDialogVisible = false;

        // 标记当前是否是新选择的技能
        this.isNewSkillSelection = isNewSelection;

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
      }, 100);
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
            
            // 显示加载状态
            this.loading = true;

            // 找到当前设备
            const deviceIndex = this.deviceList.findIndex(device => device.id === this.currentDeviceId);
            if (deviceIndex !== -1) {
              // 确保设备有config对象
              if (!this.deviceList[deviceIndex].config) {
                this.$set(this.deviceList[deviceIndex], 'config', {});
              }

              // 为特定技能保存配置
              this.$set(this.deviceList[deviceIndex].config, this.currentSkill, config);

              // 准备更新的设备配置数据
              const updateData = {
                skill_config: {
                  [this.currentSkill]: config
                }
              };
              
              // 调用API更新摄像头配置
              cameraAPI.updateCamera(this.currentDeviceId, updateData)
                .then(response => {
                  if (response.data.code === 0) {
                    // 从响应中获取更新后的摄像头数据
                    const updatedCameraData = response.data.data;
                    
                    // 确保保留当前的配置
                    if (this.deviceList[deviceIndex].config) {
                      // 原始配置对象
                      const originalConfig = this.deviceList[deviceIndex].config;
                      
                      // 更新设备数据，但保留config对象
                      const updatedDevice = {
                        ...this.deviceList[deviceIndex],
                        id: updatedCameraData.id,
                        name: updatedCameraData.name,
                        status: updatedCameraData.status ? 'online' : 'offline',
                        location: updatedCameraData.location,
                        tags: updatedCameraData.tags || [],
                        skill: Array.isArray(updatedCameraData.skill_names) 
                          ? updatedCameraData.skill_names.join(', ') 
                          : this.deviceList[deviceIndex].skill,
                        camera_type: updatedCameraData.camera_type,
                        camera_uuid: updatedCameraData.camera_uuid,
                        deviceId: updatedCameraData.deviceId,
                        gb_id: updatedCameraData.gb_id,
                        // 保留原始配置
                        config: originalConfig
                      };
                      
                      // 更新列表中的设备数据
                      this.$set(this.deviceList, deviceIndex, updatedDevice);
                    }

              // 更新原始列表
              this.originalDeviceList = [...this.deviceList];

                    this.$message.success('技能配置保存成功');
                    
                    // 如果是新选择的技能，将其添加到已选技能列表中
                    if (this.isNewSkillSelection) {
                      // 添加到已选技能缓存
                      this.selectedSkillCache.push(this.currentSkill);
                    }
            } else {
                    this.$message.error('保存配置失败：' + (response.data.msg || '未知错误'));
                  }
                })
                .catch(error => {
                  console.error('保存配置出错:', error);
                  this.$message.error('保存配置失败：' + (error.message || '服务器错误'));
                })
                .finally(() => {
                  this.loading = false;
                  // 关闭配置技能对话框
                  this.skillDialogVisible = false;
                  
                  // 重置左侧菜单标志
                  this.showLeftSkillMenu = false;
                  
                  // 更新已选技能列表，与缓存同步
                  this.skillSelectForm.selectedSkills = [...this.selectedSkillCache];
                  
                  // 重置新选择标记
                  this.isNewSkillSelection = false;
                  
                  // 如果不是从左侧菜单点击的，则重新打开选择技能对话框
                  if (!this.showLeftSkillMenu) {
                    this.skillSelectDialogVisible = true;
                  }
                });
            } else {
              this.loading = false;
              this.$message.error('未找到设备，保存失败');
              // 关闭配置技能对话框
              this.skillDialogVisible = false;
              
              // 重置左侧菜单标志
              this.showLeftSkillMenu = false;
              
              // 如果不是从左侧菜单点击的，则重新打开选择技能对话框
              if (!this.showLeftSkillMenu) {
                this.skillSelectDialogVisible = true;
              }
            }
          } else {
            this.$message.error('未指定设备ID或技能，保存失败');
            // 关闭配置技能对话框
            this.skillDialogVisible = false;
            
            // 重置左侧菜单标志
            this.showLeftSkillMenu = false;
            
            // 如果不是从左侧菜单点击的，则重新打开选择技能对话框
            if (!this.showLeftSkillMenu) {
              this.skillSelectDialogVisible = true;
            }
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
        // 显示加载状态
        this.loading = true;
        
        // 调用API删除摄像头
        cameraAPI.deleteCamera(row.id)
          .then(response => {
            if (response.data.code === 0) {
              // 删除成功后重新获取当前页数据，保持每页显示的数据量
              this.fetchCameraList();
              this.$message.success('删除成功');
            } else {
              this.$message.error('删除失败：' + (response.data.msg || '未知错误'));
            }
          })
          .catch(error => {
            console.error('删除设备出错:', error);
            this.$message.error('删除失败：' + (error.message || '服务器错误'));
          })
          .finally(() => {
            this.loading = false;
          });
      }).catch(() => {
        // 用户点击取消，不做操作
      });
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
        // 检查是否已经添加了该标签
        if (this.deviceForm.tags.includes(this.tagInputValue.trim())) {
          this.$message.warning('该标签已添加');
        } else {
        this.deviceForm.tags.push(this.tagInputValue.trim());
        }
        this.tagInputValue = '';
      }
    },

    // 新增：移除标签
    removeTag(index) {
      this.deviceForm.tags.splice(index, 1);
    },

    // 新增：获取标签颜色
    getTagColor(tag) {
      // 判断是否为已选中的标签
      if (this.currentFilteredTags && this.currentFilteredTags.includes(tag)) {
        return '#409EFF'; // 使用主题蓝色作为已选中标签的颜色
      }
      
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
          image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
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

      // 重置新选择标记
      this.isNewSkillSelection = false;

      // 重置左侧菜单标志
      this.showLeftSkillMenu = false;

      // 更新已选技能列表，与缓存同步
      this.skillSelectForm.selectedSkills = [...this.selectedSkillCache];

      // 如果不是从左侧菜单点击的，则重新打开选择技能对话框
      if (!this.showLeftSkillMenu) {
      this.skillSelectDialogVisible = true;
      }
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
    },

    // 按标签筛选设备列表
    filterByTag(tagName) {
      // 直接调用多标签筛选方法，传入单个标签的数组
      this.filterByMultipleTags([tagName]);
    },

    // 获取所有标签列表
    fetchAllTags() {
      this.loading = true;
      
      cameraAPI.getAllTags()
        .then(response => {
          if (response.data.code === 0) {
            // 设置所有标签列表
            this.allTags = response.data.data.tags || [];
            console.log('获取所有标签成功:', this.allTags);
          } else {
            console.error('获取标签列表失败:', response.data.msg);
            this.$message.error('获取标签列表失败：' + (response.data.msg || '未知错误'));
            
            // 如果API调用失败，使用uniqueTags作为后备
            this.allTags = [...this.uniqueTags];
          }
        })
        .catch(error => {
          console.error('获取标签列表出错:', error);
          this.$message.error('获取标签列表失败：' + (error.message || '服务器错误'));
          
          // 如果API调用失败，使用uniqueTags作为后备
          this.allTags = [...this.uniqueTags];
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 添加新标签
    addNewTag() {
      if (this.newTagForm.name.trim() === '') {
        this.$message.warning('标签名称不能为空');
        return;
      }
      
      // 检查是否已存在相同标签
      const existingTag = this.allTags.find(tag => tag.name === this.newTagForm.name.trim());
      if (existingTag) {
        this.$message.warning('该标签已存在');
        return;
      }
      
      // 显示加载状态
      this.loading = true;
      
      // 创建标签数据
      const tagData = {
        name: this.newTagForm.name.trim(),
        description: this.newTagForm.description.trim() || undefined
      };
      
      // 调用API创建标签
      cameraAPI.createTag(tagData)
        .then(response => {
          if (response.data.code === 0) {
            // 创建标签成功
            const newTag = response.data.data;
            this.$message.success('添加标签成功');
            
            // 刷新标签列表
            this.fetchAllTags();
          } else {
            this.$message.error('创建标签失败：' + (response.data.msg || '未知错误'));
          }
        })
        .catch(error => {
          console.error('创建标签出错:', error);
          this.$message.error('创建标签失败：' + (error.message || '服务器错误'));
        })
        .finally(() => {
          // 关闭对话框
          this.addTagDialogVisible = false;
          
          // 结束加载状态
          this.loading = false;
        });
    },
    
    // 更新设备标签到服务器
    updateDeviceTag(deviceId, tagObj) {
      // 获取设备当前的所有标签
      const deviceIndex = this.deviceList.findIndex(d => d.id === deviceId);
      if (deviceIndex === -1) return;
      
      const device = this.deviceList[deviceIndex];
      const deviceTags = device.tags || [];
      
      // 准备API所需的标签数据
      const updateData = {
        tags: deviceTags.map(tag => {
          if (typeof tag === 'string') {
            return { name: tag };
          } else {
            return {
              name: tag.name,
              description: tag.detail || tag.description
            };
          }
        })
      };
      
      // 调用更新摄像头API
      cameraAPI.updateCamera(deviceId, updateData)
        .then(response => {
          if (response.data.code !== 0) {
            console.warn('更新设备标签失败:', response.data.msg);
          }
        })
        .catch(error => {
          console.error('更新设备标签出错:', error);
        });
    },

    // 更新设备标签
    updateDeviceWithTag(deviceId, tagObj) {
      // 如果有更新设备标签的API，可以在这里调用
      // 这里仅作为示例，简单地添加到前端数据中
      const deviceIndex = this.deviceList.findIndex(d => d.id === deviceId);
      if (deviceIndex !== -1) {
        const updatedDevice = { ...this.deviceList[deviceIndex] };
        if (!updatedDevice.tags) {
          updatedDevice.tags = [];
        }
        
        // 确保不重复添加相同标签
        const existingTagIndex = updatedDevice.tags.findIndex(
          tag => (typeof tag === 'string' ? tag : tag.name) === tagObj.name
        );
        
        if (existingTagIndex === -1) {
          updatedDevice.tags.push(tagObj);
        }
        
        // 更新设备
        this.$set(this.deviceList, deviceIndex, updatedDevice);
      }
    },

    // 添加handleSkillSelectChange方法
    handleSkillSelectChange(value) {
      // 如果是添加了新技能
      if (value.length > this.selectedSkillCache.length) {
        // 找出新添加的技能
        const newSkill = value.find(skill => !this.selectedSkillCache.includes(skill));
        if (newSkill) {
          // 检查是否已经存在该技能，防止重复添加
          if (this.selectedSkillCache.includes(newSkill)) {
            // 如果已经存在，恢复原来的选择状态
            this.skillSelectForm.selectedSkills = [...this.selectedSkillCache];
            this.$message.warning(`技能"${newSkill}"已经添加过，不能重复添加`);
            return;
          }
          
          // 暂存当前已选技能，移除新添加的技能
          this.selectedSkillCache = [...value].filter(skill => skill !== newSkill);
          this.skillSelectForm.selectedSkills = [...this.selectedSkillCache];
          
          // 配置新添加的技能
          this.configureSkill(newSkill, true);
        }
      } else {
        // 如果是移除了技能，更新缓存
        this.selectedSkillCache = [...value];
      }
    },

    // 处理左侧技能点击事件
    handleLeftMenuSkillClick(skill) {
      // 设置显示左侧技能菜单标志
      this.showLeftSkillMenu = true;
      
      // 检查技能是否已选
      const skillExists = this.selectedSkillCache.includes(skill);
      
      // 直接打开配置弹框，不经过选择技能对话框
      this.configureSkill(skill, !skillExists);
      
      // 选择技能对话框在这种情况下不需要显示
      this.skillSelectDialogVisible = false;
    },

    // 新增：添加标签
    addSelectedTag(value) {
      if (!value) return;
      
      // 检查是否已经添加了该标签
      if (this.deviceForm.tags.includes(value)) {
        this.$message.warning('该标签已添加');
      } else {
        this.deviceForm.tags.push(value);
      }
      
      // 清空选择框
      this.$nextTick(() => {
        this.tagInputValue = '';
      });
    },

    // 清空所有标签
    clearAllTags() {
      this.deviceForm.tags = [];
      this.tagInputValue = '';
      this.$message.success('所有标签已清空');
    },

    // 清空标签筛选
    clearTagFilter() {
      this.currentFilteredTags = [];
      this.searchKeyword = '';
      this.fetchCameraList();
      this.$message.success('已清空标签筛选');
    },

    // 添加搜索处理方法
    handleGb28181Search(query) {
      // 保存查询条件
      this.gb28181CamerasQuery = query;
      
      // 如果查询条件变化，重置页码
      if (query) {
        this.gb28181CamerasPage = 1;
      }
      
      // 重新获取设备列表
      this.fetchGb28181Cameras();
    },

    // 初始化拉流和推流摄像头模拟数据
    initMockCameras() {
      // 推流摄像头模拟数据
      const pushCameras = [
        { id: 'push1', name: 'RTMP摄像头1', type: 'push' },
        { id: 'push2', name: 'RTMP摄像头2', type: 'push' },
        { id: 'push3', name: 'HTTP摄像头1', type: 'push' }
      ];
      
      // 拉流摄像头模拟数据
      const pullCameras = [
        { id: 'pull1', name: 'RTSP摄像头1', type: 'pull' },
        { id: 'pull2', name: 'RTSP摄像头2', type: 'pull' },
        { id: 'pull3', name: 'HLS摄像头', type: 'pull' },
        { id: 'pull4', name: 'FLV摄像头', type: 'pull' }
      ];
      
      // 合并模拟数据
      this.cameras = [...pushCameras, ...pullCameras];
    },

    // 处理摄像头选择变更
    handleCameraChange(cameraId) {
      // 如果是国标设备类型并且选择了摄像头
      if (this.deviceForm.type === 'gb28181' && cameraId) {
        // 查找选择的摄像头
        const selectedCamera = this.gb28181Cameras.find(camera => camera.id === cameraId);
        
        if (selectedCamera) {
          console.log('选择了国标设备:', selectedCamera);
          
          // 自动填充设备编号
          this.cameraTypeSpecificFields.deviceId = selectedCamera.id;
          
          // 如果用户未填写设备名称，自动使用摄像头名称
          if (!this.deviceForm.name && selectedCamera.name) {
            this.deviceForm.name = selectedCamera.name;
          }
          
          // 如果用户未填写关联地点，自动使用设备的IP地址作为位置
          if (!this.deviceForm.location && selectedCamera.ip && selectedCamera.ip !== '-') {
            this.deviceForm.location = `IP: ${selectedCamera.ip}`;
          }
          
          // 如果有原始数据，可以填充更多字段
          if (selectedCamera.original_data) {
            const originalData = selectedCamera.original_data;
            
            // 如果有额外需要填充的字段，可以在这里添加
            if (originalData.manufacturer && originalData.model) {
              const deviceInfo = `${originalData.manufacturer} ${originalData.model}`;
              // 如果用户未填写设备名称，优先使用name，其次使用厂商+型号
              if (!this.deviceForm.name) {
                this.deviceForm.name = selectedCamera.name || deviceInfo;
              }
              
              // 如果用户未填写关联地点，且没有IP地址，使用厂商+型号作为位置信息
              if (!this.deviceForm.location && (!selectedCamera.ip || selectedCamera.ip === '-')) {
                this.deviceForm.location = deviceInfo;
              }
            }
          }
        }
      } else {
        // 其他类型设备的处理逻辑
        console.log('选择了普通设备:', cameraId);
        
        // 为其他类型设备自动填充一些字段
        if (this.deviceForm.type && cameraId) {
          const selectedCamera = this.filteredCameras.find(camera => camera.id === cameraId);
          if (selectedCamera && selectedCamera.name && !this.deviceForm.name) {
            this.deviceForm.name = selectedCamera.name;
          }
        }
      }
    },

    // 打开编辑标签对话框
    openEditTagDialog(tag) {
      this.editTagForm = {
        id: tag.id,
        name: tag.name,
        description: tag.description || ''
      };
      this.editTagDialogVisible = true;
    },
    
    // 更新标签
    updateTag() {
      if (!this.editTagForm.name.trim()) {
        this.$message.warning('标签名称不能为空');
        return;
      }
      
      // 检查是否已存在相同名称的标签（排除当前编辑的标签）
      const existingTag = this.allTags.find(
        tag => tag.name === this.editTagForm.name.trim() && tag.id !== this.editTagForm.id
      );
      
      if (existingTag) {
        this.$message.warning('该标签名已存在');
        return;
      }
      
      // 显示加载状态
      this.loading = true;
      
      // 准备更新数据
      const updateData = {
        name: this.editTagForm.name.trim(),
        description: this.editTagForm.description.trim() || undefined
      };
      
      // 调用API更新标签
      cameraAPI.updateTag(this.editTagForm.id, updateData)
        .then(response => {
          if (response.data.code === 0) {
            // 刷新标签列表
            this.fetchAllTags();
            this.$message.success('标签更新成功');
          } else {
            // 如果API调用成功但业务逻辑失败，在前端更新
            const tagIndex = this.allTags.findIndex(tag => tag.id === this.editTagForm.id);
            if (tagIndex !== -1) {
              this.$set(this.allTags, tagIndex, {
                ...this.allTags[tagIndex],
                name: updateData.name,
                description: updateData.description
              });
              this.$message.warning('标签已在前端更新，但服务器端更新失败：' + (response.data.msg || '未知错误'));
            } else {
              this.$message.error('更新标签失败：' + (response.data.msg || '未知错误'));
            }
          }
        })
        .catch(error => {
          console.error('更新标签出错:', error);
          this.$message.error('更新标签失败：' + (error.message || '服务器错误'));
          
          // 如果API调用失败，在前端更新
          const tagIndex = this.allTags.findIndex(tag => tag.id === this.editTagForm.id);
          if (tagIndex !== -1) {
            this.$set(this.allTags, tagIndex, {
              ...this.allTags[tagIndex],
              name: updateData.name,
              description: updateData.description
            });
            this.$message.warning('标签已在前端更新，但服务器端不可用');
          }
        })
        .finally(() => {
          this.editTagDialogVisible = false;
          this.loading = false;
        });
    },
    
    // 确认删除标签
    confirmDeleteTag(tag) {
      this.$confirm(
        `确认删除标签 "${tag.name}" 吗？${tag.camera_count > 0 ? `该标签已被 ${tag.camera_count} 个设备使用，删除后将解除关联。` : ''}`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 显示加载状态
        this.loading = true;
        
        // 调用API删除标签
        cameraAPI.deleteTag(tag.id)
          .then(response => {
            if (response.data.code === 0) {
              // 刷新标签列表
              this.fetchAllTags();
              this.$message.success(`标签 "${tag.name}" 删除成功`);
            } else {
              // 如果API调用成功但业务逻辑失败，在前端更新
              this.allTags = this.allTags.filter(t => t.id !== tag.id);
              this.$message.warning(`标签已在前端删除，但服务器端删除失败：${response.data.msg || '未知错误'}`);
            }
          })
          .catch(error => {
            console.error('删除标签出错:', error);
            this.$message.error('删除标签失败：' + (error.message || '服务器错误'));
            
            // 如果API调用失败，在前端删除
            this.allTags = this.allTags.filter(t => t.id !== tag.id);
            this.$message.warning('标签已在前端删除，但服务器端不可用');
          })
          .finally(() => {
            this.loading = false;
          });
      }).catch(() => {
        // 用户点击取消，不做操作
      });
    },

    // 打开添加标签对话框
    openAddTagDialog() {
      this.newTagForm = {
        name: '',
        description: ''
      };
      this.addTagDialogVisible = true;
    },

    // 根据地点筛选设备列表
    filterByLocation(location) {
      // 设置当前地点筛选条件
      this.currentLocationFilter = location;
      
      // 清空搜索关键词
      this.searchKeyword = '';
      
      // 重置分页
      this.currentPage = 1;
      
      // 直接调用API进行筛选，传递完整的地点名称
      this.fetchCameraList({ location: location });
      
      // 在控制台输出筛选参数，方便调试
      console.log('正在按地点筛选:', location);
    },
    
    // 获取地点颜色
    getLocationColor(location) {
      // 如果是当前选中的地点，不在这里返回颜色（由模板控制）
      if (this.currentLocationFilter === location) {
        return ''; // 返回空值，由模板的:color属性直接设置为蓝色
      }
      
      // 这里根据地点内容生成不同的颜色
      const colors = [
        '#f0f2f5',  // 默认浅灰色
        '#e6f7ff',  // 浅蓝
        '#f6ffed',  // 浅绿
        '#fffbe6',  // 浅黄
        '#fff2e8',  // 浅橙
        '#fff1f0',  // 浅红
      ];

      // 使用字符串哈希算法生成随机但确定的颜色索引
      const hash = Array.from(location).reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
      return colors[Math.abs(hash) % colors.length];
    },

    filterAllLocations() {
      this.currentLocationFilter = '';
      this.fetchCameraList();
    },

    // 获取所有地点数据
    fetchAllLocations() {
      this.loading = true;
      
      // 使用不分页的API调用获取所有设备，或指定一个大的页面大小
      const params = {
        page: 1,
        limit: 1000  // 使用一个大的值来尝试获取所有设备
      };
      
      cameraAPI.getCameraList(params)
        .then(response => {
          if (response.data.code === 0) {
            // 统计所有地点数量
            const locationCounts = {};
            
            response.data.data.forEach(camera => {
              const location = camera.location || '未知地点';
              if (!locationCounts[location]) {
                locationCounts[location] = 0;
              }
              locationCounts[location]++;
            });
            
            // 转换为数组格式并排序
            this.allLocations = Object.entries(locationCounts).map(([name, count]) => ({
              name: name,
              count: count
            })).sort((a, b) => {
              // 首先按数量降序排序
              if (b.count !== a.count) {
                return b.count - a.count;
              }
              // 数量相同时按名称升序排序
              return a.name.localeCompare(b.name);
            });
            
            console.log('获取所有地点数据成功，共', this.allLocations.length, '个地点');
            console.log('地点数据详情:', this.allLocations);
          } else {
            console.error('获取所有地点数据失败:', response.data);
            this.$message.error('获取地点数据失败：' + (response.data.msg || '未知错误'));
          }
        })
        .catch(error => {
          console.error('获取所有地点数据出错:', error);
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 按多个标签筛选设备列表
    filterByMultipleTags(tagNames, matchAll = true) {
      if (!tagNames || !Array.isArray(tagNames) || tagNames.length === 0) {
        return;
      }
      
      // 清空当前地点筛选和搜索关键词
      this.currentLocationFilter = '';
      this.searchKeyword = '';
      
      // 重置分页
      this.currentPage = 1;
      
      // 在控制台输出筛选参数，方便调试
      console.log('正在按标签筛选:', tagNames, '匹配所有标签:', matchAll);
      
      // 构建查询参数
      const params = {
        page: this.currentPage,
        limit: this.pageSize,
        match_all: matchAll,
        tags: tagNames // 直接传递tags数组，VisionAIService.js中会处理格式转换
      };
      
      this.loading = true;
      
      // 直接调用API
      cameraAPI.getCameraList(params)
        .then(response => {
          if (response.data.code === 0) {
            console.log('标签筛选API返回数据:', response.data);
            console.log('API请求参数:', response.config.params);
            
            // 将获取的摄像头列表转换为前端所需的设备列表格式
            this.deviceList = response.data.data.map(camera => {
              return {
                id: camera.id,
                name: camera.name,
                status: camera.status ? 'online' : 'offline',
                location: camera.location,
                tags: camera.tags || [],
                skill: Array.isArray(camera.skill_names) ? camera.skill_names.join(', ') : '-',
                camera_type: camera.camera_type,
                config: this.buildConfigFromCamera(camera),
                camera_uuid: camera.camera_uuid,
                deviceId: camera.deviceId,
                gb_id: camera.gb_id
              };
            });
            
            // 保存原始数据，用于重置
            this.originalDeviceList = [...this.deviceList];
            
            // 更新总数
            this.total = response.data.total || 0;
            
            // 构建友好的提示消息
            const matchType = matchAll ? "同时包含" : "包含其中之一";
            const tagDisplay = tagNames.map(t => `"${t}"`).join("、");
            
            if (this.deviceList.length === 0) {
              this.$message.info(`没有找到${matchType}标签 ${tagDisplay} 的设备`);
            } else {
              this.$message.success(`找到${this.deviceList.length}个${matchType}标签 ${tagDisplay} 的设备`);
            }
          } else {
            this.$message.error('标签筛选失败：' + (response.data.msg || '未知错误'));
          }
        })
        .catch(error => {
          console.error('标签筛选出错:', error);
          this.$message.error('标签筛选失败：' + (error.message || '服务器错误'));
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 获取未选择的标签列表
    getAvailableTags() {
      // 过滤掉已选择的标签
      return this.allTags.filter(tag => !this.deviceForm.tags.includes(tag.name));
    },

    // 切换标签筛选
    toggleFilterTag(tagName) {
      if (this.currentFilteredTags.includes(tagName)) {
        // 如果标签已被选中，则移除
        this.removeFilterTag(tagName);
      } else {
        // 如果标签未被选中，则添加
        this.currentFilteredTags.push(tagName);
        // 应用筛选
        this.applyTagFilter();
      }
    },
    
    // 移除筛选标签
    removeFilterTag(tagName) {
      const index = this.currentFilteredTags.indexOf(tagName);
      if (index !== -1) {
        this.currentFilteredTags.splice(index, 1);
        
        // 如果没有选中的标签，清空筛选
        if (this.currentFilteredTags.length === 0) {
          this.clearTagFilter();
        } else {
          // 否则重新应用筛选
          this.applyTagFilter();
        }
      }
    },
    
    // 应用标签筛选
    applyTagFilter() {
      if (this.currentFilteredTags.length === 0) {
        return;
      }
      
      // 决定是使用AND还是OR逻辑
      const matchAll = this.tagMatchType === 'all';
      
      // 调用已有的多标签筛选方法
      this.filterByMultipleTags(this.currentFilteredTags, matchAll);
    },

    // 处理标签操作（编辑/删除）
    handleTagAction(command, tag) {
      if (command === 'edit') {
        this.openEditTagDialog(tag);
      } else if (command === 'delete') {
        this.confirmDeleteTag(tag);
      }
    },
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
  overflow-y: auto;
}

.tree-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  padding: 16px 20px;
  color: #2c3e50;
  background: linear-gradient(to bottom, #ffffff, #f8f9fb);
  border-bottom: 1px solid #e4e7ed;
  width: 100%;
  box-sizing: border-box;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  line-height: 1.4;
  display: flex;
  justify-content: space-between; /* 左右两侧对齐 */
  align-items: center;
  position: relative;
  letter-spacing: 0.5px;
}

.tree-title .title-container {
  display: flex;
  align-items: center;
}

.tree-title .title-buttons {
  display: flex;
  align-items: center;
}

.tree-title .title-text {
  display: inline-block;
}

.tree-title .add-tag-button {
  color: #409EFF;
  transition: all 0.3s;
  margin: 0 5px 0 0;
  padding: 0;
  height: 28px;
  width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background-color: #ecf5ff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.tree-title .add-tag-button:hover {
  background-color: #409EFF;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.25);
}

.tree-title .clear-tag-filter {
  color: #F56C6C;
  transition: all 0.3s;
  margin: 0;
  padding: 0;
  height: 28px;
  width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background-color: #fef0f0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.tree-title .clear-tag-filter:hover {
  background-color: #F56C6C;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(245, 108, 108, 0.25);
}

.tag-add-button-container {
  display: none; /* 隐藏旧的添加标签按钮容器 */
}

.add-tag-button {
  width: auto;
  color: #409EFF;
  padding: 4px 10px;
  transition: all 0.3s;
}

.add-tag-button:hover {
  color: #66b1ff;
  background-color: #ecf5ff;
  border-radius: 4px;
}

.tags-list-container {
  padding: 5px 10px;
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
}

.tag-item {
  margin: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  height: 26px;
  line-height: 26px;
  border-radius: 13px;
  font-size: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.tag-item:hover {
  transform: none;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.tag-item.tag-selected {
  background-color: #409EFF !important;
  color: white !important;
  border-color: #409EFF !important;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
}

.tag-actions {
  position: absolute;
  right: -3px;
  top: -3px;
  display: flex;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  z-index: 11;
}

.tag-item:hover .tag-actions {
  opacity: 1;
  visibility: visible;
}

.tag-action-btn {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  padding: 2px 5px;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  margin: 0;
  color: #606266;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tag-action-btn:hover {
  color: #409EFF;
  background-color: #ecf5ff;
}

.tag-count {
  font-size: 11px;
  margin-left: 3px;
  opacity: 0.8;
}

.no-tags-tip {
  color: #909399;
  text-align: center;
  padding: 20px 0;
  font-size: 14px;
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

.selectable-tag-item {
  margin: 0;
  padding: 0 8px;
  border-radius: 3px;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  line-height: 1;
  height: 22px;
  font-size: 12px;
  cursor: pointer;
}

.selectable-tag-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
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
.skill-tags-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 5px;
}

.skill-tag-item {
  display: inline-flex;
  align-items: center;
  margin: 2px 5px;
  padding: 2px 0;
}

.skill-tag-item .skill-name {
  font-size: 12px;
  white-space: nowrap;
}

/* 状态小圆点样式 */
.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 3px;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
  transition: all 0.3s;
  flex-shrink: 0;
  margin-bottom: 8px;
}

.status-enabled {
  background-color: #67C23A;
  box-shadow: 0 0 3px rgba(103, 194, 58, 0.6);
}

.status-disabled {
  background-color: #909399;
  box-shadow: 0 0 3px rgba(144, 147, 153, 0.6);
}

.skill-tag-item .el-tag {
  margin-left: 3px;
  padding: 0 6px;
  height: 20px;
  line-height: 18px;
}

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

/* 原先的表格技能项样式 */
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

.tag-add-area {
  margin-top: 10px;
}

.tag-input {
  width: 100%;
}

.tags-list-container {
  margin-top: 10px;
}

.no-tags-tip {
  color: #909399;
  font-size: 12px;
  text-align: center;
}

/* 新增技能列表样式 */
.skill-list-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: calc(100% - 380px);
  overflow-y: auto;
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.skill-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #f5f7fa;
}

.skill-item:hover {
  background-color: #e6f2ff;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.skill-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  color: white;
}

.skill-name {
  font-size: 13px;
  color: #606266;
}

/* 标签选择相关样式 */
.tag-selection-container {
  margin-bottom: 20px;
  /* 确保选择器在弹窗中表现良好 */
  width: 100%;
}

.tag-select-prefix {
  display: flex;
  align-items: center;
  color: #909399;
  margin-left: 5px;
}

.tag-select-prefix .el-icon-collection-tag {
  font-size: 16px;
}

/* 下拉选项样式 */
.tag-option-item {
  display: flex;
  align-items: center;
  padding: 3px 0;
}

.tag-option-item .el-tag {
  display: inline-flex;
  align-items: center;
  height: 22px;
  line-height: 1;
}

.tag-color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
  display: inline-block;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
}

.tag-name {
  flex: 1;
  font-size: 14px;
  color: #606266;
}

.tag-count {
  color: #909399;
  font-size: 12px;
  margin-left: 5px;
}

/* 已选标签容器样式 */
.selected-tags-container {
  margin-top: 5px;
  background-color: #f9fafc;
  border-radius: 4px;
  padding: 0;
  border: 1px solid #ebeef5;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
}

.selected-tags-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to right, #f9fafc, #ecf5ff);
  border-radius: 4px 4px 0 0;
  padding: 10px 15px;
  height: auto;
  line-height: 1.5;
  border-left: 3px solid #409EFF;
}

.selected-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 15px;
  border-top: 1px solid #f0f0f0;
}

.selected-tag-item {
  margin: 1px 4px 1px 0;
  padding: 0 6px;
  border-radius: 3px;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  line-height: 1;
  height: 20px;
  font-size: 11px;
}

.selected-tag-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.no-tags-selected {
  color: #909399;
  font-size: 14px;
  padding: 15px;
  text-align: center;
  background-color: #f9fafc;
  border-radius: 4px;
  border: 1px dashed #e0e0e0;
  margin-top: 15px;
}

.no-tags-selected .el-icon-info {
  margin-right: 5px;
  color: #E6A23C;
}

/* 自定义标签选择下拉框样式 */
:deep(.tag-select-dropdown) {
  border-radius: 4px !important;
  border: 1px solid #EBEEF5 !important;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1) !important;
}

:deep(.tag-select-dropdown .el-select-dropdown__item) {
  height: 34px;
  line-height: 34px;
}

:deep(.tag-select-dropdown .el-select-dropdown__item.hover), 
:deep(.tag-select-dropdown .el-select-dropdown__item:hover) {
  background-color: #F5F7FA;
}

:deep(.tag-select-dropdown .el-select-dropdown__item.selected) {
  color: #409EFF;
  font-weight: bold;
  background-color: #F5F7FA;
}

/* 确保所有标签文本垂直居中 */
.el-tag {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  line-height: 1 !important;
}

.title-icon {
  margin-right: 8px;
  font-size: 18px;
  color: #409EFF;
}

.tag-search-container {
  margin: 15px 0 10px;
  padding: 0 10px;
}

.all-tags-container {
  margin-top: 10px;
}

.tag-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  padding-bottom: 5px;
  border-bottom: 1px solid #ebeef5;
}

.tag-list-title {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  position: relative;
  padding-left: 6px;
  border-left: 2px solid #409EFF;
}

.tags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 5px;
}

.selectable-tag-item {
  margin: 1px 0;
  padding: 0 8px;
  border-radius: 3px;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  line-height: 1;
  height: 24px;
  font-size: 12px;
}

.selectable-tag-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.collapse-title {
  display: flex;
  align-items: center;
}

.collapse-title span {
  position: relative;
  padding-left: 8px;
  font-weight: 500;
}

.collapse-title span:before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 2px;
  background-color: #409EFF;
}

.tag-collapse {
  margin: 10px 0 20px 0;
}

.tag-collapse /deep/ .el-collapse-item__header {
  border: none;
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  background: linear-gradient(to right, #f9fafc, #ecf5ff);
  border-radius: 4px;
  padding: 10px 15px;
  height: auto;
  line-height: 1.5;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border-left: 3px solid #409EFF;
}

.tag-collapse /deep/ .el-collapse-item__arrow {
  line-height: 1.5;
  font-weight: bold;
  color: #409EFF;
  font-size: 14px;
  margin-right: 4px;
}

.collapse-title {
  display: flex;
  align-items: center;
  height: 24px;
}

.collapse-title span {
  position: relative;
  font-weight: 500;
  color: #606266;
  font-size: 13px;
}

.tag-collapse /deep/ .el-collapse-item__content {
  padding: 10px;
  background-color: #f9fafc;
  border-radius: 0 0 4px 4px;
  margin-top: -1px;
  padding-top: 15px;
}

.tag-collapse /deep/ .el-collapse-item__wrap {
  border: none;
}

.batch-result-dialog {
  border-radius: 4px;
}

.batch-result-dialog /deep/ .el-dialog__header {
  padding: 15px 20px;
  border-bottom: 1px solid #EBEEF5;
  background: #f5f7fa;
}

.batch-result-dialog /deep/ .el-dialog__title {
  font-size: 16px;
  font-weight: 500;
}

.batch-result-dialog /deep/ .el-dialog__body {
  padding: 0;
}

.batch-result-container {
  padding: 20px;
}

.result-summary {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-radius: 4px;
  margin-bottom: 15px;
  font-size: 14px;
}

.result-success {
  background-color: #f0f9eb;
  color: #67C23A;
}

.result-warning {
  background-color: #fdf6ec;
  color: #E6A23C;
}

.result-error {
  background-color: #fef0f0;
  color: #F56C6C;
}

.result-success i,
.result-warning i,
.result-error i {
  margin-right: 8px;
  font-size: 16px;
}

.result-section {
  margin-top: 20px;
}

.section-title {
  font-weight: 500;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.section-title i {
  margin-right: 8px;
}

.success-title {
  color: #67C23A;
}

.failed-title {
  color: #F56C6C;
}

.id-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.id-tag {
  margin: 0;
  padding: 4px 8px;
  border-radius: 4px;
}

.dialog-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 添加标签项包装器样式 */
.tag-item-wrapper {
  position: relative;
  display: inline-block;
  margin: 5px;
  transition: all 0.3s ease;
}

.tag-item-wrapper:hover {
  transform: translateY(-2px);
  z-index: 10;
}

.tag-item-wrapper:hover .tag-actions {
  opacity: 1;
  visibility: visible;
}

.tag-item {
  color: #fff;
  border-color: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  padding-right: 8px; /* 确保有足够空间显示按钮 */
}

.tag-item-wrapper:hover .tag-item {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.tag-actions {
  position: absolute;
  right: -5px;
  top: -5px;
  display: flex;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  padding: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tag-edit-btn, .tag-delete-btn {
  padding: 2px 5px;
  font-size: 12px;
  height: 20px;
  line-height: 1;
  border-radius: 2px;
  margin: 0;
}

.tag-edit-btn {
  color: #409EFF;
}

.tag-edit-btn:hover {
  background-color: #ecf5ff;
}

.tag-delete-btn {
  color: #F56C6C;
}

.tag-delete-btn:hover {
  background-color: #fef0f0;
}

/* 确保标签内容垂直居中 */
.tag-item {
  display: inline-flex;
  align-items: center;
  padding: 0 8px;
  height: 24px;
  line-height: 22px;
}

.location-filter-container {
  margin: 15px 0;
  padding: 12px;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid #ebeef5;
}

.locations-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.location-item-wrapper {
  display: inline-block;
  margin: 4px;
  transition: all 0.3s ease;
  position: relative;
}

.location-item-wrapper:hover {
  transform: translateY(-2px);
}

.location-item {
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0;
  display: inline-flex;
  align-items: center;
  padding: 0 10px;
  height: 28px;
  line-height: 26px;
  font-size: 13px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

/* 全部地点标签样式 */
.all-location-item {
  background-color: #f0f2f5 !important;
  color: #606266 !important;
  border-color: #dcdfe6 !important;
}

.all-location-item:hover {
  background-color: #e6f7ff !important;
  color: #409EFF !important;
  border-color: #b3d8ff !important;
}

/* 选中的全部地点标签 */
.all-location-item.active {
  background-color: #409EFF !important;
  color: white !important;
  border-color: #409EFF !important;
  font-weight: 500;
}

/* 常规位置标签选中状态 */
.location-item.location-item-active {
  background-color: #409EFF !important;
  color: white !important;
  border-color: #409EFF !important;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
}

.check-icon {
  margin-right: 5px;
  font-weight: bold;
  font-size: 14px;
}

.no-locations-tip {
  color: #909399;
  font-size: 14px;
  text-align: center;
  margin-top: 10px;
  width: 100%;
  padding: 10px 0;
}

/* 添加或修改相关CSS样式 */
.location-title {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  text-align: left;
}

.clear-filter {
  font-size: 12px;
  color: #f56c6c;
  margin-left: auto;
}

.filter-options {
  margin-top: 8px;
  display: flex;
  justify-content: center;
  text-align: center;
  padding-top: 8px;
  border-top: 1px solid #ebeef5;
}

/* 已选标签区域样式 */
.filtered-tags-container {
  margin: 15px 0;
  padding: 12px;
  background-color: #f9fafc;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filtered-tags-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
  color: #606266;
  font-weight: 500;
}

.filtered-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 10px 0;
  min-height: 30px;
}

.filtered-tag-item {
  margin: 2px 4px 2px 0 !important;
  padding: 0 8px !important;
  border-radius: 12px !important;
  height: 24px !important;
  line-height: 24px !important;
  display: inline-flex !important;
  align-items: center !important;
  font-size: 12px !important;
  color: #fff !important;
  transition: all 0.3s ease !important;
  border-color: transparent !important;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1) !important;
}

.filtered-tag-item:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15) !important;
}
</style>
      
