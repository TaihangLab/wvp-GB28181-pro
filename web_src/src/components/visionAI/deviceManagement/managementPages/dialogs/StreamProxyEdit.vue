<template>
  <el-dialog
    :title="proxyParam.id ? '编辑拉流代理信息' : '添加拉流代理'"
    :visible="true"
    width="1200px"
    top="3vh"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    @close="close"
    class="stream-proxy-dialog"
    :fullscreen="false"
    custom-class="large-dialog">
    
    <div id="StreamProxyEdit" style="width: 100%">
      <el-tabs tab-position="top" v-model="activeTab">
        <el-tab-pane label="拉流代理信息" name="proxy" style="background-color: #FFFFFF; padding: 1rem">
          <el-form ref="streamProxyForm" :rules="rules" :model="proxyParam" label-width="140px" style="width: 50%; margin: 0 auto" v-loading="dialogLoading">
            <el-form-item label="类型" prop="type">
              <el-select
                v-model="proxyParam.type"
                style="width: 100%"
                placeholder="请选择代理类型"
              >
                <el-option key="默认" label="默认" value="default"></el-option>
                <el-option key="FFmpeg" label="FFmpeg" value="ffmpeg"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="应用名" prop="app">
              <el-input v-model="proxyParam.app" clearable></el-input>
            </el-form-item>
            <el-form-item label="流ID" prop="stream">
              <el-input v-model="proxyParam.stream" clearable></el-input>
            </el-form-item>
            <el-form-item label="拉流地址" prop="url">
              <el-input v-model="proxyParam.srcUrl" clearable></el-input>
            </el-form-item>
            <el-form-item label="超时时间(秒)" prop="timeoutMs">
              <el-input v-model="proxyParam.timeout" clearable></el-input>
            </el-form-item>
            <el-form-item label="节点选择" prop="rtpType">
              <el-select
                v-model="proxyParam.relatesMediaServerId"
                @change="mediaServerIdChange"
                style="width: 100%"
                placeholder="请选择拉流节点"
              >
                <el-option key="auto" label="自动选择" value=""></el-option>
                <el-option
                  v-for="item in mediaServerList"
                  :key="item.id"
                  :label="item.id"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="FFmpeg命令模板" prop="ffmpegCmdKey" v-if="proxyParam.type=='ffmpeg'">
              <el-select
                v-model="proxyParam.ffmpegCmdKey"
                style="width: 100%"
                placeholder="请选择FFmpeg命令模板"
              >
                <el-option
                  v-for="item in Object.keys(ffmpegCmdList)"
                  :key="item"
                  :label="ffmpegCmdList[item]"
                  :value="item">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="拉流方式(RTSP)" prop="rtspType">
              <el-select
                v-model="proxyParam.rtspType"
                style="width: 100%"
                placeholder="请选择拉流方式"
              >
                <el-option label="TCP" value="0"></el-option>
                <el-option label="UDP" value="1"></el-option>
                <el-option label="组播" value="2"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="无人观看" prop="noneReader" >
              <el-radio-group v-model="proxyParam.noneReader">
                <el-radio :label="0">不做处理</el-radio>
                <el-radio :label="1">停用</el-radio>
                <el-radio :label="2">移除</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="其他选项">
              <div style="float: left;">
                <el-checkbox label="启用" v-model="proxyParam.enable" ></el-checkbox>
                <el-checkbox label="开启音频" v-model="proxyParam.enableAudio" ></el-checkbox>
                <el-checkbox label="录制" v-model="proxyParam.enableMp4" ></el-checkbox>
              </div>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="国标通道配置" name="channel" v-if="proxyParam.id">
          <CommonChannelEdit ref="commonChannelEdit" :dataForm="proxyParam" :cancel="close"></CommonChannelEdit>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div slot="footer" class="dialog-footer" v-if="activeTab === 'proxy'">
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="onSubmit" :loading="dialogLoading">保存</el-button>
    </div>
  </el-dialog>
</template>

<script>
import CommonChannelEdit from './CommonChannelEdit'
import MediaServer from '../service/MediaServer'

