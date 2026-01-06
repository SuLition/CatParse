<script setup>
import {ref, computed} from 'vue';
import {useRouter, useRoute} from 'vue-router';

const router = useRouter();
const route = useRoute();

const activeTab = computed(() => route.path);

const topMenuItems = [
  {id: '/parse', icon: 'search', title: '视频解析'},
  {id: '/history', icon: 'history', title: '下载历史'}
];

const bottomMenuItems = [
  {id: '/settings', icon: 'settings', title: '设置'}
];

const handleMenuClick = (path) => {
  router.push(path);
  console.log('切换到:', path);
};
</script>

<template>
  <div class="sidebar">
    <!-- Logo区域 -->
    <div class="sidebar-logo">
      <div class="logo-box">
        <span class="logo-text">姜</span>
      </div>
    </div>

    <!-- 上部菜单 -->
    <div class="sidebar-menu-top">
      <div
          v-for="item in topMenuItems"
          :key="item.id"
          :class="{ active: activeTab === item.id }"
          :title="item.title"
          class="sidebar-item"
          @click="handleMenuClick(item.id)"
      >
        <svg v-if="item.icon === 'search'" class="sidebar-icon" fill="none" viewBox="0 0 24 24"
             xmlns="http://www.w3.org/2000/svg">
          <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>
          <path d="M16 16L21 21" stroke="currentColor" stroke-linecap="round" stroke-width="2"/>
        </svg>

        <svg v-else-if="item.icon === 'history'" class="sidebar-icon" fill="none" viewBox="0 0 24 24"
             xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
          <path d="M12 7V12L15 15" stroke="currentColor" stroke-linecap="round" stroke-width="2"/>
        </svg>

        <svg v-else-if="item.icon === 'settings'" class="sidebar-icon" fill="none" viewBox="0 0 24 24"
             xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
          <path
              d="M12 2L13 5L16 4L15 7L18 8L16 11L19 13L16 15L17 18L14 17L13 20L11 20L10 17L7 18L8 15L5 13L8 11L6 8L9 7L8 4L11 5L12 2Z"
              stroke="currentColor" stroke-linejoin="round" stroke-width="2"/>
        </svg>
      </div>
    </div>

    <!-- 占位空间 -->
    <div class="sidebar-spacer"></div>

    <!-- 底部菜单 -->
    <div class="sidebar-menu-bottom">
      <div
          v-for="item in bottomMenuItems"
          :key="item.id"
          :class="{ active: activeTab === item.id }"
          :title="item.title"
          class="sidebar-item"
          @click="handleMenuClick(item.id)"
      >
        <svg v-if="item.icon === 'settings'" class="sidebar-icon" fill="none" viewBox="0 0 24 24"
             xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
          <path
              d="M12 2L13 5L16 4L15 7L18 8L16 11L19 13L16 15L17 18L14 17L13 20L11 20L10 17L7 18L8 15L5 13L8 11L6 8L9 7L8 4L11 5L12 2Z"
              stroke="currentColor" stroke-linejoin="round" stroke-width="2"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  width: 60px;
  height: 100vh;
  background: #2b2d30;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  border-right: 1px solid #3d3f43;
}

.sidebar-logo {
  width: 48px;
  height: 48px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-box {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #4a9eff 0%, #a855f7 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -1px;
}

.sidebar-menu-top {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  align-items: center;
}

.sidebar-spacer {
  flex: 1;
}

.sidebar-menu-bottom {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  align-items: center;
}

.sidebar-item {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #afb1b3;
  position: relative;
}

.sidebar-item:hover {
  background: #3d3f43;
  color: #ffffff;
}

.sidebar-item.active {
  background: #1f5c87;
  color: #ffffff;
}

.sidebar-icon {
  width: 24px;
  height: 24px;
}
</style>
