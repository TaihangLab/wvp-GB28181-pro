<template>
  <div class="multimodal-create-wrapper">
    <div class="multimodal-create">
      <!-- 统一卡片容器 -->
      <div class="page-container">
        <!-- 头部导航 -->
        <div class="header-section">
          <div class="header-left">
            <el-button icon="el-icon-arrow-left" type="text" @click="goBack">
              创建技能
            </el-button>
          </div>
          <div class="header-right">
            <el-button @click="saveDraft">完成</el-button>
            <el-button type="primary" @click="saveAndPublish">保存并上线</el-button>
          </div>
        </div>

        <!-- 主内容区域 -->
        <div class="content-container">
          <!-- 左侧基本参数 -->
          <div class="left-panel">
            <div class="params-card">
              <div class="panel-title">基本参数</div>
              
              <div class="form-section">
              <!-- 技能名称 -->
              <div class="form-item">
                <label class="form-label required">技能名称:</label>
                <el-input 
                  v-model="skillForm.name" 
                  placeholder="请输入技能名称"
                  maxlength="30"
                  show-word-limit
                  class="form-input">
                </el-input>
                <div class="form-tips">
                  仅支持数字、中文、大小写英文字母、非特殊符号；不允许空白符，不超过30字符
                </div>
              </div>

              <!-- 技能分类 -->
              <div class="form-item">
                <label class="form-label">技能分类:</label>
                <el-select 
                  v-model="skillForm.category" 
                  placeholder="请输入"
                  class="form-input">
                  <el-option label="事件检测" value="事件检测"></el-option>
                  <el-option label="安全" value="安全"></el-option>
                  <el-option label="质量总站测试-功能" value="质量总站测试-功能"></el-option>
                </el-select>
                <div class="form-tips">
                  可添加三个分类，点击"回车"确认
                </div>
              </div>

              <!-- 技能描述 -->
              <div class="form-item">
                <label class="form-label required">技能描述:</label>
                <el-input 
                  v-model="skillForm.description"
                  type="textarea"
                  placeholder="请明确说明您期待的分析功能和业务场景，例如：【目标】对厂（井）区燃煤分析【输入】燃煤图片【输出】给出精确的燃煤成分含量【应用于】燃煤企业成分检测"
                  :rows="6"
                  maxlength="1000"
                  show-word-limit
                  class="form-textarea">
                </el-input>
                <div class="form-link">
                  <el-button type="text" @click="showDescriptionExample">技能描述示例</el-button>
                </div>
              </div>
              </div>
            </div>
          </div>

          <!-- 右侧验证和结果 -->
          <div class="right-panel">
            <!-- 效果验证卡片 -->
            <div class="verification-card">
              <div class="verification-section">
                <div class="section-header">
                  <span class="section-title">效果验证</span>
                  <el-button 
                    icon="el-icon-delete" 
                    type="text" 
                    size="small" 
                    class="clear-btn"
                    @click="clearUpload">
                    清空
                  </el-button>
                </div>
                
                <div class="upload-area">
                  <el-upload
                    class="upload-dragger"
                    drag
                    :action="uploadAction"
                    :before-upload="beforeUpload"
                    :on-success="handleUploadSuccess"
                    :on-error="handleUploadError"
                    :file-list="fileList"
                    :auto-upload="false"
                    accept=".jpg,.jpeg,.png">
                    <div class="upload-content">
                      <i class="el-icon-upload upload-icon"></i>
                      <div class="upload-text">将文件拖拽此处，或点击上传</div>
                      <div class="upload-tips">文件大小不超过 20MB 内，支持JPEG、JPG、PNG格式</div>
                    </div>
                  </el-upload>
                </div>
              </div>
            </div>

            <!-- 开始分析按钮 - 放在两个卡片中间 -->
            <div class="analysis-action">
              <el-button 
                type="primary" 
                icon="el-icon-cpu"
                :loading="analyzing"
                @click="startAnalysis"
                :disabled="!canAnalyze"
                class="analysis-btn">
                {{ analyzing ? '分析中...' : '开始分析' }}
              </el-button>
              <div class="analysis-tips">
                使用多模式大模型服务全程协助，计费时间计费 <el-button type="text">查看工时</el-button>
              </div>
            </div>

            <!-- AI分析结果卡片 -->
            <div class="result-card">
              <div class="result-section">
                <div class="section-header">
                  <span class="section-title">AI 分析结果</span>
                </div>
                
                <div class="result-content">
                  <div v-if="!analysisResult" class="empty-result">
                    <i class="el-icon-warning-outline empty-icon"></i>
                    <div class="empty-text">暂无分析结果，请先配置参数并上传验证数据</div>
                  </div>
                  <div v-else class="analysis-result">
                    {{ analysisResult }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MultimodalCreate',
  data() {
    return {
      skillForm: {
        name: '',
        category: '',
        description: ''
      },
      fileList: [],
      uploadAction: '#',
      analyzing: false,
      analysisResult: '',
    }
  },
  computed: {
    canAnalyze() {
      return this.skillForm.name && 
             this.skillForm.description && 
             this.fileList.length > 0
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },

    saveDraft() {
      if (!this.validateForm()) return
      
      this.$message.success('技能已保存为草稿')
      // 这里可以调用API保存草稿
    },

    saveAndPublish() {
      if (!this.validateForm()) return
      
      this.$confirm('确认保存并上线该技能吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        // 这里可以调用API保存并上线
        this.$message.success('技能已保存并上线')
        this.$router.push('/skillManage/multimodalReview')
      }).catch(() => {
        this.$message.info('已取消操作')
      })
    },

    validateForm() {
      if (!this.skillForm.name) {
        this.$message.warning('请输入技能名称')
        return false
      }
      if (!this.skillForm.description) {
        this.$message.warning('请输入技能描述')
        return false
      }
      return true
    },

    beforeUpload(file) {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)
      const isLt20M = file.size / 1024 / 1024 < 20

      if (!isValidType) {
        this.$message.error('只支持JPEG、JPG、PNG格式的图片!')
        return false
      }
      if (!isLt20M) {
        this.$message.error('上传文件大小不能超过 20MB!')
        return false
      }
      
      // 手动添加到文件列表
      this.fileList.push({
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
        raw: file
      })
      
      return false // 阻止自动上传
    },

    handleUploadSuccess(response, file, fileList) {
      this.$message.success('文件上传成功')
    },

    handleUploadError(err, file, fileList) {
      this.$message.error('文件上传失败')
    },

    clearUpload() {
      this.fileList = []
      this.analysisResult = ''
    },

    startAnalysis() {
      if (!this.canAnalyze) {
        this.$message.warning('请先填写完整信息并上传验证文件')
        return
      }

      this.analyzing = true
      
      // 模拟分析过程
      setTimeout(() => {
        this.analyzing = false
        this.analysisResult = '分析完成：检测到明火区域，置信度95.2%，位置坐标(125, 89)，建议立即采取安全措施。'
        this.$message.success('分析完成')
      }, 3000)
    },

    showDescriptionExample() {
      this.$alert(
        '示例1：【目标】检测矿井是否出现明火【输入】矿井监控图片【输出】明火检测结果和位置【应用于】矿山安全监控\n\n' +
        '示例2：【目标】识别工人是否佩戴安全帽【输入】作业现场图片【输出】安全帽佩戴情况【应用于】施工安全管理',
        '技能描述示例',
        {
          confirmButtonText: '确定',
          type: 'info'
        }
      )
    }
  }
}
</script>

