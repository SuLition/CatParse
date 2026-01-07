<script setup>
import { watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useVideoParse } from './composables/useVideoParse.js';
import ParseInputBar from './components/ParseInputBar.vue';
import VideoResultCard from './components/VideoResultCard.vue';
import CopywritingPanel from './components/CopywritingPanel.vue';
import ParseEmpty from './components/ParseEmpty.vue';
import ParseLoading from './components/ParseLoading.vue';

const route = useRoute();

const {
  videoUrl,
  platform,
  isParsing,
  videoInfo,
  qualityOptions,
  selectedQuality,
  currentHistoryId,
  handleParse,
  clearInput,
  resetState
} = useVideoParse();

// 平台切换时重置状态
watch(platform, () => {
  resetState();
});

// 初始化：检查是否有传入的参数（来自历史记录重新解析）
onMounted(() => {
  if (route.query.url) {
    videoUrl.value = route.query.url;
    if (route.query.platform) {
      platform.value = route.query.platform;
    }
    handleParse();
  }
});
</script>

<template>
  <div class="parse-page">
    <!-- 顶部输入区 -->
    <ParseInputBar
        v-model:videoUrl="videoUrl"
        v-model:platform="platform"
        :isParsing="isParsing"
        @parse="handleParse"
        @clear="clearInput"
    />

    <!-- 解析结果 -->
    <VideoResultCard
        v-if="videoInfo"
        :videoInfo="videoInfo"
        :qualityOptions="qualityOptions"
        v-model:selectedQuality="selectedQuality"
    />

    <!-- 文案模块 -->
    <CopywritingPanel
        v-if="videoInfo"
        :videoInfo="videoInfo"
        :currentHistoryId="currentHistoryId"
    />

    <!-- 解析中状态 -->
    <ParseLoading v-if="isParsing && !videoInfo" />

    <!-- 空状态 -->
    <ParseEmpty v-if="!videoInfo && !isParsing" />
  </div>
</template>

<style scoped>
.parse-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 16px;
  overflow: hidden;
}
</style>
