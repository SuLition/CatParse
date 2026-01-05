/**
 * 平台配置模块
 * 定义所有支持的平台及其配置信息
 */

// 平台状态
export const PlatformStatus = {
  AVAILABLE: 'available',     // 可用
  COMING_SOON: 'coming_soon', // 即将支持
  MAINTENANCE: 'maintenance'  // 维护中
}

// 平台配置
export const platforms = [
  {
    id: 'bilibili',
    name: 'B站',
    icon: '📺',
    status: PlatformStatus.AVAILABLE,
    color: '#FB7299',
    features: ['video', 'audio', 'transcript'],
    urlPatterns: [
      /bilibili\.com/i,
      /b23\.tv/i
    ],
    placeholder: '请输入B站视频链接，如：https://www.bilibili.com/video/BVxxx'
  },
  {
    id: 'douyin',
    name: '抖音',
    icon: '🎵',
    status: PlatformStatus.AVAILABLE,
    color: '#000000',
    features: ['video', 'audio', 'transcript'],
    urlPatterns: [
      /douyin\.com/i,
      /iesdouyin\.com/i,
      /v\.douyin\.com/i
    ],
    placeholder: '请输入抖音视频链接，如：https://v.douyin.com/xxx'
  },
  {
    id: 'xiaohongshu',
    name: '小红书',
    icon: '📕',
    status: PlatformStatus.AVAILABLE,
    color: '#FE2C55',
    features: ['video', 'image', 'transcript'],
    urlPatterns: [
      /xiaohongshu\.com/i,
      /xhslink\.com/i
    ],
    placeholder: '请输入小红书链接或分享口令'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎬',
    status: PlatformStatus.COMING_SOON,
    color: '#000000',
    features: ['video', 'audio', 'transcript'],
    urlPatterns: [
      /tiktok\.com/i,
      /vm\.tiktok\.com/i
    ],
    placeholder: '请输入TikTok视频链接'
  },
  {
    id: 'kuaishou',
    name: '快手',
    icon: '⚡',
    status: PlatformStatus.COMING_SOON,
    color: '#FF4906',
    features: ['video', 'audio', 'transcript'],
    urlPatterns: [
      /kuaishou\.com/i,
      /v\.kuaishou\.com/i,
      /chenzhongtech\.com/i
    ],
    placeholder: '请输入快手视频链接'
  },
  {
    id: 'weibo',
    name: '微博',
    icon: '🔴',
    status: PlatformStatus.COMING_SOON,
    color: '#E6162D',
    features: ['video', 'image'],
    urlPatterns: [
      /weibo\.com/i,
      /weibo\.cn/i,
      /t\.cn/i
    ],
    placeholder: '请输入微博链接'
  },
  {
    id: 'wechat_article',
    name: '微信公众号',
    icon: '💬',
    status: PlatformStatus.COMING_SOON,
    color: '#07C160',
    features: ['article', 'image'],
    urlPatterns: [
      /mp\.weixin\.qq\.com/i
    ],
    placeholder: '请输入微信公众号文章链接'
  },
  {
    id: 'wechat_video',
    name: '视频号',
    icon: '📱',
    status: PlatformStatus.COMING_SOON,
    color: '#07C160',
    features: ['video'],
    urlPatterns: [
      /channels\.weixin\.qq\.com/i,
      /finder\.video\.qq\.com/i
    ],
    placeholder: '请输入视频号链接'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📷',
    status: PlatformStatus.COMING_SOON,
    color: '#E4405F',
    features: ['video', 'image'],
    urlPatterns: [
      /instagram\.com/i
    ],
    placeholder: '请输入Instagram链接'
  },
  {
    id: 'netease_music',
    name: '网易云音乐',
    icon: '🎵',
    status: PlatformStatus.COMING_SOON,
    color: '#C20C0C',
    features: ['audio', 'lyrics'],
    urlPatterns: [
      /music\.163\.com/i,
      /y\.music\.163\.com/i
    ],
    placeholder: '请输入网易云音乐链接'
  },
  {
    id: 'zhihu',
    name: '知乎',
    icon: '💡',
    status: PlatformStatus.COMING_SOON,
    color: '#0084FF',
    features: ['article', 'video'],
    urlPatterns: [
      /zhihu\.com/i,
      /zhuanlan\.zhihu\.com/i
    ],
    placeholder: '请输入知乎链接'
  }
]

/**
 * 获取可用平台列表
 */
export function getAvailablePlatforms() {
  return platforms.filter(p => p.status === PlatformStatus.AVAILABLE)
}

/**
 * 获取即将支持的平台列表
 */
export function getComingSoonPlatforms() {
  return platforms.filter(p => p.status === PlatformStatus.COMING_SOON)
}

/**
 * 获取所有平台列表（用于下拉选择）
 */
export function getAllPlatforms() {
  return platforms
}

/**
 * 根据ID获取平台配置
 */
export function getPlatformById(id) {
  return platforms.find(p => p.id === id)
}

/**
 * 根据URL自动识别平台
 */
export function detectPlatformByUrl(url) {
  if (!url) return null
  
  for (const platform of platforms) {
    for (const pattern of platform.urlPatterns) {
      if (pattern.test(url)) {
        return platform
      }
    }
  }
  
  return null
}

/**
 * 检查平台是否支持某个功能
 */
export function platformSupports(platformId, feature) {
  const platform = getPlatformById(platformId)
  return platform?.features?.includes(feature) || false
}
