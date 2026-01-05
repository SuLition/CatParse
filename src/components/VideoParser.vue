<template>
  <div class="app">
    <!-- Header -->
    <AppHeader @openSettings="showSettings = true" />

    <!-- Main Content -->
    <main class="main">
      <!-- Left Panel: Input & Download -->
      <section class="panel input-panel">
        <h2 class="panel-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
          链接解析
        </h2>

        <!-- 平台选择 -->
        <div class="platform-selector">
          <label class="selector-label">选择平台</label>
          <div class="platform-options">
            <button 
              v-for="platform in availablePlatforms" 
              :key="platform.id"
              class="platform-btn"
              :class="{ active: selectedPlatform === platform.id }"
              @click="selectedPlatform = platform.id"
            >
              <span class="platform-icon">{{ platform.icon }}</span>
              <span class="platform-name">{{ platform.name }}</span>
            </button>
            <!-- 即将支持的平台 -->
            <button 
              v-for="platform in comingSoonPlatforms.slice(0, 3)" 
              :key="platform.id"
              class="platform-btn coming-soon"
              disabled
              :title="`${platform.name} 即将支持`"
            >
              <span class="platform-icon">{{ platform.icon }}</span>
              <span class="platform-name">{{ platform.name }}</span>
              <span class="coming-badge">即将</span>
            </button>
          </div>
        </div>

        <div class="input-group">
          <input
              v-model="videoUrl"
              type="text"
              class="url-input"
              :placeholder="currentPlatform?.placeholder || '请输入视频链接'"
              @keyup.enter="parseVideo"
          />
          <button class="btn btn-primary" @click="parseVideo" :disabled="loading">
            <svg v-if="loading" class="spinner" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.3"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" fill="none"/>
            </svg>
            <span v-else>解析</span>
          </button>
        </div>

        <!-- Video Preview -->
        <VideoPreview :videoInfo="videoInfo" />

        <!-- B站视频详情 -->
        <BilibiliDetail 
          v-if="videoInfo && videoInfo.platform === 'bilibili'" 
          :videoInfo="videoInfo" 
        />

        <!-- 抖音视频详情 -->
        <DouyinDetail 
          v-if="videoInfo && videoInfo.platform === 'douyin'" 
          :videoInfo="videoInfo" 
        />

        <!-- 小红书视频详情 -->
        <XiaohongshuDetail 
          v-if="videoInfo && videoInfo.platform === 'xiaohongshu'" 
          :videoInfo="videoInfo" 
        />

        <!-- Download Options -->
        <DownloadPanel 
          :videoInfo="videoInfo" 
          :downloadingType="downloadingType"
          @download="downloadVideo" 
        />
      </section>

      <!-- Center Panel: Transcript -->
      <TranscriptPanel
        :videoInfo="videoInfo"
        :transcript="transcript"
        :extracting="extracting"
        @extract="extractTranscript"
        @copy="copyTranscript"
      />

      <!-- Right Panel: Rewrite -->
      <RewritePanel
        :transcript="transcript"
        :rewriting="rewriting"
        :rewrittenText="rewrittenText"
        v-model:selectedStyle="selectedStyle"
        v-model:selectedModel="selectedModel"
        @rewrite="rewriteTranscript"
        @copy="copyRewritten"
      />
    </main>

    <!-- Toast -->
    <Transition name="toast">
      <div class="toast" v-if="toast">{{ toast }}</div>
    </Transition>
    
    <!-- 进度条 -->
    <Transition name="progress">
      <div class="progress-overlay" v-if="progressInfo.visible">
        <div class="progress-modal">
          <div class="progress-title">{{ progressInfo.title }}</div>
          <div class="progress-bar-container">
            <div class="progress-bar" :style="{ width: progressInfo.progress + '%' }"></div>
          </div>
          <div class="progress-info">
            <span class="progress-status">{{ progressInfo.status }}</span>
            <span class="progress-percent">{{ progressInfo.progress }}%</span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Settings Modal -->
    <SettingsModal 
      :visible="showSettings" 
      @close="showSettings = false"
      @saved="onSettingsSaved"
    />
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { parseVideo as parseBilibiliVideoApi } from '../services/api/bilibiliApi.js'
import { parseVideo as parseDouyinVideoApi } from '../services/api/douyinApi.js'
import { parseVideo as parseXiaohongshuVideoApi } from '../services/api/xiaohongshuApi.js'
import { recognizeAudio, recognizeAudioWithData } from '../services/tencentAsr.js'
import { rewriteText } from '../services/aiRewrite.js'
import { downloadBilibili, downloadDouyin, downloadXiaohongshu, downloadAudioData } from '../services/download/downloadService.js'
import { isLoggedIn, getSessData } from '../services/auth/bilibiliAuth.js'
import { 
  getAvailablePlatforms, 
  getComingSoonPlatforms, 
  getPlatformById,
  PlatformStatus 
} from '../config/platforms.js'

