<script setup>
import {Toaster} from 'vue-sonner'
import CloseMask from "./components/common/CloseMask.vue";
import {toasterOptions} from "./utils/index.js";
import TitleBar from "./components/common/TitleBar.vue";
import Sidebar from "./components/common/Sidebar.vue";

</script>

<template>
  <div class="app-container">
    <Sidebar/>
    <div class="main-content">
      <TitleBar/>
      <router-view />
      <!--<VideoParser />-->
      <!-- 消息通知 -->
      <Toaster v-bind="toasterOptions"/>

      <!-- 关闭提示遮罩层 -->
      <CloseMask/>
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  background: #1e1f22;
  min-height: 100vh;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.app-container {
  display: flex;
  width: 100%;
  height: 100vh;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 全局下拉框样式 */
select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: #1e1f22;
  color: #ffffff;
  border: 1px solid #3d3f43;
  border-radius: 6px;
  padding: 8px 32px 8px 12px;
  font-size: 14px;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23afb1b3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
}

select:hover {
  border-color: #4a9eff;
}

select:focus {
  border-color: #4a9eff;
  box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.15);
}

select option {
  background-color: #2b2d30;
  color: #ffffff;
  padding: 10px 12px;
}

select option:hover,
select option:checked {
  background-color: #4a9eff;
  color: #ffffff;
}

select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}


</style>
