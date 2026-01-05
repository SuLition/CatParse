/**
 * 配置管理服务
 * 使用 localStorage 持久化存储配置
 */

const STORAGE_KEY = 'douyintools_config'

// 默认配置
const defaultConfig = {
  // 下载设置
  download: {
    savePath: ''  // 空字符串表示使用系统默认下载目录
  },
  tencentAsr: {
    secretId: '',
    secretKey: ''
  },
  doubao: {
    apiKey: '',
    model: 'doubao-seed-1-6-251015'
  },
  deepseek: {
    apiKey: '',
    model: 'deepseek-chat'
  },
  qianwen: {
    apiKey: '',
    model: 'qwen-turbo'
  },
  hunyuan: {
    secretId: '',
    secretKey: ''
  },
  prompts: {
    professional: '请将以下文案改写为专业、正式的风格，适合商务或官方场合使用。保持信息完整，语言精练专业：',
    casual: '请将以下文案改写为轻松、口语化的风格，像朋友聊天一样亲切自然，可以适当加入网络流行语和表情：',
    funny: '请将以下文案改写为幽默搞笑的风格，加入有趣的比喻、夸张和调侃，让读者会心一笑：',
    short: '请将以下文案精简压缩，只保留最核心的信息，用最少的字数表达完整含义：'
  }
}

// 当前配置（内存缓存）
let currentConfig = null

/**
 * 加载配置
 */
export function loadConfig() {
  if (currentConfig) return currentConfig
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // 合并默认配置，确保新增字段也存在
      currentConfig = deepMerge(defaultConfig, parsed)
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
 */
export function saveConfig(config) {
  try {
    currentConfig = { ...config }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    return true
  } catch (e) {
    console.error('保存配置失败:', e)
    return false
  }
}

/**
 * 获取指定服务的配置
 */
export function getServiceConfig(service) {
  const config = loadConfig()
  return config[service] || {}
}

/**
 * 更新指定服务的配置
 */
export function updateServiceConfig(service, serviceConfig) {
  const config = loadConfig()
  config[service] = { ...config[service], ...serviceConfig }
  return saveConfig(config)
}

/**
 * 重置配置为默认值
 */
export function resetConfig() {
  currentConfig = { ...defaultConfig }
  localStorage.removeItem(STORAGE_KEY)
  return currentConfig
}

/**
 * 检查配置是否完整
 */
export function checkConfig() {
  const config = loadConfig()
  const status = {
    tencentAsr: !!(config.tencentAsr?.secretId && config.tencentAsr?.secretKey),
    doubao: !!config.doubao?.apiKey,
    deepseek: !!config.deepseek?.apiKey,
    qianwen: !!config.qianwen?.apiKey,
    hunyuan: !!(config.hunyuan?.secretId && config.hunyuan?.secretKey)
  }
  return status
}

/**
 * 深度合并对象
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

export default {
  loadConfig,
  saveConfig,
  getServiceConfig,
  updateServiceConfig,
  resetConfig,
  checkConfig
}
