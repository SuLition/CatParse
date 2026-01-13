; NSIS Installer Hooks - 安装前静默终止旧进程

!macro NSIS_HOOK_PREINSTALL
  ; 静默终止 CatParse 主程序 (/F 强制, 2>nul 忽略错误)
  nsExec::ExecToStack 'cmd /c taskkill /F /IM "CatParse.exe" 2>nul'
  Pop $0
  Pop $1
  ; 静默终止后端服务
  nsExec::ExecToStack 'cmd /c taskkill /F /IM "backend_server.exe" 2>nul'
  Pop $0
  Pop $1
  ; 等待进程完全退出
  Sleep 1500
!macroend
