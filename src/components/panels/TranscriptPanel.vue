<template>
  <section class="panel transcript-panel">
    <h2 class="panel-title">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
      文案识别
    </h2>

    <div class="transcript-box">
      <div class="transcript-header">
        <button
            class="action-btn"
            @click="$emit('extract')"
            :disabled="!videoInfo || extracting"
        >
          <svg v-if="extracting" class="spinner" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.3"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" fill="none"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
          </svg>
          {{ extracting ? '识别中...' : '提取文案' }}
        </button>
        <button class="action-btn icon-only" @click="$emit('copy')" :disabled="!transcript" title="复制">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
      </div>
      <textarea
          :value="transcript"
          class="transcript-content"
          placeholder="点击「提取文案」自动识别视频中的语音内容..."
          readonly
      ></textarea>
    </div>
  </section>
</template>

<script setup>
defineProps({
  videoInfo: {
    type: Object,
    default: null
  },
  transcript: {
    type: String,
    default: ''
  },
  extracting: {
    type: Boolean,
    default: false
  }
})

defineEmits(['extract', 'copy'])
</script>

<style scoped>
.panel {
  background: rgba(255,255,255,0.04);
  border-radius: 12px;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255,255,255,0.06);
  overflow: hidden;
  min-height: 0;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.7rem;
  color: #fff;
  flex-shrink: 0;
}

.panel-title svg {
  width: 18px;
  height: 18px;
  color: #667eea;
}

.transcript-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.transcript-header {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  color: rgba(255,255,255,0.8);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover:not(:disabled) {
  background: rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.3);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn svg {
  width: 14px;
  height: 14px;
}

.action-btn.icon-only {
  padding: 0.5rem;
}

.transcript-content {
  flex: 1;
  width: 100%;
  padding: 0.7rem;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 8px;
  color: rgba(255,255,255,0.85);
  font-size: 0.8rem;
  line-height: 1.6;
  resize: none;
  min-height: 0;
  overflow-y: auto;
}

.transcript-content::placeholder {
  color: rgba(255,255,255,0.3);
}

.transcript-content:focus {
  outline: none;
  border-color: rgba(102, 126, 234, 0.3);
}

.spinner {
  width: 14px;
  height: 14px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
