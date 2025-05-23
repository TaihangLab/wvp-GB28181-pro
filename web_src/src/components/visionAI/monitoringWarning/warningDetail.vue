<template>
  <el-dialog
    title="预警详情"
    :visible.sync="dialogVisible"
    width="700px"
    :before-close="handleClose">
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
            <span class="value" style="color: #303133; font-weight: 500; background: rgba(103, 194, 58, 0.1); padding: 0 8px; border-radius: 4px;">{{ warning.location || '未知位置' }}</span>
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
    <span slot="footer" class="dialog-footer" style="display: flex; justify-content: flex-end; gap: 10px;">
      <el-button @click="closeDialog" style="padding: 10px 20px;">关闭</el-button>
      <el-button type="success" @click="handleWarning" style="padding: 10px 20px;">
        <i class="el-icon-check" style="margin-right: 5px;"></i>
        立即处理
      </el-button>
    </span>
  </el-dialog>
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
    }
  },
  data() {
    return {
      dialogVisible: false
    }
  },
  watch: {
    visible: {
      handler(val) {
        this.dialogVisible = val;
      },
      immediate: true
    }
  },
  methods: {
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
    // 处理预警
    handleWarning() {
      this.$emit('handle-warning', this.warning);
      this.closeDialog();
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
</style> 