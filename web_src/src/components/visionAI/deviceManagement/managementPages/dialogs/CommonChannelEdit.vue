<template>
  <div id="CommonChannelEdit" v-loading="locading" style="width: 100%">
    <el-form ref="passwordForm" status-icon label-width="160px" class="channel-form">
      <div class="form-box">
        <el-form-item label="名称" >
          <el-input v-model="form.gbName" placeholder="请输入通道名称"></el-input>
        </el-form-item>
        <el-form-item label="编码" >
          <el-input v-model="form.gbDeviceId" placeholder="请输入通道编码">
            <template v-slot:append>
              <el-button  @click="buildDeviceIdCode(form.gbDeviceId)">生成</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="设备厂商" >
          <el-input v-model="form.gbManufacturer" placeholder="请输入设备厂商"></el-input>
        </el-form-item>
        <el-form-item label="设备型号" >
          <el-input v-model="form.gbModel" placeholder="请输入设备型号"></el-input>
        </el-form-item>

        <el-form-item label="行政区域" >
          <el-input v-model="form.gbCivilCode" placeholder="请输入行政区域">
            <template v-slot:append>
              <el-button  @click="chooseCivilCode()">选择</el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="安装地址" >
          <el-input v-model="form.gbAddress" placeholder="请输入安装地址"></el-input>
        </el-form-item>
        <el-form-item label="子设备" >
          <el-select v-model="form.gbParental" style="width: 100%" placeholder="请选择是否有子设备">
            <el-option label="有" :value="1"></el-option>
            <el-option label="无" :value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="父节点编码" >
          <el-input v-model="form.gbParentId" placeholder="请输入父节点编码或选择所属虚拟组织">
            <template v-slot:append>
              <el-button  @click="chooseGroup()">选择</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="设备状态" >
          <el-select v-model="form.gbStatus" style="width: 100%" placeholder="请选择设备状态">
            <el-option label="在线" value="ON"></el-option>
            <el-option label="离线" value="OFF"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="经度" >
          <el-input v-model="form.gbLongitude" placeholder="请输入经度"></el-input>
        </el-form-item>
        <el-form-item label="纬度" >
          <el-input v-model="form.gbLatitude" placeholder="请输入纬度"></el-input>
        </el-form-item>
        <el-form-item label="云台类型" >
          <el-select v-model="form.gbPtzType" style="width: 100%" placeholder="请选择云台类型">
            <el-option label="球机" :value="1"></el-option>
            <el-option label="半球" :value="2"></el-option>
            <el-option label="固定枪机" :value="3"></el-option>
            <el-option label="遥控枪机" :value="4"></el-option>
            <el-option label="遥控半球" :value="5"></el-option>
            <el-option label="多目设备的全景/拼接通道" :value="6"></el-option>
            <el-option label="多目设备的分割通道" :value="7"></el-option>
          </el-select>
        </el-form-item>
      </div>
      <div>
        <el-form-item label="警区" >
          <el-input v-model="form.gbBlock" placeholder="请输入警区"></el-input>
        </el-form-item>
        <el-form-item label="设备归属" >
          <el-input v-model="form.gbOwner" placeholder="请输入设备归属"></el-input>
        </el-form-item>
        <el-form-item label="信令安全模式" >
          <el-select v-model="form.gbSafetyWay" style="width: 100%" placeholder="请选择信令安全模式">
            <el-option label="不采用" :value="0"></el-option>
            <el-option label="S/MIME签名" :value="2"></el-option>
            <el-option label="S/MIME加密签名同时采用" :value="3"></el-option>
            <el-option label="数字摘要" :value="4"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="注册方式" >
          <el-select v-model="form.gbRegisterWay" style="width: 100%" placeholder="请选择注册方式">
            <el-option label="IETFRFC3261标准" :value="1"></el-option>
            <el-option label="基于口令的双向认证" :value="2"></el-option>
            <el-option label="基于数字证书的双向认证注册" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="证书序列号" >
          <el-input type="number" v-model="form.gbCertNum" placeholder="请输入证书序列号"></el-input>
        </el-form-item>
        <el-form-item label="证书有效标识" >
          <el-select v-model="form.gbCertifiable" style="width: 100%" placeholder="请选择证书有效标识">
            <el-option label="有效" :value="1"></el-option>
            <el-option label="无效" :value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="无效原因码" >
          <el-input type="errCode" v-model="form.gbCertNum" placeholder="请输入无效原因码"></el-input>
        </el-form-item>
        <el-form-item label="证书终止有效期" >
          <el-date-picker
            v-model="form.gbEndTime"
            type="datetime"
            placeholder="选择日期时间"
            style="width: 100%">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="保密属性" >
          <el-select v-model="form.gbSecrecy" style="width: 100%" placeholder="请选择保密属性">
            <el-option label="不涉密" :value="0"></el-option>
            <el-option label="涉密" :value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="IP地址" >
          <el-input v-model="form.gbIpAddress" placeholder="请输入IP地址"></el-input>
        </el-form-item>
        <el-form-item label="端口" >
          <el-input type="number" v-model="form.gbPort" placeholder="请输入端口"></el-input>
        </el-form-item>
        <el-form-item label="设备口令" >
          <el-input v-model="form.gbPassword" placeholder="请输入设备口令"></el-input>
        </el-form-item>
      </div>
      <div>
        <el-form-item label="业务分组编号" >
          <el-input v-model="form.gbBusinessGroupId" placeholder="请输入业务分组编号"></el-input>
        </el-form-item>
        <el-form-item label="位置类型" >
          <el-select v-model="form.gbPositionType" style="width: 100%" placeholder="请选择位置类型">
            <el-option label="省际检查站" :value="1"></el-option>
            <el-option label="党政机关" :value="2"></el-option>
            <el-option label="车站码头" :value="3"></el-option>
            <el-option label="中心广场" :value="4"></el-option>
            <el-option label="体育场馆" :value="5"></el-option>
            <el-option label="商业中心" :value="6"></el-option>
            <el-option label="宗教场所" :value="7"></el-option>
            <el-option label="校园周边" :value="8"></el-option>
            <el-option label="治安复杂区域" :value="9"></el-option>
            <el-option label="交通干线" :value="10"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="室外/室内" >
          <el-select v-model="form.gbRoomType" style="width: 100%" placeholder="请选择位置类型">
            <el-option label="室外" :value="1"></el-option>
            <el-option label="室内" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用途" >
          <el-select v-model="form.gbUseType" style="width: 100%" placeholder="请选择位置类型">
            <el-option label="治安" :value="1"></el-option>
            <el-option label="交通" :value="2"></el-option>
            <el-option label="重点" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="补光" >
          <el-select v-model="form.gbSupplyLightType" style="width: 100%" placeholder="请选择位置类型">
            <el-option label="无补光" :value="1"></el-option>
            <el-option label="红外补光" :value="2"></el-option>
            <el-option label="白光补光" :value="3"></el-option>
            <el-option label="激光补光" :value="4"></el-option>
            <el-option label="其他" :value="9"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="监视方位" >
          <el-select v-model="form.gbDirectionType" style="width: 100%" placeholder="请选择位置类型">
            <el-option label="东(西向东)" :value="1"></el-option>
            <el-option label="西(东向西)" :value="2"></el-option>
            <el-option label="南(北向南)" :value="3"></el-option>
            <el-option label="北(南向北)" :value="4"></el-option>
            <el-option label="东南(西北到东南)" :value="5"></el-option>
            <el-option label="东北(西南到东北)" :value="6"></el-option>
            <el-option label="西南(东北到西南)" :value="7"></el-option>
            <el-option label="西北(东南到西北)" :value="8"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分辨率" >
          <el-input v-model="form.gbResolution" placeholder="请输入分辨率"></el-input>
        </el-form-item>
        <el-form-item label="下载倍速" >
          <el-select v-model="form.gbDownloadSpeedArray" multiple style="width: 100%" placeholder="请选择位置类型">
            <el-option label="1倍速" value="1"></el-option>
            <el-option label="2倍速" value="2"></el-option>
            <el-option label="4倍速" value="4"></el-option>
            <el-option label="8倍速" value="8"></el-option>
            <el-option label="16倍速" value="16"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="空域编码能力" >
          <el-select v-model="form.gbSvcSpaceSupportMod" style="width: 100%" placeholder="请选择空域编码能力">
            <el-option label="1级增强" value="1"></el-option>
            <el-option label="2级增强" value="2"></el-option>
            <el-option label="3级增强" value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时域编码能力" >
          <el-select v-model="form.gbSvcTimeSupportMode" style="width: 100%" placeholder="请选择空域编码能力">
            <el-option label="1级增强" value="1"></el-option>
            <el-option label="2级增强" value="2"></el-option>
            <el-option label="3级增强" value="3"></el-option>
          </el-select>
        </el-form-item>
        <div style="float: right;">
          <el-button type="primary" @click="onSubmit">保存</el-button>
          <el-button v-if="cancel" @click="cancelSubmit">取消</el-button>
          <el-button v-if="form.dataType === 1" @click="reset">重置</el-button>
        </div>
      </div>

    </el-form>
    <channelCode ref="channelCode"></channelCode>
    <chooseCivilCode ref="chooseCivilCode"></chooseCivilCode>
    <chooseGroup ref="chooseGroup"></chooseGroup>
  </div>
