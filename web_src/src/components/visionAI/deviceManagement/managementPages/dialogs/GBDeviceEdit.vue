<template>
  <el-dialog
    :title="editMode ? '编辑国标设备' : '添加国标设备'"
    :visible.sync="dialogVisible"
    width="800px"
    :close-on-click-modal="false"
    :before-close="handleClose"
    custom-class="device-edit-dialog">
    
    <div class="dialog-content">
      <el-form
        :model="deviceForm"
        :rules="deviceRules"
        ref="deviceForm"
        label-width="120px"
        class="device-form">
        
        <div class="form-section">
          <h4 class="section-title">
            <i class="el-icon-info"></i>
            基础信息
          </h4>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="设备编码" prop="deviceId">
                <el-input
                  v-model="deviceForm.deviceId"
                  placeholder="请输入20位设备编码"
                  :disabled="editMode"
                  maxlength="20"
                  show-word-limit>
                  <i slot="prefix" class="el-icon-postcard"></i>
                </el-input>
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="设备名称" prop="name">
                <el-input
                  v-model="deviceForm.name"
                  placeholder="请输入设备名称"
                  maxlength="50"
                  show-word-limit>
                  <i slot="prefix" class="el-icon-video-camera"></i>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="设备厂商" prop="manufacturer">
                <el-select
                  v-model="deviceForm.manufacturer"
                  placeholder="请选择或输入厂商"
                  filterable
                  allow-create
                  style="width: 100%">
                  <el-option label="海康威视" value="海康威视"></el-option>
                  <el-option label="大华技术" value="大华技术"></el-option>
                  <el-option label="宇视科技" value="宇视科技"></el-option>
                  <el-option label="华为" value="华为"></el-option>
                  <el-option label="中兴" value="中兴"></el-option>
                  <el-option label="天地伟业" value="天地伟业"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="设备型号" prop="model">
                <el-input
                  v-model="deviceForm.model"
                  placeholder="请输入设备型号"
                  maxlength="50">
                  <i slot="prefix" class="el-icon-cpu"></i>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <div class="form-section">
          <h4 class="section-title">
            <i class="el-icon-connection"></i>
            网络配置
          </h4>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="IP地址" prop="ip">
                <el-input
                  v-model="deviceForm.ip"
                  placeholder="请输入IP地址">
                  <i slot="prefix" class="el-icon-monitor"></i>
                </el-input>
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="端口" prop="port">
                <el-input-number
                  v-model="deviceForm.port"
                  :min="1"
                  :max="65535"
                  placeholder="请输入端口"
                  controls-position="right"
                  style="width: 100%">
                </el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="传输协议" prop="transport">
                <el-select v-model="deviceForm.transport" placeholder="请选择" style="width: 100%">
                  <el-option label="UDP" value="UDP"></el-option>
                  <el-option label="TCP" value="TCP"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="流传输模式" prop="streamMode">
                <el-select v-model="deviceForm.streamMode" placeholder="请选择" style="width: 100%">
                  <el-option label="UDP" value="UDP"></el-option>
                  <el-option label="TCP主动模式" value="TCP-ACTIVE"></el-option>
                  <el-option label="TCP被动模式" value="TCP-PASSIVE"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <div class="form-section">
          <h4 class="section-title">
            <i class="el-icon-lock"></i>
            安全配置
          </h4>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="设备密码" prop="password">
                <el-input
                  v-model="deviceForm.password"
                  type="password"
                  placeholder="请输入设备密码"
                  show-password>
                  <i slot="prefix" class="el-icon-key"></i>
                </el-input>
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="字符集" prop="charset">
                <el-select v-model="deviceForm.charset" placeholder="请选择" style="width: 100%">
                  <el-option label="GB2312" value="GB2312"></el-option>
                  <el-option label="UTF-8" value="UTF-8"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <div class="form-section">
          <h4 class="section-title">
            <i class="el-icon-location"></i>
            位置信息（可选）
          </h4>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="经度">
                <el-input-number
                  v-model="deviceForm.longitude"
                  :precision="6"
                  :step="0.000001"
                  placeholder="请输入经度"
                  controls-position="right"
                  style="width: 100%">
                </el-input-number>
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="纬度">
                <el-input-number
                  v-model="deviceForm.latitude"
                  :precision="6"
                  :step="0.000001"
                  placeholder="请输入纬度"
                  controls-position="right"
                  style="width: 100%">
                </el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="安装地址">
            <el-input
              v-model="deviceForm.address"
              placeholder="请输入设备安装地址"
              type="textarea"
              :rows="2"
              maxlength="200"
              show-word-limit>
            </el-input>
          </el-form-item>
        </div>
      </el-form>
    </div>
    
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSave" :loading="saving">
        {{ editMode ? '保存修改' : '添加设备' }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'GBDeviceEdit',
  data() {
    return {
      dialogVisible: false,
      editMode: false,
      saving: false,
      callback: null,
      
      deviceForm: {
        deviceId: '',
        name: '',
        manufacturer: '',
        model: '',
        ip: '',
        port: 5060,
        transport: 'UDP',
        streamMode: 'UDP',
        password: '',
        charset: 'GB2312',
        longitude: null,
        latitude: null,
        address: ''
      },
      
      deviceRules: {
        deviceId: [
          { required: true, message: '请输入设备编码', trigger: 'blur' },
          { min: 20, max: 20, message: '设备编码必须为20位', trigger: 'blur' },
          {
            pattern: /^[0-9]{20}$/,
            message: '设备编码必须为20位数字',
            trigger: 'blur'
          }
        ],
        name: [
          { required: true, message: '请输入设备名称', trigger: 'blur' },
          { min: 1, max: 50, message: '设备名称长度为1-50个字符', trigger: 'blur' }
        ],
        ip: [
          { required: true, message: '请输入IP地址', trigger: 'blur' },
          {
            pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
            message: '请输入正确的IP地址格式',
            trigger: 'blur'
          }
        ],
        port: [
          { required: true, message: '请输入端口', trigger: 'blur' },
          { type: 'number', min: 1, max: 65535, message: '端口范围为1-65535', trigger: 'blur' }
        ],
        transport: [
          { required: true, message: '请选择传输协议', trigger: 'change' }
        ],
        streamMode: [
          { required: true, message: '请选择流传输模式', trigger: 'change' }
        ],
        charset: [
          { required: true, message: '请选择字符集', trigger: 'change' }
        ]
      }
    }
  },
  
  methods: {
    // 打开对话框
    openDialog(deviceData = null, callback = null) {
      this.callback = callback;
      this.editMode = !!deviceData;
      
      if (deviceData) {
        // 编辑模式 - 填充现有数据
        this.deviceForm = {
          deviceId: deviceData.deviceId || '',
          name: deviceData.name || '',
          manufacturer: deviceData.manufacturer || '',
          model: deviceData.model || '',
          ip: deviceData.ip || deviceData.hostAddress || '',
          port: deviceData.port || 5060,
          transport: deviceData.transport || 'UDP',
          streamMode: deviceData.streamMode || 'UDP',
          password: deviceData.password || '',
          charset: deviceData.charset || 'GB2312',
          longitude: deviceData.longitude || null,
          latitude: deviceData.latitude || null,
          address: deviceData.address || ''
        };
      } else {
        // 新增模式 - 重置表单
        this.resetForm();
      }
      
      this.dialogVisible = true;
      
      // 延迟清除验证信息
      this.$nextTick(() => {
        if (this.$refs.deviceForm) {
          this.$refs.deviceForm.clearValidate();
        }
      });
    },
    
    // 重置表单
    resetForm() {
      this.deviceForm = {
        deviceId: '',
        name: '',
        manufacturer: '',
        model: '',
        ip: '',
        port: 5060,
        transport: 'UDP',
        streamMode: 'UDP',
        password: '',
        charset: 'GB2312',
        longitude: null,
        latitude: null,
        address: ''
      };
    },
    
    // 保存设备
    handleSave() {
      this.$refs.deviceForm.validate((valid) => {
        if (valid) {
          this.saving = true;
          
          // 准备提交的数据
          const submitData = { ...this.deviceForm };
          
          // 如果经纬度为空，设置为null
          if (!submitData.longitude) submitData.longitude = null;
          if (!submitData.latitude) submitData.latitude = null;
          
          // 调用API
          const apiMethod = this.editMode ? 'put' : 'post';
          const apiUrl = this.editMode 
            ? `/api/device/query/devices/${submitData.deviceId}/edit`
            : '/api/device/query/devices/add';
          
          this.$axios({
            method: apiMethod,
            url: apiUrl,
            data: submitData
          }).then((res) => {
            if (res.data.code === 0) {
              this.$message.success(this.editMode ? '设备修改成功' : '设备添加成功');
              this.handleClose();
              if (this.callback) {
                this.callback();
              }
            } else {
              this.$message.error((this.editMode ? '设备修改失败：' : '设备添加失败：') + res.data.msg);
            }
          }).catch((error) => {
            console.error('设备操作失败:', error);
            this.$message.error((this.editMode ? '设备修改失败：' : '设备添加失败：') + error.message);
          }).finally(() => {
            this.saving = false;
          });
        } else {
          this.$message.warning('请检查表单输入');
        }
      });
    },
    
    // 关闭对话框
    handleClose() {
      this.dialogVisible = false;
      this.saving = false;
      this.callback = null;
      
      // 延迟重置表单，避免视觉闪烁
      setTimeout(() => {
        this.resetForm();
        if (this.$refs.deviceForm) {
          this.$refs.deviceForm.clearValidate();
        }
      }, 300);
    },
    
    // 对外暴露的关闭方法
    close() {
      this.handleClose();
    }
  }
}
</script>

