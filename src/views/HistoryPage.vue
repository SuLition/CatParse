<script setup>
import {onMounted, computed} from 'vue';
import {useRouter} from 'vue-router';
import {useHistoryStore, useConfigStore} from '@/stores';
import {storeToRefs} from 'pinia';
import {getPlatformName, getPlatformColor} from '@/constants/platforms';
import {getCardAnimation} from '@/constants/motionAnimations';
import {Motion, AnimatePresence} from 'motion-v';
import {toast} from 'vue-sonner';
import ParseEmpty from "@/views/parse/components/ParseEmpty.vue";

// 开发模式判断
const isDev = import.meta.env.DEV;

const router = useRouter();

// Store
const historyStore = useHistoryStore();
const configStore = useConfigStore();
const {list: historyList, loading} = storeToRefs(historyStore);

// 空状态动画时长
const animationDuration = computed(() => {
  const speed = configStore.appearance?.animationSpeed || 'normal'
  const durations = {disabled: 0, fast: 0.4, normal: 0.6, elegant: 1}
  return durations[speed] || 0.6
})

// 卡片动画配置
const currentAnimation = computed(() => {
  const anim = configStore.appearance.cardAnimation || 'fade';
  return getCardAnimation(anim);
});
// 加载历史记录
onMounted(async () => {
  await historyStore.load();
});

// 删除记录
const handleDelete = async (id) => {
  await historyStore.delete(id);
  toast.success('已删除');
};

// 查看记录（跳转到解析页面并恢复展示）
const handleViewRecord = (item) => {
  router.push({
    path: '/parse',
    query: {historyId: item.id}
  });
};

// 复制文案
const handleCopy = async (item) => {
  const text = item.rewrittenText || item.originalText;
  if (!text) {
    toast.warning('暂无文案可复制');
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    toast.success('已复制到剪贴板');
  } catch (error) {
    toast.error('复制失败');
  }
};

// 获取显示文案（优先改写，其次原始）
const getDisplayText = (item) => {
  return item.rewrittenText || item.originalText || '暂无文案';
};

// 检查是否有文案
const hasText = (item) => {
  return !!(item.rewrittenText || item.originalText);
};

// 清空所有记录
const clearAll = async () => {
  if (confirm('确定要清空所有历史记录吗？')) {
    await historyStore.clear();
    toast.success('已清空');
  }
};

// 测试用：添加模拟历史记录
const handleAddHistory = async () => {
  const platforms = ['douyin', 'bilibili', 'xiaohongshu'];
  const titles = [
    '测试视频 - 今天天气真不错',
    '美食探店vlog - 必吃榜第一名',
    '旅行随手拍 - 风景超美'
  ];
  const texts = [
    '今天天气真的很不错，阳光明媚，微风不燥，是个出门的好日子。',
    '这家店的招牌菜真的太好吃了！强烈推荐大家来试试！',
    '风景超级美，随手一拍就是大片，强烈安利这个地方！'
  ];

  const randomIndex = Math.floor(Math.random() * platforms.length);
  const randomPlatform = platforms[randomIndex];
  const randomTitle = titles[randomIndex];
  const randomText = texts[randomIndex];

  await historyStore.add({
    platform: randomPlatform,
    title: `${randomTitle} #${Date.now().toString().slice(-4)}`,
    cover: '',
    originalText: randomText,
    rewrittenText: '',
    videoId: `test_${Date.now()}`,
    originalUrl: 'https://example.com/test'
  });
};

// 测试用：移除模拟历史记录
const handleRemoveLatestHistory = async () => {
  if (historyList.value.length > 0) {
    await historyStore.delete(historyList.value[0].id);
  }
};
</script>