// 子组件
import AppHeader from './common/AppHeader.vue'
import VideoPreview from './VideoPreview.vue'
import BilibiliDetail from './platforms/BilibiliDetail.vue'
import DouyinDetail from './platforms/DouyinDetail.vue'
import XiaohongshuDetail from './platforms/XiaohongshuDetail.vue'
import DownloadPanel from './panels/DownloadPanel.vue'
import TranscriptPanel from './panels/TranscriptPanel.vue'
import RewritePanel from './panels/RewritePanel.vue'
import SettingsModal from './common/SettingsModal.vue'

// State
const videoUrl = ref('')
const loading = ref(false)
const extracting = ref(false)
const rewriting = ref(false)
const videoInfo = ref(null)
const transcript = ref('')
const rewrittenText = ref('')
const selectedStyle = ref('professional')
const selectedModel = ref('doubao')
const toast = ref('')
const linkInfo = ref(null)
const downloadingType = ref('')
const showSettings = ref(false)
const selectedPlatform = ref('bilibili') // 默认选择B站

// 平台配置
const availablePlatforms = getAvailablePlatforms()
const comingSoonPlatforms = getComingSoonPlatforms()

// 当前选中的平台配置
const currentPlatform = computed(() => getPlatformById(selectedPlatform.value))

// 进度状态
const progressInfo = ref({
  visible: false,
  type: '', // 'parse' | 'download' | 'extract'
  title: '',
  progress: 0, // 0-100
  status: '' // 状态文字
})

// 显示进度
const showProgress = (type, title, progress = 0, status = '') => {
  progressInfo.value = {
    visible: true,
    type,
    title,
    progress,
    status
  }
}

// 更新进度
const updateProgress = (progress, status = '') => {
  progressInfo.value.progress = progress
  if (status) progressInfo.value.status = status
}

// 隐藏进度
const hideProgress = () => {
  progressInfo.value.visible = false
}

// 平台切换时清空视频信息
watch(selectedPlatform, () => {
  videoInfo.value = null
  transcript.value = ''
  rewrittenText.value = ''
})

// Methods
const showToast = (msg) => {
  toast.value = msg
  setTimeout(() => toast.value = '', 2000)
}

// 配置保存回调
const onSettingsSaved = () => {
  showToast('配置已保存')
}

// 格式化数字
const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

// 格式化时长
const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + sizes[i]
}

// 需要清除的URL跟踪参数列表
// 注意：小红书的 xsec_token 和 xsec_source 是解析必需的，不能删除
const TRACKING_PARAMS = [
  // 通用跟踪参数
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'source', 'share', 'share_source', 'share_medium',
  // 小红书（保留 xsec_token 和 xsec_source）
  'xhsshare', 'appuid', 'apptime',
  // 抖音
  'share_token', 'share_tag', 'timestamp', 'enter_from', 'from',
  // B站
  'spm_id_from', 'from_source', 'share_source', 'share_medium', 'share_plat',
  'share_tag', 'share_session_id', 'bbid', 'ts',
  // 通用
  'ref', 'referrer', 'callback', '_t', 't'
]

// 清理URL中的跟踪参数
const cleanUrlParams = (url) => {
  try {
    const urlObj = new URL(url)
    // 删除跟踪参数
    TRACKING_PARAMS.forEach(param => {
      urlObj.searchParams.delete(param)
    })
    // 如果没有剩余参数，返回不带?的URL
    if (urlObj.searchParams.toString() === '') {
      return urlObj.origin + urlObj.pathname
    }
    return urlObj.toString()
  } catch (e) {
    // URL解析失败，返回原URL
    return url
  }
}

