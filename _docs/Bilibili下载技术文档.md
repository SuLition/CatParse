# B站视频/音频下载技术文档

本文档详细介绍 BiliTools 项目下载 B站视频和音频的核心实现原理，可供在其他项目中参考使用。

---

## 目录

1. [整体架构](#1-整体架构)
2. [核心流程](#2-核心流程)
3. [API接口详解](#3-api接口详解)
4. [WBI签名算法](#4-wbi签名算法)
5. [视频流获取](#5-视频流获取)
6. [音频流获取](#6-音频流获取)
7. [下载实现](#7-下载实现)
8. [音视频合并](#8-音视频合并)
9. [请求头配置](#9-请求头配置)
10. [代码示例](#10-代码示例)

---

## 1. 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      用户界面 (Vue 3)                        │
├─────────────────────────────────────────────────────────────┤
│                    前端服务层 (TypeScript)                   │
│  ├── 链接解析 (parseId)                                      │
│  ├── 媒体信息获取 (getMediaInfo)                             │
│  ├── 播放链接获取 (getPlayUrl)                               │
│  └── WBI签名认证 (auth.wbi)                                  │
├─────────────────────────────────────────────────────────────┤
│                    后端服务层 (Rust/Tauri)                   │
│  ├── Aria2c 下载管理                                         │
│  ├── FFmpeg 音视频处理                                       │
│  └── 任务队列管理                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 核心流程

### 2.1 下载流程概述

```
1. 解析用户输入的链接 → 识别媒体类型和ID
2. 调用 API 获取媒体信息 (标题、封面、分P等)
3. 调用 PlayURL API 获取实际的视频/音频流地址
4. 使用 Aria2c 下载视频和音频文件
5. 使用 FFmpeg 合并视频和音频 (DASH格式)
6. 添加元数据和封面
```

### 2.2 支持的媒体类型

| 类型 | ID格式 | 说明 |
|------|--------|------|
| Video | `BV1xxx`, `av12345` | 普通视频 |
| Bangumi | `ep12345`, `ss12345`, `md12345` | 番剧/电影 |
| Music | `au12345` | 音频 |
| MusicList | `am12345` | 音频歌单 |
| Lesson | `ep12345`, `ss12345` | 课程 |

---

## 3. API接口详解

### 3.1 视频信息接口

```
GET https://api.bilibili.com/x/web-interface/view

参数:
- bvid: BV号 (如 BV1xx411c7mD)
- aid: av号 (如 12345)

返回: 视频标题、封面、分P列表、UP主信息等
```

### 3.2 番剧信息接口

```
GET https://api.bilibili.com/pgc/view/web/season

参数:
- season_id: 剧集ID (ss号)
- ep_id: 单集ID (ep号)

返回: 番剧信息、剧集列表等
```

### 3.3 音频信息接口

```
GET https://www.bilibili.com/audio/music-service-c/web/song/info

参数:
- sid: 音频ID (au号的数字部分)

返回: 音频标题、封面、时长等
```

### 3.4 视频播放链接接口 (需要WBI签名)

```
GET https://api.bilibili.com/x/player/wbi/playurl

参数:
- avid: av号
- cid: 视频cid
- qn: 清晰度 (127=8K, 126=杜比视界, 125=HDR, 120=4K, 116=1080P60, 112=1080P+, 80=1080P, 64=720P, 32=480P, 16=360P)
- fnval: 格式标识 (16=DASH, 1=MP4, 0=FLV)
- fnver: 版本号 (0)
- fourk: 是否允许4K (1)
- wts: 当前时间戳
- w_rid: WBI签名

登录后可获取更高清晰度，fnval=4048 可获取杜比/Hi-Res音质
```

### 3.5 番剧播放链接接口

```
GET https://api.bilibili.com/pgc/player/web/v2/playurl

参数:
- ep_id: 剧集ID
- season_id: 季度ID
- qn, fnval, fnver, fourk: 同视频接口
```

### 3.6 音频播放链接接口

```
GET https://www.bilibili.com/audio/music-service-c/web/url

参数:
- sid: 音频ID
- privilege: 2
- quality: 0 (最高质量)
```

---

## 4. WBI签名算法

B站对部分 API 使用 WBI 签名验证，需要以下步骤：

### 4.1 获取 WBI 密钥

```javascript
// 从导航接口获取密钥
const response = await fetch('https://api.bilibili.com/x/web-interface/nav');
const { img_url, sub_url } = response.data.wbi_img;

// 提取密钥
const imgKey = img_url.slice(img_url.lastIndexOf('/') + 1, img_url.lastIndexOf('.'));
const subKey = sub_url.slice(sub_url.lastIndexOf('/') + 1, sub_url.lastIndexOf('.'));
```

### 4.2 生成混合密钥

```javascript
const mixinKeyEncTab = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
  33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
  61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
  36, 20, 34, 44, 52,
];

const mixinKey = mixinKeyEncTab
  .map((n) => (imgKey + subKey)[n])
  .join('')
  .slice(0, 32);
```

### 4.3 生成签名

```javascript
import md5 from 'md5';

function wbiSign(params) {
  // 添加时间戳和 WebGL 指纹
  params.wts = Math.round(Date.now() / 1000);
  params.dm_img_str = btoa(webglVersion).slice(0, -2);
  params.dm_cover_img_str = btoa(webglRenderer + webglVendor).slice(0, -2);
  params.dm_img_list = '[]';
  
  // 按 key 排序
  const query = Object.keys(params)
    .sort()
    .map(key => {
      const value = (params[key] ?? '').toString().replace(/[!'()*]/g, '');
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');
  
  // 计算签名
  const w_rid = md5(query + mixinKey);
  return query + '&w_rid=' + w_rid;
}
```

---

## 5. 视频流获取

### 5.1 DASH 格式 (推荐)

DASH 格式将视频和音频分开传输，需要分别下载后合并。

```javascript
async function getPlayUrl(aid, cid, isLogin) {
  const params = {
    avid: aid,
    cid: cid,
    qn: isLogin ? 127 : 64,  // 登录用户可获取更高清晰度
    fnver: 0,
    fnval: isLogin ? 4048 : 16,  // 4048 包含杜比/Hi-Res
    fourk: 1,
  };
  
  const signedParams = await wbiSign(params);
  const response = await fetch(
    `https://api.bilibili.com/x/player/wbi/playurl?${signedParams}`,
    { headers: getHeaders() }
  );
  
  const data = response.data;
  
  if (data.dash) {
    return {
      video: data.dash.video,   // 视频流列表
      audio: [
        ...data.dash.audio,      // 普通音频
        ...(data.dash.dolby?.audio || []),  // 杜比音频
        ...(data.dash.flac?.audio ? [data.dash.flac.audio] : []),  // Hi-Res
      ],
      codec: 'dash'
    };
  }
}
```

### 5.2 视频质量ID对照表

| ID | 清晰度 | 需要登录 | 需要大会员 |
|----|--------|----------|------------|
| 127 | 8K 超高清 | ✓ | ✓ |
| 126 | 杜比视界 | ✓ | ✓ |
| 125 | HDR 真彩色 | ✓ | ✓ |
| 120 | 4K 超清 | ✓ | ✓ |
| 116 | 1080P 60帧 | ✓ | ✓ |
| 112 | 1080P 高码率 | ✓ | ✓ |
| 80 | 1080P 高清 | ✓ | |
| 64 | 720P 高清 | | |
| 32 | 480P 清晰 | | |
| 16 | 360P 流畅 | | |

### 5.3 音频质量ID对照表

| ID | 质量 | 说明 |
|----|------|------|
| 30252 | Hi-Res 无损 | FLAC |
| 30251 | 杜比全景声 | EAC3/FLAC |
| 30250 | 杜比全景声 | EAC3 |
| 30380 | 192K | AAC |
| 30280 | 320K | AAC |
| 30232 | 128K | AAC |
| 30216 | 64K | AAC |

### 5.4 编码格式ID

| ID | 编码 |
|----|------|
| 7 | AVC (H.264) |
| 12 | HEVC (H.265) |
| 13 | AV1 |

---

## 6. 音频流获取

### 6.1 B站音频区资源

```javascript
async function getMusicPlayUrl(sid) {
  const params = {
    sid: sid,
    privilege: 2,
    quality: 0,  // 最高质量
  };
  
  const response = await fetch(
    `https://www.bilibili.com/audio/music-service-c/web/url?${new URLSearchParams(params)}`,
    { headers: getHeaders() }
  );
  
  const data = response.data;
  return {
    audio: [{
      id: { 0: 30228, 1: 30280, 2: 30380, 3: 30252 }[data.type] ?? -1,
      baseUrl: data.cdns[0],
      backupUrl: data.cdns,
    }],
    codec: 'dash'
  };
}
```

---

## 7. 下载实现

### 7.1 使用 Aria2c 下载

项目使用 Aria2c 作为下载引擎，通过 JSON-RPC 接口控制。

```javascript
// Aria2c RPC 调用示例
async function aria2Download(urls, outputDir, filename, gid) {
  const payload = {
    jsonrpc: "2.0",
    id: "1",
    method: "aria2.addUri",
    params: [
      `token:${secret}`,
      urls,
      {
        dir: outputDir,
        out: filename,
        gid: gid,
      }
    ]
  };
  
  await fetch(aria2Endpoint, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
```

### 7.2 Aria2c 启动参数

```bash
aria2c \
  --enable-rpc \
  --rpc-listen-all=false \
  --disable-ipv6=true \
  --pause=true \
  --referer=https://www.bilibili.com/ \
  --header="Origin: https://www.bilibili.com" \
  --user-agent="Mozilla/5.0 ..." \
  --rpc-listen-port=6800 \
  --rpc-secret=your_secret
```

### 7.3 PCDN 过滤

B站可能返回 PCDN (P2P CDN) 节点，下载速度可能不稳定。可以过滤这些节点：

```javascript
function urlFilter(urls) {
  const mirror = [];
  const upos = [];
  const bcache = [];
  const others = [];
  
  for (const v of urls) {
    const url = new URL(v);
    const host = url.hostname;
    const os = url.searchParams.get('os') ?? '';
    
    if (host.includes('mirror') && os.endsWith('bv')) {
      mirror.push(url);
    } else if (os === 'upos') {
      upos.push(url);
    } else if (host.startsWith('cn') && os === 'bcache') {
      bcache.push(url);
    } else {
      others.push(url);
    }
  }
  
  // 优先使用镜像节点
  if (mirror.length) {
    return mirror.length < 2 ? [...mirror, ...upos] : mirror;
  }
  
  // 替换为阿里云/腾讯云镜像
  if (upos.length || bcache.length) {
    const mirrorList = [
      'upos-sz-mirrorali.bilivideo.com',
      'upos-sz-mirrorcos.bilivideo.com',
    ];
    return (upos.length ? upos : bcache).map((v, i) => {
      v.hostname = mirrorList[i] ?? v.hostname;
      return v.toString();
    });
  }
  
  return others;
}
```

---

## 8. 音视频合并

### 8.1 使用 FFmpeg 合并

DASH 格式需要将视频和音频合并：

```bash
ffmpeg -hide_banner -nostats -loglevel warning \
  -i video.m4s \
  -i audio.m4s \
  -c copy \
  -shortest \
  -movflags +faststart \
  output.mp4 -y
```

### 8.2 添加元数据

```bash
ffmpeg -hide_banner -nostats -loglevel warning \
  -i input.mp4 \
  -i cover.jpg \
  -map 0 \
  -map 1:v:0 \
  -c:v:0 copy \
  -c:v:1 mjpeg \
  -disposition:v:1 attached_pic \
  -metadata title="视频标题" \
  -metadata comment="视频描述" \
  -metadata date="2024-01-01" \
  -movflags +faststart \
  output.mp4 -y
```

### 8.3 格式转换

```bash
# 转换为 MP3
ffmpeg -i input.m4a -c:a libmp3lame -q:a 2 output.mp3

# FLV 转 MP4
ffmpeg -i input.flv -c:v copy -c:a aac -b:a 192k output.mp4
```

---

## 9. 请求头配置

### 9.1 必需的请求头

```javascript
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': 'https://www.bilibili.com/',
  'Origin': 'https://www.bilibili.com',
  'Cookie': 'your_cookie_here',  // 登录后的 Cookie
};
```

### 9.2 关键 Cookie 字段

| 字段 | 说明 |
|------|------|
| SESSDATA | 登录凭证 |
| bili_jct | CSRF Token |
| DedeUserID | 用户ID |
| buvid3 | 设备标识 |
| buvid4 | 设备标识 |
| b_nut | 设备标识 |

### 9.3 下载时的请求头

Aria2c 下载时需要设置 Referer 和 Origin：

```
Referer: https://www.bilibili.com/
Origin: https://www.bilibili.com
```

---

## 10. 代码示例

### 10.1 完整的视频下载示例 (TypeScript)

```typescript
import md5 from 'md5';

// 1. 获取视频信息
async function getVideoInfo(bvid: string) {
  const response = await fetch(
    `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`,
    { headers }
  );
  const data = await response.json();
  return {
    aid: data.data.aid,
    cid: data.data.cid,
    title: data.data.title,
    pages: data.data.pages,
  };
}

// 2. 获取 WBI 密钥并签名
async function wbiSign(params: Record<string, any>) {
  // 获取密钥
  const navResp = await fetch('https://api.bilibili.com/x/web-interface/nav', { headers });
  const navData = await navResp.json();
  const { img_url, sub_url } = navData.data.wbi_img;
  
  const imgKey = img_url.slice(img_url.lastIndexOf('/') + 1, img_url.lastIndexOf('.'));
  const subKey = sub_url.slice(sub_url.lastIndexOf('/') + 1, sub_url.lastIndexOf('.'));
  
  const mixinKeyEncTab = [46,47,18,2,53,8,23,32,15,50,10,31,58,3,45,35,27,43,5,49,33,9,42,19,29,28,14,39,12,38,41,13,37,48,7,16,24,55,40,61,26,17,0,1,60,51,30,4,22,25,54,21,56,59,6,63,57,62,11,36,20,34,44,52];
  const mixinKey = mixinKeyEncTab.map(n => (imgKey + subKey)[n]).join('').slice(0, 32);
  
  // 添加必要参数
  params.wts = Math.round(Date.now() / 1000);
  params.dm_img_str = '';
  params.dm_cover_img_str = '';
  params.dm_img_list = '[]';
  
  // 排序并签名
  const query = Object.keys(params)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key] ?? '')}`)
    .join('&');
  
  return query + '&w_rid=' + md5(query + mixinKey);
}

// 3. 获取播放链接
async function getPlayUrl(aid: number, cid: number) {
  const params = {
    avid: aid,
    cid: cid,
    qn: 127,
    fnver: 0,
    fnval: 4048,
    fourk: 1,
  };
  
  const signedQuery = await wbiSign(params);
  const response = await fetch(
    `https://api.bilibili.com/x/player/wbi/playurl?${signedQuery}`,
    { headers }
  );
  
  const data = await response.json();
  return data.data.dash;
}

// 4. 主流程
async function downloadVideo(bvid: string) {
  // 获取视频信息
  const info = await getVideoInfo(bvid);
  console.log(`标题: ${info.title}`);
  
  // 获取播放链接
  const dash = await getPlayUrl(info.aid, info.cid);
  
  // 选择最高质量的视频和音频
  const videoUrl = dash.video[0].baseUrl;
  const audioUrl = dash.audio[0].baseUrl;
  
  console.log(`视频流: ${videoUrl}`);
  console.log(`音频流: ${audioUrl}`);
  
  // 下载视频和音频 (使用你喜欢的下载方式)
  // await downloadFile(videoUrl, 'video.m4s');
  // await downloadFile(audioUrl, 'audio.m4s');
  
  // 使用 FFmpeg 合并
  // exec('ffmpeg -i video.m4s -i audio.m4s -c copy output.mp4');
}
```

### 10.2 音频下载示例

```typescript
async function downloadAudio(sid: number) {
  // 获取音频信息
  const infoResp = await fetch(
    `https://www.bilibili.com/audio/music-service-c/web/song/info?sid=${sid}`,
    { headers }
  );
  const info = await infoResp.json();
  console.log(`标题: ${info.data.title}`);
  
  // 获取播放链接
  const urlResp = await fetch(
    `https://www.bilibili.com/audio/music-service-c/web/url?sid=${sid}&privilege=2&quality=0`,
    { headers }
  );
  const urlData = await urlResp.json();
  
  const audioUrl = urlData.data.cdns[0];
  console.log(`音频流: ${audioUrl}`);
  
  // 下载音频
  // await downloadFile(audioUrl, 'audio.m4a');
}
```

---

## 参考资料

- [bilibili-API-collect](https://github.com/SocialSisterYi/bilibili-API-collect) - B站 API 文档
- [WBI 签名算法](https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/misc/sign/wbi.md)
- [Aria2c 官方文档](https://aria2.github.io/manual/en/html/)
- [FFmpeg 官方文档](https://ffmpeg.org/ffmpeg.html)

---

## 注意事项

1. **遵守B站使用条款**: 下载内容仅供个人学习使用，请勿用于商业目的
2. **尊重版权**: 部分内容可能有版权限制，请尊重创作者权益
3. **频率限制**: 避免过于频繁的请求，可能触发风控
4. **登录状态**: 高清晰度和会员内容需要登录账号
5. **接口变化**: B站 API 可能随时更改，请关注最新变化
