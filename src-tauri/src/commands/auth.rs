//! 认证相关命令 - 小红书登录
//!
//! 使用 Tauri 窗口打开小红书登录页，通过 WebView2 CookieManager 获取 Cookie

use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};
use tokio::sync::mpsc;

/// 小红书登录窗口 ID
const XHS_LOGIN_WINDOW_ID: &str = "xhs-login";

/// 小红书登录后的关键 Cookie
const XHS_COOKIE_WEB_SESSION: &str = "web_session=";

/// 检查 Cookie 是否包含有效的登录标识
/// 只要 web_session 存在且有值即可
fn is_valid_login_cookie(cookie_str: &str) -> bool {
    log::info!("[XHS Auth] Cookie 内容: {}", cookie_str);
    
    // 查找 web_session= 的位置
    if let Some(pos) = cookie_str.find(XHS_COOKIE_WEB_SESSION) {
        // 提取 web_session 的值
        let start = pos + XHS_COOKIE_WEB_SESSION.len();
        let rest = &cookie_str[start..];
        // 找到值的结束位置（分号或字符串末尾）
        let end = rest.find(';').unwrap_or(rest.len());
        let session_value = &rest[..end];
        // 只要有值就认为有效
        let is_valid = !session_value.is_empty();
        log::info!("[XHS Auth] web_session 值: {}, 长度: {}, 是否有效: {}", session_value, session_value.len(), is_valid);
        is_valid
    } else {
        log::info!("[XHS Auth] 未找到 web_session");
        false
    }
}

/// 从 WebView2 获取 Cookie（Windows 平台）
#[cfg(target_os = "windows")]
fn get_cookies_from_webview(
    window: &tauri::WebviewWindow,
    url: String,
    tx: mpsc::Sender<String>,
) {
    use webview2_com::{
        GetCookiesCompletedHandler,
        Microsoft::Web::WebView2::Win32::ICoreWebView2_2,
    };
    use windows_core::{Interface, HSTRING, PWSTR};

    let _ = window.with_webview(move |wv| {
        unsafe {
            let controller = wv.controller();
            let core_webview = controller.CoreWebView2().unwrap();
            
            // 转换为 ICoreWebView2_2 以获取 CookieManager
            let webview2_2: ICoreWebView2_2 = core_webview.cast().unwrap();
            let cookie_manager = webview2_2.CookieManager().unwrap();
            
            let url_hstring = HSTRING::from(&url);
            let tx_clone = tx.clone();
            
            let handler = GetCookiesCompletedHandler::create(Box::new(
                move |_, cookie_list| -> Result<(), windows_core::Error> {
                    let mut cookie_str = String::new();
                    if let Some(cookies) = cookie_list {
                        let mut cnt: u32 = 0;
                        cookies.Count(&mut cnt).unwrap();
                        for i in 0..cnt {
                            let cookie_item = cookies.GetValueAtIndex(i)?;
                            let mut name: PWSTR = PWSTR::null();
                            let mut value: PWSTR = PWSTR::null();
                            cookie_item.Name(&mut name)?;
                            cookie_item.Value(&mut value)?;
                            if i > 0 {
                                cookie_str.push_str("; ");
                            }
                            cookie_str.push_str(&format!(
                                "{}={}",
                                name.to_string()?,
                                value.to_string()?
                            ));
                        }
                    }
                    let _ = tx_clone.blocking_send(cookie_str);
                    Ok(())
                },
            ));
            
            let _ = cookie_manager.GetCookies(&url_hstring, &handler);
        }
    });
}

/// 非 Windows 平台的占位实现
#[cfg(not(target_os = "windows"))]
fn get_cookies_from_webview(
    _window: &tauri::WebviewWindow,
    _url: String,
    tx: mpsc::Sender<String>,
) {
    let _ = tx.blocking_send(String::new());
}

