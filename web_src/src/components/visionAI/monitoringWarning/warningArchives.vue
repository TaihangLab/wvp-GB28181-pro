<script>
export default {
  name: "WarningArchives",
  data() {
    return {
      // 接口定义
      WarningArchive: {
        id: 0,
        name: '',
        image: '',
        deviceName: '',
        warningTime: '',
        warningLevel: ''
      },
      ArchiveInfo: {
        name: '',
        location: '',
        timeRange: '',
        createTime: '',
        description: '',
        image: ''
      },
      // 预警等级枚举
      WARNING_LEVELS: {
        LEVEL1: { label: '一级预警', value: 'level1', color: '#ff4d4f' },
        LEVEL2: { label: '二级预警', value: 'level2', color: '#faad14' },
        LEVEL3: { label: '三级预警', value: 'level3', color: '#1890ff' },
        LEVEL4: { label: '四级预警', value: 'level4', color: '#52c41a' }
      },
      // 分页配置
      pagination: {
        currentPage: 1,
        pageSize: 20,
        total: 0
      },
      // 档案基本信息
      archiveInfo: {
        name: '厂区A10车间预警档案',
        location: '厂区A10车间',
        timeRange: '2023-01-01 00:00:00-2023-06-30 23:59:59',
        createTime: '2023-06-05 15:49:04',
        description: '-',
        image: ''
      },
      // 列表相关
      allArchiveList: [],
      archiveList: [],
      selectedRows: [],
      selectAll: false,
      // 详情弹框
      detailDialogVisible: false,
      currentDetail: null,
      // 图片预览
      imagePreviewVisible: false,
      currentPreviewImage: null,
      // 编辑相关
      isEditing: false,
      editingArchive: null,
      // 添加预警对话框
      showAddDialog: false,
      newArchive: {
        name: '',
        deviceName: '',
        warningLevel: '',
        description: ''
      },
      // 编辑档案表单
      editForm: {
        name: '',
        location: '',
        timeRange: '',
        createTime: '',
        description: '',
        image: ''
      },
      // 添加预警表单
      addForm: {
        name: '',
        deviceName: '',
        warningLevel: '',
        description: ''
      },
      // 对话框控制
      editDialogVisible: false,
      addDialogVisible: false,
      // 删除相关
      deleteConfirmVisible: false,
      deleteConfirmMessage: '',
      deleteType: '', // 'single' 或 'batch'
      deleteId: null,
    }
  },
  mounted() {
    this.initData();
    // 设置档案图片
    this.archiveInfo.image = this.getPreviewImage();
  },
  methods: {
    // 获取预览图片URL
    getPreviewImage() {
      // 这里返回一个实际的图片URL，可以是本地资源或远程URL
      return '/src/assets/images/preview.jpg'
    },
    // 初始化数据
    initData() {
      // 加载模拟数据
      this.allArchiveList = this.generateMockData();
      this.updatePageData();
    },
    // 生成模拟数据
    generateMockData() {
      const data = [];
      const devices = [
        'EF两区特检测区10社',
        '降盐水泵废水站',
        '东15风机',
        '齐心爱A20储产',
        'EF两区特检测区10社'
      ];
      
      const warningNames = [
        '安全帽识别',
        '工服识别',
        '安全帽识别',
        '玻璃运输车打卡',
        '烟火检测',
        '安全帽识别',
        '工服识别',
        '安全帽识别',
        '玻璃运输车打卡'
      ];
      
      for (let i = 1; i <= 9; i++) {
        const randomLevel = Math.floor(Math.random() * 4);
        const level = ['level1', 'level2', 'level3', 'level4'][randomLevel];
        let deviceName;
        
        // 根据序号选择设备名
        if (i === 1 || i === 5 || i === 8) {
          deviceName = 'EF两区特检测区10社';
        } else if (i === 2 || i === 3) {
          deviceName = '降盐水泵废水站';
        } else if (i === 4 || i === 6 || i === 9) {
          deviceName = '齐心爱A20储产';
        } else {
          deviceName = devices[Math.floor(Math.random() * devices.length)];
        }
        
        // 生成时间
        let startDate, endDate, startTime, endTime;
        if (i === 1) {
          startDate = '2023/6/11';
          startTime = '02:48:00';
          endTime = '02:49:38';
        } else if (i === 2) {
          startDate = '2023/6/11';
          startTime = '20:27:00';
          endTime = '20:28:13';
        } else if (i === 3) {
          startDate = '2023/6/8';
          startTime = '20:12:00';
          endTime = '20:16:53';
        } else if (i === 4) {
          startDate = '2023/6/25';
          startTime = '20:06:00';
          endTime = '20:06:38';
        } else if (i === 5) {
          startDate = '2023/6/3';
          startTime = '22:16:00';
          endTime = '22:18:00';
        } else if (i === 6) {
          startDate = '2023/6/18';
          startTime = '07:04:00';
          endTime = '07:08:32';
        } else if (i === 7) {
          startDate = '2023/5/31';
          startTime = '08:31:00';
          endTime = '08:34:51';
        } else if (i === 8) {
          startDate = '2023/6/14';
          startTime = '16:55:00';
          endTime = '16:58:53';
        } else {
          startDate = '2023/6/7';
          startTime = '13:15:00';
          startTime = '13:18:52';
        }
        
        const warningTime = `${startDate} ${startTime}-${startDate} ${endTime}`;
        
        data.push({
          id: i,
          name: warningNames[i-1] || `预警${i}`,
          image: this.getPreviewImage(),
          deviceName: deviceName,
          warningTime: warningTime,
          warningLevel: i === 3 || i === 5 ? 'level1' : (i === 1 || i === 2 || i === 4 || i === 9 ? 'level2' : (i === 6 || i === 7 ? 'level3' : 'level4'))
        });
      }
      return data;
    },
    // 显示图片预览
    showImagePreview(row) {
      this.currentPreviewImage = row.image;
      this.imagePreviewVisible = true;
    },
    // 更新页面数据
    updatePageData() {
      const start = (this.pagination.currentPage - 1) * this.pagination.pageSize;
      const end = start + this.pagination.pageSize;
      this.archiveList = this.allArchiveList.slice(start, end);
      this.pagination.total = this.allArchiveList.length;
    },
    // 页码改变
    handleCurrentChange(page) {
      this.pagination.currentPage = page;
      this.updatePageData();
    },
    // 每页条数改变
    handleSizeChange(size) {
      this.pagination.pageSize = size;
      this.pagination.currentPage = 1;
      this.updatePageData();
    },
    // 表格选择事件
    handleSelectionChange(selection) {
      this.selectedRows = selection.map(item => item.id);
      this.selectAll = selection.length === this.archiveList.length;
    },
    // 查看详情
    showDetail(record) {
      this.currentDetail = record;
      this.detailDialogVisible = true;
    },
    // 处理单条删除
    handleDelete(id) {
      this.deleteType = 'single';
      this.deleteId = id;
      this.deleteConfirmMessage = '确定要删除该预警档案吗？';
      this.deleteConfirmVisible = true;
    },
    // 处理批量删除
    handleBatchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请至少选择一条记录');
        return;
      }
      
      this.deleteType = 'batch';
      this.deleteConfirmMessage = `确定要删除选中的 ${this.selectedRows.length} 条记录吗？`;
      this.deleteConfirmVisible = true;
    },
    // 确认删除
    async confirmDelete() {
      try {
        if (this.deleteType === 'single') {
          // 单条删除
          const index = this.allArchiveList.findIndex(item => item.id === this.deleteId);
          if (index !== -1) {
            this.allArchiveList.splice(index, 1);
            this.$message.success('删除成功');
          }
        } else {
          // 批量删除
          this.allArchiveList = this.allArchiveList.filter(item => !this.selectedRows.includes(item.id));
          this.selectedRows = [];
          this.$message.success('批量删除成功');
        }
        
        // 更新页面数据
        this.updatePageData();
        this.deleteConfirmVisible = false;
      } catch (error) {
        this.$message.error('删除操作失败');
        console.error(error);
      }
    },
    // 编辑档案
    editArchive() {
      this.isEditing = true;
      this.editForm = { ...this.archiveInfo };
      this.editDialogVisible = true;
    },
    // 保存编辑
    saveEdit() {
      this.archiveInfo = { ...this.editForm };
      this.isEditing = false;
      this.editDialogVisible = false;
      this.$message.success('档案信息更新成功');
    },
    // 取消编辑
    cancelEdit() {
      this.isEditing = false;
      this.editDialogVisible = false;
    },
    // 添加新预警
    addWarning() {
      this.addDialogVisible = true;
      this.addForm = {
        name: '',
        deviceName: '',
        warningLevel: '',
        description: ''
      };
    },
    // 提交新预警
    submitNewWarning() {
      if (!this.addForm.name || !this.addForm.deviceName || !this.addForm.warningLevel) {
        this.$message.warning('请填写必要的信息');
        return;
      }
      
      const newId = this.allArchiveList.length > 0 ? Math.max(...this.allArchiveList.map(item => item.id)) + 1 : 1;
      
      const newRecord = {
        id: newId,
        name: this.addForm.name,
        deviceName: this.addForm.deviceName,
        warningLevel: this.addForm.warningLevel,
        image: this.getPreviewImage(),
        warningTime: new Date().toLocaleString(),
        description: this.addForm.description
      };
      
      this.allArchiveList.unshift(newRecord);
      this.updatePageData();
      this.addDialogVisible = false;
      this.$message.success('成功添加新预警记录');
    }
  }
}
</script>

