<template>
  <el-container style="height: 100%; width: 100%;">
    <el-header style="padding: 0; width: 100%;">
      <ui-header/>
    </el-header>
    <el-main style="padding: 0; width: 100%;">
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script>
import uiHeader from "./UiHeader.vue";

export default {
  name: "index",
  components: {
    uiHeader
  },
}
</script>
<style>
body{
  font-family: sans-serif;
}
/*定义标题栏*/
.page-header {
  background-color: #FFFFFF;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}

.page-title {
  font-weight: bold;
  text-align: left;
  padding-left: 0.5rem;
}

.page-header-btn {
  text-align: right;
  padding-right: 0.5rem;
}
</style>
<style scoped>
.fade-enter {
  visibility: hidden;
  opacity: 0;
}

.fade-leave-to {
  display: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity .5s ease;
}

.fade-enter-to,
.fade-leave {
  visibility: visible;
  opacity: 1;
}
</style>