<template>
  <div class="history-page">
    <div class="history-header">
      <h1 class="page-title">历史记录</h1>
      <div class="header-actions">
        <button v-if="historyList.length > 0" class="clear-button" @click="clearAll">清空记录</button>
        <button v-if="isDev" class="clear-button" @click="handleAddHistory">添加记录</button>
        <button v-if="isDev" class="clear-button" @click="handleRemoveLatestHistory">移除记录</button>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-if="loading && historyList.length !== 0" class="empty-state">
      <p class="empty-text">加载中...</p>
    </div>
    <AnimatePresence>
      <Motion
          v-if="loading && historyList.length !== 0"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
          :initial="{ opacity: 0 }"
          :transition="{ duration: 0.3 }"
      >
        <div class="empty-state">
          <p class="empty-text">加载中...</p>
        </div>
      </Motion>
    </AnimatePresence>


    <!-- 历史列表 -->
    <div v-if="!loading" class="history-list">
      <AnimatePresence mode="popLayout">
        <Motion
            v-for="item in historyList"
            :key="item.id"
            :animate="currentAnimation?.animate"
            :exit="currentAnimation?.exit"
            :initial="currentAnimation?.initial"
            :transition="currentAnimation?.transition"
            as="div"
            class="history-card"
            layout
        >
          <!-- 左侧封面图 -->
          <div class="card-cover">
            <img v-if="item.cover" :alt="item.title" :src="item.cover"/>
            <!-- 本地音频图标 -->
            <div v-else-if="item.platform === 'local' && item.localType === 'audio'" class="cover-placeholder audio">
              <svg fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" opacity="0.3" r="10" stroke="currentColor" stroke-width="1.5"/>
                <path d="M9 18V7l8-2v11" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                      stroke-width="2"/>
                <circle cx="7" cy="18" fill="currentColor" r="2"/>
                <circle cx="15" cy="16" fill="currentColor" r="2"/>
              </svg>
            </div>
            <!-- 本地文案图标 -->
            <div v-else-if="item.platform === 'local' && item.localType === 'text'" class="cover-placeholder text">
              <svg fill="none" viewBox="0 0 24 24">
                <rect height="18" opacity="0.3" rx="2" stroke="currentColor" stroke-width="1.5" width="16" x="4" y="3"/>
                <path d="M8 7h8M8 11h8M8 15h5" stroke="currentColor" stroke-linecap="round" stroke-width="2"/>
              </svg>
            </div>
            <!-- 默认占位图 -->
            <div v-else class="cover-placeholder">
              <svg fill="none" viewBox="0 0 24 24">
                <path
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
              </svg>
            </div>
            <!-- 平台标签 -->
            <span :style="{ background: getPlatformColor(item.platform) }" class="platform-badge">
            {{ getPlatformName(item.platform, item.localType) }}
          </span>
          </div>

          <!-- 右侧内容 -->
          <div class="card-content">
            <!-- 标题 -->
            <h3 class="card-title">{{ item.title }}</h3>

            <!-- 文案区域（带悬浮复制按钮） -->
            <div class="card-text-wrapper">
              <p class="card-text">{{ getDisplayText(item) }}</p>
              <button v-if="hasText(item)" class="copy-btn" title="复制文案" @click="handleCopy(item)">
                <svg fill="none" viewBox="0 0 24 24">
                  <rect height="13" rx="2" stroke="currentColor" stroke-width="2" width="13" x="9" y="9"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
            </div>

            <!-- 底部操作 -->
            <div class="card-footer">
              <span class="create-time">{{ item.createTime }}</span>
              <div class="card-actions">
                <button class="action-btn primary" @click="handleViewRecord(item)">查看记录</button>
                <button class="action-btn danger" title="删除" @click="handleDelete(item.id)">
                  <svg fill="none" height="16" viewBox="0 0 24 24" width="16">
                    <path
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </Motion>
      </AnimatePresence>
    </div>
    
    <AnimatePresence>
      <Motion
          v-if="!loading && historyList.length === 0"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
          :initial="{ opacity: 0 }"
          :transition="{ duration: 0.3 }"
      >
        <div class="empty-state">
          <svg class="empty-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
            <!-- 鱼的主体轮廓 - 线条绘制动画 -->
            <Motion
                :animate="{ pathLength: 1, opacity: 1 }"
                :initial="{ pathLength: 0, opacity: 0 }"
                :transition="{ duration: animationDuration * 0.6, ease: 'linear' }"
                as="path"
                d="
                  M 269.31 294.31
                  C 326.26 237.36 401.97 206 482.5 206
                  L 725.17 206
                  C 756.4 206 781.81 231.41 781.81 262.64
                  C 781.81 287.81 765.62 309.6 741.52 316.87
                  L 689.68 332.5
                  C 675.06 336.91 665.24 350.13 665.24 365.4
                  C 665.24 381.64 676.78 395.79 692.69 399.06
                  L 747.11 410.23
                  C 769.45 414.81 789.69 427.07 804.1 444.74
                  C 818.51 462.41 826.45 484.7 826.45 507.5
                  C 826.45 530.3 818.51 552.59 804.1 570.26
                  C 789.69 587.93 769.45 600.19 747.11 604.77
                  L 692.69 615.94
                  C 676.78 619.2 665.24 633.36 665.24 649.6
                  C 665.24 664.87 675.06 678.09 689.68 682.5
                  L 741.52 698.13
                  C 765.62 705.4 781.81 727.19 781.81 752.36
                  C 781.81 783.59 756.4 809 725.17 809
                  L 482.5 809
                  C 401.97 809 326.26 777.64 269.31 720.69
                  C 212.36 663.74 181 588.03 181 507.5
                  C 181 426.97 212.36 351.26 269.31 294.31
                  Z
                "
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="33"
            />

            <!-- 鱼眼睛 -->
            <Motion
                :animate="{ opacity: 1, scale: 1 }"
                :initial="{ opacity: 0, scale: 0 }"
                :transition="{ duration:animationDuration, delay: animationDuration * 0.3, ease: 'easeOut' }"
                as="ellipse"
                cx="340.64"
                cy="433.52"
                fill="currentColor"
                rx="20"
                ry="40"
                style="transform-origin: 341px 434px"
            />


            <!-- 鱼嘴巴装饰线 - 线条绘制动画 -->
            <Motion
                :animate="{ opacity: 1, scale: 1 }"
                :initial="{ opacity: 0, scale: 0 }"
                :transition="{ duration: animationDuration, delay: animationDuration * 0.4, ease: 'easeOut' }"
                as="path"
                d="M 494.87 413.52 L 474.72 437.16 L 496.84 463.77"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="30"
            />

            <!-- 装饰圆点 - 闪烁动画 -->
            <Motion
                :animate="{ opacity: [0, 1, 0.5, 1], scale: 1 }"
                :initial="{ opacity: 0, scale: 0 }"
                :transition="{ duration: animationDuration * 0.8, delay: animationDuration * 0.4, ease: 'easeOut' }"
                as="circle"
                cx="844.98"
                cy="776.98"
                fill="currentColor"
                r="30"
                style="transform-origin: 845px 777px"
            />
          </svg>
          <p class="empty-text">还真是空旷啊</p>
        </div>
      </Motion>
    </AnimatePresence>

  </div>
