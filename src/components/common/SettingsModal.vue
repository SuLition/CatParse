<template>
  <Teleport to="body">
    <Transition name="modal">
      <div class="modal-overlay" v-if="visible" @click.self="$emit('close')">
        <div class="modal">
          <div class="modal-header">
            <h2>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              API 配置
            </h2>
            <button class="close-btn" @click="$emit('close')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <!-- 下载设置 -->
            <div class="config-section download-section">
              <div class="section-header">
                <span class="section-title">📂 下载设置</span>
                <span class="section-desc">视频保存位置</span>
              </div>
              <div class="download-path-area">
                <div class="form-group path-input-group">
                  <label>下载目录</label>
                  <div class="path-input-row">
                    <input 
                      type="text" 
                      v-model="form.download.savePath" 
                      :placeholder="defaultDownloadPath || '系统默认下载目录'"
                      readonly
                      class="path-input"
                    />
                    <button class="btn btn-small btn-secondary" @click="selectDownloadPath">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                      </svg>
                      选择
                    </button>
                    <button 
                      v-if="form.download.savePath" 
                      class="btn btn-small btn-secondary" 
                      @click="resetDownloadPath"
                      title="恢复默认"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                        <path d="M3 3v5h5"/>
                      </svg>
                    </button>
                  </div>
                  <div class="path-hint" v-if="!form.download.savePath">
                    当前使用系统默认下载目录
                  </div>
                </div>
              </div>
            </div>

            <!-- B站登录 -->
            <div class="config-section bilibili-section">
              <div class="section-header">
                <span class="section-title">🎙️ 哔哩哔哩登录</span>
                <span class="section-desc">登录后可下载高清视频</span>
                <span class="status-dot" :class="{ active: bilibiliLoginState.isLoggedIn }"></span>
              </div>
              
              <div class="bilibili-login-area">
                <!-- 已登录状态 -->
                <div v-if="bilibiliLoginState.isLoggedIn" class="login-success">
                  <div class="user-info" v-if="bilibiliLoginState.userInfo">
                    <img :src="bilibiliLoginState.userInfo.face" class="user-avatar" alt="avatar" />
                    <div class="user-detail">
                      <div class="user-name">{{ bilibiliLoginState.userInfo.uname }}</div>
                      <div class="user-meta">
                        <span class="user-level">LV{{ bilibiliLoginState.userInfo.level }}</span>
                        <span v-if="bilibiliLoginState.userInfo.vipStatus" class="user-vip">大会员</span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="login-status-text">✅ 已登录</div>
                  <button class="btn btn-small btn-danger" @click="logoutBilibili">退出登录</button>
                </div>
                
                <!-- 未登录状态 -->
                <div v-else class="login-pending">
                  <!-- 二维码区域 -->
                  <div v-if="bilibiliLoginState.qrcode" class="qrcode-area">
                    <img :src="bilibiliLoginState.qrcode" class="qrcode-img" alt="登录二维码" />
                    <div class="qrcode-status" :class="bilibiliLoginState.status">
                      {{ bilibiliLoginState.statusText }}
                    </div>
                    <button v-if="bilibiliLoginState.status === 'expired'" 
                            class="btn btn-small btn-secondary" 
                            @click="refreshQRCode">
                      刷新二维码
                    </button>
                  </div>
                  
                  <!-- 未开始登录 -->
                  <div v-else class="login-start">
                    <div class="login-hint">登录后可解锁 1080P/4K 等高清画质</div>
                    <button class="btn btn-bilibili" @click="startBilibiliLogin" :disabled="bilibiliLoginState.status === 'loading'">
                      <svg v-if="bilibiliLoginState.status === 'loading'" class="spinner" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.3"/>
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" fill="none"/>
                      </svg>
                      <span v-else>扫码登录</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 腾讯云ASR -->
            <div class="config-section">
              <div class="section-header">
                <span class="section-title">腾讯云 ASR</span>
                <span class="section-desc">语音识别服务</span>
                <span class="status-dot" :class="{ active: configStatus.tencentAsr }"></span>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>SecretId</label>
                  <input 
                    type="text"
                    v-model="form.tencentAsr.secretId" 
                    placeholder="SecretId"
                  />
                </div>
                <div class="form-group">
                  <label>SecretKey</label>
                  <input 
                    type="text"
                    v-model="form.tencentAsr.secretKey" 
                    placeholder="SecretKey"
                  />
                </div>
              </div>
            </div>

            <!-- 豆包 -->
            <div class="config-section">
              <div class="section-header">
                <span class="section-title">豆包</span>
                <span class="section-desc">AI文案改写</span>
                <span class="status-dot" :class="{ active: configStatus.doubao }"></span>
              </div>
              <div class="form-row">
                <div class="form-group flex-2">
                  <label>API Key</label>
                  <input 
                    type="text"
                    v-model="form.doubao.apiKey" 
                    placeholder="API Key"
                  />
                </div>
                <div class="form-group flex-1">
                  <label>模型</label>
                  <input 
                    type="text" 
                    v-model="form.doubao.model" 
                    placeholder="模型ID"
                  />
                </div>
              </div>
            </div>

            <!-- DeepSeek -->
            <div class="config-section">
              <div class="section-header">
                <span class="section-title">DeepSeek</span>
                <span class="section-desc">AI文案改写</span>
                <span class="status-dot" :class="{ active: configStatus.deepseek }"></span>
              </div>
              <div class="form-row">
                <div class="form-group flex-2">
                  <label>API Key</label>
                  <input 
                    type="text"
                    v-model="form.deepseek.apiKey" 
                    placeholder="API Key"
                  />
                </div>
                <div class="form-group flex-1">
                  <label>模型</label>
                  <input 
                    type="text" 
                    v-model="form.deepseek.model" 
                    placeholder="模型ID"
                  />
                </div>
              </div>
            </div>

            <!-- 千问 -->
            <div class="config-section">
              <div class="section-header">
                <span class="section-title">通义千问</span>
                <span class="section-desc">AI文案改写</span>
                <span class="status-dot" :class="{ active: configStatus.qianwen }"></span>
              </div>
              <div class="form-row">
                <div class="form-group flex-2">
                  <label>API Key</label>
                  <input 
                    type="text"
                    v-model="form.qianwen.apiKey" 
                    placeholder="API Key"
                  />
                </div>
                <div class="form-group flex-1">
                  <label>模型</label>
                  <input 
                    type="text" 
                    v-model="form.qianwen.model" 
                    placeholder="模型ID"
                  />
                </div>
              </div>
            </div>

            <!-- 腾讯混元 -->
            <div class="config-section">
              <div class="section-header">
                <span class="section-title">腾讯元宝</span>
                <span class="section-desc">AI文案改写</span>
                <span class="status-dot" :class="{ active: configStatus.hunyuan }"></span>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>SecretId</label>
                  <input 
                    type="text"
                    v-model="form.hunyuan.secretId" 
                    placeholder="SecretId"
                  />
                </div>
                <div class="form-group">
                  <label>SecretKey</label>
                  <input 
                    type="text"
                    v-model="form.hunyuan.secretKey" 
                    placeholder="SecretKey"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="resetForm">重置</button>
            <button class="btn btn-primary" @click="saveForm">保存配置</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch, computed, onUnmounted } from 'vue'