/// 清除 WebView2 中的所有 Cookie（Windows 平台）
#[cfg(target_os = "windows")]
fn clear_cookies_from_webview(window: &tauri::WebviewWindow) {
    use webview2_com::Microsoft::Web::WebView2::Win32::ICoreWebView2_2;
    use windows_core::{Interface, HSTRING};

    let _ = window.with_webview(move |wv| {
        unsafe {
            let controller = wv.controller();
            let core_webview = controller.CoreWebView2().unwrap();
            
            let webview2_2: ICoreWebView2_2 = core_webview.cast().unwrap();
            let cookie_manager = webview2_2.CookieManager().unwrap();
            
            // 只清除 web_session Cookie
            let _ = cookie_manager.DeleteCookiesWithDomainAndPath(
                &HSTRING::from("web_session"),
                &HSTRING::from(".xiaohongshu.com"),
                &HSTRING::from("/")
            );
            log::info!("[XHS Auth] 已清除 web_session Cookie");
        }
    });
}

/// 非 Windows 平台的占位实现
#[cfg(not(target_os = "windows"))]
fn clear_cookies_from_webview(_window: &tauri::WebviewWindow) {
    // 非 Windows 平台不支持
}

/// 打开小红书登录窗口并获取 Cookie
#[tauri::command]
pub async fn open_xhs_login(app: AppHandle) -> Result<String, String> {
    // 如果已有同名窗口，强制销毁它
    if let Some(existing_window) = app.get_webview_window(XHS_LOGIN_WINDOW_ID) {
        let _ = existing_window.destroy();
        tokio::time::sleep(tokio::time::Duration::from_millis(300)).await;
    }
    
    // 创建登录窗口，使用无痕模式避免共享浏览器 Cookie
    let login_window = WebviewWindowBuilder::new(
        &app,
        XHS_LOGIN_WINDOW_ID,
        WebviewUrl::External("https://www.xiaohongshu.com".parse().unwrap()),
    )
    .title("小红书登录 - 登录后窗口将自动关闭")
    .inner_size(1000.0, 700.0)
    .center()
    .incognito(true)  // 无痕模式，不共享系统浏览器 Cookie
    .build()
    .map_err(|e| format!("创建登录窗口失败: {}", e))?;
    
    let (tx, mut rx) = mpsc::channel::<String>(32);
    let result: Arc<Mutex<Option<String>>> = Arc::new(Mutex::new(None));
    let result_clone = result.clone();
    
    // 启动定时检查 Cookie 的任务
    let window_clone = login_window.clone();
    let tx_clone = tx.clone();
    
    tokio::spawn(async move {
        // 等待窗口加载完成
        tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
        
        // 清除 web_session Cookie，确保检测到的是新登录产生的
        clear_cookies_from_webview(&window_clone);
        
        // 等待页面重新加载（清除 Cookie 后页面会变为未登录状态）
        tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
        
        log::info!("[XHS Auth] 开始检测登录 Cookie...");
        
        loop {
            get_cookies_from_webview(
                &window_clone,
                "https://www.xiaohongshu.com".to_string(),
                tx_clone.clone(),
            );
            tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
        }
    });
    
    // 监听 Cookie 变化
    let window_for_close = login_window.clone();
    tokio::spawn(async move {
        while let Some(cookie_str) = rx.recv().await {
            log::info!("[XHS Auth] 收到 Cookie, 长度: {}", cookie_str.len());
            // 使用更严格的登录检测
            if is_valid_login_cookie(&cookie_str) {
                log::info!("[XHS Auth] 检测到有效登录 Cookie!");
                *result_clone.lock().unwrap() = Some(cookie_str);
                let _ = window_for_close.destroy();  // 强制销毁窗口
                break;
            }
        }
    });
    
    // 等待窗口关闭
    let result_for_wait = result.clone();
    loop {
        tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
        
        // 检查窗口是否已关闭
        if app.get_webview_window(XHS_LOGIN_WINDOW_ID).is_none() {
            break;
        }
    }
    
    // 获取结果
    let final_result = result_for_wait.lock().unwrap().clone();
    
    match final_result {
        Some(cookie) => {
            log::info!("[XHS Auth] 获取 Cookie 成功, 长度: {}", cookie.len());
            Ok(cookie)
        }
        None => Err("未获取到登录 Cookie，请确保已登录".to_string()),
    }
}

/// 检查小红书 Cookie 是否有效
#[tauri::command]
pub fn check_xhs_cookie(cookie: String) -> bool {
    is_valid_login_cookie(&cookie)
}
