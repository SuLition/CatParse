/**
 * 解析历史存储服务
 * 使用 Tauri fs 插件将数据存储在本地 AppData 目录
 */

import { readTextFile, writeTextFile, exists, mkdir, BaseDirectory } from '@tauri-apps/plugin-fs'
import { appDataDir } from '@tauri-apps/api/path'
import { loadConfig } from '@/services/config'

const HISTORY_FILE = 'parse_history.json'
const DEFAULT_MAX_RECORDS = 100

/**
 * 获取最大记录数量配置
 */
function getMaxRecords() {
  try {
    const config = loadConfig()
    return config.history?.maxRecords || DEFAULT_MAX_RECORDS
  } catch {
    return DEFAULT_MAX_RECORDS
  }
}

/**
 * 确保 AppData 目录存在
 */
async function ensureAppDataDir() {
  try {
    // 获取 AppData 目录的完整路径
    const appDir = await appDataDir()
    console.log('[ensureAppDataDir] AppData 路径:', appDir)
    
    // 检查目录是否存在
    const dirExists = await exists(appDir)
    console.log('[ensureAppDataDir] 目录存在:', dirExists)
    
    if (!dirExists) {
      // 使用完整路径创建目录
      await mkdir(appDir, { recursive: true })
      console.log('[ensureAppDataDir] 目录创建成功')
    }
  } catch (error) {
    console.error('创建 AppData 目录失败:', error)
    throw error
  }
}

/**
 * 获取所有解析历史记录
 * @returns {Promise<Array>} 历史记录数组
 */
export async function getParseHistory() {
  try {
    const fileExists = await exists(HISTORY_FILE, { baseDir: BaseDirectory.AppData })
    if (!fileExists) {
      return []
    }
    const content = await readTextFile(HISTORY_FILE, { baseDir: BaseDirectory.AppData })
    return JSON.parse(content)
  } catch (error) {
    console.error('读取解析历史失败:', error)
    return []
  }
}

/**
 * 保存解析历史到文件
 * @param {Array} history - 历史记录数组
 */
async function saveParseHistory(history) {
  try {
    await ensureAppDataDir()
    await writeTextFile(HISTORY_FILE, JSON.stringify(history, null, 2), { 
      baseDir: BaseDirectory.AppData 
    })
    return true
  } catch (error) {
    console.error('保存解析历史失败:', error)
    return false
  }
}

/**
 * 添加解析历史记录
 * @param {Object} record - 历史记录对象
 * @param {string} record.cover - 封面图 URL
 * @param {string} record.title - 视频标题
 * @param {string} record.platform - 平台标识
 * @param {string} record.originalUrl - 原始链接
 * @param {string} record.originalText - 原始文案
 * @param {string} record.rewrittenText - 改写后的文案
 * @param {string} record.videoId - 视频唯一ID（用于去重）
 * @returns {Promise<number|null>} 返回记录 ID，失败返回 null
 */
export async function addParseHistory(record) {
  const history = await getParseHistory()
  
  // 根据 videoId 和 platform 去重，如果存在相同视频则替换
  let filteredHistory = history
  if (record.videoId) {
    filteredHistory = history.filter(item => 
      !(item.videoId === record.videoId && item.platform === record.platform)
    )
  }
  
  const id = Date.now()
  const newRecord = {
    id,
    ...record,
    createTime: new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\//g, '-')
  }
  
  // 添加到列表开头
  filteredHistory.unshift(newRecord)
  
  // 限制最大条数
  const maxRecords = getMaxRecords()
  if (filteredHistory.length > maxRecords) {
    filteredHistory.splice(maxRecords)
  }
  
  const success = await saveParseHistory(filteredHistory)
  return success ? id : null
}

/**
 * 删除指定解析历史记录
 * @param {number} id - 记录 ID
 * @returns {Promise<boolean>} 是否成功
 */
export async function deleteParseHistory(id) {
  const history = await getParseHistory()
  const filtered = history.filter(item => item.id !== id)
  return await saveParseHistory(filtered)
}

/**
 * 清空所有解析历史记录
 * @returns {Promise<boolean>} 是否成功
 */
export async function clearParseHistory() {
  return await saveParseHistory([])
}

/**
 * 更新解析历史记录
 * @param {number} id - 记录 ID
 * @param {Object} updates - 要更新的字段
 * @returns {Promise<boolean>} 是否成功
 */
export async function updateParseHistory(id, updates) {
  const history = await getParseHistory()
  const index = history.findIndex(item => item.id === id)
  
  if (index === -1) return false
  
  history[index] = { ...history[index], ...updates }
  return await saveParseHistory(history)
}

export default {
  getParseHistory,
  addParseHistory,
  deleteParseHistory,
  clearParseHistory,
  updateParseHistory
}
