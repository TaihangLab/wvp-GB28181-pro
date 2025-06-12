<template>
  <div class="business-group-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">
          <i class="el-icon-s-grid"></i>
          业务分组管理
        </h2>
        <p class="page-subtitle">管理和配置业务分组，实现通道的业务逻辑归类</p>
      </div>
      <div class="header-right">
        <el-button type="primary" icon="el-icon-plus" @click="add">
          添加通道
        </el-button>
        <el-button type="danger" icon="el-icon-delete" @click="remove" :disabled="multipleSelection.length === 0">
          移除通道
        </el-button>
        <el-button type="warning" icon="el-icon-warning" @click="showUnusualChanel">
          异常挂载
        </el-button>
        <el-button type="success" icon="el-icon-refresh" @click="handleRefresh" :loading="loading">
          刷新列表
        </el-button>
      </div>
    </div>

    <el-container v-loading="loading" class="main-container">
      <el-aside width="400px" class="tree-aside">
        <el-card class="tree-card" shadow="never">
          <div slot="header" class="tree-header">
            <span class="tree-title">
              <i class="el-icon-folder"></i>
              业务分组树
            </span>
            <div class="tree-controls">
              <el-checkbox v-model="showCode" @change="onShowCodeChange">显示编号</el-checkbox>
            </div>
          </div>
          <GroupTree ref="groupTree" :show-header="false" :edit="true" :clickEvent="treeNodeClickEvent"
                    :onChannelChange="onChannelChange" :enableAddChannel="true" :addChannelToGroup="addChannelToGroup" :showCode="showCode"></GroupTree>
        </el-card>
      </el-aside>
      
      <el-main class="content-main">
        <!-- 面包屑导航 -->
        <el-card class="breadcrumb-card" shadow="never">
          <div class="breadcrumb-content">
            <el-breadcrumb separator="/" v-if="regionParents.length > 0">
              <el-breadcrumb-item v-for="key in regionParents" :key="key">{{ key }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div v-else class="no-selection">
              <i class="el-icon-info"></i>
              未选择虚拟组织
            </div>
          </div>
        </el-card>

        <!-- 搜索筛选区域 -->
        <el-card class="search-card" shadow="never">
          <div class="search-form">
            <div class="search-row">
              <div class="search-item">
                <label>关键字搜索：</label>
                <el-input
                  v-model="searchSrt"
                  placeholder="通道名称、编号"
                  style="width: 220px;"
                  clearable
                  @input="search"
                  @clear="search">
                  <i slot="prefix" class="el-icon-search"></i>
                </el-input>
              </div>
              
              <div class="search-item">
                <label>在线状态：</label>
                <el-select
                  v-model="online"
                  placeholder="请选择"
                  style="width: 120px;"
                  clearable
                  @change="search">
                  <el-option label="全部" value=""></el-option>
                  <el-option label="在线" value="true"></el-option>
                  <el-option label="离线" value="false"></el-option>
                </el-select>
              </div>

              <div class="search-item">
                <label>通道类型：</label>
                <el-select
                  v-model="channelType"
                  placeholder="请选择"
                  style="width: 120px;"
                  clearable
                  @change="getChannelList">
                  <el-option label="全部" value=""></el-option>
                  <el-option v-for="item in Object.values($channelTypeList)" :key="item.id" :label="item.name" :value="item.id"></el-option>
                </el-select>
              </div>


            </div>
          </div>
        </el-card>

        <!-- 通道列表 -->
        <el-card class="table-card" shadow="never">
          <div slot="header" class="card-header">
            <span class="card-title">
              <i class="el-icon-menu"></i>
              通道列表
            </span>
            <div class="card-info">
              <span class="total-info">共 {{ total }} 个通道</span>
            </div>
          </div>

          <el-table
            :data="channelList"
            v-loading="loading"
            element-loading-text="加载中..."
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(0, 0, 0, 0.8)"
            empty-text="暂无通道数据"
            style="width: 100%"
            :height="$tableHeght"
            stripe
            border
            ref="channelListTable"
            @selection-change="handleSelectionChange"
            @row-dblclick="rowDblclick">
            
            <el-table-column type="selection" width="55" align="center"></el-table-column>
            
            <el-table-column prop="gbName" label="通道名称" min-width="180" show-overflow-tooltip>
              <template slot-scope="{ row }">
                <div class="channel-name">
                  <i class="el-icon-video-camera channel-icon"></i>
                  <span>{{ row.gbName }}</span>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="gbDeviceId" label="通道编号" min-width="180" align="center" show-overflow-tooltip></el-table-column>
            
            <el-table-column prop="gbManufacturer" label="厂商" min-width="100" align="center" show-overflow-tooltip></el-table-column>
            
            <el-table-column label="通道类型" min-width="100" align="center">
              <template slot-scope="{ row }">
                <el-tag size="medium" effect="plain" type="success" :style="$channelTypeList[row.dataType].style">
                  {{ $channelTypeList[row.dataType].name }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column label="在线状态" min-width="100" align="center">
              <template slot-scope="{ row }">
                <el-tag size="medium" v-if="row.gbStatus === 'ON'" type="success">在线</el-tag>
                <el-tag size="medium" type="info" v-else>离线</el-tag>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-container">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="currentChange"
              :current-page="currentPage"
              :page-size="count"
              :page-sizes="[15, 25, 35, 50]"
              layout="total, sizes, prev, pager, next"
              :total="total">
            </el-pagination>
          </div>
        </el-card>
      </el-main>
    </el-container>

    <!-- 弹窗组件 -->
    <GbChannelSelect ref="gbChannelSelect" dataType="group"></GbChannelSelect>
    <UnusualGroupChannelSelect ref="unusualGroupChannelSelect"></UnusualGroupChannelSelect>
  </div>
</template>

<script>
import DeviceService from "./service/DeviceService";
import GroupTree from "./dialogs/GroupTree.vue";
import GbChannelSelect from "./dialogs/GbChannelSelect.vue";
import UnusualGroupChannelSelect from "./dialogs/UnusualGroupChannelSelect.vue";

export default {
  name: 'BusinessGroup',
  components: {
    GroupTree,
    GbChannelSelect,
    UnusualGroupChannelSelect
  },
  data() {
    return {
      channelList: [],
      searchSrt: "",
      channelType: "",
      online: "",
      hasGroup: "false",
      currentPage: 1,
      count: 15,
      total: 0,
      loading: false,
      groupDeviceId: "",
      groupId: "",
      businessGroup: "",
      regionParents: [],
      multipleSelection: [],
      showCode: false
    };
  },
  created() {
    this.initData();
  },
  methods: {
    initData() {
      this.getChannelList();
    },
    currentChange(val) {
      this.currentPage = val;
      this.initData();
    },
    handleSizeChange(val) {
      this.count = val;
      this.getChannelList();
    },
    getChannelList() {
      this.$axios({
        method: 'get',
        url: `/api/common/channel/parent/list`,
        params: {
          page: this.currentPage,
          count: this.count,
          query: this.searchSrt,
          online: this.online,
          channelType: this.channelType,
          groupDeviceId: this.groupDeviceId
        }
      }).then((res) => {
        if (res.data.code === 0) {
          this.total = res.data.data.total;
          this.channelList = res.data.data.list;
          // 防止出现表格错位
          this.$nextTick(() => {
            this.$refs.channelListTable.doLayout();
          })
        }
      }).catch((error) => {
        console.log(error);
      });
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    rowDblclick(row, rowIndex) {
      // 双击行事件
    },
    add() {
      if (this.groupDeviceId === "") {
        this.$message.info({
          showClose: true,
          message: "请选择左侧虚拟组织节点"
        })
        return;
      }
      this.$refs.gbChannelSelect.openDialog((data) => {
        console.log("选择的数据")
        console.log(data)
        this.addChannelToGroup(this.groupDeviceId, this.businessGroup, data)
      })
    },
    addChannelToGroup(groupDeviceId, businessGroup, data) {
      if (data.length === 0) {
        return;
      }
      let channels = []
      for (let i = 0; i < data.length; i++) {
        channels.push(data[i].gbId)
      }
      this.loading = true

      this.$axios({
        method: 'post',
        url: `/api/common/channel/group/add`,
        data: {
          parentId: groupDeviceId,
          businessGroup: businessGroup,
          channelIds: channels
        }
      }).then((res) => {
        if (res.data.code === 0) {
          this.$message.success({
            showClose: true,
            message: "保存成功"
          })
          this.getChannelList()
        } else {
          this.$message.error({
            showClose: true,
            message: res.data.msg
          })
        }
        this.loading = false
      }).catch((error) => {
        this.$message.error({
          showClose: true,
          message: error
        })
        this.loading = false
      });
    },
    remove() {
      let channels = []
      for (let i = 0; i < this.multipleSelection.length; i++) {
        channels.push(this.multipleSelection[i].gbId)
      }
      if (channels.length === 0) {
        this.$message.info({
          showClose: true,
          message: "请选择通道"
        })
        return;
      }
      this.loading = true

      this.$axios({
        method: 'post',
        url: `/api/common/channel/group/delete`,
        data: {
          channelIds: channels
        }
      }).then((res) => {
        if (res.data.code === 0) {
          this.$message.success({
            showClose: true,
            message: "保存成功"
          })
          this.getChannelList()
          // 刷新树节点
          this.$refs.groupTree.refresh(this.groupDeviceId)
        } else {
          this.$message.error({
            showClose: true,
            message: res.data.msg
          })
        }
        this.loading = false
      }).catch((error) => {
        this.$message.error({
          showClose: true,
          message: error
        })
        this.loading = false
      });
    },
    showUnusualChanel() {
      this.$refs.unusualGroupChannelSelect.openDialog()
    },
    search() {
      this.currentPage = 1;
      this.total = 0;
      this.initData();
    },
    handleRefresh() {
      this.initData();
    },
    treeNodeClickEvent(group) {
      if (group.deviceId === "" || group.deviceId === group.businessGroup) {
        this.channelList = []
        this.regionParents = [];
        this.$message.info({
          showClose: true,
          message: "当前为业务分组，挂载通道请选择其下的虚拟组织，如不存在可右键新建"
        })
        return
      }
      this.groupDeviceId = group.deviceId;
      this.businessGroup = group.businessGroup;
      this.initData();
      // 获取regionDeviceId对应的节点信息
      this.$axios({
        method: 'get',
        url: `/api/group/path`,
        params: {
          deviceId: this.groupDeviceId,
          businessGroup: this.businessGroup,
        }
      }).then((res) => {
        if (res.data.code === 0) {
          let path = []
          for (let i = 0; i < res.data.data.length; i++) {
            path.push(res.data.data[i].name)
          }
          this.regionParents = path;
        }
      }).catch((error) => {
        console.log(error);
      });
    },
    onChannelChange(deviceId) {
      //
    },
    onShowCodeChange() {
      // 更新树组件的显示编号状态
      if (this.$refs.groupTree) {
        this.$refs.groupTree.showCode = this.showCode;
        this.$refs.groupTree.$forceUpdate();
      }
    }
  }
};
</script>

<style scoped>
/* 主容器 */
.business-group-container {
  height: 100%;
  background-color: #f5f7fa;
  padding: 20px;
  box-sizing: border-box;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.header-left .page-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
}

.header-left .page-title i {
  margin-right: 12px;
  font-size: 32px;
}

.header-left .page-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
  font-weight: 400;
}

.header-right {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.header-right .el-button {
  margin-left: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-weight: 600;
}

.header-right .el-button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}



/* 主要容器 */
.main-container {
  height: calc(100vh - 140px);
  background: transparent;
}

/* 侧边栏 */
.tree-aside {
  margin-right: 20px;
}

.tree-card {
  height: 100%;
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #303133;
}

.tree-title {
  display: flex;
  align-items: center;
  font-size: 16px;
}

.tree-title i {
  margin-right: 8px;
  color: #409EFF;
}

.tree-controls {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.tree-controls .el-checkbox {
  margin-left: 8px;
}

.tree-controls .el-checkbox__label {
  color: #606266;
  font-weight: 500;
}

/* 主内容区 */
.content-main {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 面包屑卡片 */
.breadcrumb-card {
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.breadcrumb-content {
  display: flex;
  align-items: center;
  min-height: 24px;
}

.no-selection {
  color: #00c6ff;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.no-selection i {
  margin-right: 8px;
}

/* 搜索区域 */
.search-card {
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.search-form {
  margin: 0;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.search-item label {
  font-weight: 500;
  color: #606266;
  font-size: 14px;
  min-width: max-content;
}



/* 表格卡片 */
.table-card {
  flex: 1;
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
}

.card-title i {
  margin-right: 8px;
  color: #409EFF;
}

.card-info {
  font-size: 14px;
  color: #909399;
}

.total-info {
  background: #f0f9ff;
  color: #1d4ed8;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 500;
}

/* 表格样式 */
.el-table {
  border-radius: 8px;
  overflow: hidden;
}

.el-table th {
  background-color: #f8f9fa !important;
  color: #606266;
  font-weight: 600;
  border-bottom: 2px solid #e9ecef;
}

.channel-name {
  display: flex;
  align-items: center;
}

.channel-icon {
  margin-right: 8px;
  color: #409EFF;
}

/* 分页 */
.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.el-pagination {
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .business-group-container {
    padding: 10px;
  }
  
  .page-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .main-container {
    flex-direction: column;
  }
  
  .tree-aside {
    width: 100% !important;
    margin-right: 0;
    margin-bottom: 16px;
  }
  
  .search-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-right {
    gap: 6px;
    justify-content: center;
  }
}
</style> 