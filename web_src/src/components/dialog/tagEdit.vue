<template>
  <el-dialog
    :title="isEdit ? '编辑标签' : '添加标签'"
    :visible.sync="dialogVisible"
    width="30%"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    :modal-append-to-body="true"
    :append-to-body="true"
    :show-close="true"
    :lock-scroll="true"
    custom-class="tag-dialog">
    <el-form :model="tagForm" label-width="80px" class="tag-form">
      <el-form-item label="标签名称" required>
        <el-input 
          v-model="tagForm.name" 
          placeholder="请输入标签名称"
          maxlength="20"
          show-word-limit
          style="width: 200pt;" />
      </el-form-item>
      <el-form-item label="标签描述">
        <el-input 
          v-model="tagForm.description" 
          type="textarea"
          placeholder="请输入标签描述（选填）"
          maxlength="100"
          show-word-limit
          :rows="3"
          style="width: 200pt;" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">取消</el-button>
      <el-button type="primary" @click="confirmTag" :loading="submitting">确认</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { cameraAPI } from '@/components/service/VisionAIService';

export default {
  name: 'TagEdit',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    editTag: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      dialogVisible: this.visible,
      tagForm: {
        name: '',
        description: ''
      },
      submitting: false
    };
  },
  computed: {
    isEdit() {
      return this.editTag && this.editTag.id;
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val;
      if (val && this.isEdit) {
        // 编辑模式，初始化表单数据
        this.tagForm = {
          name: this.editTag.name || '',
          description: this.editTag.description || ''
        };
      } else if (val) {
        // 新增模式，重置表单
        this.tagForm = {
          name: '',
          description: ''
        };
      }
    },
    dialogVisible(val) {
      if (!val) {
        this.$emit('update:visible', false);
      }
    }
  },
  methods: {
    closeDialog() {
      this.dialogVisible = false;
    },
    confirmTag() {
      // 表单验证
      if (!this.tagForm.name) {
        this.$message.warning('标签名称不能为空');
        return;
      }

      this.submitting = true;

      // 根据是编辑还是新增模式调用不同API
      const apiCall = this.isEdit
        ? cameraAPI.updateTag(this.editTag.id, this.tagForm)
        : cameraAPI.createTag(this.tagForm);

      apiCall
        .then(res => {
          const { code, msg, data } = res.data;
          if (code === 0) {
            this.$message.success(this.isEdit ? '标签更新成功' : '标签添加成功');
            this.$emit('success', data);
            this.closeDialog();
          } else {
            this.$message.error(msg || (this.isEdit ? '标签更新失败' : '标签添加失败'));
          }
        })
        .catch(err => {
          console.error('标签操作失败', err);
          this.$message.error(err.message || (this.isEdit ? '标签更新失败' : '标签添加失败'));
        })
        .finally(() => {
          this.submitting = false;
        });
    }
  }
};
</script>

<style scoped>
.tag-form {
  padding: 0 20px;
}
</style> 