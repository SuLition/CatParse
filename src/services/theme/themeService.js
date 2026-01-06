/**
 * 主题服务
 * 管理应用的亮色/暗色主题切换
 */

import { ref, watch } from 'vue'
import { getItem, setItem } from '../storage/localStorage'
import { STORAGE_KEYS } from '@/constants/storage'
import { THEME_MODES, DARK_THEME, LIGHT_THEME } from '@/constants/theme'

// 当前主题模式 (light / dark / system)
const themeMode = ref(THEME_MODES.DARK)

// 实际应用的主题 (light / dark)
const appliedTheme = ref(THEME_MODES.DARK)

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
function applyThemeToDOM(theme) {
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
}

/**
 * 初始化主题
 */
export function initTheme() {
  // 从存储加载主题设置
  const savedMode = getItem(STORAGE_KEYS.THEME, THEME_MODES.DARK)
  themeMode.value = savedMode
  
  // 计算实际主题
  const actualTheme = savedMode === THEME_MODES.SYSTEM 
    ? getSystemTheme() 
    : savedMode
  
  // 应用主题
  applyThemeToDOM(actualTheme)
  
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
export function setTheme(mode) {
  themeMode.value = mode
  setItem(STORAGE_KEYS.THEME, mode)
  
  const actualTheme = mode === THEME_MODES.SYSTEM 
    ? getSystemTheme() 
    : mode
  
  applyThemeToDOM(actualTheme)
}

/**
 * 切换主题（在亮色和暗色之间切换）
 */
export function toggleTheme() {
  const newTheme = appliedTheme.value === THEME_MODES.DARK 
    ? THEME_MODES.LIGHT 
    : THEME_MODES.DARK
  
  setTheme(newTheme)
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
  isDarkTheme
}
