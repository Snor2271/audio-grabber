@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo =========================================
echo   DANG THIET LAP AUDIO GRABBER
echo =========================================

:: 1. Tạo file .env nếu chưa tồn tại
if not exist .env (
    echo [*] Dang tao file .env tu .env.example...
    copy .env.example .env >nul
)

:: 2. Cài đặt các gói thư viện
echo [*] Dang cai dat thu vien (npm install --legacy-peer-deps)...
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo [!] Cai dat thu vien that bai!
    pause
    exit /b %errorlevel%
)

:: 3. Build giao diện sẵn cho bản chạy Production
echo [*] Dang dong goi giao dien (npm run build)...
call npm run build
if %errorlevel% neq 0 (
    echo [!] Build giao dien that bai!
    pause
    exit /b %errorlevel%
)

echo.
echo =========================================
echo   CAI DAT HOAN TAT THANH CONG!
echo   Tu gio ban chi can chay file start.bat
echo =========================================
pause