/**
 * 选项配置常量
 * 用于下拉选择器等UI组件
 */

// 支持的平台列表
export const PLATFORMS = [
  { value: 'bilibili', label: 'B站' },
  { value: 'douyin', label: '抖音' },
  { value: 'kuaishou', label: '快手' },
  { value: 'xiaohongshu', label: '小红书' }
];

// AI模型列表
export const AI_MODELS = [
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'doubao', label: '豆包' },
  { value: 'qianwen', label: '千问' },
  { value: 'hunyuan', label: '元宝' }
];

// 改写风格列表
export const REWRITE_STYLES = [
  { value: 'professional', label: '专业' },
  { value: 'casual', label: '口语化' },
  { value: 'funny', label: '幽默' },
  { value: 'short', label: '精简' }
];

// 默认提示词
export const DEFAULT_PROMPTS = {
  professional: '请将以下文案改写为专业、正式的风格，适合商务或官方场合使用。保持信息完整，语言精炼专业：',
  casual: '请将以下文案改写为轻松、口语化的风格，像朋友聊天一样亲切自然，可以适当加入网络流行语和表情：',
  funny: '请将以下文案改写为幽默搞笑的风格，加入有趣的比喻、夸张和调侃，让读者会心一笑：',
  short: '请将以下文案精简压缩，只保留最核心的信息，用最少的字数表达完整含义：'
};
