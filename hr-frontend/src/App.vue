<template>
  <!-- 统一入口：这里仅作为路由出口，由各视图自行决定布局 -->
  <router-view />
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
/* 基础全局样式，具体布局和配色交给各业务页面（如首页、登录页） */
#app {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
    Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol",
    "Noto Color Emoji";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #1f2933;
  background-color: #f5f7fa;
  min-height: 100vh;
}

body {
  margin: 0;
  padding: 0;
  background-color: #f5f7fa;
}
</style>