export default {
  name: "streamProxyEdit",
  props: ['streamProxy', 'closeEdit'],
  components: {
    CommonChannelEdit,
  },
  created() {
    console.log('StreamProxy Edit created:', this.streamProxy)
    this.initData();
  },
  data() {
    return {
      dialogLoading: false,
      mediaServer: new MediaServer(),
      proxyParam: this.streamProxy,
      mediaServerList: {},
      ffmpegCmdList: {},
      activeTab: 'proxy',
      rules: {
        name: [{ required: true, message: "请输入名称", trigger: "blur" }],
        app: [{ required: true, message: "请输入应用名", trigger: "blur" }],
        stream: [{ required: true, message: "请输入流ID", trigger: "blur" }],
        srcUrl: [{ required: true, message: "请输入要代理的流", trigger: "blur" }],
        timeout: [{ required: true, message: "请输入FFmpeg推流成功超时时间", trigger: "blur" }],
        ffmpegCmdKey: [{ required: false, message: "请输入FFmpeg命令参数模板（可选）", trigger: "blur" }],
      },
    };
  },
  watch: {
    streamProxy(newValue, oldValue){
      this.proxyParam = newValue;
    }
  },
  methods: {
    initData() {
      this.mediaServer.getOnlineMediaServerList((data)=>{
        this.mediaServerList = data.data;
      })
    },
    
    mediaServerIdChange() {
      if (this.proxyParam.relatesMediaServerId !== "auto"){
        this.$axios({
          method: 'get',
          url:`/api/proxy/ffmpeg_cmd/list`,
          params: {
            mediaServerId: this.proxyParam.relatesMediaServerId
          }
        }).then((res)=> {
          this.ffmpegCmdList = res.data.data;
          this.proxyParam.ffmpegCmdKey = Object.keys(res.data.data)[0];
        }).catch(function (error) {
          console.log(error);
        });
      }
    },
    
    onSubmit() {
      console.log(typeof this.proxyParam.noneReader)
      this.dialogLoading = true;
      this.noneReaderHandler();
      if (this.proxyParam.id) {
        this.$axios({
          method: 'post',
          url:`/api/proxy/update`,
          data: this.proxyParam
        }).then((res)=> {
          this.dialogLoading = false;
          if (typeof (res.data.code) != "undefined" && res.data.code === 0) {
            this.$message.success({
              showClose: true,
              message: "保存成功"
            });
            this.proxyParam = res.data.data
          }else {
            this.$message.error({
              showClose: true,
              message: res.data.msg
            })
          }
          this.dialogLoading = false;
        }).catch((error) =>{
          this.$message.error({
            showClose: true,
            message: error
          });
          this.dialogLoading = false;
        }).finally(()=>{
          console.log("finally==finally")
          this.dialogLoading = false;
        })
      }else {
        this.$axios({
          method: 'post',
          url:`/api/proxy/add`,
          data: this.proxyParam
        }).then((res)=> {
          this.dialogLoading = false;
          if (typeof (res.data.code) != "undefined" && res.data.code === 0) {
            this.$message.success({
            showClose: true,
            message: "保存成功"
          });
            this.proxyParam = res.data.data
          }else {
            this.$message.error({
              showClose: true,
              message: res.data.msg
            })
          }
        }).catch((error) =>{
          this.$message.error({
            showClose: true,
            message: error
          })
          this.dialogLoading = false;
        }).finally(()=>{
          this.dialogLoading = false;
        })
      }
    },
    
    close() {
      this.closeEdit();
    },
    
    noneReaderHandler() {
      console.log(this.proxyParam)
      if (!this.proxyParam.noneReader || this.proxyParam.noneReader === 0 ) {
        this.proxyParam.enableDisableNoneReader = false;
        this.proxyParam.enableRemoveNoneReader = false;
      }else if (this.proxyParam.noneReader === 1){
        this.proxyParam.enableDisableNoneReader = true;
        this.proxyParam.enableRemoveNoneReader = false;
      }else if (this.proxyParam.noneReader ===2){
        this.proxyParam.enableDisableNoneReader = false;
        this.proxyParam.enableRemoveNoneReader = true;
      }
    },
  },
};
</script>

<style scoped>
.stream-proxy-dialog {
  border-radius: 12px;
}

.stream-proxy-dialog .el-dialog {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.stream-proxy-dialog .el-dialog__header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px 12px 0 0;
  padding: 20px 24px;
}

.stream-proxy-dialog .el-dialog__title {
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.stream-proxy-dialog .el-dialog__headerbtn .el-dialog__close {
  color: white;
  font-size: 20px;
}

.stream-proxy-dialog .el-dialog__headerbtn .el-dialog__close:hover {
  color: rgba(255, 255, 255, 0.8);
}

.stream-proxy-dialog .el-dialog__body {
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

.dialog-footer {
  text-align: right;
  padding: 20px 0 0 0;
}

.dialog-footer .el-button {
  margin-left: 12px;
}
</style>