<template>
  <div class="page-container">
    <!-- 预警档案标题和操作按钮 -->
    <div class="header-section">
      <div class="left-title">预警档案</div>
      <div class="header-actions">
        <el-button type="danger" class="batch-delete-btn" @click="handleBatchDelete" :disabled="selectedRows.length === 0">
          批量删除
        </el-button>
        <el-button type="primary" class="add-btn" @click="addWarning">
          <i class="el-icon-plus"></i> 添加预警
        </el-button>
      </div>
    </div>
    
    <!-- 内容区域 -->
    <div class="content-wrapper">
      <!-- 左侧表格区域 -->
      <div class="table-section">
        <el-table
          :data="archiveList"
          @selection-change="handleSelectionChange"
          style="width: 100%"
        >
          <el-table-column type="selection" width="55" align="center"></el-table-column>
          <el-table-column label="序号" prop="id" width="80" align="center"></el-table-column>
          <el-table-column label="预警名称" prop="name" min-width="120" align="center"></el-table-column>
          <el-table-column label="预警图片" width="100" align="center">
            <template slot-scope="scope">
              <div class="preview-image-cell">
                <div class="mini-blue-box" @click="showImagePreview(scope.row)">
                  <span>预警图片</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="设备名称" prop="deviceName" min-width="150" align="center"></el-table-column>
          <el-table-column label="预警时间" prop="warningTime" min-width="180" align="center"></el-table-column>
          <el-table-column label="预警等级" width="100" align="center">
            <template slot-scope="scope">
              <span 
                class="level-tag" 
                :class="{
                  'level1-tag': scope.row.warningLevel === 'level1',
                  'level2-tag': scope.row.warningLevel === 'level2',
                  'level3-tag': scope.row.warningLevel === 'level3',
                  'level4-tag': scope.row.warningLevel === 'level4'
                }"
              >
                {{ scope.row.warningLevel === 'level1' ? '一级预警' : 
                   scope.row.warningLevel === 'level2' ? '二级预警' : 
                   scope.row.warningLevel === 'level3' ? '三级预警' : '四级预警' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="center">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="showDetail(scope.row)" class="detail-btn">详情</el-button>
              <el-button type="text" size="small" @click="handleDelete(scope.row.id)" class="delete-btn">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页区域 -->
        <div class="pagination-container">
          <div class="page-info">共 {{ pagination.total }} 条</div>
          <el-select
            v-model="pagination.pageSize"
            size="small"
            @change="handleSizeChange"
            class="page-size-select"
          >
            <el-option
              v-for="item in [10, 20, 50, 100]"
              :key="item"
              :label="`${item}条/页`"
              :value="item"
            ></el-option>
          </el-select>
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pagination.currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pagination.pageSize"
            layout="prev, pager, next, jumper"
            :total="pagination.total"
            background
            small
          >
          </el-pagination>
        </div>
      </div>
      
      <!-- 右侧档案信息区域 -->
      <div class="detail-section">
        <div class="detail-header">
          <div class="detail-title">档案基本信息</div>
          <el-button type="text" class="edit-btn" @click="editArchive">编辑</el-button>
        </div>
        
        <div class="detail-content">
          <div class="blue-preview-box">
            <el-button type="text" class="preview-btn">预览图片</el-button>
          </div>
          
          <div class="info-list">
            <div class="info-item">
              <span class="label">档案名称：</span>
              <span class="value">{{ archiveInfo.name }}</span>
            </div>
            <div class="info-item">
              <span class="label">相关位置：</span>
              <span class="value">{{ archiveInfo.location }}</span>
            </div>
            <div class="info-item">
              <span class="label">档案时间：</span>
              <span class="value">{{ archiveInfo.timeRange }}</span>
            </div>
            <div class="info-item">
              <span class="label">创建时间：</span>
              <span class="value">{{ archiveInfo.createTime }}</span>
            </div>
            <div class="info-item">
              <span class="label">档案描述：</span>
              <span class="value">{{ archiveInfo.description || '-' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 详情弹框 -->
    <el-dialog
      title="预警详情"
      :visible.sync="detailDialogVisible"
      width="30%"
      :append-to-body="true"
      custom-class="warning-detail-dialog"
    >
      <div v-if="currentDetail" class="detail-container">
        <div class="blue-preview-box detail-image-box">
          <el-button type="text" class="preview-btn">预警图像</el-button>
        </div>
        <div class="detail-info">
          <div class="detail-item">
            <span class="label">预警名称：</span>
            <span class="value">{{ currentDetail.name }}</span>
          </div>
          <div class="detail-item">
            <span class="label">设备位置：</span>
            <span class="value">{{ currentDetail.deviceName }}</span>
          </div>
          <div class="detail-item">
            <span class="label">预警时间：</span>
            <span class="value">{{ currentDetail.warningTime }}</span>
          </div>
          <div class="detail-item">
            <span class="label">预警等级：</span>
            <span class="value">
              <span 
                class="level-tag" 
                :class="{
                  'level1-tag': currentDetail.warningLevel === 'level1',
                  'level2-tag': currentDetail.warningLevel === 'level2',
                  'level3-tag': currentDetail.warningLevel === 'level3',
                  'level4-tag': currentDetail.warningLevel === 'level4'
                }"
              >
                {{ currentDetail.warningLevel === 'level1' ? '一级预警' : 
                   currentDetail.warningLevel === 'level2' ? '二级预警' : 
                   currentDetail.warningLevel === 'level3' ? '三级预警' : '四级预警' }}
              </span>
            </span>
          </div>
        </div>
      </div>
    </el-dialog>
    
    <!-- 图片预览弹框 -->
    <el-dialog
      title="预警图片预览"
      :visible.sync="imagePreviewVisible"
      width="30%"
      custom-class="image-preview-dialog"
    >
      <div class="image-preview-container" v-if="currentPreviewImage">
        <div class="blue-preview-box preview-image-full">
          <el-button type="text" class="preview-btn">预警图像</el-button>
        </div>
      </div>
    </el-dialog>
    
    <!-- 编辑档案弹框 -->
    <el-dialog
      title="编辑档案信息"
      :visible.sync="editDialogVisible"
      width="30%"
      :before-close="cancelEdit"
      custom-class="edit-archive-dialog"
    >
      <el-form :model="editForm" label-width="100px" class="edit-form">
        <el-form-item label="档案名称">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
        <el-form-item label="所属位置">
          <el-input v-model="editForm.location"></el-input>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-input v-model="editForm.timeRange"></el-input>
        </el-form-item>
        <el-form-item label="备注描述">
          <el-input type="textarea" v-model="editForm.description" rows="4"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelEdit" class="cancel-btn">取 消</el-button>
        <el-button type="primary" @click="saveEdit" class="confirm-btn">确 定</el-button>
      </div>
    </el-dialog>
    
    <!-- 添加预警弹框 -->
    <el-dialog
      title="添加预警"
      :visible.sync="addDialogVisible"
      width="30%"
      custom-class="add-warning-dialog"
    >
      <el-form :model="addForm" label-width="100px" class="add-form">
        <el-form-item label="预警名称" required>
          <el-input v-model="addForm.name" placeholder="请输入预警名称"></el-input>
        </el-form-item>
        <el-form-item label="设备位置" required>
          <el-input v-model="addForm.deviceName" placeholder="请输入设备位置"></el-input>
        </el-form-item>
        <el-form-item label="预警等级" required>
          <el-select v-model="addForm.warningLevel" placeholder="请选择预警等级" style="width: 100%">
            <el-option label="一级预警" value="level1"></el-option>
            <el-option label="二级预警" value="level2"></el-option>
            <el-option label="三级预警" value="level3"></el-option>
            <el-option label="四级预警" value="level4"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注描述">
          <el-input type="textarea" v-model="addForm.description" rows="4" placeholder="请输入备注描述"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false" class="cancel-btn">取 消</el-button>
        <el-button type="primary" @click="submitNewWarning" class="confirm-btn">确 定</el-button>
      </div>
    </el-dialog>
    
    <!-- 删除确认对话框 -->
    <el-dialog
      title="删除确认"
      :visible.sync="deleteConfirmVisible"
      width="25%"
      custom-class="delete-confirm-dialog"
      center
    >
      <div class="confirm-content">
        <p>{{ deleteConfirmMessage }}</p>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="deleteConfirmVisible = false" class="cancel-btn">取 消</el-button>
        <el-button size="small" type="danger" @click="confirmDelete" class="confirm-btn">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.page-container {
  padding: 0;
  background: #f0f2f5;
  min-height: calc(100vh - 60px);
  position: relative;
}

/* 头部区域 */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  margin-bottom: 10px;
}

.left-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.batch-delete-btn {
  background-color: #f56c6c;
  border-color: #f56c6c;
}

.add-btn {
  background-color: #409eff;
  border-color: #409eff;
}

/* 内容区域 */
.content-wrapper {
  display: flex;
  gap: 16px;
}

/* 表格区域样式 */
.table-section {
  flex: 1;
  background: white;
  border-radius: 4px;
  padding-bottom: 10px;
}

/* 移除表格竖线条 */
::v-deep .table-section .el-table--border td,
::v-deep .table-section .el-table--border th {
  border-right: none;
}

::v-deep .table-section .el-table::before,
::v-deep .table-section .el-table::after {
  display: none;
}

/* 调整el-table样式 */
::v-deep .table-section .el-table th {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 500;
  padding: 8px 0;
  text-align: center;
}

::v-deep .table-section .el-table--border {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

::v-deep .table-section .el-table td {
  padding: 8px 0;
  text-align: center;
}

::v-deep .table-section .el-table__row {
  border-bottom: 1px solid #ebeef5;
}

/* 预览图片单元格 */
.preview-image-cell {
  text-align: center;
}

.image-link {
  color: #409eff;
}

/* 预警等级标签 */
.level-tag {
  display: inline-block;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 2px;
}

.level1-tag {
  background-color: #fff0f0;
  color: #f56c6c;
}

.level2-tag {
  background-color: #fff8e6;
  color: #e6a23c;
}

.level3-tag {
  background-color: #e6f2ff;
  color: #1890ff;
}

.level4-tag {
  background-color: #e6f7e6;
  color: #67c23a;
}

/* 操作按钮 */
.detail-btn {
  color: #409eff;
  margin-right: 10px;
}

.delete-btn {
  color: #f56c6c;
}

/* 分页样式 */
.pagination-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 16px 20px;
}

.page-info {
  color: #606266;
  font-size: 13px;
  margin-right: 16px;
}

.page-size-select {
  margin-right: 16px;
  width: 90px;
}

::v-deep .pagination-container .el-pagination {
  padding: 0;
  font-weight: 400;
}

::v-deep .pagination-container .el-pagination .el-pagination__jump {
  margin-left: 10px;
}

::v-deep .pagination-container .el-pagination .el-input__inner {
  height: 24px;
  line-height: 24px;
}

::v-deep .pagination-container .el-pagination .btn-prev,
::v-deep .pagination-container .el-pagination .btn-next {
  padding: 0 6px;
  background-color: #f4f4f5;
  color: #606266;
  min-width: 24px;
}

::v-deep .pagination-container .el-pagination .el-pager li {
  min-width: 24px;
  height: 24px;
  line-height: 24px;
  font-size: 12px;
}

/* 右侧详情部分 */
.detail-section {
  width: 330px;
  background: white;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
}

.detail-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.edit-btn {
  color: #409eff;
}

.detail-content {
  padding: 16px;
}

/* 预览图片蓝色框 */
.blue-preview-box {
  width: 100%;
  height: 180px;
  background-color: #ecf5ff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.preview-btn {
  color: #409eff;
  font-size: 14px;
}

/* 详情蓝色框 */
.detail-image-box {
  height: 200px;
}

/* 信息列表 */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  font-size: 14px;
  line-height: 1.5;
  text-align: left;
}

.info-item .label {
  color: #606266;
  width: 80px;
  flex-shrink: 0;
  text-align: left;
}

.info-item .value {
  color: #333;
  flex: 1;
  text-align: left;
}

/* 弹窗通用样式 */
::v-deep .el-dialog__header {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}

::v-deep .el-dialog__title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

::v-deep .el-dialog__body {
  padding: 20px;
}

::v-deep .el-dialog__footer {
  padding: 10px 20px 20px;
  text-align: right;
}

::v-deep .cancel-btn {
  margin-right: 10px;
}

::v-deep .confirm-btn {
  min-width: 80px;
}

/* 详情弹窗 */
::v-deep .warning-detail-dialog .el-dialog {
  border-radius: 4px;
  overflow: hidden;
}

.detail-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-info {
  background: #f8f8f8;
  padding: 20px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.detail-item {
  display: flex;
  font-size: 14px;
  align-items: center;
}

.detail-item .label {
  width: 100px;
  color: #606266;
  flex-shrink: 0;
}

.detail-item .value {
  flex: 1;
  color: #333;
}

/* 图片预览对话框 */
::v-deep .image-preview-dialog .el-dialog {
  border-radius: 4px;
  overflow: hidden;
}

.image-preview-container {
  text-align: center;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 4px;
}

.preview-image-full {
  width: 100%;
  height: 300px;
  object-fit: contain;
}

/* 编辑档案弹窗 */
::v-deep .edit-archive-dialog .el-dialog {
  border-radius: 4px;
  overflow: hidden;
}

.edit-form .el-form-item {
  margin-bottom: 20px;
}

.edit-form .el-input__inner {
  height: 36px;
  line-height: 36px;
}

.edit-form .el-textarea__inner {
  min-height: 80px;
}

/* 添加预警弹窗 */
::v-deep .add-warning-dialog .el-dialog {
  border-radius: 4px;
  overflow: hidden;
}

.add-form .el-form-item {
  margin-bottom: 20px;
}

.add-form .el-input__inner {
  height: 36px;
  line-height: 36px;
}

.add-form .el-textarea__inner {
  min-height: 80px;
}

/* 删除确认弹窗 */
::v-deep .delete-confirm-dialog .el-dialog {
  border-radius: 4px;
  overflow: hidden;
  min-width: 320px;
}

::v-deep .delete-confirm-dialog .el-dialog__body {
  padding: 30px 20px;
}

::v-deep .delete-confirm-dialog .el-dialog__footer {
  border-top: 1px solid #ebeef5;
  padding: 10px 20px;
}

.confirm-content {
  text-align: center;
  font-size: 14px;
  color: #606266;
}

/* 表格中预警图片小蓝框 */
.mini-blue-box {
  width: 80px;
  height: 50px;
  background-color: #ecf5ff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  cursor: pointer;
  font-size: 12px;
  color: #409eff;
  transition: all 0.2s;
}

.mini-blue-box:hover {
  background-color: #d9ecff;
  color: #1890ff;
}
</style>