</template>

<style scoped>
.history-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 40px;
  overflow-y: scroll;
  overflow-x: hidden;
  position: relative;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.clear-button {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition-normal) var(--easing-ease);
}

.clear-button:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.empty-state {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  pointer-events: none;
  z-index: 0;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: var(--text-tertiary);
}

.empty-text {
  font-size: 16px;
  color: var(--text-secondary);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  z-index: 1;
}

/* 卡片布局 */
.history-card {
  display: flex;
  gap: 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 16px;
}

.history-card:hover {
  border-color: var(--accent-color);
  box-shadow: 0 2px 12px var(--accent-light);
}

/* 封面图 */
.card-cover {
  position: relative;
  width: 160px;
  min-width: 160px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-tertiary);
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
}

.cover-placeholder svg {
  width: 40px;
  height: 40px;
}

/* 本地音频占位图样式 */
.cover-placeholder.audio {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(124, 58, 237, 0.05) 100%);
  color: #7c3aed;
}

.cover-placeholder.audio svg {
  width: 48px;
  height: 48px;
}

/* 本地文案占位图样式 */
.cover-placeholder.text {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%);
  color: #3b82f6;
}

.cover-placeholder.text svg {
  width: 48px;
  height: 48px;
}

.platform-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #ffffff;
}

/* 右侧内容 */
.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 10px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 文案区域 */
.card-text-wrapper {
  position: relative;
  flex: 1;
  min-height: 0;
}

.card-text {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  padding-right: 30px;
}

/* 悬浮复制按钮 */
.copy-btn {
  position: absolute;
  top: 0;
  right: 0;
  width: 28px;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  opacity: 0;
  transition: all var(--transition-fast, 200ms) var(--easing-ease, ease);
}

.copy-btn svg {
  width: 14px;
  height: 14px;
}

.card-text-wrapper:hover .copy-btn {
  opacity: 1;
}

.copy-btn:hover {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: #ffffff;
}

/* 底部操作 */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-primary);
}

.create-time {
  font-size: 12px;
  color: var(--text-tertiary);
}

.card-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 14px;
  font-size: 13px;
  border-radius: 6px;
  cursor: pointer;
  transition: all var(--transition-fast, 200ms) var(--easing-ease, ease);
}

.action-btn.primary {
  background: var(--accent-color);
  border: 1px solid var(--accent-color);
  color: #ffffff;
}

.action-btn.primary:hover {
  background: var(--accent-hover);
  border-color: var(--accent-hover);
}

.action-btn.danger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: 1px solid var(--border-primary);
  color: var(--text-secondary);
}

.action-btn.danger svg {
  width: 16px;
  height: 16px;
}

.action-btn.danger:hover {
  background: #c42b1c;
  border-color: #c42b1c;
  color: #ffffff;
}
</style>
