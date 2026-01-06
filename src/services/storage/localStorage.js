/**
 * localStorage 封装服务
 * 提供统一的本地存储接口，便于后续扩展为其他存储方式
 */

/**
 * 获取存储项
 * @param {string} key - 存储键名
 * @param {*} defaultValue - 默认值
 * @returns {*} 存储的值或默认值
 */
export function getItem(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key)
    if (item === null) return defaultValue
    return JSON.parse(item)
  } catch (e) {
    console.error(`[Storage] 读取 ${key} 失败:`, e)
    return defaultValue
  }
}

/**
 * 设置存储项
 * @param {string} key - 存储键名
 * @param {*} value - 要存储的值
 * @returns {boolean} 是否成功
 */
export function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (e) {
    console.error(`[Storage] 保存 ${key} 失败:`, e)
    return false
  }
}

/**
 * 删除存储项
 * @param {string} key - 存储键名
 * @returns {boolean} 是否成功
 */
export function removeItem(key) {
  try {
    localStorage.removeItem(key)
    return true
  } catch (e) {
    console.error(`[Storage] 删除 ${key} 失败:`, e)
    return false
  }
}

/**
 * 清空所有存储
 * @returns {boolean} 是否成功
 */
export function clear() {
  try {
    localStorage.clear()
    return true
  } catch (e) {
    console.error('[Storage] 清空存储失败:', e)
    return false
  }
}

export default {
  getItem,
  setItem,
  removeItem,
  clear
}
