<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import VideoParser from './components/VideoParser.vue'

const isClosing = ref(false)
let unlisten = null

onMounted(async () => {
  // 监听关闭事件
  try {
    const { listen } = await import('@tauri-apps/api/event')
    unlisten = await listen('app-closing', () => {
      console.log('[App] 收到关闭事件')
      isClosing.value = true
    })
  } catch (e) {
    console.log('[App] 非 Tauri 环境')
  }
})

onUnmounted(() => {
  if (unlisten) unlisten()
})
</script>

<template>
  <div id="app">
    <VideoParser />
    
    <!-- 关闭提示遮罩层 -->
    <div v-if="isClosing" class="closing-overlay">
      <div class="closing-content">
        <div class="closing-spinner"></div>
        <p class="closing-text">正在关闭服务...</p>
      </div>
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

#app {
  min-height: 100vh;
  width: 100vw;
  overflow: hidden;
}

/* 关闭提示样式 */
.closing-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  backdrop-filter: blur(4px);
}

.closing-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.closing-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.closing-text {
  color: #fff;
  font-size: 16px;
  font-weight: 500;
}
</style>
