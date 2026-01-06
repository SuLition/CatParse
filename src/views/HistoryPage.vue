<script setup>
import { ref } from 'vue';

const historyList = ref([
  {
    id: 1,
    title: '测试视频标题',
    platform: 'bilibili',
    url: 'https://www.bilibili.com/video/BV1xx411c7mu',
    downloadTime: '2024-01-15 14:30',
    status: 'completed',
    size: '125.6 MB'
  },
  {
    id: 2,
    title: '另一个测试视频',
    platform: 'douyin',
    url: 'https://v.douyin.com/xxxxx',
    downloadTime: '2024-01-15 13:20',
    status: 'completed',
    size: '58.3 MB'
  }
]);

const getPlatformName = (platform) => {
  const names = {
    bilibili: 'Bilibili',
    douyin: '抖音',
    kuaishou: '快手',
    xiaohongshu: '小红书'
  };
  return names[platform] || platform;
};

const getPlatformColor = (platform) => {
  const colors = {
    bilibili: '#00a1d6',
    douyin: '#fe2c55',
    kuaishou: '#ff6600',
    xiaohongshu: '#ff2442'
  };
  return colors[platform] || '#4a9eff';
};

const handleDelete = (id) => {
  console.log('删除记录:', id);
  historyList.value = historyList.value.filter(item => item.id !== id);
};

const handleOpenFolder = (id) => {
  console.log('打开文件夹:', id);
};

const clearAll = () => {
  if (confirm('确定要清空所有下载记录吗？')) {
    historyList.value = [];
  }
};
</script>

<template>
  <div class="history-page">
    <div class="history-header">
      <h1 class="page-title">下载历史</h1>
      <button v-if="historyList.length > 0" class="clear-button" @click="clearAll">
        清空记录
      </button>
    </div>

    <div v-if="historyList.length === 0" class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3V15M12 15L8 11M12 15L16 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M3 17V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <p class="empty-text">暂无下载记录</p>
    </div>

    <div v-else class="history-list">
      <div v-for="item in historyList" :key="item.id" class="history-item">
        <div class="item-header">
          <span class="platform-badge" :style="{ background: getPlatformColor(item.platform) }">
            {{ getPlatformName(item.platform) }}
          </span>
          <span class="download-time">{{ item.downloadTime }}</span>
        </div>
        
        <div class="item-content">
          <h3 class="item-title">{{ item.title }}</h3>
          <p class="item-url">{{ item.url }}</p>
        </div>

        <div class="item-footer">
          <span class="file-size">{{ item.size }}</span>
          <div class="item-actions">
            <button class="action-button" @click="handleOpenFolder(item.id)" title="打开文件夹">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7C3 5.89543 3.89543 5 5 5H9L11 7H19C20.1046 7 21 7.89543 21 9V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
            <button class="action-button delete" @click="handleDelete(item.id)" title="删除">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.history-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 40px;
  overflow-y: auto;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.clear-button {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #3d3f43;
  border-radius: 6px;
  color: #afb1b3;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.clear-button:hover {
  background: #3d3f43;
  color: #ffffff;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: #3d3f43;
}

.empty-text {
  font-size: 16px;
  color: #6c6e73;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-item {
  background: #2b2d30;
  border: 1px solid #3d3f43;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s;
}

.history-item:hover {
  border-color: #4a9eff;
  box-shadow: 0 2px 8px rgba(74, 158, 255, 0.1);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.platform-badge {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
}

.download-time {
  font-size: 12px;
  color: #6c6e73;
}

.item-content {
  margin-bottom: 12px;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 8px 0;
}

.item-url {
  font-size: 13px;
  color: #6c6e73;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #3d3f43;
}

.file-size {
  font-size: 13px;
  color: #afb1b3;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: 1px solid #3d3f43;
  border-radius: 6px;
  color: #afb1b3;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.action-button svg {
  width: 16px;
  height: 16px;
}

.action-button:hover {
  background: #3d3f43;
  color: #ffffff;
}

.action-button.delete:hover {
  background: #c42b1c;
  border-color: #c42b1c;
  color: #ffffff;
}
</style>
