@echo off
chcp 65001 >nul
cd /d "%~dp0"

:: Đặt chế độ production để server đọc thư mục dist đã build sẵn
set NODE_ENV=production

:: Tự động bật trình duyệt sau 3 giây chờ server khởi động
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"

:: Khởi chạy máy chủ
echo Audio Grabber dang khoi dong tren http://localhost:3000 ...
call npm run start
pause