<template>
  <div>
    <el-dialog
      title="预警详情"
      :visible.sync="dialogVisible"
      width="900px"
      :before-close="handleClose"
      v-loading="loading"
      element-loading-text="处理中...">
      <div v-if="warning" class="warning-detail-container">
        <!-- 预警详情头部 -->
        <div class="warning-detail-header">
          <div class="warning-level-badge" :style="{'background-color': getWarningLevelColor(warning.level)}">
            {{ getWarningLevelText(warning.level) }}预警
          </div>
          <div class="warning-detail-time">
            <i class="el-icon-time"></i>
            {{ formatTime(warning.time) }}
          </div>
        </div>
        
        <!-- 主要内容区域 -->
        <div class="warning-detail-main">
          <!-- 左侧：预警信息和媒体内容 -->
          <div class="warning-left-content">
            <!-- 预警信息 -->
            <div class="warning-detail-info">
              <!-- 基础信息卡片 -->
              <div class="info-card">
                <div class="card-title">
                  <i class="el-icon-info"></i>
                  基础信息
                </div>
                <div class="info-grid">
                  <div class="info-row">
                    <div class="info-cell">
                      <span class="label">设备名称</span>
                      <span class="value">{{ warning.device }}</span>
                    </div>
                    <div class="info-cell">
                      <span class="label">违规位置</span>
                      <span class="value">{{ warning.location || (warning.deviceInfo && warning.deviceInfo.position) || '未知位置' }}</span>
                    </div>
                  </div>
                  <div class="info-row">
                    <div class="info-cell">
                      <span class="label">预警名称</span>
                      <span class="value">{{ warning.type }}</span>
                    </div>
                    <div class="info-cell">
                      <span class="label">预警类型</span>
                      <span class="value">{{ getWarningTypeText(warning.type) }}</span>
                    </div>
                  </div>
                  <!-- 复判信息行 (仅在复判记录页面显示) -->
                  <div class="info-row" v-if="warning.reviewType && source === 'reviewRecords'">
                    <div class="info-cell">
                      <span class="label">复判分类</span>
                      <span class="value review-classification" :class="'review-' + warning.reviewType">
                        {{ getReviewClassificationText(warning.reviewType) }}
                        <el-tooltip 
                          v-if="warning.reviewType === 'auto'" 
                          content="还原复判" 
                          placement="top"
                        >
                          <span 
                            class="restore-review-btn" 
                            @click="handleRestoreReview"
                            @click.stop
                          >
                            <i class="el-icon-refresh-left"></i>
                          </span>
                        </el-tooltip>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 详细描述卡片 -->
              <div class="info-card">
                <div class="card-title">
                  <i class="el-icon-document"></i>
                  预警描述
                </div>
                <div class="info-content">
                  <p class="description-content">{{ warning.description || '检测到工作人员未佩戴安全帽，存在安全隐患，请立即整改' }}</p>
                </div>
              </div>
            </div>
            
            <!-- 媒体内容 -->
            <div class="warning-media">
              <div class="warning-image">
                <h4 class="media-title">
                  <i class="el-icon-picture"></i>
                  违规截图
                </h4>
                <div class="image-container" @click="openImageViewer">
                  <div v-if="warning.imageUrl" class="real-image">
                    <img :src="warning.imageUrl" :alt="warning.type" />
                    <div class="media-overlay">
                      <i class="el-icon-zoom-in"></i>
                      <span>点击放大查看</span>
                    </div>
                  </div>
                  <div v-else class="placeholder-image">
                    <i :class="getWarningIcon(warning.level)"></i>
                    <span>违规截图</span>
                  </div>
                </div>
              </div>
              
              <div class="warning-video-clip">
                <h4 class="media-title">
                  <i class="el-icon-video-camera"></i>
                  视频片段
                </h4>
                <div class="video-container" @click="openVideoViewer">
                  <div class="placeholder-video">
                    <i class="el-icon-video-camera"></i>
                    <span>视频片段</span>
                    <div class="media-overlay">
                      <i class="el-icon-video-play"></i>
                      <span>点击播放视频</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 右侧：处理进展时间线 -->
          <div class="warning-right-content">
            <div class="process-timeline">
              <h4 class="timeline-title">
                <i class="el-icon-time"></i>
                处理进展
              </h4>
              <div class="timeline-container">
                <div 
                  v-for="(item, index) in operationHistory" 
                  :key="index"
                  class="timeline-item"
                  :class="{ 
                    'active': item.status === 'active', 
                    'completed': item.status === 'completed',
                    'future': item.status === 'future'
                  }"
                  :data-type="item.operationType"
                >
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <div class="timeline-status">
                      <span>{{ item.statusText }}</span>
                      <span v-if="item.operator" class="timeline-operator">{{ item.operator }}</span>
                    </div>
                    <div class="timeline-time">{{ item.time }}</div>
                    <div class="timeline-desc">{{ item.description }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <span slot="footer" class="dialog-footer">
        <!-- 实时监控页面显示所有按钮 -->
        <template v-if="source === 'realTimeMonitoring'">
          <el-button plain @click="handleReport" class="action-btn report-btn">
            <i class="el-icon-upload"></i>
            上报
          </el-button>
          <el-button plain @click="handleArchive" class="action-btn archive-btn">
            <i class="el-icon-folder"></i>
            归档
          </el-button>
          <el-button plain @click="handleFalseAlarm" class="action-btn false-alarm-btn">
            <i class="el-icon-close"></i>
            误报
          </el-button>
          <!-- 处理按钮根据状态禁用 -->
          <el-button 
            plain
            :disabled="isProcessingDisabled()"
            @click="handleWarning" 
            class="action-btn process-btn">
            <i class="el-icon-check"></i>
            {{ isProcessingDisabled() ? '已完成' : '处理' }}
          </el-button>
        </template>
        <!-- 预警管理页面只显示处理和关闭按钮 -->
        <template v-else-if="source === 'warningManagement'">
        </template>
        <!-- 预警档案页面只显示关闭按钮 -->
        <template v-else-if="source === 'warningArchives'">
        </template>
        <!-- 复判记录页面只显示关闭按钮 -->
        <template v-else-if="source === 'reviewRecords'">
        </template>
        <!-- 默认情况显示处理和关闭按钮 -->
        <template v-else>
          <!-- 处理按钮根据状态禁用 -->
          <el-button 
            plain
            :disabled="isProcessingDisabled()"
            @click="handleWarning" 
            class="action-btn process-btn">
            <i class="el-icon-check"></i>
            {{ isProcessingDisabled() ? '已完成' : '处理' }}
          </el-button>
          <el-button @click="closeDialog" class="action-btn">
            关闭
          </el-button>
        </template>
      </span>
    </el-dialog>

    <!-- 上报确认对话框 -->
    <el-dialog
      title="上报确认"
      :visible.sync="reportDialogVisible"
      width="400px"
      center>
      <div class="confirm-content">
        <p>确定要上报此预警吗？</p>
        <p style="color: #909399; font-size: 12px;">上报后预警将提交给上级部门处理</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeReportDialog">取 消</el-button>
        <el-button type="warning" @click="confirmReport">确定上报</el-button>
      </span>
    </el-dialog>

    <!-- 归档选择对话框 -->
    <el-dialog
      title="归档预警"
      :visible.sync="archiveDialogVisible"
      width="40%"
      center
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="archive-dialog-content">
        <div class="archive-info">
          <i class="el-icon-folder" style="color: #E6A23C; font-size: 24px; margin-right: 8px;"></i>
          <span>请选择要归档到的档案：</span>
        </div>
        
        <div class="archive-selection">
          <el-form label-width="80px">
            <el-form-item label="选择档案">
              <el-select 
                v-model="selectedArchiveId" 
                placeholder="请选择档案"
                style="width: 100%"
                :disabled="availableArchives.length === 0"
              >
                <el-option
                  v-for="archive in availableArchives"
                  :key="archive.id"
                  :label="archive.name + (archive.isDefault ? ' (默认)' : '')"
                  :value="archive.id"
                >
                  <span style="float: left">{{ archive.name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">
                    {{ archive.isDefault ? '默认档案' : '自定义档案' }}
                  </span>
                </el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item v-if="availableArchives.length === 0">
              <el-alert
                title="当前摄像头位置没有可用档案"
                description="系统将自动创建默认档案进行归档"
                type="info"
                :closable="false"
                show-icon
              />
            </el-form-item>
            

          </el-form>
        </div>
        
        <div class="archive-tip">
          <el-alert
            title="归档说明"
            description="归档后，预警将从实时预警页面和预警管理页面移除，仅可在预警档案中查看。"
            type="warning"
            :closable="false"
            show-icon
          />
        </div>
      </div>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeArchiveDialog">取 消</el-button>
        <el-button type="danger" @click="confirmArchive">确认归档</el-button>
      </span>
    </el-dialog>

    <!-- 处理意见对话框 -->
    <el-dialog
      title="处理预警"
      :visible.sync="remarkDialogVisible"
      width="30%"
      center
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form :model="remarkForm" label-width="80px">
        <el-form-item label="处理意见" required>
          <el-input
            v-model="remarkForm.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入处理意见，描述具体的处理措施和结果"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <div class="process-tip">
        <i class="el-icon-info" style="color: #909399; margin-right: 4px;"></i>
        <span style="color: #909399; font-size: 13px;">填写处理意见后，可点击"确认处理"添加处理记录，或点击"结束处理"完成整个处理流程</span>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveRemark">确认处理</el-button>
        <el-button type="success" @click="finishProcessing">结束处理</el-button>
      </span>
    </el-dialog>

         <!-- 简单图片放大显示 -->
     <div 
       v-if="imageViewerVisible" 
       class="simple-image-overlay"
       @click="closeImageViewer">
       <div class="simple-image-container" @click.stop>
         <img 
           v-if="warning && warning.imageUrl"
           :src="warning.imageUrl" 
           :alt="warning.type"
           class="simple-enlarged-image" />
       </div>
     </div>

    <!-- 简单视频播放器 -->
    <div 
      v-if="videoViewerVisible" 
      class="simple-video-overlay"
      @click="closeVideoViewer">
      <div class="simple-video-container" @click.stop>
        <div class="simple-video-player">
          <!-- 视频预览区域 -->
          <div class="video-preview">
            <img 
              v-if="warning && warning.imageUrl"
              :src="warning.imageUrl" 
              :alt="warning.type" />
          </div>
          
          <!-- 简化的视频控制条 - 只保留必要按钮 -->
          <div class="simple-video-controls">
            <el-button 
              size="mini" 
              :icon="isVideoPlaying ? 'el-icon-video-pause' : 'el-icon-video-play'"
              circle
              @click="toggleVideoPlay">
            </el-button>
            
            <div class="progress-container">
              <span class="time-display">{{ currentTime }} / {{ totalTime }}</span>
              <div class="progress-bar">
                <el-slider 
                  v-model="videoProgress"
                  :max="100"
                  :show-tooltip="false"
                  @change="seekVideo">
                </el-slider>
              </div>
            </div>
            
            <el-button 
              size="mini" 
              icon="el-icon-close"
              circle
              @click="closeVideoViewer">
            </el-button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: "WarningDetail",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    warning: {
      type: Object,
      default: null
    },
    source: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      // 归档相关
      archiveDialogVisible: false,
      selectedArchiveId: '',
      archivesList: [],
      currentCameraId: '',
      // 上报相关
      reportDialogVisible: false,
      reportWarningId: '',
      
      // 处理意见对话框
      remarkDialogVisible: false,
      remarkForm: {
        remark: ''
      },
      
      // 处理进展时间线 - 改为数据属性，动态记录操作历史
      operationHistory: [],
      
      // 图片查看器相关
      imageViewerVisible: false,
      
      // 视频播放器相关
      videoViewerVisible: false,
      isVideoPlaying: false,
      videoProgress: 0,
      currentTime: '00:00',
      totalTime: '02:15',
      volume: 80,
      isMuted: false
    }
  },
  watch: {
    visible: {
      handler(val) {
        this.dialogVisible = val;
        if (val && this.warning) {
          // 当对话框打开时，初始化档案数据和操作历史
          this.initArchivesList();
          this.initOperationHistory();
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.initArchivesList();
    // 添加键盘事件监听
    document.addEventListener('keydown', this.handleKeydown);
  },
  destroyed() {
    // 移除键盘事件监听
    document.removeEventListener('keydown', this.handleKeydown);
  },
  computed: {
    // 可用档案列表
    availableArchives() {
      return this.archivesList.filter(archive => 
        archive.cameraId === this.currentCameraId || archive.isDefault
      );
    },
    // 默认档案
    defaultArchive() {
      return this.availableArchives.find(archive => archive.isDefault);
    }
  },
  methods: {
    // 初始化档案列表
    initArchivesList() {
      // 模拟一些档案数据
      this.archivesList = [
        {
          id: 'archive_default_1',
          name: '可燃气体监控点默认档案',
          cameraId: 'camera_1',
          cameraName: '可燃气体监控点',
          isDefault: true,
          createTime: '2023-01-15 10:30:00'
        },
        {
          id: 'archive_default_2',
          name: '储罐区监控点默认档案',
          cameraId: 'camera_2',
          cameraName: '储罐区监控点',
          isDefault: true,
          createTime: '2023-01-15 10:30:00'
        },
        {
          id: 'archive_custom_1',
          name: '重要预警专用档案',
          cameraId: 'camera_1',
          cameraName: '可燃气体监控点',
          isDefault: false,
          createTime: '2023-02-20 14:20:00'
        }
      ];
    },
    
    // 关闭对话框
    closeDialog() {
      this.dialogVisible = false;
      this.$emit('update:visible', false);
    },
    // 处理关闭对话框事件
    handleClose(done) {
      this.closeDialog();
      if (done) done();
    },
    
    // 处理还原复判
    async handleRestoreReview() {
      if (!this.warning || !this.warning.id) {
        this.$message.error('预警信息不完整');
        return;
      }
      
      try {
        await this.$confirm(
          '确定要还原此预警的复判结果吗？还原后该预警将重新进入预警管理页面等待处理。',
          '还原复判确认',
          {
            confirmButtonText: '确定还原',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );
        
        this.loading = true;
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 创建要还原到预警管理页面的预警数据
        const restoredWarning = {
          id: this.warning.id,
          type: this.warning.type,
          device: this.warning.device,
          deviceInfo: this.warning.deviceInfo,
          location: this.warning.location,
          time: this.warning.time,
          level: this.warning.level,
          imageUrl: this.warning.imageUrl,
          description: this.warning.description,
          status: 'pending', // 重新设置为待处理状态
          // 重置操作历史，只保留预警触发记录
          operationHistory: this.warning.operationHistory ? 
            this.warning.operationHistory.filter(record => record.operationType === 'create') : []
        };
        
        // 触发还原事件，通知父组件将预警添加到预警管理页面
        this.$emit('restore-review', restoredWarning);
        
        this.$message.success('预警已成功还原到预警管理页面');
        
        // 关闭详情对话框
        this.closeDialog();
        
      } catch (error) {
        if (error !== 'cancel') {
          console.error('还原复判失败:', error);
          this.$message.error('还原复判失败，请稍后重试');
        }
      } finally {
        this.loading = false;
      }
    },
    
    // 处理预警事件 - 复制预警管理页面的核心逻辑
    async handleWarningAction(action) {
      if (!this.warning || !this.warning.id) {
        this.$message.error('预警信息不完整');
        return;
      }
      
      try {
        this.loading = true;
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (action === 'markProcessed') {
          // 标记为已处理
          this.warning.status = 'completed';
          this.$message.success('已标记为已处理');
          this.$emit('handle-warning', this.warning);
          // 不立即关闭对话框，让用户看到状态变化
        } else if (action === 'report') {
          // 上报
          this.reportWarningId = this.warning.id;
          this.reportDialogVisible = true;
          return; // 不关闭loading，等确认后再关闭
        } else if (action === 'archive') {
          // 归档 - 需要选择档案
          this.currentCameraId = this.warning.cameraId || 'camera_1';
          this.initArchiveSelection();
          this.archiveDialogVisible = true;
          return; // 不关闭loading，等确认后再关闭
        } else if (action === 'falseAlarm') {
          // 误报 - 不需要检查处理状态，可以直接归档
          this.currentCameraId = this.warning.cameraId || 'camera_1';
          await this.handleFalseAlarmArchive();
          return; // 不关闭loading，等归档完成后再关闭
        }
      } catch (error) {
        console.error('处理失败:', error);
        this.$message.error('处理预警失败');
      } finally {
        this.loading = false;
      }
    },
    
    // 处理预警
    handleWarning() {
      // 检查当前是否已经在处理中
      const hasProcessingRecord = this.operationHistory.some(record => 
        record.operationType === 'processing' && record.status === 'active'
      );
      
      if (hasProcessingRecord) {
        // 如果已经有处理中记录，直接弹出处理意见对话框
        this.remarkDialogVisible = true;
      } else {
        // 如果没有处理中记录，先添加"处理中"状态
        this.startProcessing();
      }
    },
    
    // 开始处理
    startProcessing() {
      // 更新待处理记录为已完成状态
      this.operationHistory = this.operationHistory.map(record => {
        if (record.operationType === 'pending' && record.status === 'active') {
          return {
            ...record,
            status: 'completed',
            description: '预警已确认，开始处理'
          };
        }
        return record;
      });
      
      // 同步更新warning对象的操作历史
      if (this.warning && this.warning.operationHistory) {
        this.warning.operationHistory = this.warning.operationHistory.map(record => {
          if (record.operationType === 'pending' && record.status === 'active') {
            return {
              ...record,
              status: 'completed',
              description: '预警已确认，开始处理'
            };
          }
          return record;
        });
      }
      
      // 弹出处理意见对话框
      this.remarkDialogVisible = true;
    },
    
    // 保存处理意见（添加处理中记录）
    async saveRemark() {
      if (!this.remarkForm.remark.trim()) {
        this.$message.warning('请输入处理意见');
        return;
      }
      
      try {
        this.loading = true;
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 添加新的处理中记录
        this.addOperationRecord({
          status: 'completed',
          statusText: '处理中',
          time: this.getCurrentTime(),
          description: `处理意见：${this.remarkForm.remark}`,
          operationType: 'processing',
          operator: this.getCurrentUserName()
        });
        
        this.$message.success('处理记录已添加');
        // 发出处理记录添加事件，传递action标识
        this.$emit('handle-warning', { ...this.warning, action: 'record-added' });
        this.closeRemarkDialog();
      } catch (error) {
        console.error('处理失败:', error);
        this.$message.error('处理失败');
      } finally {
        this.loading = false;
      }
    },
    
    // 结束处理
    async finishProcessing() {
      try {
        this.loading = true;
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 添加新的已处理记录，而不是修改现有记录
        this.addOperationRecord({
          status: 'completed',
          statusText: '已处理',
          time: this.getCurrentTime(),
          description: '预警处理已完成，可以进行后续操作',
          operationType: 'completed',
          operator: this.getCurrentUserName()
        });
        
        this.$message.success('处理已完成，现在可以进行归档等操作');
        // 发出完成处理事件，不再触发处理流程
        this.$emit('handle-warning', { ...this.warning, action: 'finished' });
        this.closeRemarkDialog();
      } catch (error) {
        console.error('结束处理失败:', error);
        this.$message.error('结束处理失败');
      } finally {
        this.loading = false;
      }
    },
    
    // 关闭处理意见对话框
    closeRemarkDialog() {
      this.remarkDialogVisible = false;
      this.remarkForm = {
        remark: ''
      };
    },
    
    // 上报处理
    handleReport() {
      this.handleWarningAction('report');
    },
    // 归档处理
    handleArchive() {
      // 检查是否已经处理完成
      const hasCompletedProcessing = this.operationHistory.some(record => 
        record.operationType === 'completed'
      );
      
      if (!hasCompletedProcessing) {
        this.$message.warning('请先完成预警处理后再进行归档操作');
        return;
      }
      
      this.handleWarningAction('archive');
    },
    // 误报处理
    handleFalseAlarm() {
      this.handleWarningAction('falseAlarm');
    },
    
    // 初始化归档选择
    initArchiveSelection() {
      // 自动选择默认档案（如果存在）
      if (this.defaultArchive) {
        this.selectedArchiveId = this.defaultArchive.id;
      } else {
        // 如果没有默认档案，则准备创建
        this.selectedArchiveId = '';
      }
    },
    
    // 确认上报
    async confirmReport() {
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 记录上报操作到历史
        this.addOperationRecord({
          status: 'completed',
          statusText: '预警上报',
          time: this.getCurrentTime(),
          description: '预警已上报给上级部门处理，等待上级部门响应',
          operationType: 'report',
          operator: this.getCurrentUserName()
        });
        
        this.$emit('handle-report', this.warning);
        this.closeReportDialog();
        // 不关闭详情对话框，让用户可以继续查看和操作
      } catch (error) {
        console.error('上报失败:', error);
        this.$message.error('上报失败');
      } finally {
        this.loading = false;
      }
    },
    
    // 关闭上报对话框
    closeReportDialog() {
      this.reportDialogVisible = false;
      this.reportWarningId = '';
    },
    
    // 确认归档
    async confirmArchive() {
      try {
        let targetArchiveId = this.selectedArchiveId;
        let archiveName = '';
        
        // 如果没有选择档案，自动创建默认档案
        if (!targetArchiveId) {
          targetArchiveId = await this.createDefaultArchive();
          archiveName = '默认档案';
        } else {
          // 获取选中档案的名称
          const selectedArchive = this.availableArchives.find(archive => archive.id === targetArchiveId);
          archiveName = selectedArchive ? selectedArchive.name : '未知档案';
        }
        
        if (!targetArchiveId) {
          this.$message.error('无法创建默认档案');
          return;
        }
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 记录归档操作到历史
        this.addOperationRecord({
          status: 'completed',
          statusText: '预警归档',
          time: this.getCurrentTime(),
          description: `预警已归档到：${archiveName}，可在预警档案中查看`,
          operationType: 'archive',
          operator: this.getCurrentUserName(),
          archiveInfo: {
            archiveId: targetArchiveId,
            archiveName: archiveName
          }
        });
        
        this.$emit('handle-archive', this.warning);
        this.closeArchiveDialog();
        // 不关闭详情对话框，让用户可以继续查看操作历史
      } catch (error) {
        console.error('归档失败:', error);
        this.$message.error('归档失败');
      } finally {
        this.loading = false;
      }
    },
    
    // 关闭归档对话框
    closeArchiveDialog() {
      this.archiveDialogVisible = false;
      this.selectedArchiveId = '';
    },
    
    // 自动创建默认档案
    async createDefaultArchive() {
      try {
        // 模拟API调用创建默认档案
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const newArchive = {
          id: `archive_${Date.now()}`,
          name: `${this.getCurrentCameraName()}默认档案`,
          cameraId: this.currentCameraId,
          cameraName: this.getCurrentCameraName(),
          isDefault: true,
          createTime: new Date().toLocaleString()
        };
        
        this.archivesList.push(newArchive);
        
        return newArchive.id;
      } catch (error) {
        console.error('创建默认档案失败:', error);
        this.$message.error('创建默认档案失败');
        return null;
      }
    },
    
    // 获取当前摄像头名称
    getCurrentCameraName() {
      // 实际项目中应该从摄像头数据中获取
      const cameraNames = {
        'camera_1': '可燃气体监控点',
        'camera_2': '储罐区监控点',
        'camera_3': '管道接口监控点'
      };
      return cameraNames[this.currentCameraId] || '监控点';
    },
    
    // 获取当前时间
    getCurrentTime() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },
    
    // 获取当前用户昵称
    getCurrentUserName() {
      // 实际项目中应该从用户登录信息或Vuex store中获取
      // 这里模拟一些用户昵称
      const userNames = ['张工程师', '李主管', '王安全员', '赵技术员', '陈操作员'];
      const savedUserName = localStorage.getItem('currentUserName');
      
      if (savedUserName) {
        return savedUserName;
      } else {
        // 如果没有保存的用户名，随机选择一个并保存
        const randomName = userNames[Math.floor(Math.random() * userNames.length)];
        localStorage.setItem('currentUserName', randomName);
        return randomName;
      }
    },
    
    // 处理误报事件 - 与预警管理页面保持完全一致
    async handleFalseAlarmArchive() {
      try {
        let targetArchiveId = null;
        let archiveName = '';
        
        // 查找或创建默认档案
        const existingDefaultArchive = this.availableArchives.find(archive => archive.isDefault);
        if (existingDefaultArchive) {
          targetArchiveId = existingDefaultArchive.id;
          archiveName = existingDefaultArchive.name;
        } else {
          // 如果没有默认档案，自动创建
          targetArchiveId = await this.createDefaultArchive();
          archiveName = '默认档案';
        }
        
        if (!targetArchiveId) {
          this.$message.error('无法创建默认档案');
          return;
        }
        
        // 保存到智能复判记录
        await this.saveToReviewRecords(this.warning);
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 记录误报操作到历史
        this.addOperationRecord({
          status: 'completed',
          statusText: '误报处理',
          time: this.getCurrentTime(),
          description: `预警被标记为误报并自动归档到：${archiveName}，已保存到智能复判记录`,
          operationType: 'falseAlarm',
          operator: this.getCurrentUserName(),
          archiveInfo: {
            archiveId: targetArchiveId,
            archiveName: archiveName
          }
        });
        
        this.$message.success('误报事件已保存到智能复判');
        this.$emit('handle-false-alarm', this.warning);
        // 不关闭详情对话框，让用户可以继续查看操作历史
      } catch (error) {
        console.error('误报归档失败:', error);
        this.$message.error('误报归档失败');
      } finally {
        this.loading = false;
      }
    },
    
    // 保存到智能复判记录 - 与预警管理页面保持完全一致
    async saveToReviewRecords(warningInfo) {
      try {
        // 创建复判记录数据
        const reviewRecord = {
          id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          originalWarningId: warningInfo.id,
          warningType: warningInfo.type || warningInfo.deviceName,
          deviceName: warningInfo.device || (warningInfo.deviceInfo && warningInfo.deviceInfo.name),
          location: warningInfo.location || (warningInfo.deviceInfo && warningInfo.deviceInfo.position),
          originalTime: warningInfo.time,
          imageUrl: warningInfo.imageUrl,
          level: warningInfo.level,
          description: warningInfo.description,
          reviewResult: 'false_alarm', // 复判结果：误报
          reviewTime: this.getCurrentTime(),
          reviewer: this.getCurrentUserName(),
          reviewReason: '人工标记为误报',
          confidence: 100, // 人工复判置信度100%
          aiReviewResult: null, // AI复判结果（如果有的话）
          aiConfidence: null,
          status: 'completed',
          createTime: this.getCurrentTime()
        };
        
        // 保存到本地存储（实际项目中应该调用API保存到数据库）
        let reviewRecords = JSON.parse(localStorage.getItem('intelligentReviewRecords') || '[]');
        reviewRecords.unshift(reviewRecord);
        
        // 限制记录数量，避免本地存储过大
        if (reviewRecords.length > 1000) {
          reviewRecords = reviewRecords.slice(0, 1000);
        }
        
        localStorage.setItem('intelligentReviewRecords', JSON.stringify(reviewRecords));
        
        // 模拟API调用保存时间
        await new Promise(resolve => setTimeout(resolve, 200));
        
        console.log('误报记录已保存到智能复判:', reviewRecord);
        
      } catch (error) {
        console.error('保存到智能复判记录失败:', error);
        throw error;
      }
    },
    // 获取预警等级文字
    getWarningLevelText(level) {
      // 如果已经是中文格式，直接返回等级部分
      if (level && level.includes('预警')) {
        return level.replace('预警', '');
      }
      
      // 如果是英文格式，转换为中文
      const levelMap = {
        'level1': '一级',
        'level2': '二级',
        'level3': '三级',
        'level4': '四级'
      };
      return levelMap[level] || '未知';
    },
    // 获取预警图标
    getWarningIcon(level) {
      // 如果是中文格式，转换为对应图标
      if (level && level.includes('预警')) {
        const chineseIconMap = {
          '一级预警': 'el-icon-warning',
          '二级预警': 'el-icon-warning-outline',
          '三级预警': 'el-icon-warning-outline',
          '四级预警': 'el-icon-warning-outline'
        };
        return chineseIconMap[level] || 'el-icon-warning';
      }
      
      // 如果是英文格式，使用原有映射
      const iconMap = {
        'level1': 'el-icon-warning',
        'level2': 'el-icon-warning-outline',
        'level3': 'el-icon-warning-outline',
        'level4': 'el-icon-warning-outline'
      };
      return iconMap[level] || 'el-icon-warning';
    },
    // 获取预警等级颜色
    getWarningLevelColor(level) {
      // 如果是中文格式，转换为对应颜色
      if (level && level.includes('预警')) {
        const chineseColorMap = {
          '一级预警': '#f56c6c',
          '二级预警': '#e6a23c',
          '三级预警': '#409EFF',
          '四级预警': '#67c23a'
        };
        return chineseColorMap[level] || '#f56c6c';
      }
      
      // 如果是英文格式，使用原有映射
      const colorMap = {
        'level1': '#f56c6c',
        'level2': '#e6a23c',
        'level3': '#409EFF',
        'level4': '#67c23a'
      };
      return colorMap[level] || '#f56c6c';
    },
    // 获取预警类型文字
    getWarningTypeText(type) {
      const typeMap = {
        '未戴安全帽': '安全违规',
        '未穿工作服': '安全违规',
        '闲杂人员': '人员违规',
        '吸烟': '消防违规',
        '安全帽识别': '安全违规',
        '工服识别': '安全违规',
        '玻璃运输车打卡': '车辆违规',
        '烟火检测': '消防违规'
      };
      return typeMap[type] || '其他违规';
    },
    // 初始化操作历史
    initOperationHistory() {
      if (!this.warning) return;
      
      // 重置操作历史
      this.operationHistory = [];
      
      // 如果预警有保存的操作历史，则直接加载
      if (this.warning.operationHistory && Array.isArray(this.warning.operationHistory) && this.warning.operationHistory.length > 0) {
        this.operationHistory = [...this.warning.operationHistory];
        return;
      }
      
      // 如果没有操作历史，则创建默认的初始记录
      // 添加预警产生记录（始终存在的初始记录）
      this.addOperationRecord({
        status: 'completed',
        statusText: '预警产生',
        time: this.warning.time || this.getCurrentTime(),
        description: `${this.warning.type || '系统检测'}：${this.warning.description || '检测到异常情况，请及时处理'}`,
        operationType: 'create',
        operator: '系统'
      });
      
      // 添加待处理记录（始终显示）
      this.addOperationRecord({
        status: 'active',
        statusText: '待处理',
        time: this.warning.createTime || this.getCurrentTime(),
        description: '预警已产生，等待处理人员确认并开始处理',
        operationType: 'pending',
        operator: ''
      });
    },
    
    // 添加操作记录到历史
    addOperationRecord(record) {
      // 确保记录包含必要字段
      const newRecord = {
        id: Date.now() + Math.random(), // 唯一ID
        status: record.status || 'completed',
        statusText: record.statusText || '操作',
        time: record.time || this.getCurrentTime(),
        description: record.description || '操作完成',
        operationType: record.operationType || 'custom',
        operator: record.operator || this.getCurrentUserName(),
        ...record
      };
      
      // 添加到历史记录开头（最新的在上面）
      this.operationHistory.unshift(newRecord);
      
      // 更新预警对象的操作历史
      if (this.warning) {
        if (!this.warning.operationHistory) {
          this.$set(this.warning, 'operationHistory', []);
        }
        this.warning.operationHistory.unshift(newRecord);
      }
    },
    
    // 检查处理按钮是否应该禁用
    isProcessingDisabled() {
      if (!this.warning || !this.warning.operationHistory || this.warning.operationHistory.length === 0) {
        return false; // 没有历史记录，可以处理
      }
      
      // 如果已归档，禁用处理按钮
      const hasArchived = this.warning.operationHistory.some(record => 
        record.operationType === 'archive' || record.operationType === 'falseAlarm'
      ) || this.warning.status === 'archived';
      
      if (hasArchived) {
        return true;
      }
      
      // 如果已完成处理，禁用处理按钮
      const hasCompletedProcessing = this.warning.operationHistory.some(record => 
        record.operationType === 'completed'
      );
      
      return hasCompletedProcessing;
    },
    // 格式化时间
    formatTime(timeString) {
      try {
        // 如果是完整的时间字符串，格式化为更友好的显示
        if (timeString && timeString.includes(' ')) {
          const [date, time] = timeString.split(' ');
          const [year, month, day] = date.split('-');
          return `${year}年${month}月${day}日 ${time}`;
        }
        return timeString;
      } catch (error) {
        return timeString;
      }
    },
    // 获取复判分类文字
    getReviewClassificationText(type) {
      const typeMap = {
        'manual': '人工审核',
        'auto': '多模态大模型复判'
      };
      return typeMap[type] || '未知复判方式';
    },
    
    // ==================== 简单图片查看器相关方法 ====================
    
    // 打开图片查看器
    openImageViewer() {
      if (this.warning && this.warning.imageUrl) {
        this.imageViewerVisible = true;
      } else {
        this.$message.warning('暂无违规截图');
      }
    },
    
    // 关闭图片查看器
    closeImageViewer() {
      this.imageViewerVisible = false;
    },
    
    // 处理键盘事件
    handleKeydown(event) {
      if (event.key === 'Escape') {
        if (this.imageViewerVisible) {
          this.closeImageViewer();
        } else if (this.videoViewerVisible) {
          this.closeVideoViewer();
        }
      }
    },
    
    // ==================== 视频播放器相关方法 ====================
    
    // 打开视频播放器
    openVideoViewer() {
      this.resetVideoPlayer();
      this.videoViewerVisible = true;
    },
    
    // 关闭视频播放器
    closeVideoViewer() {
      this.videoViewerVisible = false;
      this.resetVideoPlayer();
    },
    
    // 重置视频播放器状态
    resetVideoPlayer() {
      this.isVideoPlaying = false;
      this.videoProgress = 0;
      this.currentTime = '00:00';
      this.volume = 80;
      this.isMuted = false;
    },
    
    // 切换播放/暂停
    toggleVideoPlay() {
      this.isVideoPlaying = !this.isVideoPlaying;
      
      if (this.isVideoPlaying) {
        this.startVideoProgress();
      } else {
        this.stopVideoProgress();
      }
    },
    
    // 开始播放进度更新
    startVideoProgress() {
      this.videoTimer = setInterval(() => {
        if (this.videoProgress < 100) {
          this.videoProgress += 1;
          this.updateCurrentTime();
        } else {
          this.isVideoPlaying = false;
          this.stopVideoProgress();
        }
      }, 1350); // 模拟2分15秒的视频，135秒/100步 = 1.35秒每步
    },
    
    // 停止播放进度更新
    stopVideoProgress() {
      if (this.videoTimer) {
        clearInterval(this.videoTimer);
        this.videoTimer = null;
      }
    },
    
    // 更新当前播放时间
    updateCurrentTime() {
      const totalSeconds = 135; // 2分15秒
      const currentSeconds = Math.floor((this.videoProgress / 100) * totalSeconds);
      const minutes = Math.floor(currentSeconds / 60);
      const seconds = currentSeconds % 60;
      this.currentTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },
    
    // 拖拽进度条
    seekVideo(value) {
      this.videoProgress = value;
      this.updateCurrentTime();
    },
    
    // 切换静音
    toggleMute() {
      this.isMuted = !this.isMuted;
    },
    
    // 切换全屏
    toggleFullscreen() {
    },
    
         // 下载视频
     downloadVideo() {
       // 实际项目中这里应该提供真实的视频下载链接
     }
   },
   
   // 组件销毁时清理定时器
   beforeDestroy() {
     if (this.videoTimer) {
       clearInterval(this.videoTimer);
     }
     // 清理全局事件监听
     document.removeEventListener('mousemove', this.onDrag);
     document.removeEventListener('mouseup', this.endDrag);
   }
 }
</script>

<style scoped>
/* 预警详情容器 */
.warning-detail-container {
  padding: 0;
}

/* 预警详情头部 */
.warning-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.warning-level-badge {
  font-size: 16px;
  font-weight: bold;
  padding: 8px 16px;
  border-radius: 20px;
  color: white;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
}

.warning-detail-time {
  font-size: 14px;
  color: #606266;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  padding: 6px 12px;
  border-radius: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.warning-detail-time i {
  margin-right: 6px;
  color: #409EFF;
}

/* 主要内容区域 */
.warning-detail-main {
  display: flex;
  gap: 24px;
  padding: 0 4px;
  align-items: stretch;
}

/* 左侧内容 */
.warning-left-content {
  flex: 2;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* 右侧内容 */
.warning-right-content {
  flex: 1;
  min-width: 280px;
  display: flex;
  flex-direction: column;
}

/* 预警信息样式 */
.warning-detail-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

/* 信息卡片样式 */
.info-card {
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transition: all 0.3s ease;
}

.info-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #c6e2ff;
}

/* 卡片标题 */
.card-title {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
}

.card-title i {
  margin-right: 8px;
  color: #409EFF;
  font-size: 16px;
}

/* 网格布局 */
.info-grid {
  padding: 16px;
}

.info-row {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-cell {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-cell .label {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-cell .value {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  transition: all 0.2s ease;
}

.info-cell .value:hover {
  background: #ecf5ff;
  border-color: #c6e2ff;
}

/* 复判分类科技感样式 - 渐变字体颜色，统一背景 */
.info-cell .value.review-classification {
  font-weight: 700;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  background: #f8f9fa;
  font-size: 14px;
  letter-spacing: 0.5px;
  position: relative;
  transition: all 0.3s ease;
  display: inline-block;
  min-width: 120px;
  text-align: center;
  text-transform: uppercase;
}

/* 多模态大模型复判 - 蓝紫科技渐变字体 */
.info-cell .value.review-auto {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  border-color: rgba(102, 126, 234, 0.3);
  box-shadow: 0 0 0 1px rgba(102, 126, 234, 0.1);
}

.info-cell .value.review-auto:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  border-color: rgba(102, 126, 234, 0.5);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
  transform: translateY(-1px);
}

/* 人工审核 - 青绿科技渐变字体 */
.info-cell .value.review-manual {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  border-color: rgba(17, 153, 142, 0.3);
  box-shadow: 0 0 0 1px rgba(17, 153, 142, 0.1);
}

.info-cell .value.review-manual:hover {
  background: linear-gradient(135deg, #38ef7d 0%, #11998e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  border-color: rgba(17, 153, 142, 0.5);
  box-shadow: 0 2px 8px rgba(17, 153, 142, 0.2);
  transform: translateY(-1px);
}

/* 还原复判按钮样式 */
.restore-review-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  cursor: pointer;
  margin-left: 8px;
  font-size: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(245, 87, 108, 0.2);
  position: relative;
  top: -1px;
}

.restore-review-btn:hover {
  background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
  transform: scale(1.1) rotate(-5deg);
  box-shadow: 0 4px 8px rgba(245, 87, 108, 0.3);
}

.restore-review-btn:active {
  transform: scale(0.95);
}

.restore-review-btn i {
  font-size: 10px;
  line-height: 1;
}

/* 内容布局 */
.info-content {
  padding: 16px;
}

.info-text .label {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  display: block;
}

.description-content {
  font-size: 14px;
  color: #303133;
  line-height: 1.6;
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  margin: 0;
  white-space: pre-wrap;
}

/* 媒体内容样式 */
.warning-media {
  display: flex;
  gap: 16px;
  flex: 1;
}

.warning-image,
.warning-video-clip {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.media-title {
  font-size: 14px;
  margin: 0 0 12px;
  color: #303133;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.media-title i {
  margin-right: 6px;
  color: #409EFF;
}

.image-container,
.video-container {
  position: relative;
  height: 0;
  padding-bottom: 65%;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.image-container:hover,
.video-container:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.real-image,
.placeholder-image,
.placeholder-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, #1e3c72, #2a5298);
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.real-image {
  background: transparent;
  padding: 0;
  overflow: hidden;
}

.real-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.real-image:hover img {
  transform: scale(1.05);
}

.placeholder-image i,
.placeholder-video i {
  font-size: 36px;
  margin-bottom: 12px;
  opacity: 0.8;
}

.placeholder-image i {
  color: #f56c6c;
  animation: pulse 1.5s infinite;
}

.placeholder-video i {
  color: #409EFF;
}

/* 媒体覆盖层样式 */
.media-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  color: white;
  font-size: 14px;
  z-index: 1;
}

.image-container:hover .media-overlay,
.video-container:hover .media-overlay {
  opacity: 1;
}

.media-overlay i {
  font-size: 48px;
  margin-bottom: 12px;
  color: white !important;
  animation: none;
}

.media-overlay span {
  color: white;
  font-weight: 500;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

/* 处理进展时间线样式 */
.process-timeline {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 12px;
  border: 1px solid #ebeef5;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  /* 高度自适应，与左侧内容区域保持一致 */
  height: 100%;
  display: flex;
  flex-direction: column;
}

.timeline-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  padding: 16px 20px;
  background: linear-gradient(135deg, #409EFF 0%, #36a3f7 100%);
  color: white;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  /* 固定标题高度，不参与滚动 */
  flex-shrink: 0;
}

.timeline-title i {
  margin-right: 8px;
  font-size: 16px;
}

.timeline-container {
  padding: 16px 20px 20px;
  position: relative;
  /* 设置滚动容器，占用剩余空间 */
  flex: 1;
  overflow-y: auto;
  /* 美化滚动条 */
  scrollbar-width: thin;
  scrollbar-color: #c0c4cc #f5f7fa;
}

/* Webkit浏览器滚动条样式 */
.timeline-container::-webkit-scrollbar {
  width: 6px;
}

.timeline-container::-webkit-scrollbar-track {
  background: #f5f7fa;
  border-radius: 3px;
}

.timeline-container::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
  transition: background 0.3s ease;
}

.timeline-container::-webkit-scrollbar-thumb:hover {
  background: #a6a9ad;
}

.timeline-item {
  position: relative;
  padding-left: 24px;
  margin-bottom: 20px;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 20px;
  bottom: -20px;
  width: 2px;
  background: linear-gradient(to bottom, #e4e7ed, #f5f7fa);
}

.timeline-item:last-child::before {
  display: none;
}

.timeline-dot {
  position: absolute;
  left: 0;
  top: 6px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #e4e7ed;
  background: #e4e7ed;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  z-index: 2;
  transition: all 0.3s ease;
}

/* 所有历史时间线项目（除第一个外）使用灰色样式 */
.timeline-container .timeline-item:not(:first-child) .timeline-dot {
  border-color: #e4e7ed !important;
  background: #e4e7ed !important;
  box-shadow: 0 2px 6px rgba(228, 231, 237, 0.3) !important;
  animation: none !important;
}

.timeline-container .timeline-item:not(:first-child) .timeline-content {
  background: #fafbfc !important;
  border-color: #f0f2f5 !important;
}

.timeline-container .timeline-item:not(:first-child) .timeline-status {
  color: #909399 !important;
}

.timeline-container .timeline-item:not(:first-child) .timeline-time {
  color: #c0c4cc !important;
}

.timeline-container .timeline-item:not(:first-child) .timeline-desc {
  color: #c0c4cc !important;
}

.timeline-container .timeline-item:not(:first-child) .timeline-operator {
  color: #c0c4cc !important;
  background: rgba(192, 196, 204, 0.1) !important;
}

/* 所有历史时间线项目的左边框都显示为灰色 */
.timeline-container .timeline-item:not(:first-child) .timeline-content::before {
  background: #e4e7ed !important;
}

/* 最新的时间线项目（第一个）使用动态蓝色圆点 - 优先级最高 */
.timeline-container .timeline-item:first-child .timeline-dot {
  border-color: #409EFF !important;
  background: #409EFF !important;
  box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.2), 0 2px 6px rgba(64, 158, 255, 0.3) !important;
  animation: pulse-latest 2s infinite !important;
}

/* 最新圆点的动态效果 */
@keyframes pulse-latest {
  0% {
    box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.2), 0 2px 6px rgba(64, 158, 255, 0.3);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(64, 158, 255, 0.1), 0 2px 6px rgba(64, 158, 255, 0.3);
  }
  100% {
    box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.2), 0 2px 6px rgba(64, 158, 255, 0.3);
  }
}

/* 移除原有的active和completed状态样式，避免干扰圆点颜色 */
/* .timeline-item.active .timeline-dot {
  border-color: #409EFF;
  background: #409EFF;
  box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.2), 0 2px 6px rgba(0, 0, 0, 0.1);
  animation: pulse-dot 2s infinite;
}

.timeline-item.completed .timeline-dot {
  border-color: #67c23a;
  background: #67c23a;
  box-shadow: 0 2px 6px rgba(103, 194, 58, 0.3);
} */

.timeline-content {
  margin-left: 4px;
  background: #ffffff;
  border-radius: 8px;
  padding: 12px 16px;
  border: 1px solid #f0f2f5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  position: relative;
}

/* 为不同操作类型添加左边框颜色 */
.timeline-content::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: 0 8px 8px 0;
}

/* 预警产生 */
.timeline-item[data-type="create"] .timeline-content::before {
  background: #909399;
}

/* 处理中（初始状态） */
.timeline-item[data-type="processing"] .timeline-content::before {
  background: #409EFF;
}

/* 处理中（操作记录） */
.timeline-item[data-type="processing-action"] .timeline-content::before {
  background: #409EFF;
}

/* 已处理 */
.timeline-item[data-type="completed"] .timeline-content::before {
  background: #67c23a;
}

/* 上报 */
.timeline-item[data-type="report"] .timeline-content::before {
  background: #e6a23c;
}

/* 归档 */
.timeline-item[data-type="archive"] .timeline-content::before {
  background: #f56c6c;
}

/* 误报 */
.timeline-item[data-type="falseAlarm"] .timeline-content::before {
  background: #909399;
}

/* 待处理 */
.timeline-item[data-type="pending"] .timeline-content::before {
  background: #909399;
}

/* 复判相关操作 */
.timeline-item[data-type="review_completed"] .timeline-content::before {
  background: #67c23a;
}

.timeline-item[data-type="review_start"] .timeline-content::before {
  background: #409EFF;
}

.timeline-item.active .timeline-content {
  border-color: #409EFF;
  background: linear-gradient(135deg, #ecf5ff 0%, #f0f9ff 100%);
  box-shadow: 0 3px 12px rgba(64, 158, 255, 0.1);
}

.timeline-item.completed .timeline-content {
  border-color: #f0f9ff;
  background: #fafbfc;
}

.timeline-status {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timeline-operator {
  font-size: 12px;
  color: #909399;
  font-weight: normal;
  background: rgba(144, 147, 153, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  margin-left: 8px;
}

.timeline-item.active .timeline-status {
  color: #409EFF;
}

.timeline-item.completed .timeline-status {
  color: #67c23a;
}

.timeline-time {
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
  font-family: 'Monaco', 'Consolas', monospace;
  min-height: 16px; /* 确保即使没有时间也保持高度 */
}

.timeline-time:empty::before {
  content: '待确定';
  color: #c0c4cc;
  font-style: italic;
}

.timeline-item.active .timeline-time {
  color: #409EFF;
}

.timeline-desc {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  word-break: break-all;
}

.timeline-item.active .timeline-desc {
  color: #409EFF;
  font-weight: 500;
}

/* 为未来步骤添加特殊样式 */
.timeline-item.future {
  opacity: 0.7;
}

.timeline-item.future .timeline-dot {
  border-color: #e4e7ed;
  background: #f5f7fa;
}

.timeline-item.future .timeline-content {
  background: #fafbfc;
  border-color: #f0f2f5;
}

.timeline-item.future .timeline-status {
  color: #c0c4cc;
}

.timeline-item.future .timeline-desc {
  color: #c0c4cc;
}

/* 底部按钮样式 */
.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #ebeef5;
  background: #fafbfc;
}

.action-btn {
  padding: 8px 20px;
  font-size: 14px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.action-btn i {
  margin-right: 6px;
}

.report-btn {
  background-color: transparent;
  border-color: #d1d5db;
  color: #4b5563;
}

.report-btn:hover {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border-color: #3b82f6;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.archive-btn {
  background-color: transparent;
  border-color: #d1d5db;
  color: #4b5563;
}

.archive-btn:hover {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border-color: #3b82f6;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.false-alarm-btn {
  background-color: transparent;
  border-color: #d1d5db;
  color: #4b5563;
}

.false-alarm-btn:hover {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border-color: #3b82f6;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* 处理按钮 - 科技感蓝色交互效果 */
.process-btn {
  background-color: transparent;
  border-color: #d1d5db;
  color: #4b5563;
}

.process-btn:hover {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border-color: #3b82f6;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* 动画效果 */
@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse-dot {
  0% {
    box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.2), 0 2px 6px rgba(0, 0, 0, 0.1);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(64, 158, 255, 0.1), 0 2px 6px rgba(0, 0, 0, 0.1);
  }
  100% {
    box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.2), 0 2px 6px rgba(0, 0, 0, 0.1);
  }
}

/* 对话框样式 */
.confirm-content {
  text-align: center;
  padding: 20px 0;
}

.confirm-content p {
  margin: 8px 0;
  font-size: 14px;
  color: #606266;
}

/* 归档对话框样式 */
.archive-dialog-content {
  padding: 10px 0;
}

.archive-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.archive-selection {
  margin-bottom: 20px;
}

.archive-tip {
  margin-top: 15px;
}

.process-tip {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  border-left: 3px solid #909399;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .warning-detail-main {
    flex-direction: column;
  }
  
  .warning-right-content {
    min-width: auto;
  }
  
  .warning-media {
    flex-direction: column;
  }
  
  .dialog-footer {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .action-btn {
    margin: 4px;
  }
  
  /* 移动端信息卡片调整 */
  .info-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .info-grid {
    padding: 12px;
  }
  
  .card-title {
    padding: 10px 12px;
    font-size: 13px;
  }
  
  .info-content {
    padding: 12px;
  }
  
  .info-cell .value {
    padding: 6px 10px;
    font-size: 13px;
  }
  
  .remark-content,
  .description-content {
    padding: 10px 12px;
    font-size: 13px;
  }
}

/* ==================== 简单图片放大样式 ==================== */
.simple-image-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  animation: fadeIn 0.3s ease-out;
}

.simple-image-container {
  max-width: 60vw;
  max-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  padding: 0;
}

.simple-enlarged-image {
  max-width: 800px;
  max-height: 600px;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  cursor: default;
  animation: zoomIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* ==================== 简单视频播放器样式 ==================== */
.simple-video-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  animation: fadeIn 0.3s ease-out;
}

.simple-video-container {
  max-width: 70vw;
  max-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  padding: 0;
}

.simple-video-player {
  width: 900px;
  max-width: 100%;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  animation: zoomIn 0.3s ease-out;
  cursor: default;
}

/* 通用视频播放相关样式 */

.video-preview {
  position: relative;
  height: 450px;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px 8px 0 0;
}

.video-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.8);
}

/* 播放覆盖层样式已移除 - 按需求去掉视频中央播放键 */

/* 简化的视频控制条 - 毛玻璃效果 */
.simple-video-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0 0 8px 8px;
  box-shadow: 0 -4px 25px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.progress-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 16px;
}

.time-display {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-family: 'Monaco', 'Consolas', monospace;
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  flex-shrink: 0;
}

.progress-bar {
  flex: 1;
}

.progress-bar .el-slider__runway {
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  height: 4px;
  border-radius: 2px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}

.progress-bar .el-slider__bar {
  background: linear-gradient(90deg, #409EFF 0%, #66b3ff 100%);
  border-radius: 2px;
  box-shadow: 0 1px 6px rgba(64, 158, 255, 0.3);
}

.progress-bar .el-slider__button {
  width: 14px;
  height: 14px;
  border: 2px solid #409EFF;
  background: radial-gradient(circle, white 0%, #f0f8ff 100%);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.4);
  transition: all 0.3s ease;
}

.progress-bar .el-slider__button:hover {
  transform: scale(1.1);
  box-shadow: 0 3px 12px rgba(64, 158, 255, 0.6);
}

.simple-video-controls .el-button {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.simple-video-controls .el-button:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.simple-video-controls .el-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}



/* 媒体查看器响应式调整 */
@media (max-width: 768px) {
  .simple-image-container {
    max-width: 85vw;
    max-height: 70vh;
    padding: 0;
  }
  
  .simple-enlarged-image {
    max-width: 90vw;
    max-height: 60vh;
    border-radius: 6px;
  }
  
  .simple-video-container {
    max-width: 90vw;
    max-height: 80vh;
  }
  
  .simple-video-player {
    width: 100%;
  }
  
  .simple-video-controls {
    flex-direction: column;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
  }
  
  .progress-container {
    order: 1;
    margin: 0;
    width: 100%;
    flex-direction: column;
    gap: 8px;
  }
  
  .progress-bar {
    width: 100%;
  }
  
  .simple-video-controls .el-button {
    order: 2;
  }
  
  .video-preview {
    height: 300px;
  }
}

@media (max-width: 480px) {
  .simple-enlarged-image {
    max-width: 95vw;
    max-height: 50vh;
  }
}
</style> 