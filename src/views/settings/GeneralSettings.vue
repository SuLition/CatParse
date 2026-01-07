<script setup>
import { reactive, ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { loadConfig, saveConfig, PAGE_TRANSITION_OPTIONS } from '@/services/config'
import { setWindowEffect, useWindowEffect, setAccentColor, useAccentColor } from '@/services/theme'
import { ACCENT_COLOR_OPTIONS } from '@/constants/theme'
import CustomSelect from '@/components/common/CustomSelect.vue'

// 窗口效果选项
const WINDOW_EFFECT_OPTIONS = [
  { value: 'none', label: '无效果' },
  { value: 'mica', label: 'Mica (云母)' }
]

// 窗口效果
const windowEffect = useWindowEffect()

// 主题色
const accentColor = useAccentColor()

// 自动检查更新
const autoCheckUpdate = ref(true)

// 检查中状态
const isChecking = ref(false)

// 表单数据
const form = reactive({
  appearance: { pageTransition: 'fade' }
})

// 切换窗口效果
const onWindowEffectChange = async (effect) => {
  await setWindowEffect(effect)
  toast.success(`窗口效果已切换为 ${WINDOW_EFFECT_OPTIONS.find(o => o.value === effect)?.label || effect}`)
}

// 切换主题色
const onAccentColorChange = (colorKey) => {
  setAccentColor(colorKey)
  const color = ACCENT_COLOR_OPTIONS.find(o => o.value === colorKey)
  toast.success(`主题色已切换为 ${color?.label || colorKey}`)
}

// 页面过渡效果变更
const onTransitionChange = (value) => {
  form.appearance.pageTransition = value
  // 立即保存
  const config = loadConfig()
  saveConfig({ ...config, appearance: { ...config.appearance, pageTransition: value } })
  // 通知 App.vue 刷新过渡效果
  if (window.__refreshTransition) {
    window.__refreshTransition()
  }
}

// 加载配置
const loadForm = () => {
  const config = loadConfig()
  if (config.appearance) {
    Object.assign(form.appearance, config.appearance)
  }
  // 加载自动检查更新设置
  autoCheckUpdate.value = config.update?.autoCheck ?? true
}

// 切换自动检查更新
const onAutoCheckChange = () => {
  const config = loadConfig()
  saveConfig({
    ...config,
    update: { ...config.update, autoCheck: autoCheckUpdate.value }
  })
  toast.success(autoCheckUpdate.value ? '已开启自动检查更新' : '已关闭自动检查更新')
}

// 手动检查更新
const checkUpdateNow = async () => {
  if (isChecking.value) return
  
  if (window.__checkUpdate) {
    isChecking.value = true
    try {
      await window.__checkUpdate(true)
    } finally {
      isChecking.value = false
    }
  } else {
    toast.error('更新功能未初始化')
  }
}

onMounted(() => {
  loadForm()
})
</script>

<template>
  <div class="settings-panel">
    <!-- 窗口效果 -->
    <div class="setting-group">
      <div class="setting-item">
        <div class="setting-row">
          <svg class="setting-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <rect height="18" rx="2" width="18" x="3" y="3"/>
          </svg>
          <span class="setting-label">窗口效果</span>
        </div>
        <CustomSelect v-model="windowEffect" :options="WINDOW_EFFECT_OPTIONS" class="setting-select"
                      @change="onWindowEffectChange"/>
      </div>
      <p class="setting-hint">Windows 11 原生毛玻璃效果（需要 Win11 22H2+）</p>
    </div>

    <!-- 主题色 -->
    <div class="setting-group">
      <div class="setting-item">
        <div class="setting-row">
          <svg class="setting-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="4"/>
          </svg>
          <span class="setting-label">主题色</span>
        </div>
        <div class="color-picker">
          <button
            v-for="color in ACCENT_COLOR_OPTIONS"
            :key="color.value"
            class="color-dot"
            :class="{ active: accentColor === color.value }"
            :style="{ '--color': color.color }"
            :title="color.label"
            @click="onAccentColorChange(color.value)"
          />
        </div>
      </div>
      <p class="setting-hint">应用的强调色，用于按钮、链接等元素</p>
    </div>

    <!-- 页面过渡 -->
    <div class="setting-group">
      <div class="setting-item">
        <div class="setting-row">
          <svg class="setting-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
          <span class="setting-label">页面过渡</span>
        </div>
        <CustomSelect v-model="form.appearance.pageTransition" :options="PAGE_TRANSITION_OPTIONS"
                      class="setting-select" @change="onTransitionChange"/>
      </div>
      <p class="setting-hint">切换页面时的动画效果</p>
    </div>

    <!-- 自动检查更新 -->
    <div class="setting-group">
      <div class="setting-item">
        <div class="setting-row">
          <svg class="setting-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <span class="setting-label">自动检查更新</span>
        </div>
        <label class="switch">
          <input type="checkbox" v-model="autoCheckUpdate" @change="onAutoCheckChange">
          <span class="slider"></span>
        </label>
      </div>
      <p class="setting-hint">启动应用时自动检查新版本</p>
    </div>

    <!-- 手动检查更新 -->
    <div class="setting-group">
      <div class="setting-item">
        <div class="setting-row">
          <svg class="setting-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span class="setting-label">检查更新</span>
        </div>
        <button class="check-update-btn" :class="{ 'btn-loading': isChecking }" @click="checkUpdateNow">立即检查</button>
      </div>
      <p class="setting-hint">手动检查是否有新版本可用</p>
    </div>
  </div>
</template>

<style scoped>
.settings-panel {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.setting-group {
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border-primary, #3d3f43);
}

.setting-group:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.setting-icon {
  width: 20px;
  height: 20px;
  color: var(--text-tertiary, #6c6e73);
}

.setting-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #ffffff);
}

.setting-hint {
  font-size: 12px;
  color: var(--text-tertiary, #6c6e73);
  margin: 8px 0 0 32px;
}

.setting-select {
  width: 160px;
}

/* Switch 开关样式 */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-primary, #1e1f22);
  border: 1px solid var(--border-primary, #3d3f43);
  transition: 0.2s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 2px;
  bottom: 2px;
  background-color: var(--text-tertiary, #6c6e73);
  transition: 0.2s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--accent-color, #4a9eff);
  border-color: var(--accent-color, #4a9eff);
}

input:checked + .slider:before {
  transform: translateX(20px);
  background-color: #fff;
}

/* 检查更新按钮 */
.check-update-btn {
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--border-primary, #3d3f43);
  background: var(--bg-primary, #1e1f22);
  color: var(--text-primary, #ffffff);
}

.check-update-btn:hover {
  background: var(--accent-color, #4a9eff);
  border-color: var(--accent-color, #4a9eff);
  color: #fff;
}

/* 主题色选择器 */
.color-picker {
  display: flex;
  gap: 8px;
}

.color-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: var(--color);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.color-dot:hover {
  transform: scale(1.15);
}

.color-dot.active {
  border-color: var(--text-primary, #ffffff);
  box-shadow: 0 0 0 2px var(--color);
}
</style>
