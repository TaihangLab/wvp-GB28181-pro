<template>
  <el-dialog
    :title="streamPush.id ? '编辑推流信息' : '添加推流'"
    :visible="true"
    width="1200px"
    top="3vh"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    @close="close"
    class="stream-push-dialog"
    :fullscreen="false"
    custom-class="large-dialog">
    
    <div id="ChannelEdit" style="width: 100%">
      <el-tabs tab-position="top" v-model="activeTab">
        <el-tab-pane label="推流信息编辑" name="push" style="background-color: #FFFFFF; padding: 1rem">
          <el-divider content-position="center">基础信息</el-divider>
          <el-form ref="streamPushForm" status-icon label-width="120px" class="channel-form" v-loading="locading">
            <el-form-item label="应用名" >
              <el-input v-model="streamPush.app" placeholder="请输入应用名"></el-input>
            </el-form-item>
            <el-form-item label="流ID" >
              <el-input v-model="streamPush.stream" placeholder="请输入流ID"></el-input>
            </el-form-item>
          </el-form>
          <el-divider content-position="center">策略</el-divider>
          <el-form ref="streamPushForm" status-icon label-width="120px" v-loading="locading">
            <el-form-item style="text-align: left">
              <el-checkbox v-model="streamPush.startOfflinePush">拉起离线推流</el-checkbox>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="国标通道配置" name="channel" v-if="streamPush.id">
          <CommonChannelEdit ref="commonChannelEdit" :dataForm="streamPush" :cancel="close"></CommonChannelEdit>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div slot="footer" class="dialog-footer" v-if="activeTab === 'push'">
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="onSubmit" :loading="locading">保存</el-button>
    </div>
  </el-dialog>
</template>

<script>
import CommonChannelEdit from './CommonChannelEdit'

export default {
  name: "channelEdit",
  props: [ 'streamPush', 'closeEdit'],
  components: {
    CommonChannelEdit,
  },
  created() {
    console.log(this.streamPush)
  },
  data() {
    return {
      locading: false,
      activeTab: 'push',
    };
  },
  methods: {
    onSubmit: function () {
      console.log(this.streamPush)
      this.locading = true
      if (this.streamPush.id) {
        this.$axios({
          method: 'post',
          url: "/api/push/update",
          data: this.streamPush
        }).then((res) => {
          if (res.data.code === 0) {
            this.$message.success({
              showClose: true,
              message: '保存成功',
            });
          }else {
            this.$message.error({
              showClose: true,
              message: res.data.msg
            })
          }
        }).catch((error) => {
          this.$message.error({
            showClose: true,
            message: error
          })
        }).finally(()=>{
          this.locading = false
        })
      }else {
        this.$axios({
          method: 'post',
          url: "/api/push/add",
          data: this.streamPush
        }).then((res) => {
          if (res.data.code === 0) {
            this.$message.success({
              showClose: true,
              message: '保存成功',
            });

            this.streamPush = res.data.data
          }else {
            this.$message.error({
              showClose: true,
              message: res.data.msg
            })
          }
        }).catch((error) => {
          this.$message.error({
            showClose: true,
            message: error
          })
        }).finally(()=>{
          this.locading = false
        })
      }

    },
    close: function () {
      this.closeEdit()
    },
  },
};
</script>
<style scoped>
.stream-push-dialog {
  border-radius: 12px;
}

.stream-push-dialog .el-dialog {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.stream-push-dialog .el-dialog__header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px 12px 0 0;
  padding: 20px 24px;
}

.stream-push-dialog .el-dialog__title {
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.stream-push-dialog .el-dialog__headerbtn .el-dialog__close {
  color: white;
  font-size: 20px;
}

.stream-push-dialog .el-dialog__headerbtn .el-dialog__close:hover {
  color: rgba(255, 255, 255, 0.8);
}

.stream-push-dialog .el-dialog__body {
  padding: 32px;
  max-height: 80vh;
  overflow-y: auto;
}

.large-dialog {
  min-height: 600px;
}

.large-dialog .el-dialog__body {
  min-height: 500px;
}

.channel-form {
  display: grid;
  background-color: #FFFFFF;
  padding: 0;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px;
}

.channel-form .el-form-item {
  margin-bottom: 20px;
}

.channel-form .el-form-item__label {
  font-weight: 600;
  color: #606266;
}

.channel-form .el-input__inner {
  border-radius: 6px;
  border: 1px solid #dcdfe6;
  transition: border-color 0.3s;
}

.channel-form .el-input__inner:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.el-tabs__content {
  padding: 0;
}

.el-tab-pane {
  background-color: transparent !important;
  padding: 20px 0 !important;
}

.el-tabs__header {
  margin-bottom: 20px;
}

.el-tabs__item {
  font-weight: 600;
  color: #606266;
}

.el-tabs__item.is-active {
  color: #667eea;
}

.dialog-footer {
  text-align: right;
  padding: 16px 0 0 0;
  border-top: 1px solid #e8e8e8;
  margin-top: 24px;
}

.dialog-footer .el-button {
  margin-left: 12px;
}

.el-divider {
  margin: 24px 0 20px 0;
}

.el-divider__text {
  background-color: #f8f9fa;
  color: #606266;
  font-weight: 600;
  padding: 0 20px;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .stream-push-dialog .el-dialog {
    width: 90% !important;
    margin: 0 auto;
  }
}

@media (max-width: 1024px) {
  .channel-form {
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  
  .stream-push-dialog .el-dialog {
    width: 95% !important;
  }
  
  .stream-push-dialog .el-dialog__body {
    padding: 24px;
  }
}

@media (max-width: 768px) {
  .channel-form {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .stream-push-dialog .el-dialog {
    width: 100% !important;
    margin: 0;
    height: 100%;
  }
  
  .stream-push-dialog .el-dialog__body {
    padding: 20px;
    max-height: calc(100vh - 120px);
  }
}
</style>
