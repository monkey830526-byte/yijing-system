@echo off
chcp 65001 >nul
title 易經占卦系統
cd /d "%~dp0"

echo.
echo  ╔══════════════════════════════════════╗
echo  ║        易經占卦系統 啟動中...         ║
echo  ╚══════════════════════════════════════╝
echo.

if not exist ".env" (
  echo  [提示] 尚未設定 .env，請複製 .env.example 並填入 GOOGLE_AI_KEY
  copy .env.example .env >nul
)

if not exist "node_modules" (
  echo  [安裝] 正在安裝依賴套件...
  npm install
  echo.
)

echo  [啟動] 伺服器啟動中，請稍候...
echo  [提示] 請在瀏覽器開啟：http://localhost:3000
echo  [提示] 局域網路存取：http://%COMPUTERNAME%:3000
echo  [提示] 關閉此視窗即可停止伺服器
echo.
node server.js
pause
