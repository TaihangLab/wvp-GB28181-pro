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
              class="location-item location-item-all">
              <i class="el-icon-check" v-if="currentLocationFilter === ''"></i>
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
                class="location-item">
                <i class="el-icon-check" v-if="currentLocationFilter === location.name"></i>
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
      <el-dialog :visible.sync="deviceDialogVisible" 
        :title="(deviceForm.id !== 0 && !!deviceForm.id) ? '编辑摄像头' : '添加摄像头'" 
        width="30%"
        :close-on-click-modal="false" 
        :destroy-on-close="false" 
        :modal-append-to-body="true" 
        :append-to-body="true"
        :show-close="true" 
        :lock-scroll="true" 
        custom-class="device-dialog" 
        @opened="handleDialogOpened">
        <el-form :model="deviceForm" label-width="80px" class="skill-form">
          <el-form-item label="设备名称">
            <el-input v-model="deviceForm.name" style="width: 200pt;" />
          </el-form-item>
          <el-form-item label="设备类型">
            <el-select v-model="deviceForm.type" placeholder="请选择设备类型" style="width: 200pt;"
              @change="handleDeviceTypeChange" :disabled="deviceForm.id !== 0 && !!deviceForm.id">
              <el-option v-for="item in deviceTypes" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="摄像头">
            <el-select 
              v-model="deviceForm.cameraId" 
              placeholder="请选择摄像头" 
              style="width: 100%;"
              value-key="id"
              :disabled="deviceForm.id !== 0 && !!deviceForm.id"
              :loading="deviceForm.type === 'gb28181' && gb28181CamerasLoading || deviceForm.type === 'push' && pushStreamCamerasLoading"
              filterable
              @change="handleCameraChange">
              <template v-if="deviceForm.id !== 0 && !!deviceForm.id">
                <!-- 编辑模式显示当前摄像头名称，并禁用选择 -->
                <el-option
                  :key="deviceForm.cameraId"
                  :label="deviceForm.source_name || getCameraNameById(deviceForm.cameraId, deviceForm.type)"
                  :value="deviceForm.cameraId">
                </el-option>
              </template>
              <template v-else-if="deviceForm.type === 'gb28181'">
                <!-- 国标设备列表 -->
                <el-option
                  v-for="camera in gb28181Cameras"
                  :key="camera.id"
                  :label="camera.name"
                  :value="camera.id">
                  <div style="display: flex; justify-content: space-between; align-items: center">
                    <span style="font-weight: 500;">{{ camera.name }}</span>
                    <span style="float: right; color: #8492a6; font-size: 12px; display: flex; align-items: center;">
                      <span>{{ camera.ip || '-' }}</span>
                      <el-tag 
                        size="mini" 
                        :type="camera.status === 'online' || camera.onLine ? 'success' : 'danger'" 
                        style="margin-left: 5px;">
                        {{ camera.status === 'online' || camera.onLine ? '在线' : '离线' }}
                      </el-tag>
                    </span>
                  </div>
                </el-option>
              </template>
              <template v-else-if="deviceForm.type === 'push'">
                <!-- 推流设备列表 -->
                <el-option
                  v-for="camera in pushStreamCameras"
                  :key="camera.id"
                  :label="`${camera.name} (${camera.app || ''}/${camera.stream || ''})`"
                  :value="camera.id">
                  <div style="display: flex; justify-content: space-between; align-items: center">
                    <span style="font-weight: 500;">{{ camera.name }}</span>
                    <span style="float: right; color: #8492a6; font-size: 12px; display: flex; align-items: center;">
                      <span>{{ camera.app || '' }}/{{ camera.stream || '' }}</span>
                      <el-tag 
                        size="mini" 
                        :type="camera.pushing ? 'success' : 'danger'" 
                        style="margin-left: 5px;">
                        {{ camera.pushing ? '推流中' : '未推流' }}
                      </el-tag>
                    </span>
                  </div>
                </el-option>
              </template>
              <template v-else-if="deviceForm.type === 'pull'">
                <!-- 拉流设备列表 -->
                <el-tooltip 
                  v-for="camera in proxyStreamCameras" 
                  :key="camera.id"
                  :content="camera.srcUrl ? `源URL: ${camera.srcUrl}` : '无源URL'" 
                  placement="top"
                  :disabled="!camera.srcUrl">
                  <el-option
                    :label="`${camera.name} (${camera.app || ''}/${camera.stream || ''})`"
                    :value="camera.id">
                    <div style="display: flex; justify-content: space-between; align-items: center">
                      <span style="font-weight: 500;">{{ camera.name }}</span>
                      <span style="float: right; color: #8492a6; font-size: 12px; display: flex; align-items: center;">
                        <span>{{ camera.app || '' }}/{{ camera.stream || '' }}</span>
                        <el-tag 
                          size="mini" 
                          :type="camera.pulling ? 'success' : 'danger'" 
                          style="margin-left: 5px;">
                          {{ camera.pulling ? '拉流中' : '未拉流' }}
                        </el-tag>
                      </span>
                    </div>
                  </el-option>
                </el-tooltip>
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
              <!-- 编辑模式下显示的信息 -->
              <span v-if="deviceForm.id" style="font-size: 12px; color: #409EFF;">
                <i class="el-icon-info"></i> 编辑模式下不能更改摄像头
              </span>
              
              <!-- 添加模式下的设备列表信息 -->
              <span v-else-if="deviceForm.type === 'gb28181' && !deviceForm.cameraId" style="font-size: 12px; color: #909399;">
                {{ gb28181CamerasLoading ? '加载中...' : `共找到 ${gb28181CamerasTotal} 个设备` }}
              </span>
              <span v-else-if="deviceForm.type === 'push' && !deviceForm.cameraId" style="font-size: 12px; color: #909399;">
                {{ pushStreamCamerasLoading ? '加载中...' : `共找到 ${pushStreamCamerasTotal} 个设备` }}
              </span>
              <span v-else-if="deviceForm.type === 'pull' && !deviceForm.cameraId" style="font-size: 12px; color: #909399;">
                {{ proxyStreamCamerasLoading ? '加载中...' : `共找到 ${proxyStreamCamerasTotal} 个设备` }}
              </span>
              
              <!-- 选择了摄像头后显示的详细信息 -->
              <span v-else-if="deviceForm.cameraId && deviceForm.type === 'gb28181'" style="font-size: 12px; color: #67C23A; display: flex; align-items: center;">
                <i class="el-icon-check" style="margin-right: 5px;"></i>
                <span>IP: {{ getSelectedCameraIP() || '-' }}</span>
                <el-tag 
                  size="mini" 
                  :type="getSelectedCameraStatus() ? 'success' : 'danger'" 
                  style="margin-left: 5px;">
                  {{ getSelectedCameraStatus() ? '在线' : '离线' }}
                </el-tag>
              </span>
              
              <!-- 推流设备选择后信息 -->
              <span v-else-if="deviceForm.cameraId && deviceForm.type === 'push'" style="font-size: 12px; color: #67C23A; display: flex; align-items: center;">
                <i class="el-icon-check" style="margin-right: 5px;"></i>
                <span>{{ cameraTypeSpecificFields.app || '' }}/{{ cameraTypeSpecificFields.stream || '' }}</span>
                <el-tag 
                  size="mini" 
                  :type="getSelectedCameraPushingStatus() ? 'success' : 'danger'" 
                  style="margin-left: 5px;">
                  {{ getSelectedCameraPushingStatus() ? '推流中' : '未推流' }}
                </el-tag>
              </span>
              
              <!-- 拉流设备选择后信息 -->
              <span v-else-if="deviceForm.cameraId && deviceForm.type === 'pull'" style="font-size: 12px; color: #67C23A; display: flex; align-items: center;">
                <i class="el-icon-check" style="margin-right: 5px;"></i>
                <span>{{ cameraTypeSpecificFields.app || '' }}/{{ cameraTypeSpecificFields.stream || '' }}</span>
                <el-tag 
                  size="mini" 
                  :type="getSelectedCameraPullingStatus() ? 'success' : 'danger'" 
                  style="margin-left: 5px;">
                  {{ getSelectedCameraPullingStatus() ? '拉流中' : '未拉流' }}
                </el-tag>
              </span>
              
              <!-- 刷新按钮 -->
              <el-button 
                v-if="deviceForm.type === 'gb28181' && !(deviceForm.id !== 0 && !!deviceForm.id)"
                type="text" 
                size="small"
                :loading="gb28181CamerasLoading"
                @click="fetchGb28181Cameras">
                <i class="el-icon-refresh"></i> 刷新列表
              </el-button>
              <el-button 
                v-if="deviceForm.type === 'push' && !(deviceForm.id !== 0 && !!deviceForm.id)"
                type="text" 
                size="small"
                :loading="pushStreamCamerasLoading"
                @click="fetchPushStreamCameras">
                <i class="el-icon-refresh"></i> 刷新列表
              </el-button>
              <el-button 
                v-if="deviceForm.type === 'pull' && !(deviceForm.id !== 0 && !!deviceForm.id)"
                type="text" 
                size="small"
                :loading="proxyStreamCamerasLoading"
                @click="fetchProxyStreamCameras">
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
                :disabled="true"
              />
            </el-form-item>
            <el-form-item label="通道编号">
              <el-input 
                v-model="cameraTypeSpecificFields.channelId" 
                placeholder="通道编号" 
                style="width: 200pt;" 
                :disabled="true"
              />
            </el-form-item>
          </div>

          <!-- 代理流设备特定字段 -->
          <div v-if="deviceForm.type === 'pull'">
            <el-form-item label="应用名称">
              <el-input v-model="cameraTypeSpecificFields.app" placeholder="应用名称" style="width: 200pt;" :disabled="true" />
            </el-form-item>
            <el-form-item label="流ID">
              <el-input v-model="cameraTypeSpecificFields.stream" placeholder="流ID" style="width: 200pt;" :disabled="true" />
            </el-form-item>
            <el-form-item label="代理ID">
              <el-input v-model="cameraTypeSpecificFields.proxy_id" placeholder="代理ID" style="width: 200pt;" :disabled="true" />
            </el-form-item>
          </div>

          <!-- 推流设备特定字段 -->
          <div v-if="deviceForm.type === 'push'">
            <el-form-item label="应用名称">
              <el-input v-model="cameraTypeSpecificFields.app" placeholder="应用名称" style="width: 200pt;" :disabled="true" />
            </el-form-item>
            <el-form-item label="流ID">
              <el-input v-model="cameraTypeSpecificFields.stream" placeholder="流ID" style="width: 200pt;" :disabled="true" />
            </el-form-item>
            <el-form-item label="推流ID">
              <el-input v-model="cameraTypeSpecificFields.push_id" placeholder="推流ID" style="width: 200pt;" :disabled="true" />
            </el-form-item>
          </div>

          <el-form-item label="设备标签">
            <div class="tag-selection-container">
              <!-- 可选标签区域 - 移到已选标签上方 -->
              <div class="available-tags-container">
                <div class="available-tags-header" @click="toggleAvailableTagsCollapse">
                  <div class="collapse-title">
                    <span>可选标签</span>
                    <el-tag
                      size="mini"
                      type="info"
                      effect="plain"
                      style="margin-left: 5px;">
                      {{ getAvailableTags().length }}
                    </el-tag>
                  </div>
                  <i :class="availableTagsCollapsed ? 'el-icon-arrow-down' : 'el-icon-arrow-up'" 
                     style="color: #409EFF; cursor: pointer;"></i>
                </div>
                <div class="tags-grid" v-show="!availableTagsCollapsed">
                  <el-tag
                    v-for="tag in getAvailableTags()"
                    :key="tag.id || tag.name"
                    :color="getTagColor(tag.name)"
                    effect="plain"
                    class="selectable-tag-item"
                    @click="addSelectedTag(tag.name)"
                    style="color: #fff; border-color: transparent; cursor: pointer;">
                    {{ tag.name }}
                  </el-tag>
                  <div v-if="getAvailableTags().length === 0" class="no-tags-tip">
                    所有标签已选择
                  </div>
                </div>
              </div>
              
              <!-- 已选标签区域 -->
              <div class="selected-tags-container" v-if="deviceForm.tags && deviceForm.tags.length > 0">
                <div class="selected-tags-header" @click="toggleSelectedTagsCollapse">
                  <div class="collapse-title">
                    <span>已选标签</span>
                    <el-tag
                      size="mini"
                      type="info"
                      effect="plain"
                      style="margin-left: 5px;">
                      {{ deviceForm.tags.length }}
                    </el-tag>
                  </div>
                  <div style="display: flex; align-items: center;">
                    <el-link type="danger" :underline="false" v-if="deviceForm.tags.length > 0" @click.stop="clearAllTags" style="margin-right: 10px;">清空</el-link>
                    <i :class="selectedTagsCollapsed ? 'el-icon-arrow-down' : 'el-icon-arrow-up'" 
                       style="color: #409EFF; cursor: pointer;"></i>
                  </div>
                </div>
                <div class="selected-tags-list" v-show="!selectedTagsCollapsed">
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
        <el-form :model="skillSelectForm" class="skill-form">
          <div v-if="!showLeftSkillMenu">
            <el-select v-model="skillSelectForm.selectedSkill" placeholder="请选择技能" style="width: 100%"
              popper-class="skill-select" @change="handleSingleSkillSelect" :loading="skillOptionsLoading">
              <el-option
                v-for="item in skillOptions"
                :key="item.id"
                :label="item.label"
                :value="item.value">
                <span style="float: left; font-weight: 500;">{{ item.name_zh }}</span>
                <span style="float: right; color: #8492a6; font-size: 12px; display: flex; align-items: center;">
                  {{ item.name }}
                  <el-tag size="mini" type="info" effect="plain" style="margin-left: 5px;">
                    {{ item.type }}
                  </el-tag>
                </span>
              </el-option>
              <div slot="empty" class="empty-options" v-if="skillOptionsLoading">
                <i class="el-icon-loading"></i> 正在加载技能列表...
              </div>
              <div slot="empty" class="empty-options" v-else>
                暂无可用技能
              </div>
            </el-select>
            <div class="skill-info" v-if="skillOptions.length > 0">
              <span style="font-size: 12px; color: #909399;">共发现 {{ skillOptionsTotal }} 个技能</span>
              <el-button type="text" size="small" @click="fetchSkillClasses" :loading="skillOptionsLoading">
                <i class="el-icon-refresh"></i> 刷新列表
              </el-button>
            </div>
          </div>

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
                <el-button type="text" icon="el-icon-setting" @click.stop="viewSkillDetails" style="margin-left: 5px;" title="配置技能参数"></el-button>
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

      <!-- 技能详情对话框 -->
      <el-dialog title="技能参数配置" :visible.sync="skillDetailDialogVisible" width="35%" :close-on-click-modal="false">
        <div v-if="skillDetailData && skillDetailData.params" class="skill-detail-content">
          <div class="detail-params-title">技能参数设置</div>
          <el-row class="detail-params-container" v-for="(value, key, index) in skillDetailData.params" :key="index">
            <el-col :span="10" class="param-label">
              {{ key }}
              <el-tooltip v-if="getParamTooltip(key)" :content="getParamTooltip(key)" placement="top">
                <i class="el-icon-question"></i>
              </el-tooltip>
            </el-col>
            <el-col :span="14" class="param-value">
              <!-- 根据参数类型显示不同的UI组件 -->
              <template v-if="Array.isArray(value)">
                <div class="array-value">
                  <el-tag 
                    v-for="(item, idx) in value" 
                    :key="idx" 
                    size="small" 
                    type="info" 
                    class="array-item">
                    {{ item }}
                  </el-tag>
                </div>
              </template>
              <template v-else-if="typeof value === 'object' && value !== null">
                <pre class="json-value">{{ JSON.stringify(value, null, 2) }}</pre>
              </template>
              <template v-else>
                <el-input v-model="skillDetailData.params[key]" placeholder="请输入参数值"></el-input>
              </template>
            </el-col>
          </el-row>
        </div>
        <div v-else-if="skillDetailData === null" class="skill-detail-loading">
          <i class="el-icon-loading"></i> 正在加载技能参数...
        </div>
        <div v-else class="skill-detail-empty">
          <i class="el-icon-info"></i>
          <p>未能获取到技能参数信息</p>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="skillDetailDialogVisible = false">取消</el-button>
          <el-button type="primary" size="small" @click="saveSkillDetails" v-if="skillDetailData && skillDetailData.params">保存</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import cameraComponent from './cameraComponents/camera.js'
export default cameraComponent
</script>

<style>
@import './cameraComponents/camera.css';
</style>


      

