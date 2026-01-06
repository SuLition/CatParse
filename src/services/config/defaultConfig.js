/**
 * 默认配置值
 */

import { DEFAULT_PROMPTS } from '@/constants/options'

// 应用默认配置
export const defaultConfig = {
  // 下载设置
  download: {
    savePath: ''  // 空字符串表示使用系统默认下载目录
  },
  
  // 腾讯语音识别配置
  tencentAsr: {
    secretId: '',
    secretKey: ''
  },
  
  // 豆包配置
  doubao: {
    apiKey: '',
    model: 'doubao-seed-1-6-251015'
  },
  
  // DeepSeek 配置
  deepseek: {
    apiKey: '',
    model: 'deepseek-chat'
  },
  
  // 千问配置
  qianwen: {
    apiKey: '',
    model: 'qwen-turbo'
  },
  
  // 混元配置
  hunyuan: {
    secretId: '',
    secretKey: ''
  },
  
  // 提示词配置
  prompts: { ...DEFAULT_PROMPTS }
}
