<template>
  <div>
    <el-dialog
      title="预警详情"
      :visible.sync="dialogVisible"
      width="700px"
      :before-close="handleClose"
      v-loading="loading"
      element-loading-text="处理中...">
      <div v-if="warning" class="warning-detail-container">
      <div class="warning-detail-header" style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; background: linear-gradient(to right, #f5f7fa, #f9fafc); border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);">
        <div style="font-size: 16px; font-weight: bold; padding: 6px 14px; border-radius: 4px; color: white; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15); background-color: #f56c6c;"
             :style="{'background-color': getWarningLevelColor(warning.level)}">
          {{ getWarningLevelText(warning.level) }}预警
        </div>
        <div class="warning-detail-time" style="font-size: 14px; color: #606266; display: flex; align-items: center; background: rgba(0, 0, 0, 0.03); padding: 4px 12px; border-radius: 20px;">
          <i class="el-icon-time" style="margin-right: 5px; color: #409EFF;"></i>
          {{ warning.time }}
        </div>
      </div>
      
      <div class="warning-detail-content" style="padding: 0 20px 20px;">
        <div class="warning-detail-info" style="margin-bottom: 25px; background-color: #f9f9f9; padding: 20px; border-radius: 8px; border-left: 4px solid #409EFF; box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.03);">
          <div class="info-item" style="display: flex; margin-bottom: 15px; line-height: 1.6;">
            <span class="label" style="color: #606266; width: 90px; flex-shrink: 0; font-weight: 500;">设备名称：</span>
            <span class="value" style="color: #303133; font-weight: 500; background: rgba(64, 158, 255, 0.1); padding: 0 8px; border-radius: 4px;">{{ warning.device }}</span>
          </div>
          <div class="info-item" style="display: flex; margin-bottom: 15px; line-height: 1.6;">
            <span class="label" style="color: #606266; width: 90px; flex-shrink: 0; font-weight: 500;">预警名称：</span>
            <span class="value" style="color: #f56c6c; font-weight: 500; background: rgba(245, 108, 108, 0.1); padding: 0 8px; border-radius: 4px;">{{ warning.type }}</span>
          </div>
          <div class="info-item" style="display: flex; margin-bottom: 15px; line-height: 1.6;">
            <span class="label" style="color: #606266; width: 90px; flex-shrink: 0; font-weight: 500;">预警类型：</span>
            <span class="value" style="color: #e6a23c; font-weight: 500; background: rgba(230, 162, 60, 0.1); padding: 0 8px; border-radius: 4px;">{{ getWarningTypeText(warning.type) }}</span>
          </div>
          <div class="info-item" style="display: flex; margin-bottom: 15px; line-height: 1.6;">
            <span class="label" style="color: #606266; width: 90px; flex-shrink: 0; font-weight: 500;">违规位置：</span>
            <span class="value" style="color: #303133; font-weight: 500; background: rgba(103, 194, 58, 0.1); padding: 0 8px; border-radius: 4px;">{{ warning.location || (warning.deviceInfo && warning.deviceInfo.position) || '未知位置' }}</span>
          </div>
          <div class="info-item" style="display: flex; margin-bottom: 15px; line-height: 1.6;" v-if="warning.remark">
            <span class="label" style="color: #606266; width: 90px; flex-shrink: 0; font-weight: 500;">处理备注：</span>
            <span class="value" style="color: #67c23a; font-weight: 500; background: rgba(103, 194, 58, 0.1); padding: 0 8px; border-radius: 4px;">{{ warning.remark }}</span>
          </div>
          <div class="info-item" style="display: flex; line-height: 1.6;">
            <span class="label" style="color: #606266; width: 90px; flex-shrink: 0; font-weight: 500; align-self: flex-start;">预警描述：</span>
            <span class="value" style="color: #303133; font-weight: 500; background: rgba(230, 162, 60, 0.1); padding: 8px; border-radius: 4px; text-align: left; line-height: 1.6;">{{ warning.description || '检测到工作人员未佩戴安全帽，存在安全隐患，请立即整改' }}</span>
          </div>
        </div>
        
        <div class="warning-media" style="display: flex; gap: 20px;">
          <div class="warning-image" style="flex: 1; display: flex; flex-direction: column;">
            <h4 style="font-size: 15px; margin: 0 0 12px; color: #303133; font-weight: 600; display: flex; align-items: center;">
              <i class="el-icon-picture" style="margin-right: 6px; color: #409EFF;"></i>
              违规截图
            </h4>
            <div class="image-container" style="position: relative; height: 0; padding-bottom: 75%; background-color: #000; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
              <div class="placeholder-image" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(45deg, #1e3c72, #2a5298);">
                <i :class="getWarningIcon(warning.level)" style="font-size: 48px;"></i>
                <span style="margin-top: 15px;">违规截图</span>
              </div>
            </div>
          </div>
          
          <div class="warning-video-clip" style="flex: 1; display: flex; flex-direction: column;">
            <h4 style="font-size: 15px; margin: 0 0 12px; color: #303133; font-weight: 600; display: flex; align-items: center;">
              <i class="el-icon-video-camera" style="margin-right: 6px; color: #409EFF;"></i>
              视频片段
            </h4>
            <div class="video-container" style="position: relative; height: 0; padding-bottom: 75%; background-color: #000; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
              <div class="placeholder-video" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(45deg, #1e3c72, #2a5298);">
                <i class="el-icon-video-camera" style="font-size: 48px;"></i>
                <span style="margin-top: 15px;">视频片段</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <span slot="footer" class="dialog-footer" style="display: flex; justify-content: center; gap: 10px;">
      <!-- 实时监控页面显示所有按钮 -->
      <template v-if="source === 'realTimeMonitoring'">
        <el-button @click="handleReport" style="padding: 10px 20px; background-color: #e6a23c; border-color: #e6a23c; color: white;">
          <i class="el-icon-upload" style="margin-right: 5px;"></i>
          上报
        </el-button>
        <el-button @click="handleArchive" style="padding: 10px 20px; background-color: #f56c6c; border-color: #f56c6c; color: white;">
          <i class="el-icon-folder" style="margin-right: 5px;"></i>
          归档
        </el-button>
        <el-button @click="handleFalseAlarm" style="padding: 10px 20px; background-color: #909399; border-color: #909399; color: white;">
          <i class="el-icon-close" style="margin-right: 5px;"></i>
          误报
        </el-button>
        <el-button type="success" @click="handleWarning" style="padding: 10px 20px;">
          <i class="el-icon-check" style="margin-right: 5px;"></i>
          处理
        </el-button>
        <el-button @click="closeDialog" style="padding: 10px 20px;">
          关闭
        </el-button>
      </template>
      <!-- 预警管理页面只显示处理和关闭按钮 -->
      <template v-else-if="source === 'warningManagement'">
        <el-button type="success" @click="handleWarning" style="padding: 10px 20px;">
          <i class="el-icon-check" style="margin-right: 5px;"></i>
          立即处理
        </el-button>
        <el-button @click="closeDialog" style="padding: 10px 20px;">
          关闭
        </el-button>
      </template>
      <!-- 预警档案页面只显示关闭按钮 -->
      <template v-else-if="source === 'warningArchives'">
        <el-button @click="closeDialog" style="padding: 10px 20px;">
          关闭
        </el-button>
      </template>
      <!-- 默认情况显示处理和关闭按钮 -->
      <template v-else>
        <el-button type="success" @click="handleWarning" style="padding: 10px 20px;">
          <i class="el-icon-check" style="margin-right: 5px;"></i>
          立即处理
        </el-button>
        <el-button @click="closeDialog" style="padding: 10px 20px;">
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
            
            <el-form-item>
              <el-button 
                type="text" 
                icon="el-icon-plus"
                @click="showCreateArchiveDialog"
                style="padding: 0;"
              >
                创建新档案
              </el-button>
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

    <!-- 创建档案对话框 -->
    <el-dialog
      title="创建新档案"
      :visible.sync="createArchiveDialogVisible"
      width="35%"
      center
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form :model="newArchiveForm" label-width="80px">
        <el-form-item label="档案名称" required>
          <el-input
            v-model="newArchiveForm.name"
            placeholder="请输入档案名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="档案描述">
          <el-input
            v-model="newArchiveForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入档案描述（可选）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item>
          <el-alert
            :title="`档案将关联到：${getCurrentCameraName()}`"
            type="info"
            :closable="false"
            show-icon
          />
        </el-form-item>
      </el-form>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeCreateArchiveDialog">取 消</el-button>
        <el-button type="primary" @click="createNewArchive">创建档案</el-button>
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
      // 创建档案相关
      createArchiveDialogVisible: false,
      newArchiveForm: {
        name: '',
        description: ''
      }
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
          this.$message.success('已标记为已处理');
          this.$emit('handle-warning', this.warning);
          this.closeDialog();
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
      this.handleWarningAction('markProcessed');
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
    
    // 显示创建新档案对话框
    showCreateArchiveDialog() {
      this.createArchiveDialogVisible = true;
    },
    
    // 创建新档案
    async createNewArchive() {
      if (!this.newArchiveForm.name.trim()) {
        this.$message.warning('请输入档案名称');
        return;
      }
      
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const newArchive = {
          id: `archive_${Date.now()}`,
          name: this.newArchiveForm.name,
          cameraId: this.currentCameraId,
          cameraName: this.getCurrentCameraName(),
          isDefault: false,
          description: this.newArchiveForm.description,
          createTime: new Date().toLocaleString()
        };
        
        this.archivesList.push(newArchive);
        this.selectedArchiveId = newArchive.id;
        
        this.$message.success('档案创建成功');
        this.closeCreateArchiveDialog();
      } catch (error) {
        console.error('创建档案失败:', error);
        this.$message.error('创建档案失败');
      }
    },
    
    // 关闭创建档案对话框
    closeCreateArchiveDialog() {
      this.createArchiveDialogVisible = false;
      this.newArchiveForm = {
        name: '',
        description: ''
      };
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
.warning-media .placeholder-image,
.warning-media .placeholder-video {
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

.warning-media .placeholder-image i,
.warning-media .placeholder-video i {
  opacity: 0.8;
  margin-bottom: 10px;
}

.warning-media .placeholder-image i.el-icon-warning {
  color: #f56c6c;
  animation: pulse 1.5s infinite;
}

.warning-media .placeholder-video i.el-icon-video-camera {
  color: #409EFF;
}

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
</style> 