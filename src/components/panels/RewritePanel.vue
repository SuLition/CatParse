<template>
  <section class="panel rewrite-panel">
    <h2 class="panel-title">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
      文案改写
    </h2>

    <!-- 选项行 -->
    <div class="select-row">
      <!-- AI模型选择 -->
      <div class="select-group">
        <label class="section-label">AI模型</label>
        <div class="custom-select">
          <select :value="selectedModel" @change="$emit('update:selectedModel', $event.target.value)">
            <option v-for="model in aiModels" :key="model.id" :value="model.id">
              {{ model.name }}
            </option>
          </select>
          <svg class="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      <!-- 改写风格 -->
      <div class="select-group">
        <label class="section-label">改写风格</label>
        <div class="custom-select">
          <select :value="selectedStyle" @change="onStyleChange($event.target.value)">
            <option v-for="style in rewriteStyles" :key="style.id" :value="style.id">
              {{ style.name }}
            </option>
          </select>
          <svg class="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- 提示词输入框 -->
    <div class="prompt-group">
      <label class="section-label">提示词</label>
      <textarea 
        v-model="currentPrompt"
        class="prompt-input"
        placeholder="输入改写提示词..."
        rows="2"
        @blur="savePrompt"
      ></textarea>
    </div>

    <button
        class="btn btn-rewrite"
        @click="$emit('rewrite')"
        :disabled="!transcript || rewriting"
    >
      <svg v-if="rewriting" class="spinner" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.3"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" fill="none"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M23 4v6h-6"/>
        <path d="M1 20v-6h6"/>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
      </svg>
      {{ rewriting ? 'AI改写中...' : '开始改写' }}
    </button>

    <div class="rewrite-result">
      <div class="result-header">
        <span class="result-label">改写结果</span>
        <button class="action-btn icon-only" @click="$emit('copy')" title="复制">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
      </div>
      <div class="result-content">{{ rewrittenText }}</div>
    </div>
  </section>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { getServiceConfig, updateServiceConfig } from '../../services/config.js'

const props = defineProps({
  transcript: {
    type: String,
    default: ''
  },
  rewriting: {
    type: Boolean,
    default: false
  },
  selectedStyle: {
    type: String,
    default: 'professional'
  },
  selectedModel: {
    type: String,
    default: 'doubao'
  },
  rewrittenText: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['rewrite', 'copy', 'update:selectedStyle', 'update:selectedModel'])

// 当前提示词
const currentPrompt = ref('')

// 默认提示词
const defaultPrompts = {
  professional: '请将以下文案改写为专业、正式的风格，适合商务或官方场合使用。保持信息完整，语言精炼专业：',
  casual: '请将以下文案改写为轻松、口语化的风格，像朋友聊天一样亲切自然，可以适当加入网络流行语和表情：',
  funny: '请将以下文案改写为幽默搞笑的风格，加入有趣的比喻、夸张和调侃，让读者会心一笑：',
  short: '请将以下文案精简压缩，只保留最核心的信息，用最少的字数表达完整含义：'
}

// 加载提示词
const loadPrompt = (style) => {
  const prompts = getServiceConfig('prompts')
  currentPrompt.value = prompts[style] || defaultPrompts[style] || ''
}

// 保存提示词
const savePrompt = () => {
  const prompts = getServiceConfig('prompts') || {}
  prompts[props.selectedStyle] = currentPrompt.value
  updateServiceConfig('prompts', prompts)
}

// 风格切换时保存当前提示词并加载新的
const onStyleChange = (newStyle) => {
  savePrompt()
  emit('update:selectedStyle', newStyle)
  loadPrompt(newStyle)
}

// 监听风格变化
watch(() => props.selectedStyle, (newStyle) => {
  loadPrompt(newStyle)
})

// 初始化加载
onMounted(() => {
  loadPrompt(props.selectedStyle)
})

// AI模型列表
const aiModels = [
  { id: 'deepseek', name: 'DeepSeek' },
  { id: 'doubao', name: '豆包' },
  { id: 'qianwen', name: '千问' },
  { id: 'hunyuan', name: '元宝' },
]

// Rewrite styles
const rewriteStyles = [
  { id: 'professional', name: '专业' },
  { id: 'casual', name: '口语化' },
  { id: 'funny', name: '幽默' },
  { id: 'short', name: '精简' },
]
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
  margin-bottom: 0.5rem;
  color: #fff;
  flex-shrink: 0;
}

.panel-title svg {
  width: 18px;
  height: 18px;
  color: #667eea;
}

.section-label {
  font-size: 0.7rem;
  font-weight: 500;
  color: rgba(255,255,255,0.5);
  margin-bottom: 0.35rem;
}

/* 选项行 */
.select-row {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
}

.select-group {
  flex: 1;
}

.prompt-group {
  margin-bottom: 0.6rem;
  flex-shrink: 0;
}

.prompt-input {
  height: 80px;
  width: 100%;
  padding: 0.5rem;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 0.75rem;
  line-height: 1.4;
  resize: none;
  font-family: inherit;
  transition: all 0.2s;
}

.prompt-input:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.prompt-input::placeholder {
  color: rgba(255,255,255,0.3);
}

.custom-select {
  position: relative;
}

.custom-select select {
  width: 100%;
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 0.8rem;
  cursor: pointer;
  appearance: none;
  transition: all 0.2s;
}

.custom-select select:hover {
  background: rgba(255,255,255,0.1);
  border-color: rgba(255,255,255,0.2);
}

.custom-select select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.custom-select select option {
  background: #1a1a2e;
  color: #fff;
  padding: 0.5rem;
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

.btn-rewrite {
  width: 100%;
  padding: 0.65rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  margin-bottom: 0.7rem;
  flex-shrink: 0;
}

.btn-rewrite:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-rewrite:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-rewrite svg {
  width: 16px;
  height: 16px;
}

.rewrite-result {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(0,0,0,0.3);
  border-radius: 8px;
  overflow: hidden;
  min-height: 0;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: rgba(102, 126, 234, 0.1);
  border-bottom: 1px solid rgba(102, 126, 234, 0.2);
  flex-shrink: 0;
}

.result-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #667eea;
}

.result-content {
  flex: 1;
  padding: 0.7rem;
  font-size: 0.8rem;
  line-height: 1.6;
  color: rgba(255,255,255,0.85);
  overflow-y: auto;
  min-height: 0;
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

.action-btn svg {
  width: 14px;
  height: 14px;
}

.action-btn.icon-only {
  padding: 0.5rem;
}

.spinner {
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
