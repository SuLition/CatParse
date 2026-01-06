<template>
  <div v-if="videoInfo" class="bilibili-detail">
    <!-- 荣誉标签 -->
    <div v-if="videoInfo.honors && videoInfo.honors.length" class="honor-tags">
      <span v-for="honor in videoInfo.honors" :key="honor" class="honor-tag">{{ honor }}</span>
    </div>

    <!-- 统计数据网格 -->
    <div class="stat-grid">
      <div class="stat-item">
        <div class="stat-left">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path
                d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
          </svg>
          <span class="stat-label">播放</span>
        </div>
        <span class="stat-value">{{ videoInfo.views }}</span>
      </div>
      <div class="stat-item">
        <div class="stat-left">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <span class="stat-label">点赞</span>
        </div>
        <span class="stat-value">{{ videoInfo.likes }}</span>
      </div>
      <div class="stat-item">
        <div class="stat-left">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
          </svg>
          <span class="stat-label">收藏</span>
        </div>
        <span class="stat-value">{{ videoInfo.favorite }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  videoInfo: {
    type: Object,
    default: null
  }
})
</script>

<style scoped>
.bilibili-detail {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 0.7rem;
  flex: 1;
  overflow-y: auto;
  padding-right: 0.3rem;
}

.honor-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.honor-tag {
  padding: 0.25rem 0.6rem;
  background: linear-gradient(135deg, rgba(251, 114, 153, 0.2) 0%, rgba(0, 161, 214, 0.2) 100%);
  border: 1px solid rgba(251, 114, 153, 0.3);
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  color: #fb7299;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.4rem;
}

.stat-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.6rem;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  transition: all 0.2s;
}

.stat-item:hover {
  background: rgba(0, 161, 214, 0.1);
}

.stat-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
}

.stat-item svg {
  width: 16px;
  height: 16px;
  color: #00a1d6;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
}

.stat-label {
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.5);
}

.video-desc {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 0.6rem;
}

.desc-header {
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.4rem;
}

.desc-content {
  font-size: 0.75rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
  white-space: pre-wrap;
  word-break: break-word;

  overflow-y: auto;
}

.video-meta-detail {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.5rem 0.6rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.72rem;
}

.meta-label {
  color: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
}

.meta-value {
  color: rgba(255, 255, 255, 0.85);
}

.meta-value.bvid {
  font-family: monospace;
  color: #00a1d6;
  font-weight: 500;
}

.season-info {
  background: linear-gradient(135deg, rgba(0, 161, 214, 0.1) 0%, rgba(251, 114, 153, 0.1) 100%);
  border: 1px solid rgba(0, 161, 214, 0.2);
  border-radius: 8px;
  padding: 0.6rem;
}

.season-header {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: #00a1d6;
  margin-bottom: 0.4rem;
}

.season-header svg {
  width: 14px;
  height: 14px;
}

.season-title {
  font-size: 0.8rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.3rem;
  line-height: 1.3;
}

.season-stat {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.5);
}
</style>
