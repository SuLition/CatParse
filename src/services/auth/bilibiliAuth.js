/**
 * B站登录授权服务
 * 实现二维码登录、Cookie管理和持久化存储
 */

import { SERVICE_URL } from '../api/config.js'

const BILIBILI_AUTH_KEY = 'bilibili_auth'

/**
 * 调用代理 API
 */
async function proxyRequest(url, method = 'GET', headers = {}) {
  const response = await fetch(`${SERVICE_URL}/proxy/bilibili`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, method, headers })
  })
  
  const result = await response.json()
  if (!result.success) {
    throw new Error(result.message || '请求失败')
  }
  return result
}

/**
 * 生成登录二维码
 * @returns {Promise<{url: string, qrcode_key: string}>} 二维码URL和key
 */
export async function generateQRCode() {
  const result = await proxyRequest(
    'https://passport.bilibili.com/x/passport-login/web/qrcode/generate',
    'GET',
    { 'Accept': 'application/json' }
  )
  
  const data = result.data
  if (data.code !== 0) {
    throw new Error(data.message || '获取二维码失败')
  }
  
  return {
    url: data.data.url,
    qrcode_key: data.data.qrcode_key
  }
}

/**
 * 轮询二维码登录状态
 * @param {string} qrcodeKey - 二维码key
 * @returns {Promise<{code: number, message: string, cookies?: object}>}
 * code: 0-登录成功, 86038-二维码已失效, 86090-已扫码待确认, 86101-未扫码
 */
export async function pollQRCodeStatus(qrcodeKey) {
  const result = await proxyRequest(
    `https://passport.bilibili.com/x/passport-login/web/qrcode/poll?qrcode_key=${qrcodeKey}`,
    'GET',
    { 'Accept': 'application/json' }
  )
  
  const data = result.data
  
  // 登录成功时，从 URL 中提取 Cookie 信息
  if (data.code === 0 && data.data.code === 0) {
    const url = data.data.url
    const refreshToken = data.data.refresh_token || ''
    const cookies = parseLoginUrl(url, refreshToken)
    return {
      code: 0,
      message: '登录成功',
      cookies
    }
  }
  
  return {
    code: data.data.code,
    message: getStatusMessage(data.data.code)
  }
}

/**
 * 解析登录成功后的URL，提取Cookie信息
 * @param {string} url - 登录成功返回的URL
 * @param {string} refreshToken - refresh_token
 */
function parseLoginUrl(url, refreshToken = '') {
  try {
    const urlObj = new URL(url)
    const params = urlObj.searchParams
    
    return {
      DedeUserID: params.get('DedeUserID') || '',
      DedeUserID__ckMd5: params.get('DedeUserID__ckMd5') || '',
      SESSDATA: params.get('SESSDATA') || '',
      bili_jct: params.get('bili_jct') || '',
      refresh_token: refreshToken
    }
  } catch (e) {
    console.error('解析登录URL失败:', e)
    return null
  }
}

/**
 * 获取状态码对应的消息
 */
function getStatusMessage(code) {
  const messages = {
    0: '登录成功',
    86038: '二维码已失效，请刷新',
    86090: '已扫码，请在手机上确认',
    86101: '等待扫码'
  }
  return messages[code] || '未知状态'
}

/**
 * 获取用户信息
 * @returns {Promise<object>} 用户信息
 */
export async function getUserInfo() {
  const auth = loadBilibiliAuth()
  if (!auth || !auth.cookies?.SESSDATA) {
    return null
  }
  
  // 使用主站 API，传递登录 Cookie
  const result = await proxyRequest(
    'https://api.bilibili.com/x/web-interface/nav',
    'GET',
    {
      'Accept': 'application/json',
      'Cookie': `SESSDATA=${auth.cookies.SESSDATA}`
    }
  )
  
  const data = result.data
  if (data.code !== 0) {
    // 登录已失效
    if (data.code === -101) {
      clearBilibiliAuth()
      return null
    }
    throw new Error(data.message || '获取用户信息失败')
  }
  
  return {
    isLogin: data.data.isLogin,
    mid: data.data.mid,
    uname: data.data.uname,
    face: data.data.face,
    vipType: data.data.vipType,
    vipStatus: data.data.vipStatus,
    level: data.data.level_info?.current_level || 0
  }
}

/**
 * 构建Cookie字符串
 */
function buildCookieString(cookies) {
  if (!cookies) return ''
  return Object.entries(cookies)
    .filter(([_, v]) => v)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ')
}

/**
 * 保存B站登录信息
 * @param {object} authData - 登录信息
 */
export function saveBilibiliAuth(authData) {
  try {
    const data = {
      ...authData,
      savedAt: Date.now()
    }
    localStorage.setItem(BILIBILI_AUTH_KEY, JSON.stringify(data))
    return true
  } catch (e) {
    console.error('保存B站登录信息失败:', e)
    return false
  }
}

/**
 * 加载B站登录信息
 * @returns {object|null} 登录信息
 */
export function loadBilibiliAuth() {
  try {
    const stored = localStorage.getItem(BILIBILI_AUTH_KEY)
    if (!stored) return null
    return JSON.parse(stored)
  } catch (e) {
    console.error('加载B站登录信息失败:', e)
    return null
  }
}

/**
 * 清除B站登录信息
 */
export function clearBilibiliAuth() {
  localStorage.removeItem(BILIBILI_AUTH_KEY)
}

/**
 * 检查是否已登录
 * @returns {boolean}
 */
export function isLoggedIn() {
  const auth = loadBilibiliAuth()
  return !!(auth && auth.cookies?.SESSDATA)
}

/**
 * 获取登录Cookie用于API请求
 * @returns {string} Cookie字符串
 */
export function getAuthCookie() {
  const auth = loadBilibiliAuth()
  if (!auth || !auth.cookies) return ''
  return buildCookieString(auth.cookies)
}

/**
 * 获取SESSDATA
 * @returns {string}
 */
export function getSessData() {
  const auth = loadBilibiliAuth()
  return auth?.cookies?.SESSDATA || ''
}

/**
 * 获取bili_jct (CSRF Token)
 * @returns {string}
 */
export function getCsrfToken() {
  const auth = loadBilibiliAuth()
  return auth?.cookies?.bili_jct || ''
}

export default {
  generateQRCode,
  pollQRCodeStatus,
  getUserInfo,
  saveBilibiliAuth,
  loadBilibiliAuth,
  clearBilibiliAuth,
  isLoggedIn,
  getAuthCookie,
  getSessData,
  getCsrfToken
}