// 从分享口令中提取有效链接
const extractUrlFromText = (text) => {
  if (!text) return ''
  
  // 尝试提取 URL
  const urlPatterns = [
    // 抖音
    /https?:\/\/v\.douyin\.com\/[a-zA-Z0-9]+\/?/i,
    /https?:\/\/www\.douyin\.com\/video\/\d+/i,
    /https?:\/\/www\.iesdouyin\.com\/[^\s]+/i,
    // B站
    /https?:\/\/www\.bilibili\.com\/video\/[a-zA-Z0-9]+\/?[^\s]*/i,
    /https?:\/\/b23\.tv\/[a-zA-Z0-9]+\/?/i,
    // 小红书
    /https?:\/\/www\.xiaohongshu\.com\/(?:explore|discovery\/item)\/[a-zA-Z0-9]+[^\s]*/i,
    /https?:\/\/xhslink\.com\/[a-zA-Z0-9\/]+/i,
    // TikTok
    /https?:\/\/(?:www\.)?tiktok\.com\/@[^\s]+\/video\/\d+/i,
    /https?:\/\/vm\.tiktok\.com\/[a-zA-Z0-9]+\/?/i,
    // 快手
    /https?:\/\/v\.kuaishou\.com\/[a-zA-Z0-9]+\/?/i,
    /https?:\/\/www\.kuaishou\.com\/[^\s]+/i,
    // 微博
    /https?:\/\/weibo\.com\/[^\s]+/i,
    /https?:\/\/m\.weibo\.cn\/[^\s]+/i,
    // 通用 http/https 链接
    /https?:\/\/[^\s]+/i
  ]
  
  for (const pattern of urlPatterns) {
    const match = text.match(pattern)
    if (match) {
      // 清理URL末尾的无效字符
      let url = match[0]
      // 移除末尾的中文标点、空格等
      url = url.replace(/[\u3000-\u303f\uff00-\uffef\u3001\u3002]+$/, '')
      // 清理跟踪参数
      url = cleanUrlParams(url)
      return url
    }
  }
  
  // 没有找到URL，返回原始文本（去除首尾空格）
  return text.trim()
}

const parseVideo = async () => {
  if (!videoUrl.value.trim()) {
    showToast('请输入视频链接')
    return
  }

  // 从分享口令中提取有效链接
  const extractedUrl = extractUrlFromText(videoUrl.value)
  if (extractedUrl !== videoUrl.value) {
    videoUrl.value = extractedUrl
  }

  // 检查平台是否可用
  const platform = currentPlatform.value
  if (!platform || platform.status !== PlatformStatus.AVAILABLE) {
    showToast('该平台暂不支持，敬请期待')
    return
  }
  
  // 检查链接格式
  const urlValid = platform.urlPatterns.some(pattern => pattern.test(videoUrl.value))
  if (!urlValid) {
    showToast(`请输入正确的${platform.name}链接`)
    return
  }
  
  // 设置 linkInfo 用于显示
  linkInfo.value = {
    platform: platform.id,
    platformName: platform.name
  }
  
  loading.value = true
  videoInfo.value = null
  showProgress('parse', '解析中', 10, `正在解析 ${platform.name} 链接...`)

  try {
    // 根据平台调用不同的解析函数
    if (platform.id === 'bilibili') {
      await parseBilibiliVideo()
    } else if (platform.id === 'douyin') {
      await parseDouyinVideo()
    } else if (platform.id === 'xiaohongshu') {
      await parseXiaohongshuVideo()
    } else {
      throw new Error(`${platform.name} 解析功能开发中...`)
    }
    
    loading.value = false
    updateProgress(100, '解析完成')
    setTimeout(hideProgress, 500)
    showToast('解析成功！')
    
  } catch (error) {
    console.error('解析失败:', error)
    loading.value = false
    hideProgress()
    showToast(`解析失败: ${error.message}`)
  }
}

