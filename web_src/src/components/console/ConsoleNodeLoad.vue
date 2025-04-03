<template>
  <div id="ConsoleNodeLoad" style="width: 100%; height: 100%; background: #FFFFFF; text-align: center">
    <!-- 使用普通div替代v-charts组件 -->
    <div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
      <p>节点负载情况</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConsoleNodeLoad',
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
