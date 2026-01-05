/**
 * 解析服务配置
 * 区分开发模式和生产模式
 */

// 判断是否为开发模式
export const isDev = import.meta.env.DEV

// 判断是否为 Tauri 环境
export const isTauri = typeof window !== 'undefined' && window.__TAURI__ !== undefined

/**
 * 获取解析服务地址
 * - 开发模式：使用本地 Python 服务
 * - 生产模式（Tauri）：使用内置的解析服务
 */
export function getServiceUrl() {
  // 开发模式或生产模式都使用本地服务
  // Tauri 会在启动时自动启动后端服务
  return 'http://127.0.0.1:3721'
}

// 导出服务地址
export const SERVICE_URL = getServiceUrl()

// 日志
if (isDev) {
  console.log('[API Config] 开发模式')
  console.log('[API Config] SERVICE_URL:', SERVICE_URL)
} else {
  console.log('[API Config] 生产模式')
  console.log('[API Config] SERVICE_URL:', SERVICE_URL)
}
