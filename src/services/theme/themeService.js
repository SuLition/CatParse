/**
 * 主题服务
 * 管理应用的亮色/暗色主题切换
 */

import { ref, watch } from 'vue'
import { getItem, setItem } from '../storage/localStorage'
import { STORAGE_KEYS } from '@/constants/storage'
import { THEME_MODES, DARK_THEME, LIGHT_THEME } from '@/constants/theme'
import { invoke } from '@tauri-apps/api/core'

// 当前主题模式 (light / dark / system)
const themeMode = ref(THEME_MODES.DARK)

// 实际应用的主题 (light / dark)
const appliedTheme = ref(THEME_MODES.DARK)

// 窗口效果 (none / mica / acrylic)
const windowEffect = ref('none')

// 系统主题媒体查询
let systemThemeQuery = null

/**
 * 获取系统主题偏好
 * @returns {'light' | 'dark'}
 */
function getSystemTheme() {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? THEME_MODES.DARK 
      : THEME_MODES.LIGHT
  }
  return THEME_MODES.DARK
}

/**
 * 应用主题到 DOM
 * @param {'light' | 'dark'} theme
 */
async function applyThemeToDOM(theme) {
  const root = document.documentElement
  const themeVars = theme === THEME_MODES.LIGHT ? LIGHT_THEME : DARK_THEME
  
  // 设置 CSS 变量
  Object.entries(themeVars).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
  
  // 设置 html class
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
  
  // 更新实际应用的主题
  appliedTheme.value = theme
  
  // 应用窗口效果
  await applyWindowEffect(windowEffect.value, theme === THEME_MODES.DARK)
}

/**
 * 应用窗口效果
 * @param {'none' | 'mica' | 'acrylic'} effect
 * @param {boolean} isDark
 */
async function applyWindowEffect(effect, isDark) {
  try {
    const result = await invoke('set_window_effect', {
      effect: effect,
      isDark: isDark
    })
    console.log('[WindowEffect]', result)
    
    // 根据效果类型设置背景透明度
    const root = document.documentElement
    if (effect === 'none') {
      root.classList.remove('window-effect-enabled')
    } else {
      root.classList.add('window-effect-enabled')
    }
  } catch (error) {
    console.warn('[窗口效果] 设置失败:', error)
  }
}

/**
 * 初始化主题
 */
export async function initTheme() {
  // 从存储加载主题设置
  const savedMode = getItem(STORAGE_KEYS.THEME, THEME_MODES.DARK)
  themeMode.value = savedMode
  
  // 加载窗口效果设置
  const savedEffect = getItem(STORAGE_KEYS.WINDOW_EFFECT, 'none')
  windowEffect.value = savedEffect
  
  // 计算实际主题
  const actualTheme = savedMode === THEME_MODES.SYSTEM 
    ? getSystemTheme() 
    : savedMode
  
  // 应用主题
  await applyThemeToDOM(actualTheme)
  
  // 监听系统主题变化
  if (typeof window !== 'undefined' && window.matchMedia) {
    systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    systemThemeQuery.addEventListener('change', handleSystemThemeChange)
  }
}

/**
 * 处理系统主题变化
 */
function handleSystemThemeChange(e) {
  if (themeMode.value === THEME_MODES.SYSTEM) {
    applyThemeToDOM(e.matches ? THEME_MODES.DARK : THEME_MODES.LIGHT)
  }
}

/**
 * 设置主题模式
 * @param {'light' | 'dark' | 'system'} mode
 */
export async function setTheme(mode) {
  themeMode.value = mode
  setItem(STORAGE_KEYS.THEME, mode)
  
  const actualTheme = mode === THEME_MODES.SYSTEM 
    ? getSystemTheme() 
    : mode
  
  await applyThemeToDOM(actualTheme)
}

/**
 * 设置窗口效果
 * @param {'none' | 'mica' | 'acrylic'} effect
 */
export async function setWindowEffect(effect) {
  windowEffect.value = effect
  setItem(STORAGE_KEYS.WINDOW_EFFECT, effect)
  await applyWindowEffect(effect, appliedTheme.value === THEME_MODES.DARK)
}

/**
 * 获取当前窗口效果
 * @returns {Ref<string>}
 */
export function useWindowEffect() {
  return windowEffect
}

/**
 * 切换主题（在亮色和暗色之间切换）
 */
export async function toggleTheme() {
  const newTheme = appliedTheme.value === THEME_MODES.DARK 
    ? THEME_MODES.LIGHT 
    : THEME_MODES.DARK
  
  await setTheme(newTheme)
}

/**
 * 获取当前主题模式
 * @returns {Ref<string>}
 */
export function useThemeMode() {
  return themeMode
}

/**
 * 获取实际应用的主题
 * @returns {Ref<string>}
 */
export function useAppliedTheme() {
  return appliedTheme
}

/**
 * 检查当前是否是暗色主题
 * @returns {boolean}
 */
export function isDarkTheme() {
  return appliedTheme.value === THEME_MODES.DARK
}

export default {
  initTheme,
  setTheme,
  toggleTheme,
  useThemeMode,
  useAppliedTheme,
  isDarkTheme,
  setWindowEffect,
  useWindowEffect
}
