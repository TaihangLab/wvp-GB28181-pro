<template>
  <div id="ConsoleDisk" style="width: 100%; height: 100%; background: #FFFFFF; text-align: center">
    <!-- 使用普通div替代v-charts组件 -->
    <div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
      <p>磁盘使用情况</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConsoleDisk',
  data() {
    return {
      // 空数据
    };
  },
  methods: {
    setData: function(data) {
      // 空方法
    }
  }
};
</script>
