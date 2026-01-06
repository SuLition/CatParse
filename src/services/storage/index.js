/**
 * 存储服务统一导出
 */

export * from './localStorage'
export * from './historyStorage'

// 默认导出常用服务
export { default as storage } from './localStorage'
export { default as historyStorage } from './historyStorage'