<style scoped>
.multimodal-create-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.multimodal-create {
  padding: 20px;
  background-color: #f5f5f5;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
}

.page-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  height: calc(100vh - 80px);
}

.page-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.05) 50%, transparent 100%);
  z-index: 1;
}

.header-section {
  background: white;
  padding: 12px 24px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  min-height: 30px;
}

.header-left .el-button {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  padding: 0;
}

.header-left .el-button:hover {
  color: #7c3aed;
}

.header-right {
  display: flex;
  gap: 12px;
}

.header-right .el-button {
  height: 32px;
  padding: 6px 16px;
  font-size: 14px;
  border-radius: 6px;
  font-weight: 500;
}

.header-right .el-button--primary {
  background: #7c3aed;
  border-color: #7c3aed;
  box-shadow: 0 2px 4px rgba(124, 58, 237, 0.3);
}

.header-right .el-button:not(.el-button--primary) {
  background: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
}

.header-right .el-button:not(.el-button--primary):hover {
  background: #f5f3ff;
  border-color: #c4b5fd;
  color: #7c3aed;
}

.content-container {
  flex: 1;
  display: flex;
  gap: 24px;
  padding: 20px 24px 24px 24px;
  overflow: hidden;
  position: relative;
  z-index: 2;
}

.left-panel {
  width: 480px;
  flex-shrink: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding-right: 12px;
}

