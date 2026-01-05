<template>
  <header class="header">
    <div class="logo">
      <svg class="logo-icon" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" opacity="0.8"/>
        <path d="M2 17l10 5 10-5" stroke="currentColor" stroke-width="2" fill="none"/>
        <path d="M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" fill="none"/>
      </svg>
      <span>文案小助手</span>
    </div>
    <div class="header-right">
      <!-- 解析服务状态指示器 -->
      <div class="service-status" :class="serviceStatusClass">
        <span class="status-dot"></span>
        <span class="status-text">{{ serviceStatusText }}</span>
        <button 
          v-if="serviceStatus !== 'online'" 
          class="restart-btn" 
          @click="restartService"
          :disabled="serviceStatus === 'checking'"
          title="启动服务"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 4v6h-6M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>
      </div>
      <button class="settings-btn" @click="$emit('openSettings')" title="配置">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

defineEmits(['openSettings'])

// 服务状态: 'checking' | 'online' | 'offline'
const serviceStatus = ref('checking')
let checkInterval = null

// 状态文本
const serviceStatusText = computed(() => {
  const map = {
    'checking': '检测中...',
    'online': '服务运行中',
    'offline': '服务未启动'
  }
  return map[serviceStatus.value]
})

// 状态样式类
const serviceStatusClass = computed(() => {
  return `status-${serviceStatus.value}`
})

// 检查服务状态
async function checkServiceStatus() {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)
    
    const response = await fetch('http://127.0.0.1:3721/health', {
      method: 'GET',
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (response.ok) {
      serviceStatus.value = 'online'
    } else {
      serviceStatus.value = 'offline'
    }
  } catch (error) {
    serviceStatus.value = 'offline'
  }
}

// 手动启动服务
async function restartService() {
  serviceStatus.value = 'checking'
  
  try {
    // 使用 Tauri invoke 调用后端启动命令
    const { invoke } = await import('@tauri-apps/api/core')
    const result = await invoke('start_backend')
    console.log('[服务启动]', result)
  } catch (e) {
    console.log('[服务启动] 失败:', e)
  }
  
  // 等待一段时间后检查状态
  let retries = 0
  const checkInterval = setInterval(async () => {
    retries++
    await checkServiceStatus()
    
    if (serviceStatus.value === 'online' || retries >= 10) {
      clearInterval(checkInterval)
    }
  }, 1000)
}

onMounted(() => {
  // 立即检查一次
  checkServiceStatus()
  
  // 每 3 秒检查一次服务状态
  checkInterval = setInterval(checkServiceStatus, 3000)
})

onUnmounted(() => {
  if (checkInterval) {
    clearInterval(checkInterval)
  }
})
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 1rem;
  background: rgba(255,255,255,0.03);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-icon {
  width: 24px;
  height: 24px;
  color: #667eea;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* 服务状态指示器 */
.service-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.3s;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-text {
  white-space: nowrap;
}

/* 在线状态 */
.service-status.status-online {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.service-status.status-online .status-dot {
  background: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
}

/* 离线状态 */
.service-status.status-offline {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.service-status.status-offline .status-dot {
  background: #ef4444;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
  animation: none;
}

/* 检测中状态 */
.service-status.status-checking {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.service-status.status-checking .status-dot {
  background: #fbbf24;
  box-shadow: 0 0 8px rgba(251, 191, 36, 0.6);
}

/* 重启按钮 */
.restart-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  margin-left: 0.25rem;
  background: rgba(255,255,255,0.1);
  border: none;
  border-radius: 50%;
  color: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.restart-btn:hover:not(:disabled) {
  background: rgba(255,255,255,0.2);
  transform: rotate(180deg);
}

.restart-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.restart-btn svg {
  width: 12px;
  height: 12px;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.settings-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  transition: all 0.2s;
}

.settings-btn:hover {
  background: rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.3);
  color: #667eea;
}

.settings-btn svg {
  width: 18px;
  height: 18px;
}
</style>
