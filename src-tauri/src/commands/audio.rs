//! 音频处理命令

use serde::Serialize;
use std::process::Command;
use tauri::Manager;

#[derive(Clone, Serialize)]
pub struct ExtractAudioResult {
    pub audio_path: String,
}

/// 查找 FFmpeg 可执行文件
/// 优先级: 打包目录 > 系统 PATH
fn find_ffmpeg(app: &tauri::AppHandle) -> Option<std::path::PathBuf> {
    // 1. 检查打包目录中的 FFmpeg (backend_server/_internal/ffmpeg.exe)
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            let possible_paths = [
                // onedir 模式: binaries/backend_server/_internal/ffmpeg.exe
                exe_dir.join("binaries").join("backend_server").join("_internal").join("ffmpeg.exe"),
                // 资源目录
                exe_dir.join("_internal").join("ffmpeg.exe"),
            ];
            
            for path in &possible_paths {
                if path.exists() {
                    println!("[FFmpeg] 找到打包的 FFmpeg: {:?}", path);
                    return Some(path.clone());
                }
            }
        }
    }
    
    // 2. 检查资源目录
    if let Ok(resource_dir) = app.path().resource_dir() {
        let possible_paths = [
            resource_dir.join("binaries").join("backend_server").join("_internal").join("ffmpeg.exe"),
            resource_dir.join("backend_server").join("_internal").join("ffmpeg.exe"),
        ];
        
        for path in &possible_paths {
            if path.exists() {
                println!("[FFmpeg] 找到资源目录的 FFmpeg: {:?}", path);
                return Some(path.clone());
            }
        }
    }
    
    // 3. 检查系统 PATH
    if let Ok(output) = Command::new("where").arg("ffmpeg").output() {
        if output.status.success() {
            let path_str = String::from_utf8_lossy(&output.stdout);
            if let Some(first_line) = path_str.lines().next() {
                let path = std::path::PathBuf::from(first_line.trim());
                if path.exists() {
                    println!("[FFmpeg] 找到系统 FFmpeg: {:?}", path);
                    return Some(path);
                }
            }
        }
    }
    
    None
}

/// 从本地视频文件提取音频
#[tauri::command]
pub async fn extract_audio(
    app: tauri::AppHandle,
    video_path: String,
) -> Result<ExtractAudioResult, String> {
    // 检查视频文件是否存在
    if !std::path::Path::new(&video_path).exists() {
        return Err("视频文件不存在".to_string());
    }

    // 获取应用数据目录
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("获取应用数据目录失败: {}", e))?;

    // 创建 temp 目录
    let temp_dir = app_data_dir.join("temp");
    if !temp_dir.exists() {
        std::fs::create_dir_all(&temp_dir).map_err(|e| format!("创建临时目录失败: {}", e))?;
    }

    // 生成输出音频文件名
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis();
    let audio_filename = format!("extracted_{}.mp3", timestamp);
    let audio_path = temp_dir.join(&audio_filename);

    // 查找 FFmpeg
    let ffmpeg_path = find_ffmpeg(&app)
        .ok_or_else(|| "FFmpeg 未找到，无法提取音频".to_string())?;

    // 执行 FFmpeg 提取音频
    let output = Command::new(&ffmpeg_path)
        .args([
            "-i",
            &video_path,
            "-vn",
            "-acodec",
            "libmp3lame",
            "-ab",
            "128k",
            "-ar",
            "44100",
            "-ac",
            "2",
            "-y",
            audio_path.to_str().unwrap(),
        ])
        .output()
        .map_err(|e| {
            format!(
                "FFmpeg 执行失败: {}. FFmpeg 路径: {:?}",
                e, ffmpeg_path
            )
        })?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("FFmpeg 提取失败: {}", stderr));
    }

    // 检查输出文件是否存在
    if !audio_path.exists() {
        return Err("音频提取失败，未生成输出文件".to_string());
    }

    Ok(ExtractAudioResult {
        audio_path: audio_path.to_string_lossy().to_string(),
    })
}