import { loadConfig, saveConfig, checkConfig, resetConfig } from '../../services/config.js'
import { selectDownloadDir, getSystemDownloadDir } from '../../services/download/tauriDownload.js'
import { 
  generateQRCode, 
  pollQRCodeStatus, 
  getUserInfo,
  saveBilibiliAuth, 
  loadBilibiliAuth, 
  clearBilibiliAuth,
  isLoggedIn 
} from '../../services/auth/bilibiliAuth.js'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'saved'])

// 表单数据
const form = reactive({
  download: { savePath: '' },
  tencentAsr: { secretId: '', secretKey: '' },
  doubao: { apiKey: '', model: 'doubao-seed-1-6-251015' },
  deepseek: { apiKey: '', model: 'deepseek-chat' },
  qianwen: { apiKey: '', model: 'qwen-turbo' },
  hunyuan: { secretId: '', secretKey: '' }
})

// 系统默认下载路径
const defaultDownloadPath = ref('')

// 配置状态
const configStatus = ref({
  tencentAsr: false,
  doubao: false,
  deepseek: false,
  qianwen: false,
  hunyuan: false
})

// B站登录状态
const bilibiliLoginState = reactive({
  isLoggedIn: false,
  qrcode: null,        // 二维码图片URL
  qrcodeKey: null,     // 二维码key
  status: 'idle',      // idle | loading | scanning | confirming | success | expired | error
  statusText: '',
  userInfo: null,      // 登录后的用户信息
  pollTimer: null      // 轮询定时器
})