.params-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.params-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg,
      rgba(139, 69, 237, 0.12) 0%,
      rgba(99, 102, 241, 0.10) 25%,
      rgba(59, 130, 246, 0.08) 50%,
      rgba(139, 69, 237, 0.06) 75%,
      rgba(99, 102, 241, 0.04) 100%);
  border-radius: 12px;
  pointer-events: none;
  z-index: 1;
}

.params-card > * {
  position: relative;
  z-index: 2;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  overflow: hidden;
  padding-left: 12px;
}

.verification-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
  overflow: hidden;
}

.verification-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg,
      rgba(139, 69, 237, 0.12) 0%,
      rgba(99, 102, 241, 0.10) 25%,
      rgba(59, 130, 246, 0.08) 50%,
      rgba(139, 69, 237, 0.06) 75%,
      rgba(99, 102, 241, 0.04) 100%);
  border-radius: 12px;
  pointer-events: none;
  z-index: 1;
}

.verification-card > * {
  position: relative;
  z-index: 2;
}

.result-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 20px;
  height: 180px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.result-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg,
      rgba(139, 69, 237, 0.12) 0%,
      rgba(99, 102, 241, 0.10) 25%,
      rgba(59, 130, 246, 0.08) 50%,
      rgba(139, 69, 237, 0.06) 75%,
      rgba(99, 102, 241, 0.04) 100%);
  border-radius: 12px;
  pointer-events: none;
  z-index: 1;
}

.result-card > * {
  position: relative;
  z-index: 2;
}

.panel-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.form-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-item {
  margin-bottom: 24px;
}

.form-item:last-child {
  margin-bottom: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-label.required::before {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}

.form-input {
  width: 100%;
}

.form-textarea {
  width: 100%;
  flex: 1;
}

.form-textarea >>> .el-textarea__inner {
  height: 100% !important;
  min-height: 120px !important;
  resize: none !important;
}

.form-tips {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.form-link {
  margin-top: 8px;
}

.form-link .el-button {
  padding: 0;
  font-size: 12px;
  color: #7c3aed;
}

.verification-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.result-section {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  position: relative;
  flex-shrink: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  flex: 1;
}

.clear-btn {
  color: #909399;
  padding: 0;
  font-size: 12px;
}

.clear-btn:hover {
  color: #f56c6c;
}

.upload-area {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.upload-dragger {
  flex: 1;
  height: 100%;
}

.upload-dragger >>> .el-upload-dragger {
  width: 100%;
  height: 100%;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.3s ease;
}

.upload-dragger >>> .el-upload-dragger:hover {
  border-color: #7c3aed;
  background: #f5f3ff;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 16px;
}

.upload-icon {
  font-size: 32px;
  color: #c0c4cc;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.upload-tips {
  font-size: 12px;
  color: #909399;
  text-align: center;
  line-height: 1.4;
}

.analysis-action {
  text-align: center;
  padding: 8px 0;
  flex-shrink: 0;
}

.analysis-btn {
  padding: 12px 32px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 20px;
  margin-bottom: 6px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.analysis-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.analysis-btn:hover::before {
  left: 100%;
}

.analysis-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.analysis-btn:active {
  transform: translateY(0);
}

.analysis-btn.is-loading {
  background: linear-gradient(135deg, #a0a0a0 0%, #808080 100%);
}

.analysis-tips {
  font-size: 12px;
  color: #909399;
}

.analysis-tips .el-button {
  padding: 0;
  font-size: 12px;
  color: #7c3aed;
}

.result-content {
  flex: 1;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  overflow-y: auto;
}

.empty-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.empty-icon {
  font-size: 28px;
  color: #c0c4cc;
  margin-bottom: 8px;
}

.empty-text {
  font-size: 14px;
  color: #909399;
}

.analysis-result {
  font-size: 14px;
  color: #303133;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .content-container {
    flex-direction: column;
    gap: 16px;
  }
  
  .left-panel {
    width: 100%;
    padding-right: 0;
  }
  
  .right-panel {
    padding-left: 0;
  }
}
</style> 