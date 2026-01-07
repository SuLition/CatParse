/**
 * 视频数据格式化工具
 * 将各平台的原始数据转换为统一格式
 */
import { formatNumber, formatPubDate } from '@/utils/format.js';

/**
 * 格式化B站视频数据
 */
export function formatBilibiliData(data) {
  return {
    ...data,
    platform: 'bilibili',
    author: {
      name: data.author || '未知作者',
      avatar: data.authorAvatar || '',
      id: data.authorId || ''
    },
    views: data.views || '0',
    likes: data.likes || '0',
    comments: data.comments || '0',
    danmaku: data.danmaku || '0',
    coin: data.coin || '0',
    favorite: data.favorite || '0',
    share: data.shares || '0',
    desc: data.desc || '暂无简介',
    pubdate: data.createTime || formatPubDate(data.pubdate),
    durationRaw: data.durationRaw || 0,
    dimensionStr: data.dimension ? `${data.dimension.width}x${data.dimension.height}` : ''
  };
}

/**
 * 格式化抖音视频数据
 */
export function formatDouyinData(data) {
  return {
    ...data,
    platform: 'douyin',
    author: {
      name: data.author || '未知作者',
      avatar: data.authorAvatar || '',
      id: data.authorId || '',
      signature: data.authorSignature || ''
    },
    views: formatNumber(data.views || 0),
    likes: formatNumber(data.likes || 0),
    comments: formatNumber(data.comments || 0),
    shares: formatNumber(data.shares || 0),
    collects: formatNumber(data.collects || 0),
    desc: data.title || '',
    durationRaw: data.durationRaw || data.duration || 0,
    pubdate: data.createTime || '',
    dimensionStr: data.dimension || ''
  };
}

/**
 * 格式化小红书视频数据
 */
export function formatXiaohongshuData(data) {
  return {
    ...data,
    platform: 'xiaohongshu',
    author: {
      name: data.author || '未知作者',
      avatar: data.authorAvatar || '',
      id: data.authorId || ''
    },
    desc: data.desc || data.title || '',
    durationRaw: parseInt(data.duration, 10) || 0,
    pubdate: data.createTime || '',
    dimensionStr: data.dimension || '',
    comments: data.comments || '0'
  };
}

/**
 * 格式化视频流选项
 */
export function formatQualityOptions(videoStreams, platform) {
  if (!videoStreams || videoStreams.length === 0) {
    return [];
  }
  
  return videoStreams.map(s => ({
    label: `${s.short || s.name} (${s.size || '未知'})`,
    value: s.id,
    stream: s
  }));
}
