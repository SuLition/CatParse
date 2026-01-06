/**
 * 历史记录存储服务
 * 管理下载历史的持久化存储
 */

import { getItem, setItem, removeItem } from './localStorage'
import { STORAGE_KEYS, HISTORY_CONFIG } from '@/constants/storage'

/**
 * 获取所有历史记录
 * @returns {Array} 历史记录数组
 */
export function getHistory() {
  return getItem(STORAGE_KEYS.DOWNLOAD_HISTORY, [])
}

/**
 * 添加历史记录
 * @param {Object} record - 历史记录对象
 * @param {string} record.title - 视频标题
 * @param {string} record.platform - 平台标识
 * @param {string} record.url - 视频链接
 * @param {string} record.size - 文件大小
 * @param {string} record.savePath - 保存路径
 * @returns {boolean} 是否成功
 */
export function addHistory(record) {
  const history = getHistory()
  
  // 生成唯一 ID 和时间戳
  const newRecord = {
    id: Date.now(),
    ...record,
    downloadTime: new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\//g, '-'),
    status: 'completed'
  }
  
  // 添加到列表开头
  history.unshift(newRecord)
  
  // 限制最大条数
  if (history.length > HISTORY_CONFIG.MAX_RECORDS) {
    history.splice(HISTORY_CONFIG.MAX_RECORDS)
  }
  
  return setItem(STORAGE_KEYS.DOWNLOAD_HISTORY, history)
}

/**
 * 删除指定历史记录
 * @param {number} id - 记录 ID
 * @returns {boolean} 是否成功
 */
export function deleteHistory(id) {
  const history = getHistory()
  const filtered = history.filter(item => item.id !== id)
  return setItem(STORAGE_KEYS.DOWNLOAD_HISTORY, filtered)
}

/**
 * 清空所有历史记录
 * @returns {boolean} 是否成功
 */
export function clearHistory() {
  return removeItem(STORAGE_KEYS.DOWNLOAD_HISTORY)
}

/**
 * 更新历史记录状态
 * @param {number} id - 记录 ID
 * @param {Object} updates - 要更新的字段
 * @returns {boolean} 是否成功
 */
export function updateHistory(id, updates) {
  const history = getHistory()
  const index = history.findIndex(item => item.id === id)
  
  if (index === -1) return false
  
  history[index] = { ...history[index], ...updates }
  return setItem(STORAGE_KEYS.DOWNLOAD_HISTORY, history)
}

export default {
  getHistory,
  addHistory,
  deleteHistory,
  clearHistory,
  updateHistory
}