// 解析B站视频 - 使用 B 站官方 API + WBI 签名
const parseBilibiliVideo = async () => {
  updateProgress(20, '正在获取视频信息...')
  
  // 使用新的 B 站 API 解析
  const { videoInfo: data, playData } = await parseBilibiliVideoApi(videoUrl.value)
  
  updateProgress(60, '正在解析视频流...')
  
  const formatPubDate = (timestamp) => {
    if (!timestamp) return '未知'
    const date = new Date(timestamp * 1000)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }
  
  // 构建基础信息对象
  const biliInfo = {
    title: data.title || '未知标题',
    author: data.owner?.name || '未知作者',
    authorId: data.owner?.mid || '',
    authorAvatar: data.owner?.face || '',
    views: formatNumber(data.stat?.view || 0),
    likes: formatNumber(data.stat?.like || 0),
    comments: formatNumber(data.stat?.reply || 0),
    cover: data.pic || '',
    duration: formatDuration(data.duration || 0),
    platform: 'bilibili',
    bvid: data.bvid || '',
    aid: data.aid || '',
    cid: data.cid || '',
    desc: data.desc || '暂无简介',
    pubdate: formatPubDate(data.pubdate),
    danmaku: formatNumber(data.stat?.danmaku || 0),
    favorite: formatNumber(data.stat?.favorite || 0),
    coin: formatNumber(data.stat?.coin || 0),
    share: formatNumber(data.stat?.share || 0),
    dimension: data.dimension ? `${data.dimension.width}x${data.dimension.height}` : '未知',
    videos: data.videos || 1,
    ugcSeason: data.ugc_season ? {
      id: data.ugc_season.id,
      title: data.ugc_season.title,
      cover: data.ugc_season.cover,
      epCount: data.ugc_season.ep_count || 0,
      stat: {
        view: formatNumber(data.ugc_season.stat?.view || 0),
        like: formatNumber(data.ugc_season.stat?.like || 0),
        fav: formatNumber(data.ugc_season.stat?.fav || 0)
      }
    } : null,
    honors: data.honor_reply?.honor?.map(h => h.desc) || [],
    videoStreams: [],
    audioStream: null,
    isLoggedIn: isLoggedIn(),
    rawData: data
  }
  
  // 解析视频流信息
  const qualityMap = {
    127: { name: '8K 超高清', short: '8K' },
    126: { name: '杰出 HDR', short: 'HDR' },
    125: { name: 'HDR 真彩色', short: 'HDR' },
    120: { name: '4K 超清', short: '4K' },
    116: { name: '1080P 60帧', short: '1080P60' },
    112: { name: '1080P 高码率', short: '1080P+' },
    80: { name: '1080P 高清', short: '1080P' },
    74: { name: '720P 60帧', short: '720P60' },
    64: { name: '720P 高清', short: '720P' },
    32: { name: '480P 清晰', short: '480P' },
    16: { name: '360P 流畅', short: '360P' }
  }
  
  if (playData?.dash) {
    const videos = playData.dash.video || []
    const audios = playData.dash.audio || []
    const duration = playData.timelength || (data.duration * 1000) || 0
    
    // 按画质分组，每个画质取最高码率
    const qualityGroups = {}
    videos.forEach(v => {
      const qid = v.id
      if (!qualityGroups[qid] || v.bandwidth > qualityGroups[qid].bandwidth) {
        qualityGroups[qid] = v
      }
    })
    
    const streams = Object.entries(qualityGroups)
      .map(([qid, v]) => {
        const q = qualityMap[qid] || { name: `画质${qid}`, short: qid }
        const estimatedSize = (v.bandwidth / 8) * (duration / 1000)
        return {
          id: parseInt(qid),
          name: q.name,
          short: q.short,
          url: v.baseUrl || v.base_url,
          backupUrl: v.backupUrl || v.backup_url,
          bandwidth: v.bandwidth,
          width: v.width,
          height: v.height,
          codecs: v.codecs,
          size: formatFileSize(estimatedSize)
        }
      })
      .sort((a, b) => b.id - a.id)
    
    biliInfo.videoStreams = streams
    
    // 音频流
    if (audios.length > 0) {
      const bestAudio = audios.reduce((a, b) => 
        (a.bandwidth || 0) > (b.bandwidth || 0) ? a : b
      )
      const audioSize = (bestAudio.bandwidth / 8) * (duration / 1000)
      biliInfo.audioStream = {
        url: bestAudio.baseUrl || bestAudio.base_url,
        backupUrl: bestAudio.backupUrl || bestAudio.backup_url,
        bandwidth: bestAudio.bandwidth,
        size: formatFileSize(audioSize)
      }
    }
  }
  
  // 视频流解析完成后，一次性设置 videoInfo
  videoInfo.value = biliInfo
  updateProgress(90, '解析完成')
}

