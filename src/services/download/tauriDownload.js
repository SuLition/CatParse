/**
 * Tauri 原生下载服务
 * 使用 Rust 后端进行高速下载
 */

import { getServiceConfig } from '../config.js'

// 检测是否在 Tauri 环境中运行
export function isTauri() {
  return typeof window !== 'undefined' && window.__TAURI_INTERNALS__ !== undefined
}

/**
 * 获取保存目录（优先使用用户配置，否则使用系统默认）
 */
async function getSaveDir() {
  const { invoke } = await import('@tauri-apps/api/core')
  
  // 优先使用用户配置的下载路径
  const downloadConfig = getServiceConfig('download')
  if (downloadConfig.savePath) {
    return downloadConfig.savePath
  }
  
  // 否则使用系统默认下载目录
  return await invoke('get_download_dir')
}

/**
 * 使用 Tauri 后端下载文件
 * @param {string} url - 下载链接
 * @param {string} filename - 文件名
 * @param {object} options - 配置选项
 * @param {string} options.referer - Referer 头
 * @param {string} options.origin - Origin 头
 * @param {string} options.saveDir - 保存目录
 * @param {function} onProgress - 进度回调 (progress, status) => void
 * @returns {Promise<string>} 保存的文件路径
 */
export async function tauriDownload(url, filename, options = {}, onProgress) {
  if (!isTauri()) {
    throw new Error('不在 Tauri 环境中')
  }

  const { invoke } = await import('@tauri-apps/api/core')
  const { listen } = await import('@tauri-apps/api/event')

  // 获取保存目录
  let saveDir = options.saveDir
  if (!saveDir) {
    saveDir = await getSaveDir()
  }

  // 监听下载进度事件
  let unlisten = null
  if (onProgress) {
    unlisten = await listen('download-progress', (event) => {
      const { progress, downloaded, total, status } = event.payload
      const downloadedMB = (downloaded / 1024 / 1024).toFixed(2)
      const totalMB = (total / 1024 / 1024).toFixed(2)
      
      if (status === 'connecting') {
        onProgress(0, '正在连接服务器...')
      } else if (status === 'downloading') {
        onProgress(Math.round(progress), `已下载 ${downloadedMB}MB / ${totalMB}MB`)
      } else if (status === 'completed') {
        onProgress(100, '下载完成')
      }
    })
  }

  try {
    const result = await invoke('download_file', {
      request: {
        url,
        filename,
        save_dir: saveDir,
        referer: options.referer || null,
        origin: options.origin || null,
      }
    })

    return result
  } finally {
    if (unlisten) {
      unlisten()
    }
  }
}

/**
 * B站视频下载 - Tauri 版本
 */
export async function tauriDownloadBilibili(url, filename, onProgress) {
  return tauriDownload(url, filename, {
    referer: 'https://www.bilibili.com/',
    origin: 'https://www.bilibili.com'
  }, onProgress)
}

/**
 * 抖音视频下载 - Tauri 版本
 */
export async function tauriDownloadDouyin(url, filename, onProgress) {
  return tauriDownload(url, filename, {
    referer: 'https://www.douyin.com/',
    origin: 'https://www.douyin.com'
  }, onProgress)
}

/**
 * 小红书视频下载 - Tauri 版本
 */
export async function tauriDownloadXiaohongshu(url, filename, onProgress) {
  return tauriDownload(url, filename, {
    referer: 'https://www.xiaohongshu.com/',
    origin: 'https://www.xiaohongshu.com'
  }, onProgress)
}

/**
 * 使用 Tauri 后端下载数据到内存（用于音频识别等场景）
 * @param {string} url - 下载链接
 * @param {object} options - 配置选项
 * @param {string} options.referer - Referer 头
 * @param {string} options.origin - Origin 头
 * @param {function} onProgress - 进度回调 (progress, status) => void
 * @returns {Promise<Uint8Array>} 下载的数据
 */