// 加载配置
const loadForm = async () => {
  const config = loadConfig()
  Object.keys(form).forEach(key => {
    if (config[key]) {
      Object.assign(form[key], config[key])
    }
  })
  configStatus.value = checkConfig()
  
  // 加载系统默认下载路径
  try {
    defaultDownloadPath.value = await getSystemDownloadDir() || ''
  } catch (e) {
    console.warn('获取默认下载路径失败:', e)
  }
  
  // 加载B站登录状态
  await loadBilibiliLoginState()
}

// 选择下载目录
const selectDownloadPath = async () => {
  try {
    const selected = await selectDownloadDir()
    if (selected) {
      form.download.savePath = selected
    }
  } catch (e) {
    console.error('选择目录失败:', e)
  }
}

// 重置下载路径为默认
const resetDownloadPath = () => {
  form.download.savePath = ''
}

// 加载B站登录状态
const loadBilibiliLoginState = async () => {
  const auth = loadBilibiliAuth()
  if (auth && auth.cookies?.SESSDATA) {
    bilibiliLoginState.isLoggedIn = true
    bilibiliLoginState.status = 'success'
    bilibiliLoginState.statusText = '已登录'
    // 尝试获取用户信息
    try {
      const userInfo = await getUserInfo()
      if (userInfo) {
        bilibiliLoginState.userInfo = userInfo
      }
    } catch (e) {
      console.warn('获取B站用户信息失败:', e)
    }
  } else {
    bilibiliLoginState.isLoggedIn = false
    bilibiliLoginState.status = 'idle'
    bilibiliLoginState.statusText = ''
    bilibiliLoginState.userInfo = null
  }
}

