<template>
  <div class="preview-card" :class="{ active: videoInfo }">
    <!-- 有视频信息时显示 -->
    <template v-if="videoInfo">
      <div class="preview-thumb">
        <img :src="videoInfo.cover" alt="封面" />
      </div>
      <div class="preview-info">
        <h3 class="preview-title">{{ videoInfo.title }}</h3>
        <div class="preview-meta">
        <span class="meta-item">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          {{ videoInfo.author }}
        </span>
        <span class="meta-item">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
          </svg>
          {{ videoInfo.views }}
        </span>
        <span class="meta-item" v-if="videoInfo.likes">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          {{ videoInfo.likes }}
        </span>
        <span class="meta-item" v-if="videoInfo.duration">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
          </svg>
          {{ videoInfo.duration }}
        </span>
        <span class="meta-item platform" :class="videoInfo.platform">
          {{ platformName }}
        </span>
      </div>
    </div>
    </template>
    
    <!-- 空状态提示 -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <polygon points="10,8 16,12 10,16" fill="currentColor" opacity="0.3"/>
          <polygon points="10,8 16,12 10,16"/>
        </svg>
      </div>
      <div class="empty-content">
        <p class="empty-title">粘贴链接，开始解析</p>
        <p class="empty-desc">支持抖音、B站等平台视频链接</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  videoInfo: {
    type: Object,
    default: null
  }
})

const platformName = computed(() => {
  const map = {
    'douyin': '抖音',
    'bilibili': 'B站',
    'xiaohongshu': '小红书',
    'tiktok': 'TikTok',
    'kuaishou': '快手',
    'weibo': '微博',
    'wechat_article': '公众号',
    'wechat_video': '视频号',
    'instagram': 'Instagram',
    'netease_music': '网易云',
    'zhihu': '知乎'
  }
  return map[props.videoInfo?.platform] || props.videoInfo?.platform || '未知'
})
</script>

<style scoped>
.preview-card {
  display: flex;
  gap: 0.7rem;
  padding: 0.7rem;
  background: rgba(0,0,0,0.2);
  border-radius: 10px;
  margin-bottom: 0.7rem;
  transition: all 0.3s;
  min-height: 72px;
}

.preview-card.active {
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.preview-thumb {
  width: 100px;
  height: 56px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(255,255,255,0.05);
}

.preview-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.2);
}

.placeholder svg {
  width: 32px;
  height: 32px;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 0.5rem;
}

.empty-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(102, 126, 234, 0.5);
  background: rgba(102, 126, 234, 0.1);
  border-radius: 10px;
}

.empty-icon svg {
  width: 28px;
  height: 28px;
}

.empty-content {
  flex: 1;
}

.empty-title {
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(255,255,255,0.7);
  margin-bottom: 0.25rem;
}

.empty-desc {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.4);
}

.preview-info {
  flex: 1;
  min-width: 0;
}

.preview-title {
  font-size: 0.8rem;
  font-weight: 500;
  line-height: 1.3;
  margin-bottom: 0.35rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: rgba(255,255,255,0.9);
}

.preview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.7rem;
  color: rgba(255,255,255,0.5);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.meta-item svg {
  width: 14px;
  height: 14px;
}

.meta-item.platform {
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.meta-item.platform.douyin {
  background: rgba(254, 44, 85, 0.2);
  color: #fe2c55;
}

.meta-item.platform.bilibili {
  background: rgba(0, 161, 214, 0.2);
  color: #00a1d6;
}

.meta-item.platform.xiaohongshu {
  background: rgba(254, 44, 85, 0.2);
  color: #fe2c55;
}

.meta-item.platform.tiktok {
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
}

.meta-item.platform.kuaishou {
  background: rgba(255, 73, 6, 0.2);
  color: #ff4906;
}

.meta-item.platform.weibo {
  background: rgba(230, 22, 45, 0.2);
  color: #e6162d;
}

.meta-item.platform.wechat_article,
.meta-item.platform.wechat_video {
  background: rgba(7, 193, 96, 0.2);
  color: #07c160;
}

.meta-item.platform.instagram {
  background: rgba(228, 64, 95, 0.2);
  color: #e4405f;
}

.meta-item.platform.netease_music {
  background: rgba(194, 12, 12, 0.2);
  color: #c20c0c;
}

.meta-item.platform.zhihu {
  background: rgba(0, 132, 255, 0.2);
  color: #0084ff;
}
</style>
