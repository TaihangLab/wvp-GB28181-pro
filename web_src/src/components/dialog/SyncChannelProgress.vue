<template>
  <div id="SyncChannelProgress" v-loading="isLoging">
    <el-dialog
      width="240px"
      top="13%"
      :append-to-body="true"
      :close-on-click-modal="false"
      :visible.sync="showDialog"
      :destroy-on-close="true"
      :show-close="true"
      @close="close()"
     style="text-align: center">
      <el-progress type="circle" :percentage="percentage" :status="syncStatus"></el-progress>
      <div style="text-align: center">
        {{msg}}
      </div>
    </el-dialog>
  </div>
</template>

<script>

export default {
  name: "SyncChannelProgress",
  computed: {},
  props: ['platformId'],
  created() {},
  data() {
    return {
      endCallBack: null,
      syncStatus: null,
      percentage: 0,
      total: 0,
      current: 0,
      showDialog: false,
      isLoging: false,
      syncFlag: false,
      deviceId: null,
      timmer: null,
      msg: "正在同步",
    };
  },
  methods: {
    openDialog: function (deviceId, endCallBack) {
      console.log("deviceId: " + deviceId)
      this.deviceId = deviceId;
      this.showDialog = true;
      this.msg = "";
      this.percentage= 0;
      this.total= 0;
      this.current= 0;
      this.syncFlag= false;
      this.syncStatus = null;
      this.endCallBack = endCallBack;
      this.getProgress()
    },
    getProgress(){
      this.$axios({
        method: 'get',
        url:`/api/device/query/${this.deviceId}/sync_status/`,
      }).then((res) => {
        if (res.data.code === 0) {

          if (res.data.data != null) {
            if (res.data.data.syncIng) {
              if (res.data.data.total === 0) {
                this.msg = `等待同步中`;
                this.timmer = setTimeout(this.getProgress, 300)
              }else {
                this.syncFlag = true;
                this.total = res.data.data.total;
                this.current = res.data.data.current;
                this.percentage = Math.floor(Number(res.data.data.current)/Number(res.data.data.total)* 10000)/100;
                this.msg = `同步中...[${res.data.data.current}/${res.data.data.total}]`;
                this.timmer = setTimeout(this.getProgress, 300)
              }
            }else {
              if (res.data.data.errorMsg){
                this.msg = res.data.data.errorMsg;
                this.syncStatus = "exception"
              }else {
                this.syncStatus = "success"
                this.percentage = 100;
                this.msg = '同步成功';
                setTimeout(()=>{
                  this.showDialog = false;
                }, 3000)
              }
            }
          }else {
            this.msg = res.data.msg;
            this.timmer = setTimeout(this.getProgress, 300)
          }
        }else {
          if (this.syncFlag) {
            this.syncStatus = "success"
            this.percentage = 100;
            this.msg = '同步成功';
          }else {
            this.syncStatus = "error"
            this.msg = res.data.msg;
          }
        }
      }).catch((error) =>{
        console.log(error);
        this.syncStatus = "error"
        this.msg = error.response.data.msg;
      });
    },
    close: function (){
      if (this.endCallBack) {
        this.endCallBack()
      }
      window.clearTimeout(this.timmer)
    }
  },
};
</script>
