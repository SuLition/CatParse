/**
 * 存储服务统一导出
 */

export * from './localStorage'
export * from './historyStorage'
export * from './parseHistoryStorage'

// 默认导出常用服务
export { default as storage } from './localStorage'
export { default as historyStorage } from './historyStorage'
export { default as parseHistoryStorage } from './parseHistoryStorage'
