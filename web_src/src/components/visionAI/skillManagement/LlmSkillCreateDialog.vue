<template>
  <el-dialog
    title="创建技能（多模态大模型生成）"
    :visible.sync="dialogVisible"
    width="55%"
    @close="handleClose"
    :close-on-click-modal="false"
    class="skill-create-dialog">
    
    <div class="dialog-content">
      <!-- 进度指示器 -->
      <div class="progress-indicator">
        <div class="progress-step active">
          <div class="step-circle">1</div>
          <div class="step-label">基础信息</div>
        </div>
        <div class="progress-line"></div>
        <div class="progress-step">
          <div class="step-circle">2</div>
          <div class="step-label">详细配置</div>
        </div>
      </div>

      <el-form :model="form" :rules="rules" ref="createForm" label-width="120px" class="create-form">
        <div class="form-section">
          <h3 class="section-title">
            <i class="el-icon-info"></i>
            基本信息
          </h3>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="技能名称" prop="name">
                <el-input 
                  v-model="form.name" 
                  placeholder="请输入技能名称"
                  maxlength="30"
                  show-word-limit
                  @input="generateSkillId">
                </el-input>
                <div class="form-tip">
                  仅支持数字、中文、大小写英文字母、非特殊符号，不允许空格，不可重复
                </div>
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="技能ID" prop="skillId">
                <el-input 
                  v-model="form.skillId" 
                  placeholder="系统自动生成或手动输入"
                  maxlength="40"
                  show-word-limit>
                </el-input>
                <div class="form-tip">
                  支持大小写字母、数字、下划线和中划线，必须以英文或数字开头
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div class="form-section">
          <h3 class="section-title">
            <i class="el-icon-view"></i>
            应用场景
          </h3>
          
          <el-form-item prop="scenario">
            <div class="scenario-grid">
              <div 
                class="scenario-card" 
                :class="{ active: form.scenario === 'vision' }"
                @click="selectScenario('vision')">
                <div class="scenario-header">
                  <div class="scenario-icon">
                    <i class="el-icon-video-camera"></i>
                  </div>
                  <div class="scenario-title">视频分析</div>
                </div>
                <div class="scenario-content">
                  <div class="scenario-features">
                    <span class="feature-tag">实时处理</span>
                    <span class="feature-tag">连续帧分析</span>
                  </div>
                  <div class="scenario-desc">对动态图像序列进行实时分析，适用于监控、行为识别等场景</div>
                </div>
              </div>
              
              <div 
                class="scenario-card" 
                :class="{ active: form.scenario === 'image' }"
                @click="selectScenario('image')">
                <div class="scenario-header">
                  <div class="scenario-icon">
                    <i class="el-icon-picture"></i>
                  </div>
                  <div class="scenario-title">图片处理</div>
                </div>
                <div class="scenario-content">
                  <div class="scenario-features">
                    <span class="feature-tag">批量处理</span>
                    <span class="feature-tag">高精度识别</span>
                  </div>
                  <div class="scenario-desc">对静态图像进行批量处理和分析，适用于质量检测、物体识别等场景</div>
                </div>
              </div>
            </div>
          </el-form-item>
        </div>

        <div class="form-section">
          <h3 class="section-title">
            <i class="el-icon-price-tag"></i>
            标签与描述
          </h3>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="技能标签" prop="tags">
                <el-select
                  v-model="form.tags"
                  placeholder="请选择技能标签"
                  style="width: 100%"
                  filterable
                  allow-create>
                  <el-option label="事件检测" value="事件检测">
                    <span style="float: left">事件检测</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">异常事件识别</span>
                  </el-option>
                  <el-option label="安全监控" value="安全监控">
                    <span style="float: left">安全监控</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">安全违规检测</span>
                  </el-option>
                  <el-option label="质量检测" value="质量检测">
                    <span style="float: left">质量检测</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">产品质量控制</span>
                  </el-option>
                  <el-option label="行为识别" value="行为识别">
                    <span style="float: left">行为识别</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">人员行为分析</span>
                  </el-option>
                  <el-option label="场景分析" value="场景分析">
                    <span style="float: left">场景分析</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">环境场景理解</span>
                  </el-option>
                </el-select>
                <div class="form-tip">
                  可选择现有标签，或输入自定义标签，单个标签不能超过10个字
                </div>
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="技能图标" prop="icon">
                <div class="icon-upload-wrapper">
                  <el-upload
                    class="avatar-uploader"
                    action="#"
                    :show-file-list="false"
                    :auto-upload="false"
                    :on-change="handleIconChange"
                    accept="image/*">
                    <div v-if="form.iconUrl" class="avatar-preview">
                      <img :src="form.iconUrl" class="avatar" />
                      <div class="avatar-overlay">
                        <i class="el-icon-camera"></i>
                        <span>更换图标</span>
                      </div>
                    </div>
                    <div v-else class="avatar-placeholder">
                      <i class="el-icon-plus"></i>
                      <div class="upload-text">上传图标</div>
                    </div>
                  </el-upload>
                  <div class="upload-tip">
                    JPG、PNG格式，64x64px
                  </div>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="技能描述" prop="description">
            <el-input
              type="textarea"
              v-model="form.description"
              placeholder="请详细描述技能的功能、适用场景和预期效果..."
              :rows="4"
              maxlength="255"
              show-word-limit>
            </el-input>
            <div class="form-tip">
              请简要描述技能的核心能力和应用价值，10-255个字符。
            </div>
          </el-form-item>
        </div>
      </el-form>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose" size="medium">取消</el-button>
      <el-button type="primary" @click="handleConfirm" :loading="loading" size="medium">
        下一步：详细配置
        <i class="el-icon-arrow-right"></i>
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'LlmSkillCreateDialog',
  data() {
    // 生成随机技能ID的函数
    const generateRandomSkillId = () => {
      const timestamp = Date.now().toString().slice(-4)
      const randomStr = Math.random().toString(36).substring(2, 5)
      const randomHex = Math.random().toString(16).substring(2, 5)
      const randomBase32 = Math.random().toString(32).substring(2, 4)
      const separators = ['_', '-']
      const sep = separators[Math.floor(Math.random() * separators.length)]
      const patterns = [
        `${randomStr}${sep}${timestamp}${randomHex}`,
        `${randomHex}${sep}${randomStr}${timestamp}`,
        `${timestamp}${sep}${randomStr}${randomHex}`,
        `${randomStr}${randomBase32}${timestamp}`,
        `${randomHex}${timestamp}${randomStr}`,
        `${randomStr}${timestamp}${randomHex.substring(0, 2)}`
      ]
      return patterns[Math.floor(Math.random() * patterns.length)]
    }
    
    return {
      dialogVisible: false,
      loading: false,
      form: {
        name: '',
        skillId: generateRandomSkillId(),
        scenario: '',
        tags: '',
        description: '',
        iconUrl: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入技能名称', trigger: 'blur' },
          { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' },
          { pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_-]+$/, message: '只能包含中文、英文、数字、下划线和中划线', trigger: 'blur' }
        ],
        skillId: [
          { required: true, message: '请输入技能ID', trigger: 'blur' },
          { min: 3, max: 40, message: '长度在 3 到 40 个字符', trigger: 'blur' },
          { pattern: /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/, message: '必须以英文或数字开头，只能包含字母、数字、下划线和中划线', trigger: 'blur' }
        ],
        scenario: [
          { required: true, message: '请选择应用场景', trigger: 'change' }
        ],
        tags: [
          { required: true, message: '请选择或输入技能标签', trigger: 'change' }
        ],
        description: [
          { required: true, message: '请输入技能描述', trigger: 'blur' },
          { min: 10, max: 255, message: '描述长度在 10 到 255 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    show() {
      this.dialogVisible = true
      this.resetForm()
    },
    
    hide() {
      this.dialogVisible = false
    },
    
    handleClose() {
      this.dialogVisible = false
      // 关闭时不重置表单，保留用户输入的数据
    },
    
    resetForm() {
      this.form = {
        name: '',
        skillId: this.generateRandomSkillId(),
        scenario: '',
        tags: '',
        description: '',
        iconUrl: ''
      }
      this.loading = false
      if (this.$refs.createForm) {
        this.$refs.createForm.resetFields()
      }
    },
    
    // 清空表单（用于真正需要重置的场景）
    clearForm() {
      this.resetForm()
    },
    
    selectScenario(scenario) {
      this.form.scenario = scenario
    },
    
    // 根据技能名称自动生成技能ID
    generateSkillId() {
      if (this.form.name && !this.form.skillId) {
        // 生成逻辑：提取英文字母 + 随机字符串
        const timestamp = Date.now().toString().slice(-6)
        const randomStr = Math.random().toString(36).substring(2, 6)
        
        let id = this.form.name
          .replace(/[\u4e00-\u9fa5]/g, '') // 移除中文
          .replace(/[^a-zA-Z0-9]/g, '') // 移除特殊字符
          .toLowerCase()
        
        if (!id) {
          id = 'ai'
        }
        
        this.form.skillId = `${id}_${timestamp}_${randomStr}`
      }
    },
    
    // 生成随机技能ID
    generateRandomSkillId() {
      const timestamp = Date.now().toString().slice(-4)
      const randomStr = Math.random().toString(36).substring(2, 5)
      const randomHex = Math.random().toString(16).substring(2, 5)
      const randomBase32 = Math.random().toString(32).substring(2, 4)
      const separators = ['_', '-']
      const sep = separators[Math.floor(Math.random() * separators.length)]
      const patterns = [
        `${randomStr}${sep}${timestamp}${randomHex}`,
        `${randomHex}${sep}${randomStr}${timestamp}`,
        `${timestamp}${sep}${randomStr}${randomHex}`,
        `${randomStr}${randomBase32}${timestamp}`,
        `${randomHex}${timestamp}${randomStr}`,
        `${randomStr}${timestamp}${randomHex.substring(0, 2)}`
      ]
      return patterns[Math.floor(Math.random() * patterns.length)]
    },
    
    handleIconChange(file) {
      const isValidImage = file.raw && ['image/jpeg', 'image/jpg', 'image/png'].includes(file.raw.type)
      const isValidSize = file.raw && file.raw.size / 1024 / 1024 < 2

      if (!isValidImage) {
        this.$message.error('图标只能是 JPG/PNG 格式!')
        return
      }
      if (!isValidSize) {
        this.$message.error('图标大小不能超过 2MB!')
        return
      }

      if (file.raw) {
        this.form.iconUrl = URL.createObjectURL(file.raw)
      }
    },
    
    handleConfirm() {
      this.$refs.createForm.validate((valid) => {
        if (valid) {
          this.loading = true
          
          // 模拟数据验证
          setTimeout(() => {
            this.loading = false
            this.$message.success('基础信息保存成功！')
            this.$emit('confirm', this.form)
            this.hide()
            // 成功提交后重置表单
            this.resetForm()
          }, 1000)
        } else {
          this.$message.warning('请完善必填信息')
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
.skill-create-dialog {
  --primary-color: #409eff;
  --success-color: #67c23a;
  --warning-color: #e6a23c;
  --danger-color: #f56c6c;
  --info-color: #909399;
}

.skill-create-dialog >>> .el-dialog {
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.skill-create-dialog >>> .el-dialog__header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 20px;
  border-radius: 12px 12px 0 0;
}

.skill-create-dialog >>> .el-dialog__title {
  font-size: 18px;
  font-weight: 600;
}

.skill-create-dialog >>> .el-dialog__headerbtn {
  top: 18px;
  right: 20px;
}

.skill-create-dialog >>> .el-dialog__close {
  color: white;
  font-size: 20px;
}

.dialog-content {
  padding: 0;
}

/* 进度指示器 */
.progress-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  margin-bottom: 20px;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.step-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.3s ease;
}

.progress-step.active .step-circle {
  background: linear-gradient(135deg, var(--primary-color) 0%, #667eea 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.step-label {
  margin-top: 8px;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.progress-step.active .step-label {
  color: var(--primary-color);
  font-weight: 600;
}

.progress-line {
  width: 60px;
  height: 2px;
  background: #e5e7eb;
  margin: 0 15px;
}

/* 表单样式 */
.create-form {
  padding: 0 24px;
}

.form-section {
  margin-bottom: 18px;
}

.section-title {
  display: flex;
  align-items: center;
  margin: 0 0 18px 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  padding-bottom: 10px;
  border-bottom: 2px solid #f3f4f6;
}

.section-title i {
  margin-right: 8px;
  color: var(--primary-color);
  font-size: 18px;
}

.form-tip {
  font-size: 12px;
  color: #6b7280;
  margin-top: 5px;
  line-height: 1.4;
  text-align: left;
}

/* 应用场景卡片 */
.scenario-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.scenario-card {
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
  position: relative;
  overflow: hidden;
}

.scenario-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(102, 126, 234, 0.03) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.scenario-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(64, 158, 255, 0.15);
}

.scenario-card:hover::before {
  opacity: 1;
}

.scenario-card.active {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f3ff 100%);
  box-shadow: 0 8px 25px rgba(64, 158, 255, 0.2);
}

.scenario-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.scenario-icon {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: linear-gradient(135deg, var(--primary-color) 0%, #667eea 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  flex-shrink: 0;
}

.scenario-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.2;
  flex: 1;
}

.scenario-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.scenario-features {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.scenario-desc {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
}

.feature-tag {
  background: rgba(64, 158, 255, 0.1);
  color: var(--primary-color);
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 12px;
  border: none;
  line-height: 1.2;
  white-space: nowrap;
}

/* 图标上传 */
.icon-upload-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.avatar-uploader {
  flex-shrink: 0;
}

.avatar-uploader >>> .el-upload {
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  width: 60px;
  height: 60px;
}

.avatar-uploader >>> .el-upload:hover {
  border-color: var(--primary-color);
}

.avatar-preview {
  position: relative;
  width: 100%;
  height: 100%;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 10px;
}

.avatar-preview:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay i {
  font-size: 16px;
  margin-bottom: 4px;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #fafafa;
  color: #8c939d;
}

.avatar-placeholder i {
  font-size: 22px;
  margin-bottom: 5px;
  color: #c0c4cc;
}

.upload-text {
  font-size: 12px;
  font-weight: 500;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
  margin-top: 2px;
  flex: 1;
  min-width: 0;
}

/* 底部按钮 */
.dialog-footer {
  padding: 16px 24px;
  background: #fafbfc;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.dialog-footer .el-button {
  padding: 8px 16px;
  font-weight: 500;
}

/* 表单项样式优化 */
.create-form >>> .el-form-item {
  margin-bottom: 16px;
}

.create-form >>> .el-form-item__label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.create-form >>> .el-input__inner,
.create-form >>> .el-textarea__inner {
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 14px;
}

.create-form >>> .el-input__inner:focus,
.create-form >>> .el-textarea__inner:focus {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.create-form >>> .el-select {
  width: 100%;
}

.create-form >>> .el-input-group__prepend {
  background: #f8fafc;
  border-color: #e5e7eb;
  color: #6b7280;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .skill-create-dialog >>> .el-dialog {
    width: 95% !important;
    margin: 15px auto;
  }
  
  .create-form {
    padding: 0 16px;
  }
  
  .form-section {
    margin-bottom: 16px;
  }
  
  .scenario-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .scenario-card {
    padding: 6px;
  }
  
  .scenario-header {
    gap: 6px;
    margin-bottom: 6px;
  }
  
  .scenario-icon {
    width: 18px;
    height: 18px;
    font-size: 9px;
  }
  
  .scenario-title {
    font-size: 13px;
  }
  
  .scenario-content {
    gap: 4px;
  }
  
  .scenario-desc {
    font-size: 11px;
  }
  
  .feature-tag {
    font-size: 10px;
    padding: 2px 6px;
  }
  
  .progress-indicator {
    padding: 16px 0;
    margin-bottom: 16px;
  }
  
  .progress-line {
    width: 40px;
    margin: 0 8px;
  }
  
  .dialog-footer {
    padding: 12px 16px;
  }
}
</style> 