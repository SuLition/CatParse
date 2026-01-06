/**
 * 配置管理服务
 * 使用 localStorage 持久化存储配置
 */

import { getItem, setItem, removeItem } from '../storage/localStorage'
import { STORAGE_KEYS } from '@/constants/storage'
import { defaultConfig } from './defaultConfig'

// 当前配置（内存缓存）
let currentConfig = null

/**
 * 深度合并对象
 * @param {Object} target - 目标对象
 * @param {Object} source - 源对象
 * @returns {Object} 合并后的对象
 */
function deepMerge(target, source) {
  const result = { ...target }
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key])
    } else {
      result[key] = source[key]
    }
  }
  return result
}

/**
 * 加载配置
 * @returns {Object} 配置对象
 */
export function loadConfig() {
  if (currentConfig) return currentConfig
  
  try {
    const stored = getItem(STORAGE_KEYS.APP_CONFIG)
    if (stored) {
      // 合并默认配置，确保新增字段也存在
      currentConfig = deepMerge(defaultConfig, stored)
    } else {
      currentConfig = { ...defaultConfig }
    }
  } catch (e) {
    console.error('加载配置失败:', e)
    currentConfig = { ...defaultConfig }
  }
  
  return currentConfig
}

/**
 * 保存配置
 * @param {Object} config - 配置对象
 * @returns {boolean} 是否成功
 */
export function saveConfig(config) {
  // 深拷贝配置对象，避免引用问题
  currentConfig = JSON.parse(JSON.stringify(config))
  return setItem(STORAGE_KEYS.APP_CONFIG, config)
}

/**
 * 获取指定服务的配置
 * @param {string} service - 服务名称
 * @returns {Object} 服务配置
 */
export function getServiceConfig(service) {
  const config = loadConfig()
  return config[service] || {}
}

/**
 * 更新指定服务的配置
 * @param {string} service - 服务名称
 * @param {Object} serviceConfig - 服务配置
 * @returns {boolean} 是否成功
 */
export function updateServiceConfig(service, serviceConfig) {
  const config = loadConfig()
  config[service] = { ...config[service], ...serviceConfig }
  return saveConfig(config)
}

/**
 * 重置配置为默认值
 * @returns {Object} 默认配置
 */
export function resetConfig() {
  currentConfig = { ...defaultConfig }
  removeItem(STORAGE_KEYS.APP_CONFIG)
  return currentConfig
}

/**
 * 检查配置是否完整
 * @returns {Object} 各服务配置状态
 */
export function checkConfig() {
  const config = loadConfig()
  return {
    tencentAsr: !!(config.tencentAsr?.secretId && config.tencentAsr?.secretKey),
    doubao: !!config.doubao?.apiKey,
    deepseek: !!config.deepseek?.apiKey,
    qianwen: !!config.qianwen?.apiKey,
    hunyuan: !!(config.hunyuan?.secretId && config.hunyuan?.secretKey)
  }
}

export default {
  loadConfig,
  saveConfig,
  getServiceConfig,
  updateServiceConfig,
  resetConfig,
  checkConfig
}
