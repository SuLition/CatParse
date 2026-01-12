<script setup>
import {ref, onMounted, computed} from 'vue'
import {Motion} from 'motion-v'
import {useConfigStore} from '@/stores'

const configStore = useConfigStore()

// 根据动画速率计算 duration
// 动画触发条件：组件挂载时自动播放路径绘制动画
const animationDuration = computed(() => {
  const speed = configStore.appearance?.animationSpeed || 'normal'
  const durations = {disabled: 0.01, fast: 0.8, normal: 1.2, elegant: 2}
  return durations[speed] || 1.2
})

const hitokoto = ref('')
const loading = ref(false)

// 获取一言
const fetchHitokoto = async () => {
  loading.value = true
  try {
    const response = await fetch('https://60s.viki.moe/v2/hitokoto')
    const result = await response.json()
    if (result.code === 200 && result.data?.hitokoto) {
      hitokoto.value = result.data.hitokoto
    }
  } catch (error) {
    console.warn('获取一言失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchHitokoto()
})
</script>

<template>
  <div class="empty-state">
    <div class="empty-content">
      <svg class="cat-icon" height="200" viewBox="0 0 1024 1024" width="200" xmlns="http://www.w3.org/2000/svg">
        <!-- 猫眼睛 - 使用 Motion 实现缩放淡入动画 -->
        <Motion
            :animate="{ opacity: 1, scale: 1 }"
            :initial="{ opacity: 0, scale: 0 }"
            :transition="{ duration: 0.3, delay: animationDuration * 0.8, ease: 'easeOut' }"
            as="circle"
            class="cat-eye"
            cx="405.47"
            cy="362.54"
            fill="currentColor"
            r="22.53"
            style="transform-origin: 405px 362px"
        />
        <Motion
            :animate="{ opacity: 1, scale: 1 }"
            :initial="{ opacity: 0, scale: 0 }"
            :transition="{ duration: 0.3, delay: animationDuration * 0.85, ease: 'easeOut' }"
            as="circle"
            class="cat-eye"
            cx="560.47"
            cy="362.54"
            fill="currentColor"
            r="22.53"
            style="transform-origin: 560px 362px"
        />
        <!-- 猫身体轮廓 - 使用 Motion 实现路径绘制动画 -->
        <Motion
            :animate="{ pathLength: 1, opacity: 1 }"
            :initial="{ pathLength: 0, opacity: 0 }"
            :transition="{ duration: 0.4, ease: 'linear' }"
            as="path"
            d="M 259.86 832.87 L 583.83 832.87 C 610.33 832.9 635.97 825.72 657.98 812.14 C 678.69 799.36 695.91 781.18 707.79 759.56 C 719.66 737.94 725.77 713.65 725.45 689.32 C 725.1 663.46 717.41 637.97 703.2 615.6 L 639.35 515.11 C 636.6 510.77 637.05 505.24 640.48 501.34 C 674.8 462.27 693.71 412.09 693.71 360.03 L 693.71 221.09 C 693.71 205.36 684.9 191.36 670.71 184.55 C 656.52 177.75 640.08 179.63 627.81 189.48 L 571.98 234.27 C 565.84 238.98 558.13 241.69 550.26 241.69 L 408.81 241.69 C 400.94 241.69 393.23 238.98 387.09 234.27 L 331.26 189.48 C 318.98 179.62 302.55 177.74 288.36 184.55 C 274.17 191.35 265.36 205.36 265.36 221.09 L 265.36 360.03 C 265.36 403.98 281.57 446.13 310.99 478.72 C 322.98 491.99 329.58 509.03 329.58 526.69 L 329.58 760.87"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="37"
        />
      </svg>
      <p class="empty-text">{{ hitokoto }}</p>
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: 450px;
}

.cat-icon {
  width: 100px;
  height: 100px;
  color: var(--text-tertiary);
}

.empty-text {
  font-size: 15px;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.6;
  min-height: 48px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
