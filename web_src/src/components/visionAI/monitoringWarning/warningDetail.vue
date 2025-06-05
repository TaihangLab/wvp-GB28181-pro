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
            {{ warning.time }}
          </div>
        </div>
        
        <!-- 主要内容区域 -->
        <div class="warning-detail-main">
          <!-- 左侧：预警信息和媒体内容 -->
          <div class="warning-left-content">
            <!-- 预警信息 -->
            <div class="warning-detail-info">
              <div class="info-item">
                <span class="label">设备名称：</span>
                <span class="value device-name">{{ warning.device }}</span>
              </div>
              <div class="info-item">
                <span class="label">预警名称：</span>
                <span class="value warning-name">{{ warning.type }}</span>
              </div>
              <div class="info-item">
                <span class="label">预警类型：</span>
                <span class="value warning-type">{{ getWarningTypeText(warning.type) }}</span>
              </div>
              <div class="info-item">
                <span class="label">违规位置：</span>
                <span class="value location">{{ warning.location || (warning.deviceInfo && warning.deviceInfo.position) || '未知位置' }}</span>
              </div>
              <div class="info-item" v-if="warning.remark">
                <span class="label">处理备注：</span>
                <span class="value remark">{{ warning.remark }}</span>
              </div>
              <div class="info-item description-item">
                <span class="label">预警描述：</span>
                <span class="value description">{{ warning.description || '检测到工作人员未佩戴安全帽，存在安全隐患，请立即整改' }}</span>
              </div>
            </div>
            
            <!-- 媒体内容 -->
            <div class="warning-media">
              <div class="warning-image">
                <h4 class="media-title">
                  <i class="el-icon-picture"></i>
                  违规截图
                </h4>
                <div class="image-container">
                  <div class="placeholder-image">
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
                <div class="video-container">
                  <div class="placeholder-video">
                    <i class="el-icon-video-camera"></i>
                    <span>视频片段</span>
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
                  v-for="(item, index) in processTimeline" 
                  :key="index"
                  class="timeline-item"
                  :class="{ 
                    'active': item.status === 'active', 
                    'completed': item.status === 'completed',
                    'future': item.status === 'future'
                  }"
                >
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <div class="timeline-status">{{ item.statusText }}</div>
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
          <el-button @click="handleReport" class="action-btn report-btn">
            <i class="el-icon-upload"></i>
            上报
          </el-button>
          <el-button @click="handleArchive" class="action-btn archive-btn">
            <i class="el-icon-folder"></i>
            归档
          </el-button>
          <el-button @click="handleFalseAlarm" class="action-btn false-alarm-btn">
            <i class="el-icon-close"></i>
            误报
          </el-button>
          <template v-if="warning && warning.status === 'completed'">
            <el-button type="success" disabled class="action-btn">
              <i class="el-icon-check"></i>
              已处理
            </el-button>
          </template>
          <template v-else>
            <el-button type="success" @click="handleWarning" class="action-btn">
              <i class="el-icon-check"></i>
              处理
            </el-button>
          </template>
        </template>
        <!-- 预警管理页面只显示处理和关闭按钮 -->
        <template v-else-if="source === 'warningManagement'">
        </template>
        <!-- 预警档案页面只显示关闭按钮 -->
        <template v-else-if="source === 'warningArchives'">
        </template>
        <!-- 默认情况显示处理和关闭按钮 -->
        <template v-else>
          <template v-if="warning && warning.status === 'completed'">
            <el-button type="success" disabled class="action-btn">
              <i class="el-icon-check"></i>
              已处理
            </el-button>
          </template>
          <template v-else>
            <el-button type="success" @click="handleWarning" class="action-btn">
              <i class="el-icon-check"></i>
              处理
            </el-button>
          </template>
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
        <span style="color: #909399; font-size: 13px;">填写处理意见后，该预警将被标记为已处理状态</span>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeRemarkDialog">取 消</el-button>
        <el-button type="primary" @click="saveRemark">确认处理</el-button>
      </span>
    </el-dialog>

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
    }
  },
  watch: {
    visible: {
      handler(val) {
        this.dialogVisible = val;
        if (val && this.warning) {
          // 当对话框打开时，初始化档案数据
          this.initArchivesList();
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.initArchivesList();
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
    },
    // 处理进展时间线
    processTimeline() {
      if (!this.warning) return [];
      
      const timeline = [];
      
      // 预警产生 - 始终是完成状态
      timeline.push({
        status: 'completed',
        statusText: '预警产生',
        time: this.warning.time || '2025-06-03 15:17:28',
        description: `${this.warning.type || '系统检测'}：${this.warning.description || '检测到异常情况，请及时处理'}`
      });
      
      // 待处理节点 - 始终显示
      const isPending = this.warning.status === 'pending';
      timeline.push({
        status: isPending ? 'active' : 'completed',
        statusText: '待处理',
        time: this.warning.createTime || this.getCurrentTime(),
        description: isPending ? '等待处理人员确认并处理' : '预警已进入处理流程'
      });
      
      // 处理完成节点
      if (this.warning.status === 'completed') {
        // 已经处理完成
        timeline.push({
          status: 'completed',
          statusText: '处理完成',
          time: this.warning.processTime || this.getCurrentTime(),
          description: this.warning.remark || '预警处理完成'
        });
      } else if (this.warning.status === 'pending') {
        // 还在待处理状态，显示未来的处理完成节点
        timeline.push({
          status: 'future',
          statusText: '处理完成',
          time: '',
          description: '请填写处理意见完成预警处理'
        });
      }
      
      // 归档节点逻辑优化
      if (this.warning.status === 'archived') {
        // 已归档状态 - 显示完成
        timeline.push({
          status: 'completed',
          statusText: '已归档',
          time: this.warning.archiveTime || this.getCurrentTime(),
          description: this.warning.isFalseAlarm ? '误报已归档，处理流程结束' : '预警已归档，处理流程结束'
        });
      } else if (this.warning.status === 'completed') {
        // 处理完成但未归档 - 显示为活跃状态，提示用户可以进行归档操作
        timeline.push({
          status: 'active',
          statusText: '归档处理',
          time: '',
          description: '可选择将预警归档至相应档案'
        });
      } else if (this.warning.status === 'pending') {
        // 待处理状态 - 显示为未来步骤
        timeline.push({
          status: 'future',
          statusText: '归档处理',
          time: '',
          description: '处理完成后可进行归档操作'
        });
      }
      
      return timeline.reverse(); // 最新的在上面
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
          // 误报 - 自动归档到默认档案
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
      // 弹出处理意见对话框
      this.remarkDialogVisible = true;
    },
    
    // 保存处理意见并完成处理
    async saveRemark() {
      if (!this.remarkForm.remark.trim()) {
        this.$message.warning('请输入处理意见');
        return;
      }
      
      try {
        this.loading = true;
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 更新预警状态和备注 - 使用Vue.set确保响应式更新
        if (this.warning) {
          this.$set(this.warning, 'status', 'completed');
          this.$set(this.warning, 'remark', this.remarkForm.remark);
          this.$set(this.warning, 'processTime', this.getCurrentTime());
        }
        
        this.$message.success('处理完成，处理意见已保存');
        this.$emit('handle-warning', this.warning);
        this.closeRemarkDialog();
        
        // 强制更新视图，确保按钮状态立即变化
        this.$nextTick(() => {
          this.$forceUpdate();
        });
      } catch (error) {
        console.error('处理失败:', error);
        this.$message.error('处理失败');
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
        
        this.$message.success('预警已成功上报');
        this.$emit('handle-report', this.warning);
        this.closeReportDialog();
        this.closeDialog();
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
        
        // 如果没有选择档案，自动创建默认档案
        if (!targetArchiveId) {
          targetArchiveId = await this.createDefaultArchive();
        }
        
        if (!targetArchiveId) {
          this.$message.error('无法创建默认档案');
          return;
        }
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));
        
        this.$message.success('预警已成功归档');
        this.$emit('handle-archive', this.warning);
        this.closeArchiveDialog();
        this.closeDialog();
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
        this.$message.success('已自动创建默认档案');
        
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
    
    // 处理误报事件 - 复制预警管理页面的逻辑
    async handleFalseAlarmArchive() {
      try {
        let targetArchiveId = null;
        
        // 查找或创建默认档案
        const existingDefaultArchive = this.availableArchives.find(archive => archive.isDefault);
        if (existingDefaultArchive) {
          targetArchiveId = existingDefaultArchive.id;
        } else {
          // 如果没有默认档案，自动创建
          targetArchiveId = await this.createDefaultArchive();
        }
        
        if (!targetArchiveId) {
          this.$message.error('无法创建默认档案');
          return;
        }
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 300));
        
        this.$message.success('误报已自动归档到默认档案');
        this.$emit('handle-false-alarm', this.warning);
        this.closeDialog();
      } catch (error) {
        console.error('误报归档失败:', error);
        this.$message.error('误报归档失败');
      } finally {
        this.loading = false;
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
    }
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
}

/* 左侧内容 */
.warning-left-content {
  flex: 2;
  min-width: 0;
}

/* 右侧内容 */
.warning-right-content {
  flex: 1;
  min-width: 280px;
}

/* 预警信息样式 */
.warning-detail-info {
  background: linear-gradient(135deg, #f9f9f9 0%, #f5f7fa 100%);
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid #409EFF;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  margin-bottom: 12px;
  line-height: 1.6;
  align-items: flex-start;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  color: #606266;
  width: 80px;
  flex-shrink: 0;
  font-weight: 500;
  font-size: 13px;
}

.info-item .value {
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 13px;
  flex: 1;
}

.info-item .device-name {
  color: #303133;
  background: rgba(64, 158, 255, 0.1);
}

.info-item .warning-name {
  color: #f56c6c;
  background: rgba(245, 108, 108, 0.1);
}

.info-item .warning-type {
  color: #e6a23c;
  background: rgba(230, 162, 60, 0.1);
}

.info-item .location {
  color: #303133;
  background: rgba(103, 194, 58, 0.1);
}

.info-item .remark {
  color: #67c23a;
  background: rgba(103, 194, 58, 0.1);
}

.description-item {
  align-items: flex-start;
}

.info-item .description {
  color: #303133;
  background: rgba(230, 162, 60, 0.1);
  padding: 8px 12px;
  line-height: 1.6;
  text-align: left;
}

/* 媒体内容样式 */
.warning-media {
  display: flex;
  gap: 16px;
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
}

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

/* 处理进展时间线样式 */
.process-timeline {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 12px;
  border: 1px solid #ebeef5;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
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
}

.timeline-title i {
  margin-right: 8px;
  font-size: 16px;
}

.timeline-container {
  padding: 16px 20px 20px;
  position: relative;
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
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  z-index: 2;
  transition: all 0.3s ease;
}

.timeline-item.active .timeline-dot {
  border-color: #409EFF;
  background: #409EFF;
  box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.2), 0 2px 6px rgba(0, 0, 0, 0.1);
  animation: pulse-dot 2s infinite;
}

.timeline-item.completed .timeline-dot {
  border-color: #67c23a;
  background: #67c23a;
  box-shadow: 0 2px 6px rgba(103, 194, 58, 0.3);
}

.timeline-content {
  margin-left: 4px;
  background: #ffffff;
  border-radius: 8px;
  padding: 12px 16px;
  border: 1px solid #f0f2f5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
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
  background-color: #e6a23c;
  border-color: #e6a23c;
  color: white;
}

.report-btn:hover {
  background-color: #eeb462;
  border-color: #eeb462;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(230, 162, 60, 0.3);
}

.archive-btn {
  background-color: #f56c6c;
  border-color: #f56c6c;
  color: white;
}

.archive-btn:hover {
  background-color: #f78989;
  border-color: #f78989;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
}

.false-alarm-btn {
  background-color: #909399;
  border-color: #909399;
  color: white;
}

.false-alarm-btn:hover {
  background-color: #a6a9ad;
  border-color: #a6a9ad;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(144, 147, 153, 0.3);
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
}
</style> 