// 解析抖音视频
const parseDouyinVideo = async () => {
  updateProgress(20, '正在获取视频信息...')
  
  // 调用抖音解析服务
  const data = await parseDouyinVideoApi(videoUrl.value)
  
  updateProgress(80, '正在处理视频数据...')
  
  // 设置视频信息
  videoInfo.value = data
  updateProgress(90, '解析完成')
}

// 解析小红书视频
const parseXiaohongshuVideo = async () => {
  updateProgress(20, '正在获取笔记信息...')
  
  // 调用小红书解析服务
  const data = await parseXiaohongshuVideoApi(videoUrl.value)
  
  updateProgress(80, '正在处理笔记数据...')
  
  // 设置视频信息
  videoInfo.value = data
  updateProgress(90, '解析完成')
}

// 下载视频
const downloadVideo = async (quality) => {
  if (!videoInfo.value) {
    showToast('请先解析视频')
    return
  }
  
  downloadingType.value = quality
  showProgress('download', '下载中', 0, '正在连接...')
  
  try {
    if (videoInfo.value.platform === 'bilibili') {
      let downloadUrl = ''
      let backupUrls = []
      let fileName = (videoInfo.value.title || 'video').replace(/[\\/:*?"<>|]/g, '_')
      
      if (typeof quality === 'object') {
        if (quality.type === 'bilibili-video' && quality.stream) {
          downloadUrl = quality.stream.url
          // 获取备用链接
          backupUrls = quality.stream.backupUrl || []
          downloadingType.value = `bilibili-${quality.stream.id}`
          fileName += `_${quality.stream.short}.mp4`
        }
      }
      
      if (downloadUrl) {
        await downloadBilibili(downloadUrl, fileName, (progress, status) => {
          updateProgress(progress, status)
        }, { backupUrls })
        setTimeout(hideProgress, 500)
        showToast('下载完成')
      } else {
        hideProgress()
        showToast('未获取到下载链接')
      }
    } else if (videoInfo.value.platform === 'douyin') {
      // 抖音视频下载
      let downloadUrl = ''
      let backupUrls = []
      let fileName = (videoInfo.value.title || 'video').replace(/[\\/:*?"<>|]/g, '_')
      
      if (typeof quality === 'object') {
        if (quality.type === 'douyin-video' && quality.stream) {
          downloadUrl = quality.stream.url
          backupUrls = quality.stream.backupUrls || []
          downloadingType.value = `douyin-${quality.stream.id}`
          fileName += `_${quality.stream.short}.mp4`
        }
      }
      
      if (downloadUrl) {
        await downloadDouyin(downloadUrl, fileName, (progress, status) => {
          updateProgress(progress, status)
        }, { backupUrls })
        setTimeout(hideProgress, 500)
        showToast('下载完成')
      } else {
        hideProgress()
        showToast('未获取到下载链接')
      }
    } else if (videoInfo.value.platform === 'xiaohongshu') {
      // 小红书视频下载
      let downloadUrl = ''
      let backupUrls = []
      let fileName = (videoInfo.value.title || 'video').replace(/[\\/:*?"<>|]/g, '_')
      
      if (typeof quality === 'object') {
        if (quality.type === 'xiaohongshu-video' && quality.stream) {
          downloadUrl = quality.stream.url
          backupUrls = quality.stream.backupUrls || []
          downloadingType.value = `xiaohongshu-${quality.stream.id}`
          fileName += `_${quality.stream.short}.mp4`
        }
      }
      
      if (downloadUrl) {
        await downloadXiaohongshu(downloadUrl, fileName, (progress, status) => {
          updateProgress(progress, status)
        }, { backupUrls })
        setTimeout(hideProgress, 500)
        showToast('下载完成')
      } else {
        hideProgress()
        showToast('未获取到下载链接')
      }
    } else {
      hideProgress()
      showToast('该平台视频下载服务开发中')
    }
  } catch (error) {
    console.error('下载失败:', error)
    hideProgress()
    showToast('下载失败，请重试')
  } finally {
    downloadingType.value = ''
  }
}

const extractTranscript = async () => {
  if (!videoInfo.value) {
    showToast('请先解析视频')
    return
  }
  
  extracting.value = true
  transcript.value = ''
  showProgress('extract', '文案提取', 0, '正在准备...')
  
  try {
    let result = ''
    
    if (videoInfo.value.platform === 'bilibili') {
      // B站 - 需要先下载音频转Base64
      const audioStream = videoInfo.value.audioStream
      
      // 优先使用备用URL（避免PCDN节点签名问题）
      let audioUrl = audioStream?.url
      const backupUrls = audioStream?.backupUrl || []
      
      // 检查主 URL 是否是 PCDN 节点
      const isPcdn = audioUrl && (audioUrl.includes('mcdn.bilivideo') || audioUrl.includes('.szbdyd.com'))
      if (isPcdn && backupUrls.length > 0) {
        // 使用备用URL
        audioUrl = backupUrls[0]
        console.log('[extractTranscript] 主URL是PCDN节点，切换到备用URL:', audioUrl)
      }
      
      console.log('[extractTranscript] B站音频URL:', audioUrl)
      console.log('[extractTranscript] audioStream:', audioStream)
      if (!audioUrl) {
        throw new Error('未获取到B站音频链接')
      }
      
      updateProgress(5, '正在下载音频...')
      
      // 使用下载服务获取音频数据
      const audioData = await downloadAudioData(audioUrl, 'bilibili', (progress, status) => {
        const scaledProgress = 5 + Math.round(progress * 0.3)
        updateProgress(scaledProgress, status)
      })
      
      // 腾讯云ASR Base64方式限制5MB
      const MAX_SIZE = 5 * 1024 * 1024
      const finalData = audioData.length > MAX_SIZE 
        ? audioData.slice(0, MAX_SIZE) 
        : audioData
      
      if (audioData.length > MAX_SIZE) {
        updateProgress(35, `音频过大，将识别前 ${(MAX_SIZE / 1024 / 1024).toFixed(1)}MB`)
      }
      
      updateProgress(40, '正在转换音频格式...')
      
      // 转换为Base64 - 使用分块处理避免内存溢出
      const chunkSize = 32768
      let binary = ''
      for (let i = 0; i < finalData.length; i += chunkSize) {
        const chunk = finalData.subarray(i, Math.min(i + chunkSize, finalData.length))
        binary += String.fromCharCode.apply(null, chunk)
      }
      const base64Data = btoa(binary)
      
      updateProgress(45, '正在创建识别任务...')
      
      // 调用Base64识别接口
      result = await recognizeAudioWithData(base64Data, (status, message) => {
        if (status === 'creating') {
          updateProgress(50, message)
        } else if (status === 'processing') {
          const match = message.match(/(\d+)%/)
          const pct = match ? parseInt(match[1]) : 50
          updateProgress(55 + Math.round(pct * 0.45), message)
        } else if (status === 'done') {
          updateProgress(100, message)
        }
      })
    } else if (videoInfo.value.platform === 'douyin') {
      // 抖音 - 使用音频流进行语音识别
      const audioStream = videoInfo.value.audioStream
      
      // 获取音频 URL
      let audioUrl = audioStream?.url
      const isVideoAudio = audioStream?.isVideoAudio || false
      
      console.log('[extractTranscript] 抖音音频URL:', audioUrl)
      console.log('[extractTranscript] isVideoAudio:', isVideoAudio)
      
      if (!audioUrl) {
        throw new Error('未获取到抖音音频链接')
      }
      
      let base64Data = ''
      let audioSize = 0
      
      // 如果是从视频提取的音频，使用 FFmpeg 提取纯音频
      if (isVideoAudio) {
        updateProgress(5, '正在从视频提取音频...')
        
        // 调用后端音频提取接口
        const extractResponse = await fetch('http://127.0.0.1:3721/extract-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ video_url: audioUrl, platform: 'douyin' })
        })
        
        const extractResult = await extractResponse.json()
        
        if (!extractResult.success) {
          throw new Error(extractResult.message || '音频提取失败')
        }
        
        base64Data = extractResult.audio_base64
        audioSize = extractResult.audio_size || 0
        
        console.log(`[extractTranscript] 音频提取成功: ${(audioSize / 1024).toFixed(1)}KB`)
        updateProgress(35, `音频大小: ${(audioSize / 1024).toFixed(1)}KB`)
      } else {
        // 有独立音频源，直接下载
        updateProgress(5, '正在下载抖音音频...')
        
        const audioData = await downloadAudioData(audioUrl, 'douyin', (progress, status) => {
          const scaledProgress = 5 + Math.round(progress * 0.3)
          updateProgress(scaledProgress, status)
        })
        
        // 腾讯云ASR Base64方式限制5MB
        const MAX_SIZE = 5 * 1024 * 1024
        const finalData = audioData.length > MAX_SIZE 
          ? audioData.slice(0, MAX_SIZE) 
          : audioData
        
        audioSize = finalData.length
        
        if (audioData.length > MAX_SIZE) {
          updateProgress(35, `音频过大，将识别前 ${(MAX_SIZE / 1024 / 1024).toFixed(1)}MB`)
        }
        
        updateProgress(40, '正在转换音频格式...')
        
        // 转换为Base64
        const chunkSize = 32768
        let binary = ''
        for (let i = 0; i < finalData.length; i += chunkSize) {
          const chunk = finalData.subarray(i, Math.min(i + chunkSize, finalData.length))
          binary += String.fromCharCode.apply(null, chunk)
        }
        base64Data = btoa(binary)
      }
      
      updateProgress(45, '正在创建识别任务...')
      
      // 调用Base64识别接口
      result = await recognizeAudioWithData(base64Data, (status, message) => {
        if (status === 'creating') {
          updateProgress(50, message)
        } else if (status === 'processing') {
          const match = message.match(/(\d+)%/)
          const pct = match ? parseInt(match[1]) : 50
          updateProgress(50 + Math.round(pct * 0.45), message)
        } else if (status === 'done') {
          updateProgress(100, message)
        }
      })
    } else if (videoInfo.value.platform === 'xiaohongshu') {
      // 小红书 - 检查是否是视频笔记
      if (!videoInfo.value.isVideo) {
        throw new Error('图文笔记不支持文案提取，请尝试视频笔记')
      }
      
      const audioStream = videoInfo.value.audioStream
      
      // 获取视频 URL
      let videoUrl = audioStream?.url || videoInfo.value.videoUrl
      
      console.log('[extractTranscript] 小红书视频URL:', videoUrl)
      
      if (!videoUrl) {
        throw new Error('未获取到小红书视频链接')
      }
      
      updateProgress(5, '正在提取音频...')
      
      // 调用后端音频提取接口（使用 FFmpeg 从视频中提取纯音频）
      const extractResponse = await fetch('http://127.0.0.1:3721/extract-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_url: videoUrl, platform: 'xiaohongshu' })
      })
      
      const extractResult = await extractResponse.json()
      
      if (!extractResult.success) {
        throw new Error(extractResult.message || '音频提取失败')
      }
      
      const base64Data = extractResult.audio_base64
      const audioSize = extractResult.audio_size || 0
      
      console.log(`[extractTranscript] 音频提取成功: ${(audioSize / 1024).toFixed(1)}KB`)
      
      // 检查音频大小是否超过 5MB 限制
      const MAX_SIZE = 5 * 1024 * 1024
      if (audioSize > MAX_SIZE) {
        updateProgress(35, `音频过大 (${(audioSize / 1024 / 1024).toFixed(1)}MB)，可能无法完整识别`)
      } else {
        updateProgress(35, `音频大小: ${(audioSize / 1024).toFixed(1)}KB`)
      }
      
      updateProgress(45, '正在创建识别任务...')
      
      // 调用 Base64 识别接口
      result = await recognizeAudioWithData(base64Data, (status, message) => {
        if (status === 'creating') {
          updateProgress(50, message)
        } else if (status === 'processing') {
          const match = message.match(/(\d+)%/)
          const pct = match ? parseInt(match[1]) : 50
          updateProgress(50 + Math.round(pct * 0.45), message)
        } else if (status === 'done') {
          updateProgress(100, message)
        }
      })
    } else {
      throw new Error('该平台文案提取服务开发中')
    }
    
    transcript.value = result || '未识别到语音内容'
    showToast('文案提取完成')
  } catch (error) {
    console.error('语音识别失败:', error)
    showToast(`识别失败: ${error.message}`)
  } finally {
    extracting.value = false
    hideProgress()
  }
}

const copyTranscript = () => {
  navigator.clipboard?.writeText(transcript.value)
  showToast('已复制到剪贴板')
}

const rewriteTranscript = async () => {
  if (!transcript.value.trim()) {
    showToast('请先提取文案')
    return
  }
  
  rewriting.value = true
  rewrittenText.value = ''
  
  try {
    const result = await rewriteText(transcript.value, selectedStyle.value, selectedModel.value)
    rewrittenText.value = result
    showToast('改写完成')
  } catch (error) {
    console.error('改写失败:', error)
    showToast(error.message || '改写失败，请重试')
  } finally {
    rewriting.value = false
  }
}

const copyRewritten = () => {
  navigator.clipboard?.writeText(rewrittenText.value)
  showToast('已复制到剪贴板')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
  font-family: 'Noto Sans SC', -apple-system, sans-serif;
  color: #e8e8e8;
  overflow: hidden;
}

.main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  overflow: hidden;
  min-height: 0;
}

.panel {
  background: rgba(255,255,255,0.04);
  border-radius: 12px;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255,255,255,0.06);
  overflow: hidden;
  min-height: 0;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.7rem;
  color: #fff;
  flex-shrink: 0;
}

.panel-title svg {
  width: 18px;
  height: 18px;
  color: #667eea;
}

/* 平台选择器 */
.platform-selector {
  margin-bottom: 0.8rem;
}

.selector-label {
  display: block;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.6);
  margin-bottom: 0.5rem;
}

.platform-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.platform-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.7rem;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  color: rgba(255,255,255,0.7);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.platform-btn:hover:not(:disabled) {
  background: rgba(255,255,255,0.1);
  border-color: rgba(255,255,255,0.2);
}

.platform-btn.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
  border-color: #667eea;
  color: #fff;
}

