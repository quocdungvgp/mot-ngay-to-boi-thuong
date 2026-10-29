@echo off
setlocal EnableDelayedExpansion
cd /d %~dp0
set REPO=mot-ngay-to-boi-thuong
set "PATH=%PATH%;%ProgramFiles%\Git\cmd;%ProgramFiles%\GitHub CLI"
echo ================================================
echo   DUA GAME "MOT NGAY LAM TO BOI THUONG" LEN WEB
echo ================================================
echo.

where git >nul 2>nul || (
  echo [1/5] Chua co Git, dang cai...
  winget install --id Git.Git -e --silent --accept-package-agreements --accept-source-agreements
)
where gh >nul 2>nul || (
  echo [1/5] Chua co GitHub CLI, dang cai...
  winget install --id GitHub.cli -e --silent --accept-package-agreements --accept-source-agreements
)
where git >nul 2>nul || (echo Khong cai duoc Git. Tai tay tai https://git-scm.com roi chay lai. & pause & exit /b 1)
where gh  >nul 2>nul || (echo Khong cai duoc GitHub CLI. Tai tay tai https://cli.github.com roi chay lai. & pause & exit /b 1)

echo [2/5] Dang nhap GitHub (trinh duyet se mo ra, bam Authorize)...
gh auth status >nul 2>nul || gh auth login -h github.com -p https -w
gh auth status >nul 2>nul || (echo Chua dang nhap duoc GitHub. & pause & exit /b 1)
for /f "delims=" %%u in ('gh api user --jq .login') do set GHUSER=%%u
echo     Tai khoan: !GHUSER!

echo [3/5] Dong goi code...
if not exist .git git init -q -b main
git config user.name >nul 2>nul || git config user.name "!GHUSER!"
git config user.email >nul 2>nul || git config user.email "!GHUSER!@users.noreply.github.com"
git add -A
git commit -q -m "Cap nhat game %date% %time%" >nul 2>nul

echo [4/5] Day len GitHub...
gh repo view !GHUSER!/%REPO% >nul 2>nul
if errorlevel 1 (
  gh repo create %REPO% --public --source=. --remote=origin --push
) else (
  git remote get-url origin >nul 2>nul || git remote add origin https://github.com/!GHUSER!/%REPO%.git
  git push -u origin main
)
if errorlevel 1 (echo Day code that bai. & pause & exit /b 1)

echo [5/5] Mo Render de tao server...
start "" "https://dashboard.render.com/blueprint/new?repo=https://github.com/!GHUSER!/%REPO%"
echo.
echo ================================================
echo  TREN TRANG RENDER VUA MO:
echo   - Dang nhap bang GitHub (lan dau)
echo   - Dat ten Blueprint bat ky, bam "Deploy Blueprint" / "Apply"
echo   - Cho 2-3 phut, Render cho link ...onrender.com la choi duoc
echo.
echo  Ve sau sua code xong chi can chay lai deploy.bat,
echo  Render tu cap nhat.
echo ================================================
pause
