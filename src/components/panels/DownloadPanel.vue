<template>
  <div class="download-section" v-if="videoInfo">
    <h3 class="section-label">下载选项</h3>
    
    <!-- 统一的下载区域 -->
    <div class="download-area">
      <!-- 视频下载 -->
      <div class="download-row" v-if="videoOptions.length > 0">
        <div class="select-wrapper">
          <select v-model="selectedVideoOption" class="quality-select">
            <option v-for="opt in videoOptions" :key="opt.key" :value="opt">
              {{ opt.label }}
            </option>
          </select>
          <svg class="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
        <button 
          class="download-action-btn"
          @click="downloadVideo"
          :disabled="isVideoDownloading"
        >
          <svg v-if="!isVideoDownloading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <svg v-else class="spinner" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.3"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" fill="none"/>
          </svg>
          <span>下载视频</span>
        </button>
        <button 
          v-if="showOpenFolder"
          class="open-folder-btn"
          @click="handleOpenFolder"
          title="打开下载文件夹"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { isTauri, openDownloadDir } from '../../services/download/tauriDownload'

const props = defineProps({
  videoInfo: {
    type: Object,
    default: null
  },
  downloadingType: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['download'])

// 是否显示打开文件夹按钮（仅 Tauri 环境）
const showOpenFolder = ref(false)

onMounted(() => {
  showOpenFolder.value = isTauri()
})

// 打开下载文件夹
const handleOpenFolder = async () => {
  try {
    await openDownloadDir()
  } catch (error) {
    console.error('打开文件夹失败:', error)
  }
}

// 选中的视频选项
const selectedVideoOption = ref(null)

// 统一的视频选项列表
const videoOptions = computed(() => {
  if (!props.videoInfo) return []
  
  const platform = props.videoInfo.platform
  const options = []
  
  if (platform === 'douyin') {
    // 抖音视频选项 - 从 videoStreams 获取多清晰度
    const streams = props.videoInfo.videoStreams || []
    if (streams.length > 0) {
      streams.forEach(stream => {
        options.push({
          key: `douyin-${stream.id}`,
          label: `${stream.name} ${stream.short} (${stream.size})`,
          type: 'douyin-video',
          stream: stream
        })
      })
    } else if (props.videoInfo.videoUrl) {
      // 如果没有 videoStreams，使用默认 videoUrl
      options.push({
        key: 'douyin-default',
        label: '默认画质',
        type: 'douyin-video',
        stream: {
          url: props.videoInfo.videoUrl,
          backupUrls: [],
          name: '默认画质',
          short: 'SD'
        }
      })
    }
  } else if (platform === 'bilibili') {
    // B站视频选项
    const streams = props.videoInfo.videoStreams || []
    streams.forEach(stream => {
      options.push({
        key: `bilibili-${stream.id}`,
        label: `${stream.name} (${stream.size})`,
        type: 'bilibili-video',
        stream: stream
      })
    })
  } else if (platform === 'xiaohongshu') {
    // 小红书视频选项
    const streams = props.videoInfo.videoStreams || []
    if (streams.length > 0) {
      streams.forEach(stream => {
        options.push({
          key: `xiaohongshu-${stream.id}`,
          label: `${stream.name} ${stream.short} (${stream.size})`,
          type: 'xiaohongshu-video',
          stream: stream
        })
      })
    } else if (props.videoInfo.videoUrl) {
      // 如果没有 videoStreams，使用默认 videoUrl
      options.push({
        key: 'xiaohongshu-default',
        label: '高清视频',
        type: 'xiaohongshu-video',
        stream: {
          id: 0,
          url: props.videoInfo.videoUrl,
          backupUrls: [],
          name: '高清视频',
          short: 'HD'
        }
      })
    }
  }
  
  return options
})

// 监听视频选项变化，默认选中第一个
watch(videoOptions, (options) => {
  if (options && options.length > 0) {
    selectedVideoOption.value = options[0]
  }
}, { immediate: true })

// 视频是否正在下载
const isVideoDownloading = computed(() => {
  if (!selectedVideoOption.value) return false
  return props.downloadingType === selectedVideoOption.value.key
})

// 下载视频
const downloadVideo = () => {
  if (!selectedVideoOption.value) return
  
  const opt = selectedVideoOption.value
  if (opt.type === 'bilibili-video') {
    emit('download', { type: 'bilibili-video', stream: opt.stream })
  } else if (opt.type === 'douyin-video') {
    emit('download', { type: 'douyin-video', stream: opt.stream })
  } else if (opt.type === 'xiaohongshu-video') {
    emit('download', { type: 'xiaohongshu-video', stream: opt.stream })
  } else {
    emit('download', opt.type)
  }
}
</script>

<style scoped>
.section-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255,255,255,0.6);
  margin-bottom: 0.5rem;
}

.download-area {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.download-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.select-wrapper {
  flex: 1;
  position: relative;
}

.quality-select {
  width: 100%;
  padding: 0.6rem 2rem 0.6rem 0.75rem;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 0.85rem;
  cursor: pointer;
  appearance: none;
  transition: all 0.2s;
}

.quality-select:hover {
  background: rgba(255,255,255,0.1);
  border-color: rgba(255,255,255,0.2);
}

.quality-select:focus {
  outline: none;
  border-color: #667eea;
}

.quality-select option {
  background: #1a1a2e;
  color: #fff;
}

.select-arrow {
  position: absolute;
  right: 0.6rem;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  color: rgba(255,255,255,0.5);
  pointer-events: none;
}

.download-action-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.download-action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.download-action-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.download-action-btn svg {
  width: 16px;
  height: 16px;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.open-folder-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 8px;
  color: rgba(255,255,255,0.8);
  cursor: pointer;
  transition: all 0.2s;
}

.open-folder-btn:hover {
  background: rgba(255,255,255,0.15);
  border-color: rgba(255,255,255,0.25);
  color: #fff;
}

.open-folder-btn svg {
  width: 16px;
  height: 16px;
}
</style>