.platform-btn.coming-soon {
  opacity: 0.5;
  cursor: not-allowed;
}

.platform-icon {
  font-size: 0.9rem;
}

.platform-name {
  font-weight: 500;
}

.coming-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
  font-size: 0.55rem;
  padding: 0.1rem 0.25rem;
  border-radius: 3px;
  font-weight: 600;
}

.input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.7rem;
}

.url-input {
  flex: 1;
  padding: 0.6rem 0.85rem;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.url-input:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.url-input::placeholder {
  color: rgba(255,255,255,0.4);
}

.btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  min-width: 80px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input-panel {
  overflow-y: auto;
}

/* Spinner */
.spinner {
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Toast */
.toast {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.6rem 1.2rem;
  background: rgba(102, 126, 234, 0.95);
  color: white;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  z-index: 1000;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.15);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.25);
}

/* Progress Overlay */
.progress-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.progress-modal {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 1.5rem 2rem;
  min-width: 320px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
}

.progress-title {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 1rem;
  text-align: center;
}

.progress-bar-container {
  height: 8px;
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-status {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.6);
}

.progress-percent {
  font-size: 0.85rem;
  font-weight: 600;
  color: #667eea;
}

.progress-enter-active,
.progress-leave-active {
  transition: all 0.3s ease;
}

.progress-enter-from,
.progress-leave-to {
  opacity: 0;
}

.progress-enter-from .progress-modal,
.progress-leave-to .progress-modal {
  transform: scale(0.9);
}
</style>
