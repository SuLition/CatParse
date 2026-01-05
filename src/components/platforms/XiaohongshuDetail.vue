<template>
  <div class="xiaohongshu-detail" v-if="videoInfo">
    <!-- 话题标签 -->
    <div class="hashtag-list" v-if="videoInfo.hashtags && videoInfo.hashtags.length">
      <span class="hashtag-tag" v-for="tag in videoInfo.hashtags" :key="tag.id">
        #{{ tag.name }}
      </span>
    </div>
    
    <!-- 统计数据网格 -->
    <div class="stat-grid">
      <div class="stat-item">
        <div class="stat-left">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          <span class="stat-label">点赞</span>
        </div>
        <span class="stat-value">{{ videoInfo.likes }}</span>
      </div>
      <div class="stat-item">
        <div class="stat-left">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>
          <span class="stat-label">分享</span>
        </div>
        <span class="stat-value">{{ videoInfo.shares }}</span>
      </div>
      <div class="stat-item">
        <div class="stat-left">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
          <span class="stat-label">收藏</span>
        </div>
        <span class="stat-value">{{ videoInfo.collects }}</span>
      </div>
    </div>

    <!-- 笔记描述 -->
    <div class="note-desc" v-if="videoInfo.desc">
      <div class="desc-header">笔记内容</div>
      <div class="desc-content">{{ videoInfo.desc }}</div>
    </div>

    <!-- 图片列表（图文笔记） -->
    <div class="image-gallery" v-if="videoInfo.isNote && videoInfo.images && videoInfo.images.length > 1">
      <div class="gallery-header">图片列表 ({{ videoInfo.images.length }}张)</div>
      <div class="gallery-grid">
        <div 
          class="gallery-item" 
          v-for="(img, index) in videoInfo.images.slice(0, 6)" 
          :key="index"
        >
          <img :src="img" :alt="`图片${index + 1}`" />
          <span class="img-index">{{ index + 1 }}</span>
        </div>
        <div class="gallery-more" v-if="videoInfo.images.length > 6">
          +{{ videoInfo.images.length - 6 }}
        </div>
      </div>
    </div>

    <!-- 视频信息 -->
    <div class="video-meta-detail">
      <div class="meta-row">
        <span class="meta-label">笔记ID:</span>
        <span class="meta-value note-id">{{ videoInfo.noteId }}</span>
      </div>
      <div class="meta-row" v-if="videoInfo.createTime">
        <span class="meta-label">发布时间:</span>
        <span class="meta-value">{{ videoInfo.createTime }}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">类型:</span>
        <span class="meta-value">{{ videoInfo.isVideo ? '视频笔记' : '图文笔记' }}</span>
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
.xiaohongshu-detail {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 0.7rem;
  flex: 1;
  overflow-y: auto;
  padding-right: 0.3rem;
}

/* 话题标签 */
.hashtag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.hashtag-tag {
  padding: 0.25rem 0.6rem;
  background: linear-gradient(135deg, rgba(254, 44, 85, 0.15) 0%, rgba(255, 149, 0, 0.15) 100%);
  border: 1px solid rgba(254, 44, 85, 0.3);
  border-radius: 12px;
  font-size: 0.55rem;
  font-weight: 500;
  color: #fe2c55;
}

/* 统计数据网格 */
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
  background: rgba(255,255,255,0.04);
  border-radius: 8px;
  transition: all 0.2s;
}

.stat-item:hover {
  background: rgba(254, 44, 85, 0.1);
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
  color: #fe2c55;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
}

.stat-label {
  font-size: 0.6rem;
  color: rgba(255,255,255,0.5);
}

/* 笔记描述 */
.note-desc {
  background: rgba(0,0,0,0.2);
  border-radius: 8px;
  padding: 0.6rem;
}

.desc-header {
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(255,255,255,0.6);
  margin-bottom: 0.4rem;
}

.desc-content {
  font-size: 0.75rem;
  line-height: 1.5;
  color: rgba(255,255,255,0.8);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 100px;
  overflow-y: auto;
}

/* 图片列表 */
.image-gallery {
  background: rgba(0,0,0,0.2);
  border-radius: 8px;
  padding: 0.6rem;
}

.gallery-header {
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(255,255,255,0.6);
  margin-bottom: 0.4rem;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.4rem;
}

.gallery-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.img-index {
  position: absolute;
  bottom: 2px;
  right: 2px;
  background: rgba(0,0,0,0.6);
  color: #fff;
  font-size: 0.6rem;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
}

.gallery-more {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.1);
  border-radius: 6px;
  color: rgba(255,255,255,0.7);
  font-size: 0.8rem;
  font-weight: 600;
}

/* 视频元信息 */
.video-meta-detail {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.5rem 0.6rem;
  background: rgba(255,255,255,0.03);
  border-radius: 6px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.72rem;
}

.meta-label {
  color: rgba(255,255,255,0.5);
  flex-shrink: 0;
}

.meta-value {
  color: rgba(255,255,255,0.85);
}

.meta-value.note-id {
  font-family: monospace;
  color: #fe2c55;
  font-weight: 500;
}
</style>
