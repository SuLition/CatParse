<script setup>
import HamsterLoading from '@/components/common/HamsterLoading.vue';
import {Motion, AnimatePresence} from 'motion-v';
</script>

<template>
  <div class="parsing-state">
    <AnimatePresence>
      <Motion
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
          :initial="{ opacity: 0 }"
          :style="{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }"
          :transition="{ duration: 0.3, delay: 0.2, ease: 'linear' }"
      >
        <HamsterLoading :size="12"/>
        <p class="parsing-hint">全力解析中...</p>
      </Motion>
    </AnimatePresence>
  </div>
</template>

<style scoped>
.parsing-state {
  flex: 1;
  position: absolute;
  inset: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.parsing-hint {
  font-size: 14px;
  color: var(--text-secondary);
}
</style>
