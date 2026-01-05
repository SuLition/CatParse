/**
 * AI文案改写服务
 */

import { getServiceConfig } from './config.js'
import { SERVICE_URL } from './api/config.js'

// 默认提示词
const defaultPrompts = {
  professional: '请将以下文案改写为专业、正式的风格，适合商务或官方场合使用。保持信息完整，语言精炼专业：',
  casual: '请将以下文案改写为轻松、口语化的风格，像朋友聊天一样亲切自然，可以适当加入网络流行语和表情：',
  funny: '请将以下文案改写为幽默搞笑的风格，加入有趣的比喻、夸张和调侃，让读者会心一笑：',
  short: '请将以下文案精简压缩，只保留最核心的信息，用最少的字数表达完整含义：'
}

/**
 * 获取提示词
 */
function getPrompt(style) {
  const prompts = getServiceConfig('prompts')
  return prompts[style] || defaultPrompts[style] || defaultPrompts.professional
}

/**
 * 豆包AI改写
 * @param {string} text - 原始文案
 * @param {string} style - 改写风格
 * @returns {Promise<string>} - 改写后的文案
 */
export async function rewriteWithDoubao(text, style = 'professional') {
  const config = getServiceConfig('doubao')
  
  if (!config.apiKey) {
    throw new Error('请先配置豆包 API Key')
  }
  
  const prompt = getPrompt(style)
  
  const requestBody = JSON.stringify({
    model: config.model || 'doubao-seed-1-6-251015',
    messages: [
      {
        role: 'system',
        content: '你是一个专业的文案改写助手，擅长将视频文案改写成不同风格。请直接输出改写后的文案，不要添加任何解释或前缀。'
      },
      {
        role: 'user',
        content: `${prompt}\n\n${text}`
      }
    ],
    max_tokens: 2000,
    temperature: 0.7
  })

  // 使用后端代理
  const response = await fetch(`${SERVICE_URL}/proxy/doubao`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: requestBody
    })
  })

  const proxyResult = await response.json()
  if (!proxyResult.success) {
    console.error('豆包API代理错误:', proxyResult.message)
    throw new Error('AI改写请求失败')
  }

  const data = proxyResult.data
  return data.choices?.[0]?.message?.content || ''
}

/**
 * 通用AI改写接口
 * @param {string} text - 原始文案
 * @param {string} style - 改写风格
 * @param {string} model - AI模型
 * @returns {Promise<string>} - 改写后的文案
 */
export async function rewriteText(text, style = 'professional', model = 'doubao') {
  if (!text || !text.trim()) {
    throw new Error('请输入要改写的文案')
  }

  switch (model) {
    case 'doubao':
      return rewriteWithDoubao(text, style)
    case 'deepseek':
      throw new Error('DeepSeek模型暂未配置')
    case 'qianwen':
      throw new Error('千问模型暂未配置')
    case 'hunyuan':
      throw new Error('元宝模型暂未配置')
    default:
      return rewriteWithDoubao(text, style)
  }
}