export async function tauriFetchData(url, options = {}, onProgress) {
  if (!isTauri()) {
    throw new Error('不在 Tauri 环境中')
  }

  const { invoke } = await import('@tauri-apps/api/core')
  const { listen } = await import('@tauri-apps/api/event')

  // 监听下载进度事件
  let unlisten = null
  if (onProgress) {
    unlisten = await listen('fetch-progress', (event) => {
      const { progress, downloaded, total, status } = event.payload
      const downloadedMB = downloaded ? (downloaded / 1024 / 1024).toFixed(2) : 0
      const totalMB = total ? (total / 1024 / 1024).toFixed(2) : 0
      
      if (status === 'connecting') {
        onProgress(0, '正在连接服务器...')
      } else if (status === 'downloading') {
        onProgress(Math.round(progress || 0), `已下载 ${downloadedMB}MB / ${totalMB}MB`)
      } else if (status === 'completed') {
        onProgress(100, '下载完成')
      }
    })
  }

  try {
    const data = await invoke('fetch_data', {
      request: {
        url,
        referer: options.referer || null,
        origin: options.origin || null,
      }
    })

    // 返回的是 number[](字节数组)，转换为 Uint8Array
    return new Uint8Array(data)
  } finally {
    if (unlisten) {
      unlisten()
    }
  }
}

/**
 * B站音频数据下载 - Tauri 版本
 */
export async function tauriFetchBilibiliAudio(url, onProgress) {
  return tauriFetchData(url, {
    referer: 'https://www.bilibili.com/',
    origin: 'https://www.bilibili.com'
  }, onProgress)
}

/**
 * 抖音音频数据下载 - Tauri 版本
 */
export async function tauriFetchDouyinAudio(url, onProgress) {
  return tauriFetchData(url, {
    referer: 'https://www.douyin.com/',
    origin: 'https://www.douyin.com'
  }, onProgress)
}

/**
 * 小红书音频数据下载 - Tauri 版本
 */
export async function tauriFetchXiaohongshuAudio(url, onProgress) {
  return tauriFetchData(url, {
    referer: 'https://www.xiaohongshu.com/',
    origin: 'https://www.xiaohongshu.com'
  }, onProgress)
}

/**
 * 获取下载目录路径（用户配置或系统默认）
 * @returns {Promise<string>} 下载目录路径
 */
export async function getDownloadDir() {
  if (!isTauri()) {
    return null
  }
  return await getSaveDir()
}

/**
 * 打开下载目录
 * @returns {Promise<void>}
 */
export async function openDownloadDir() {
  if (!isTauri()) {
    console.warn('非 Tauri 环境，无法打开文件夹')
    return
  }
  
  try {
    const downloadDir = await getSaveDir()
    if (!downloadDir) {
      console.error('无法获取下载目录')
      return
    }
    
    console.log('[打开文件夹]', downloadDir)
    
    // 调用 Rust 后端打开文件夹
    const { invoke } = await import('@tauri-apps/api/core')
    await invoke('open_folder', { path: downloadDir })
    
    console.log('[打开文件夹] 成功')
  } catch (error) {
    console.error('打开文件夹失败:', error)
  }
}

/**
 * 选择下载目录（打开文件夹选择器）
 * @returns {Promise<string|null>} 选择的目录路径，取消则返回 null
 */
export async function selectDownloadDir() {
  if (!isTauri()) {
    console.warn('非 Tauri 环境，无法选择文件夹')
    return null
  }
  
  const { open } = await import('@tauri-apps/plugin-dialog')
  
  const selected = await open({
    directory: true,
    multiple: false,
    title: '选择下载目录'
  })
  
  return selected
}

/**
 * 获取系统默认下载目录
 * @returns {Promise<string>}
 */
export async function getSystemDownloadDir() {
  if (!isTauri()) {
    return null
  }
  const { invoke } = await import('@tauri-apps/api/core')
  return await invoke('get_download_dir')
}