</template>

<script>
import channelCode from './channelCode'
import ChooseCivilCode from "./chooseCivilCode.vue";
import ChooseGroup from "./chooseGroup.vue";

export default {
  name: "CommonChannelEdit",
  props: [ 'id', 'dataForm', 'saveSuccess', 'cancel'],
  components: {
    ChooseCivilCode,
    ChooseGroup,
    channelCode,
  },
  created() {
    // 获取完整信息
    if (this.id) {
      this.getCommonChannel()
    }else {
      if(!this.dataForm.gbDeviceId) {
        this.dataForm.gbDeviceId = ""
      }
      console.log(this.dataForm)
      this.form = this.dataForm
    }
  },
  data() {
    return {
      locading: false,
      form: {},
    };
  },
  methods: {
    onSubmit: function () {
      this.locading = true
      if (this.form.gbDownloadSpeedArray) {
        this.form.gbDownloadSpeed = this.form.gbDownloadSpeedArray.join("/")
      }
      if (this.form.gbId) {
        this.$axios({
          method: 'post',
          url: "/api/common/channel/update",
          data: this.form
        }).then((res) => {
          if (res.data.code === 0) {
            this.$message.success({
            showClose: true,
            message: "保存成功"
          });
            if (this.saveSuccess) {
              this.saveSuccess()
            }
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
          });
        }).finally(()=>{
          this.locading = false
        })
      }else {
        this.$axios({
          method: 'post',
          url: "/api/common/channel/add",
          data: this.form
        }).then((res) => {
          if (res.data.code === 0) {
            this.$message.success({
              showClose: true,
              message: "保存成功"
            });
            this.form = res.data.data
            if (this.saveSuccess) {
              this.saveSuccess()
            }
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
          });
        }).finally(()=>{
          this.locading = false
        })
      }

    },
    reset: function () {
      this.$confirm("确定重置为默认内容?", '提示', {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.locading = true
        this.$axios({
          method: 'post',
          url: "/api/common/channel/reset",
          params: {
            id: this.form.gbId
          }
        }).then((res) => {
          if (res.data.code === 0) {
            this.$message.success({
              showClose: true,
              message: "重置成功 已保存"
            });
            this.getCommonChannel()
          }
        }).catch((error) => {
          console.error(error)
        }).finally(()=>{
          this.locading = false
        })
      }).catch(() => {

      });

    },
    getCommonChannel:function () {
      this.locading = true
      this.$axios({
        method: 'get',
        url: "/api/common/channel/one",
        params: {
          id: this.id
        }
      }).then((res) => {
        if (res.data.code === 0) {
          if (res.data.data.gbDownloadSpeed) {
            res.data.data.gbDownloadSpeedArray = res.data.data.gbDownloadSpeed.split("/")
          }
          this.form = res.data.data;
        }
      }).catch((error) => {
        console.error(error)
      }).finally(()=>{
        this.locading = false
      })
    },
    buildDeviceIdCode: function (deviceId){

      this.$refs.channelCode.openDialog(code=>{
        console.log(this.form)
        console.log("code===> " + code)
        this.form.gbDeviceId = code;
        console.log("code22===> " + code)
      }, deviceId);
    },
    chooseCivilCode: function (){
      this.$refs.chooseCivilCode.openDialog(code=>{
          this.form.gbCivilCode = code;
      });
    },
    chooseGroup: function (){
      this.$refs.chooseGroup.openDialog((deviceId, businessGroupId)=>{
          this.form.gbBusinessGroupId = businessGroupId;
          this.form.gbParentId = deviceId;
      });
    },
    cancelSubmit: function (){
      if(this.cancel) {
        this.cancel()
      }
    }
    // getDeviceChannel:function (callback) {
    //   this.$axios({
    //     method: 'get',
    //     url: "/api/device/query/channel/raw",
    //     params: {
    //       id: this.id
    //     }
    //   }).then((res) => {
    //     if (res.data.code === 0) {
    //       if(callback) {
    //         callback(res.data.data)
    //       }
    //     }
    //   }).catch((error) => {
    //     console.error(error)
    //   }).finally(()=>[
    //     this.locading = false
    //   ])
    // }
  },
};
</script>
<style>
.channel-form {
  display: grid;
  background-color: #FFFFFF;
  padding: 1.5rem 1rem 0 1rem;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem 2rem;
  max-height: 60vh;
  overflow-y: auto;
}

.channel-form .form-box {
  grid-column: span 2;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem 2rem;
}

.channel-form .el-form-item {
  margin-bottom: 1.2rem;
}

.channel-form .el-form-item__label {
  font-weight: 500;
  color: #606266;
}

.channel-form .el-input,
.channel-form .el-select {
  width: 100%;
}

/* 让按钮区域跨越整个宽度 */
.channel-form > div:last-child {
  grid-column: span 2;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #EBEEF5;
}

/* 响应式调整 */
@media (max-width: 900px) {
  .channel-form {
    grid-template-columns: 1fr;
  gap: 1rem;
  }
  
  .channel-form .form-box {
    grid-column: span 1;
    grid-template-columns: 1fr;
  }
  
  .channel-form > div:last-child {
    grid-column: span 1;
  }
}
</style>
