/**
 * URL 解析工具函数
 */

// 需要清除的URL跟踪参数
const TRACKING_PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'source', 'share', 'share_source', 'share_medium',
  'xhsshare', 'appuid', 'apptime',
  'share_token', 'share_tag', 'timestamp', 'enter_from', 'from',
  'spm_id_from', 'from_source', 'share_plat', 'share_tag', 'share_session_id', 'bbid', 'ts',
  'ref', 'referrer', 'callback', '_t', 't'
];

// 清理URL中的跟踪参数
export const cleanUrlParams = (url) => {
  try {
    const urlObj = new URL(url);
    TRACKING_PARAMS.forEach(param => {
      urlObj.searchParams.delete(param);
    });
    if (urlObj.searchParams.toString() === '') {
      return urlObj.origin + urlObj.pathname;
    }
    return urlObj.toString();
  } catch (e) {
    return url;
  }
};

// 从分享口令中提取有效链接
export const extractUrlFromText = (text) => {
  if (!text) return '';
  
  const urlPatterns = [
    /https?:\/\/v\.douyin\.com\/[a-zA-Z0-9]+\/?/i,
    /https?:\/\/www\.douyin\.com\/video\/\d+/i,
    /https?:\/\/www\.bilibili\.com\/video\/[a-zA-Z0-9]+\/?[^\s]*/i,
    /https?:\/\/b23\.tv\/[a-zA-Z0-9]+\/?/i,
    /https?:\/\/www\.xiaohongshu\.com\/(?:explore|discovery\/item)\/[a-zA-Z0-9]+[^\s]*/i,
    /https?:\/\/xhslink\.com\/[a-zA-Z0-9\/]+/i,
    /https?:\/\/[^\s]+/i
  ];
  
  for (const pattern of urlPatterns) {
    const match = text.match(pattern);
    if (match) {
      let url = match[0];
      url = url.replace(/[\u3000-\u303f\uff00-\uffef\u3001\u3002]+$/, '');
      url = cleanUrlParams(url);
      return url;
    }
  }
  
  return text.trim();
};