<style scoped>
.device-edit-dialog {
  border-radius: 8px;
}

.dialog-content {
  max-height: 70vh;
  overflow-y: auto;
}

.device-form {
  padding: 0 10px;
}

.form-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 10px;
}

.section-title {
  display: flex;
  align-items: center;
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  padding-bottom: 8px;
  border-bottom: 2px solid #409EFF;
}

.section-title i {
  margin-right: 8px;
  color: #409EFF;
  font-size: 18px;
}

.el-form-item {
  margin-bottom: 20px;
}

.dialog-footer {
  text-align: right;
  padding: 20px 0 0 0;
  border-top: 1px solid #f0f0f0;
}

.dialog-footer .el-button {
  min-width: 100px;
}

/* 表单样式优化 */
.device-form .el-input__inner {
  border-radius: 6px;
  transition: all 0.3s;
}

.device-form .el-input__inner:focus {
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.device-form .el-select {
  width: 100%;
}

.device-form .el-textarea__inner {
  border-radius: 6px;
  font-family: inherit;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .device-edit-dialog {
    width: 95% !important;
    margin: 0 auto;
  }
  
  .dialog-content {
    max-height: 60vh;
  }
  
  .device-form .el-col-12 {
    width: 100% !important;
  }
  
  .section-title {
    font-size: 14px;
  }
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .form-section {
    border-bottom-color: #2c2c2c;
  }
  
  .dialog-footer {
    border-top-color: #2c2c2c;
  }
}
</style> 