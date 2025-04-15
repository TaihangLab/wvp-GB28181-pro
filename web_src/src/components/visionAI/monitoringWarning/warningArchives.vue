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
        Red: { label: '一级预警', value: 'red', color: '#ff4d4f' },
        Orange: { label: '二级预警', value: 'orange', color: '#faad14' },
        Yellow: { label: '三级预警', value: 'yellow', color: '#faad14' },
        Blue: { label: '四级预警', value: 'blue', color: '#52c41a' }
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
      // 多个档案列表
      archivesList: [
        {
          id: 1,
          name: '厂区A10车间预警档案',
          location: '厂区A10车间',
          timeRange: '2023-01-01 00:00:00-2023-06-30 23:59:59',
          createTime: '2023-06-05 15:49:04',
          description: '-',
          image: ''
        },
        {
          id: 2,
          name: '东15风机预警档案',
          location: '东15风机',
          timeRange: '2023-01-01 00:00:00-2023-06-30 23:59:59',
          createTime: '2023-06-10 09:25:18',
          description: '东15风机特殊情况监控',
          image: ''
        },
        {
          id: 3,
          name: 'EF两区特检测区预警档案',
          location: 'EF两区特检测区',
          timeRange: '2023-01-01 00:00:00-2023-06-30 23:59:59',
          createTime: '2023-05-20 16:40:33',
          description: '特检区域重点监控',
          image: ''
        },
        {
          id: 4,
          name: '降盐水泵废水站预警档案',
          location: '降盐水泵废水站',
          timeRange: '2023-01-01 00:00:00-2023-06-30 23:59:59',
          createTime: '2023-05-15 11:23:46',
          description: '废水处理站安全监控',
          image: ''
        }
      ],
      // 当前选中的档案ID
      currentArchiveId: 1,
      // 列表相关
      allArchiveList: [],
      archiveList: [],
      // 每个档案对应的预警列表
      archiveWarningLists: {},
      selectedRows: [],
      selectAll: false,
      // 详情弹框
      detailDialogVisible: false,
      currentDetail: null,
      // 图片预览
      imagePreviewVisible: false,
      currentPreviewImage: null,
      // 文件上传相关
      uploadAction: 'https://jsonplaceholder.typicode.com/posts/', // 模拟上传地址
      uploadHeaders: {
        Authorization: 'Bearer token'
      },
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
      // 添加档案对话框
      addArchiveDialogVisible: false,
      newArchiveForm: {
        name: '',
        location: '',
        timeRange: '',
        description: '',
        image: ''
      }
    }
  },
  mounted() {
    this.initData();
  },
  methods: {
    // 获取预览图片URL
    getPreviewImage() {
      // 这里返回一个实际的图片URL，可以是本地资源或远程URL
      return 'https://via.placeholder.com/300x200/ecf5ff/409eff?text=预览图片';
    },
    // 显示图片预览
    showImagePreview(row) {
      this.currentPreviewImage = row.image;
      this.imagePreviewVisible = true;
    },
    // 初始化数据
    initData() {
      // 为每个档案生成对应的预警数据
      this.archivesList.forEach(archive => {
        this.archiveWarningLists[archive.id] = this.generateMockDataForArchive(archive);
      });
      
      // 设置当前档案信息
      this.archiveInfo = { ...this.archivesList[0] };
      
      // 设置当前档案的预警列表
      this.allArchiveList = this.archiveWarningLists[this.currentArchiveId];
      this.updatePageData();
    },
    // 生成特定档案的模拟数据
    generateMockDataForArchive(archive) {
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
      
      // 根据档案ID决定生成多少条数据
      const count = archive.id === 1 ? 9 : (archive.id === 2 ? 6 : (archive.id === 3 ? 8 : 5));
      
      for (let i = 1; i <= count; i++) {
        const randomLevel = Math.floor(Math.random() * 4);
        const level = ['level1', 'level2', 'level3', 'level4'][randomLevel];
        let deviceName;
        
        // 根据档案类型选择对应的设备名
        if (archive.id === 1) {
          deviceName = i % 3 === 0 ? '厂区A10车间' : '厂区A10车间区域' + (i % 5 + 1);
        } else if (archive.id === 2) {
          deviceName = '东15风机';
        } else if (archive.id === 3) {
          deviceName = 'EF两区特检测区10社';
        } else {
          deviceName = '降盐水泵废水站';
        }
        
        // 生成时间
        const currentYear = new Date().getFullYear();
        const randomMonth = Math.floor(Math.random() * 6) + 1;
        const randomDay = Math.floor(Math.random() * 28) + 1;
        const randomHour = Math.floor(Math.random() * 24);
        const randomMinute = Math.floor(Math.random() * 60);
        
        const startDate = `${currentYear}/${randomMonth}/${randomDay}`;
        const startTime = `${randomHour.toString().padStart(2, '0')}:${randomMinute.toString().padStart(2, '0')}:00`;
        const endTime = `${randomHour.toString().padStart(2, '0')}:${(randomMinute + Math.floor(Math.random() * 5) + 1).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
        
        const warningTime = `${startDate} ${startTime}-${startDate} ${endTime}`;
        
        data.push({
          id: i,
          name: warningNames[(i - 1) % warningNames.length] || `预警${i}`,
          image: this.getPreviewImage(),
          deviceName: deviceName,
          warningTime: warningTime,
          warningLevel: i % 4 === 0 ? 'level1' : (i % 4 === 1 ? 'level2' : (i % 4 === 2 ? 'level3' : 'level4'))
        });
      }
      return data;
    },
    // 切换到指定档案
    switchToArchive(archiveId) {
      this.currentArchiveId = archiveId;
      // 更新当前档案信息
      const selectedArchive = this.archivesList.find(item => item.id === archiveId);
      if (selectedArchive) {
        this.archiveInfo = { ...selectedArchive };
        // 更新预警列表数据
        this.allArchiveList = this.archiveWarningLists[archiveId];
        this.pagination.currentPage = 1;
        this.updatePageData();
      }
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
      // 确保编辑时显示原有图片
      if (!this.editForm.image) {
        this.editForm.image = this.getPreviewImage();
      }
      this.editDialogVisible = true;
    },
    // 保存编辑
    saveEdit() {
      // 更新档案信息
      this.archiveInfo = { ...this.editForm };
      
      // 同时更新档案列表中的对应档案
      const index = this.archivesList.findIndex(item => item.id === this.currentArchiveId);
      if (index !== -1) {
        this.archivesList[index] = { ...this.editForm, id: this.currentArchiveId };
      }
      
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
    },
    // 添加新档案
    addNewArchive() {
      this.addArchiveDialogVisible = true;
      this.newArchiveForm = {
        name: '',
        location: '',
        timeRange: '',
        description: '',
        image: ''
      };
    },
    // 提交新档案
    submitNewArchive() {
      if (!this.newArchiveForm.name || !this.newArchiveForm.location) {
        this.$message.warning('请填写必要的信息');
        return;
      }
      
      const newArchiveId = this.archivesList.length > 0 
        ? Math.max(...this.archivesList.map(item => item.id)) + 1 
        : 1;
      
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const day = currentDate.getDate().toString().padStart(2, '0');
      const hours = currentDate.getHours().toString().padStart(2, '0');
      const minutes = currentDate.getMinutes().toString().padStart(2, '0');
      const seconds = currentDate.getSeconds().toString().padStart(2, '0');
      
      const createTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      
      const newArchive = {
        id: newArchiveId,
        name: this.newArchiveForm.name,
        location: this.newArchiveForm.location,
        timeRange: this.newArchiveForm.timeRange || `${year}-01-01 00:00:00-${year}-12-31 23:59:59`,
        createTime: createTime,
        description: this.newArchiveForm.description || '-',
        image: this.newArchiveForm.image || this.getPreviewImage()
      };
      
      // 添加到档案列表
      this.archivesList.push(newArchive);
      
      // 为新档案生成预警数据
      this.archiveWarningLists[newArchiveId] = this.generateMockDataForArchive(newArchive);
      
      // 切换到新档案
      this.switchToArchive(newArchiveId);
      
      this.addArchiveDialogVisible = false;
      this.$message.success('成功添加新档案');
    },
    // 处理上传成功后的逻辑
    handleUploadSuccess(response, file) {
      // 实际项目中应从服务器响应中获取图片URL
      // 这里使用本地文件预览URL作为演示
      const imageUrl = URL.createObjectURL(file.raw);
      
      // 根据上下文设置不同表单的图片
      if (this.editDialogVisible) {
        this.editForm.image = imageUrl;
      } else if (this.addArchiveDialogVisible) {
        this.newArchiveForm.image = imageUrl;
      }
      
      this.$message.success('图片上传成功');
    },
    // 处理上传前的图片校验
    beforeUpload(file) {
      // 检查文件类型
      const isImage = file.type.indexOf('image/') === 0;
      if (!isImage) {
        this.$message.error('只能上传图片文件!');
        return false;
      }
      
      // 检查文件大小，限制为2MB
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        this.$message.error('图片不能超过2MB!');
        return false;
      }
      
      return true;
    },
    // 处理上传错误
    handleUploadError(error) {
      console.error('上传错误', error);
      this.$message.error('图片上传失败，请重试');
    },
    // 处理移除图片
    handleRemove() {
      if (this.editDialogVisible) {
        this.editForm.image = '';
      } else if (this.addArchiveDialogVisible) {
        this.newArchiveForm.image = '';
      }
    }
  }
}
</script>

<template>
  <div class="page-container">
    <!-- 内容区域 -->
    <div class="content-wrapper">
 
      <!-- 左侧档案信息区域 -->
      <div class="detail-section">
        <div class="detail-header">
          <div class="detail-title">档案基本信息</div>
          <div class="header-actions">
            <el-button type="primary" size="mini" @click="addNewArchive">添加档案</el-button>
          </div>
        </div>

        <!-- 档案列表 -->
        <div class="archives-list">
          <div 
            v-for="archive in archivesList" 
            :key="archive.id" 
            class="archive-item"
            :class="{'active': currentArchiveId === archive.id}"
            @click="switchToArchive(archive.id)"
          >
            <div class="archive-content">
              <div class="archive-name">{{ archive.name }}</div>
              <div class="archive-location">位置: {{ archive.location }}</div>
              <div class="archive-time">创建: {{ archive.createTime }}</div>
            </div>
          </div>
        </div>

        <!-- 当前选中档案详情 -->
        <div class="detail-content">
          <div class="archive-detail-card">
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
            <div class="action-buttons">
              <el-button type="primary" plain size="small" class="edit-archive-btn" @click="editArchive">编辑档案</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧表格区域 -->
      <div class="table-section">
        <!-- 表格标题和操作按钮 -->
        <div class="table-header">
          <div class="table-title">预警列表 - {{ archiveInfo.name }}</div>
          <div class="table-actions">
            <el-button type="danger" size="small" class="batch-delete-btn" @click="handleBatchDelete" :disabled="selectedRows.length === 0">
              批量删除
            </el-button>
            <el-button type="primary" size="small" class="add-btn" @click="addWarning">
              <i class="el-icon-plus"></i> 添加预警
            </el-button>
          </div>
        </div>
        
        <!-- 表格内容 -->
        <el-table :data="archiveList" @selection-change="handleSelectionChange" style="width: 100%">
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
              <span class="level-tag" :class="{
                'level1-tag': scope.row.warningLevel === 'level1',
                'level2-tag': scope.row.warningLevel === 'level2',
                'level3-tag': scope.row.warningLevel === 'level3',
                'level4-tag': scope.row.warningLevel === 'level4'
              }">
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
          <el-select v-model="pagination.pageSize" size="small" @change="handleSizeChange" class="page-size-select">
            <el-option v-for="item in [10, 20, 50, 100]" :key="item" :label="`${item}条/页`" :value="item"></el-option>
          </el-select>
          <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
            :current-page="pagination.currentPage" :page-sizes="[10, 20, 50, 100]" :page-size="pagination.pageSize"
            layout="prev, pager, next, jumper" :total="pagination.total" background small>
          </el-pagination>
        </div>
      </div>

    </div>

    <!-- 详情弹框 -->
    <el-dialog title="预警详情" :visible.sync="detailDialogVisible" width="30%" :append-to-body="true"
      custom-class="warning-detail-dialog">
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
              <span class="level-tag" :class="{
                'level1-tag': currentDetail.warningLevel === 'level1',
                'level2-tag': currentDetail.warningLevel === 'level2',
                'level3-tag': currentDetail.warningLevel === 'level3',
                'level4-tag': currentDetail.warningLevel === 'level4'
              }">
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
    <el-dialog title="预警图片预览" :visible.sync="imagePreviewVisible" width="30%" custom-class="image-preview-dialog">
      <div class="image-preview-container" v-if="currentPreviewImage">
        <div class="blue-preview-box preview-image-full">
          <el-button type="text" class="preview-btn">预警图像</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 编辑档案弹框 -->
    <el-dialog title="编辑档案信息" :visible.sync="editDialogVisible" width="30%" :before-close="cancelEdit"
      custom-class="edit-archive-dialog">
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
    <el-dialog title="添加预警" :visible.sync="addDialogVisible" width="30%" custom-class="add-warning-dialog">
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
    <el-dialog title="删除确认" :visible.sync="deleteConfirmVisible" width="25%" custom-class="delete-confirm-dialog"
      center>
      <div class="confirm-content">
        <p>{{ deleteConfirmMessage }}</p>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="deleteConfirmVisible = false" class="cancel-btn">取 消</el-button>
        <el-button size="small" type="danger" @click="confirmDelete" class="confirm-btn">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 添加档案对话框 -->
    <el-dialog title="添加新档案" :visible.sync="addArchiveDialogVisible" width="30%" custom-class="add-archive-dialog">
      <el-form :model="newArchiveForm" label-width="100px" class="add-form">
        <el-form-item label="档案名称" required>
          <el-input v-model="newArchiveForm.name"></el-input>
        </el-form-item>
        <el-form-item label="所属位置" required>
          <el-input v-model="newArchiveForm.location"></el-input>
        </el-form-item>
        <el-form-item label="时间范围" required>
          <el-input v-model="newArchiveForm.timeRange"></el-input>
        </el-form-item>
        <el-form-item label="备注描述">
          <el-input type="textarea" v-model="newArchiveForm.description" rows="4" placeholder="请输入备注描述"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addArchiveDialogVisible = false" class="cancel-btn">取 消</el-button>
        <el-button type="primary" @click="submitNewArchive" class="confirm-btn">确 定</el-button>
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

/* 内容区域 */
.content-wrapper {
  display: flex;
  gap: 16px;
  padding: 16px;
}

/* 表格区域样式 */
.table-section {
  flex: 1;
  background: white;
  border-radius: 4px;
  padding-bottom: 10px;
  display: flex;
  flex-direction: column;
}

/* 表格头部 */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
}

.table-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.table-actions {
  display: flex;
  gap: 10px;
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
  border: none;
  border-radius: 0;
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

/* 旧样式保留兼容 */
.high-level {
  background-color: #fff0f0;
  color: #f56c6c;
}

.medium-level {
  background-color: #fff8e6;
  color: #e6a23c;
}

.low-level {
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
  margin-top: auto;
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

/* 左侧详情部分 */
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

.header-actions {
  display: flex;
  gap: 8px;
}

.edit-btn {
  color: #409eff;
}

/* 档案列表样式 */
.archives-list {
  max-height: 300px;
  overflow-y: auto;
  border-bottom: 1px solid #ebeef5;
  padding: 0 10px;
}

.archive-item {
  padding: 12px;
  border-radius: 4px;
  margin: 8px 0;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #ebeef5;
  position: relative;
}

.archive-item:hover {
  background-color: #f5f7fa;
}

.archive-item.active {
  background-color: #ecf5ff;
  border-color: #d9ecff;
}

.archive-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: #409eff;
  border-radius: 4px 0 0 4px;
}

.archive-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.archive-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.archive-location, .archive-time {
  font-size: 12px;
  color: #909399;
}

.detail-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.archive-detail-card {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 20px;
}

/* 信息列表 */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  font-size: 14px;
  line-height: 1.5;
  text-align: left;
  padding-bottom: 12px;
  border-bottom: 1px solid #f5f7fa;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  color: #909399;
  width: 90px;
  flex-shrink: 0;
  text-align: left;
  font-weight: 500;
}

.info-item .value {
  color: #333;
  flex: 1;
  text-align: left;
  word-break: break-all;
}

/* 档案操作按钮 */
.action-buttons {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.edit-archive-btn {
  width: 100%;
  height: 36px;
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

/* 上传组件样式 */
.upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 178px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-uploader:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}

.remove-image {
  color: #f56c6c;
  margin-top: 8px;
}


.blue-upload-box {
  width: 100%;
  height: 100%;
  border-radius: 4px;
  background-color: #ecf5ff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #409eff;
  transition: all 0.3s;
  border: 1px dashed #d9ecff;
}

.blue-upload-box:hover {
  background-color: #d9ecff;
}

.blue-upload-box i {
  font-size: 32px;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
}

.image-preview {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.9;
}

.image-actions {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-preview:hover .image-actions {
  opacity: 1;
}

.image-actions i {
  color: #fff;
  font-size: 22px;
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  padding: 10px;
  transition: all 0.2s;
}

.image-actions i:hover {
  transform: scale(1.1);
  background-color: rgba(0, 0, 0, 0.5);
}
</style>