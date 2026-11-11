@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Audio Grabber - Cai dat khoa Gemini API

:menu
cls
echo =========================================
echo   AUDIO GRABBER - KHOA GEMINI API
echo =========================================
echo.
call :status
echo.
echo   [1] Them hoac doi khoa API
echo   [2] Kiem tra khoa dang luu
echo   [3] Xoa khoa khoi file .env
echo   [4] Mo trang tao khoa cua Google AI Studio
echo   [0] Thoat
echo.
set "CHOICE="
set /p "CHOICE=Chon (0-4): "
if "%CHOICE%"=="1" goto add
if "%CHOICE%"=="2" goto test
if "%CHOICE%"=="3" goto remove
if "%CHOICE%"=="4" goto openpage
if "%CHOICE%"=="0" exit /b 0
goto menu

:add
echo.
echo Dan khoa API vao day roi nhan Enter.
echo Khoa thuong bat dau bang AIza. Khong chia se khoa nay cho ai.
echo.
set "GKEY="
set /p "GKEY=Khoa API: "
if not defined GKEY (
    echo [!] Ban chua nhap gi.
    pause
    goto menu
)
powershell -NoProfile -Command "$q=[char]34; $k=$env:GKEY.Trim().Trim($q).Trim([char]39); if($k -notmatch '^[A-Za-z0-9_-]{20,}$'){ exit 2 }; $p='.env'; if(-not (Test-Path $p)){ if(Test-Path '.env.example'){ Copy-Item '.env.example' $p } else { New-Item $p -ItemType File | Out-Null } }; $full=(Resolve-Path $p).Path; $lines=[System.IO.File]::ReadAllLines($full); $line='GEMINI_API_KEY='+$q+$k+$q; $found=$false; $out=@(); foreach($l in $lines){ if($l -match '^\s*#?\s*GEMINI_API_KEY\s*='){ if(-not $found){ $found=$true; $out+=$line } } else { $out+=$l } }; if(-not $found){ $out+=$line }; [System.IO.File]::WriteAllLines($full,$out,(New-Object System.Text.UTF8Encoding($false)))"
set "RC=%errorlevel%"
set "GKEY="
if "%RC%"=="2" (
    echo.
    echo [!] Khoa khong hop le: chi gom chu, so, dau gach noi, gach duoi, dai it nhat 20 ky tu.
    echo     Hay kiem tra lai va dan lai khoa.
    pause
    goto menu
)
if not "%RC%"=="0" (
    echo.
    echo [!] Khong ghi duoc file .env. Ma loi: %RC%
    pause
    goto menu
)
echo.
echo [OK] Da luu khoa vao file .env
echo.
echo Dang kiem tra khoa voi Google...
goto dotest

:test
echo.
if not exist .env (
    echo [!] Chua co file .env. Hay chon [1] de them khoa.
    pause
    goto menu
)

:dotest
powershell -NoProfile -Command "$q=[char]34; $p='.env'; if(-not (Test-Path $p)){ exit 3 }; $m=[System.IO.File]::ReadAllLines((Resolve-Path $p).Path) | Where-Object { $_ -match '^\s*GEMINI_API_KEY\s*=' } | Select-Object -First 1; if(-not $m){ exit 3 }; $k=($m -replace '^\s*GEMINI_API_KEY\s*=\s*','').Trim().Trim($q).Trim([char]39); if($k -eq '' -or $k -eq 'MY_GEMINI_API_KEY'){ exit 3 }; try { [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; Invoke-RestMethod -Uri 'https://generativelanguage.googleapis.com/v1beta/models' -Headers @{'x-goog-api-key'=$k} -Method Get -TimeoutSec 20 | Out-Null; exit 0 } catch { if($_.Exception.Response){ exit 4 } else { exit 5 } }"
set "RC=%errorlevel%"
echo.
if "%RC%"=="0" (
    echo [OK] Khoa hop le. Google chap nhan khoa nay.
    echo.
    echo QUAN TRONG: hay tat roi mo lai start.bat de ung dung doc khoa moi.
) else if "%RC%"=="3" (
    echo [!] Chua co khoa hop le trong file .env. Hay chon [1] de them khoa.
) else if "%RC%"=="4" (
    echo [!] Google tu choi khoa nay: khoa sai, da bi thu hoi hoac chua duoc phep.
    echo     Tao khoa moi o muc [4] roi dung muc [1] de them lai.
) else (
    echo [!] Khong ket noi duoc toi Google. Kiem tra mang roi thu lai.
    echo     Neu khoa da duoc luu, ban van co the dung khi co mang.
)
echo.
pause
goto menu

:remove
echo.
if not exist .env (
    echo [!] Khong co file .env de xoa khoa.
    pause
    goto menu
)
powershell -NoProfile -Command "$q=[char]34; $p=(Resolve-Path '.env').Path; $lines=[System.IO.File]::ReadAllLines($p); $out=@(); foreach($l in $lines){ if($l -notmatch '^\s*GEMINI_API_KEY\s*='){ $out+=$l } }; $out+=('GEMINI_API_KEY='+$q+$q); [System.IO.File]::WriteAllLines($p,$out,(New-Object System.Text.UTF8Encoding($false)))"
if errorlevel 1 (
    echo [!] Khong xoa duoc khoa.
) else (
    echo [OK] Da xoa khoa. Nut Goi y bang AI se khong dung duoc cho den khi them khoa moi.
    echo     Ung dung van tai nhac va dat ten theo luat binh thuong.
)
echo.
pause
goto menu

:openpage
start "" "https://aistudio.google.com/apikey"
echo.
echo Da mo trang tao khoa. Neu trang khong mo dung cho, vao aistudio.google.com
echo roi chon Get API key, bam Create API key, sao chep khoa va quay lai day chon [1].
echo.
pause
goto menu

:status
if not exist .env (
    echo   Trang thai: chua co file .env
    exit /b 0
)
powershell -NoProfile -Command "$q=[char]34; $m=[System.IO.File]::ReadAllLines((Resolve-Path '.env').Path) | Where-Object { $_ -match '^\s*GEMINI_API_KEY\s*=' } | Select-Object -First 1; $k=''; if($m){ $k=($m -replace '^\s*GEMINI_API_KEY\s*=\s*','').Trim().Trim($q).Trim([char]39) }; if($k -eq '' -or $k -eq 'MY_GEMINI_API_KEY'){ Write-Host '  Trang thai: CHUA co khoa Gemini' } else { $t=$k.Substring([Math]::Max(0,$k.Length-4)); Write-Host ('  Trang thai: da luu khoa, ket thuc bang ...'+$t) }"
exit /b 0
