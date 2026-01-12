/**
 * 认证服务统一导出
 */

export { default as bilibiliAuth } from './bilibiliAuth'
export { default as xiaohongshuAuth } from './xiaohongshuAuth'

// 小红书登录相关函数导出
export {
  openXhsLoginWindow,
  saveXhsAuth,
  loadXhsAuth,
  clearXhsAuth,
  isXhsLoggedIn,
  getXhsCookie,
  performLogin as performXhsLogin
} from './xiaohongshuAuth'
