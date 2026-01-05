# 文案小助手

一个基于Vue 3和Tauri构建的视频解析、文案提取与AI改写工具，支持多个主流短视频平台。

## 功能特性

- **多平台视频解析**：支持Bilibili、抖音、快手、小红书等多个平台的视频链接解析
- **视频下载**：支持高清视频下载，包含多种画质选择
- **语音识别**：自动提取视频中的语音内容，生成文字稿
- **AI文案改写**：使用多种AI模型对文案进行智能改写
- **任务管理**：后台任务管理，支持进度跟踪

## 技术栈

- **前端**：Vue 3 + Vite + JavaScript
- **桌面应用**：Tauri
- **后端服务**：Python Flask
- **解析服务**：独立的parser-service
- **AI模型**：支持Doubao、DeepSeek、通义千问等多种模型

## 安装依赖

```bash
npm install
```

## 开发运行

```bash
# 启动前端开发服务器
npm run dev

# 启动Tauri桌面应用开发模式
npm run tauri:dev

# 启动后端服务
cd _references/video-parser-main
pip install -r requirements.txt
python app.py
```

## 构建项目

```bash
# 构建前端
npm run build

# 构建Tauri桌面应用
npm run tauri:build
```

## 项目结构

```
src/                    # 前端源码
├── components/         # Vue组件
├── config/             # 平台配置
├── services/           # 服务API
├── stores/             # 状态管理
src-tauri/             # Tauri配置
_references/           # 后端服务代码
parser-service/        # 解析服务
```

## 使用说明

1. 启动后端服务
2. 运行前端应用
3. 选择视频平台
4. 输入视频链接并解析
5. 下载视频或提取文案
6. 使用AI进行文案改写

## 支持平台

- Bilibili（哔哩哔哩）
- Douyin（抖音）
- Xiaohongshu（小红书）
- Kuaishou（快手）

## 许可证

MIT