// 开始B站登录
const startBilibiliLogin = async () => {
  try {
    bilibiliLoginState.status = 'loading'
    bilibiliLoginState.statusText = '正在获取二维码...'
    
    const { url, qrcode_key } = await generateQRCode()
    bilibiliLoginState.qrcode = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}`
    bilibiliLoginState.qrcodeKey = qrcode_key
    bilibiliLoginState.status = 'scanning'
    bilibiliLoginState.statusText = '请使用哔哩哔哩APP扫码'
    
    // 开始轮询登录状态
    startPolling()
  } catch (error) {
    console.error('获取二维码失败:', error)
    bilibiliLoginState.status = 'error'
    bilibiliLoginState.statusText = '获取二维码失败'
  }
}

// 开始轮询登录状态
const startPolling = () => {
  stopPolling()
  
  bilibiliLoginState.pollTimer = setInterval(async () => {
    try {
      const result = await pollQRCodeStatus(bilibiliLoginState.qrcodeKey)
      
      switch (result.code) {
        case 0: // 登录成功
          stopPolling()
          bilibiliLoginState.status = 'success'
          bilibiliLoginState.statusText = '登录成功'
          bilibiliLoginState.isLoggedIn = true
          bilibiliLoginState.qrcode = null
          // 保存登录信息
          saveBilibiliAuth({ cookies: result.cookies })
          // 获取用户信息
          try {
            const userInfo = await getUserInfo()
            bilibiliLoginState.userInfo = userInfo
          } catch (e) {
            console.warn('获取用户信息失败:', e)
          }
          break
        case 86090: // 已扫码待确认
          bilibiliLoginState.status = 'confirming'
          bilibiliLoginState.statusText = '已扫码，请在手机上确认'
          break
        case 86038: // 二维码已失效
          stopPolling()
          bilibiliLoginState.status = 'expired'
          bilibiliLoginState.statusText = '二维码已过期，请刷新'
          break
        case 86101: // 未扫码
          // 保持当前状态
          break
        default:
          break
      }
    } catch (error) {
      console.error('轮询登录状态失败:', error)
    }
  }, 2000)
}

// 停止轮询
const stopPolling = () => {
  if (bilibiliLoginState.pollTimer) {
    clearInterval(bilibiliLoginState.pollTimer)
    bilibiliLoginState.pollTimer = null
  }
}

// 退出b站登录
const logoutBilibili = () => {
  clearBilibiliAuth()
  bilibiliLoginState.isLoggedIn = false
  bilibiliLoginState.status = 'idle'
  bilibiliLoginState.statusText = ''
  bilibiliLoginState.userInfo = null
  bilibiliLoginState.qrcode = null
}

// 刷新二维码
const refreshQRCode = () => {
  startBilibiliLogin()
}

// 组件卸载时清理定时器
onUnmounted(() => {
  stopPolling()
})

// 保存配置
const saveForm = () => {
  const success = saveConfig({ ...form })
  if (success) {
    configStatus.value = checkConfig()
    emit('saved')
    emit('close')
  }
}

// 重置配置
const resetForm = () => {
  const config = resetConfig()
  Object.keys(form).forEach(key => {
    if (config[key]) {
      Object.assign(form[key], config[key])
    }
  })
  configStatus.value = checkConfig()
}

// 监听显示状态，加载配置
watch(() => props.visible, (val) => {
  if (val) {
    loadForm()
  } else {
    // 关闭弹窗时停止轮询
    stopPolling()
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  width: 90%;
  max-width: 600px;
  max-height: 85vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.1);
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.modal-header h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
}

.modal-header h2 svg {
  width: 22px;
  height: 22px;
  color: #667eea;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.05);
  border: none;
  border-radius: 8px;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255,255,255,0.1);
  color: #fff;
}

.close-btn svg {
  width: 18px;
  height: 18px;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.25rem;
}

.config-section {
  margin-bottom: 1.25rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.config-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
}

.section-desc {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.4);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  margin-left: auto;
}

.status-dot.active {
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
}

.form-row {
  display: flex;
  gap: 0.75rem;
}

.form-group {
  flex: 1;
  margin-bottom: 0.5rem;
}

.form-group.flex-2 {
  flex: 2;
}

.form-group.flex-1 {
  flex: 1;
}

.form-group label {
  display: block;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.5);
  margin-bottom: 0.35rem;
}

.form-group input {
  width: 100%;
  padding: 0.6rem 0.75rem;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.form-group input::placeholder {
  color: rgba(255,255,255,0.3);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.btn {
  padding: 0.6rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.8);
}

.btn-secondary:hover {
  background: rgba(255,255,255,0.12);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-small {
  padding: 0.4rem 0.8rem;
  font-size: 0.75rem;
}

.btn-danger {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.btn-danger:hover {
  background: rgba(239, 68, 68, 0.3);
}

.btn-bilibili {
  background: linear-gradient(135deg, #fb7299 0%, #f45a8d 100%);
  color: white;
  padding: 0.6rem 1.5rem;
}

.btn-bilibili:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(251, 114, 153, 0.4);
}

.btn-bilibili:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* B站登录样式 */
.bilibili-section {
  background: linear-gradient(135deg, rgba(251, 114, 153, 0.05) 0%, rgba(0, 161, 214, 0.05) 100%);
  border: 1px solid rgba(251, 114, 153, 0.15);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.25rem;
}

/* 下载设置样式 */
.download-section {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border: 1px solid rgba(102, 126, 234, 0.15);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.25rem;
}

.download-path-area {
  display: flex;
  flex-direction: column;
}

.path-input-group {
  margin-bottom: 0;
}

.path-input-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.path-input {
  flex: 1;
  cursor: default !important;
  background: rgba(255,255,255,0.04) !important;
}

.path-input-row .btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  white-space: nowrap;
}

.path-input-row .btn svg {
  flex-shrink: 0;
}

.path-hint {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.4);
  margin-top: 0.35rem;
}

.bilibili-login-area {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-success {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid rgba(251, 114, 153, 0.3);
}

.user-detail {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-level {
  font-size: 0.7rem;
  padding: 0.15rem 0.4rem;
  background: rgba(251, 114, 153, 0.2);
  border-radius: 4px;
  color: #fb7299;
}

.user-vip {
  font-size: 0.7rem;
  padding: 0.15rem 0.4rem;
  background: linear-gradient(135deg, #fb7299 0%, #f45a8d 100%);
  border-radius: 4px;
  color: white;
}

.login-status-text {
  flex: 1;
  font-size: 0.85rem;
  color: #10b981;
}

.login-pending {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.qrcode-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.qrcode-img {
  width: 160px;
  height: 160px;
  border-radius: 8px;
  background: white;
  padding: 8px;
}

.qrcode-status {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.7);
}

.qrcode-status.scanning {
  color: #00a1d6;
}

.qrcode-status.confirming {
  color: #fb7299;
}

.qrcode-status.expired {
  color: #ef4444;
}

.qrcode-status.error {
  color: #ef4444;
}

.login-start {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.login-hint {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.5);
}

.spinner {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.9) translateY(20px);
}

/* 滚动条 */
.modal-body::-webkit-scrollbar {
  width: 4px;
}

.modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.modal-body::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.15);
  border-radius: 3px;
}
</style>
