/**
 * 本地文件存储服务
 * 使用 Tauri 文件系统 API 将数据存储到 AppData 目录
 */

import { readTextFile, writeTextFile, exists, mkdir, remove, BaseDirectory } from '@tauri-apps/plugin-fs'
import { appDataDir } from '@tauri-apps/api/path'

// 存储文件名常量
export const FILE_NAMES = {
  CONFIG: 'config.json',
  BILIBILI_AUTH: 'bilibili_auth.json',
  XHS_AUTH: 'xhs_auth.json',
  DOWNLOAD_HISTORY: 'download_history.json',
  PARSE_HISTORY: 'parse_history.json'
}

/**
 * 确保 AppData 目录存在
 */
export async function ensureAppDataDir() {
  try {
    const appDir = await appDataDir()
    const dirExists = await exists(appDir)
    if (!dirExists) {
      await mkdir(appDir, { recursive: true })
    }
    return true
  } catch (error) {
    console.error('[FileStorage] 创建 AppData 目录失败:', error)
    return false
  }
}

/**
 * 读取 JSON 文件
 * @param {string} filename - 文件名
 * @param {any} defaultValue - 默认值
 * @returns {Promise<any>}
 */
export async function readJsonFile(filename, defaultValue = null) {
  try {
    const fileExists = await exists(filename, { baseDir: BaseDirectory.AppData })
    if (!fileExists) {
      return defaultValue
    }
    const content = await readTextFile(filename, { baseDir: BaseDirectory.AppData })
    return JSON.parse(content)
  } catch (error) {
    console.error(`[FileStorage] 读取文件 ${filename} 失败:`, error)
    return defaultValue
  }
}

/**
 * 写入 JSON 文件
 * @param {string} filename - 文件名
 * @param {any} data - 要写入的数据
 * @returns {Promise<boolean>}
 */
export async function writeJsonFile(filename, data) {
  try {
    await ensureAppDataDir()
    await writeTextFile(filename, JSON.stringify(data, null, 2), {
      baseDir: BaseDirectory.AppData
    })
    return true
  } catch (error) {
    console.error(`[FileStorage] 写入文件 ${filename} 失败:`, error)
    return false
  }
}

/**
 * 删除文件
 * @param {string} filename - 文件名
 * @returns {Promise<boolean>}
 */
export async function removeFile(filename) {
  try {
    const fileExists = await exists(filename, { baseDir: BaseDirectory.AppData })
    if (fileExists) {
      await remove(filename, { baseDir: BaseDirectory.AppData })
    }
    return true
  } catch (error) {
    console.error(`[FileStorage] 删除文件 ${filename} 失败:`, error)
    return false
  }
}

/**
 * 检查文件是否存在
 * @param {string} filename - 文件名
 * @returns {Promise<boolean>}
 */
export async function fileExists(filename) {
  try {
    return await exists(filename, { baseDir: BaseDirectory.AppData })
  } catch {
    return false
  }
}
