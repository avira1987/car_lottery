@echo off
chcp 65001 >nul
echo ========================================
echo   Commit و Push به GitHub
echo ========================================
echo.

where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [خطا] Git نصب نیست. ابتدا Git را نصب کنید:
    echo https://git-scm.com/download/win
    pause
    exit /b 1
)

cd /d "%~dp0"

echo [1] بررسی وضعیت...
git status
echo.

echo [2] افزودن فایل‌ها (بدون .env)...
git add .
git status
echo.

echo [3] Commit...
git commit -m "chore: رعایت امنیت .env و آماده‌سازی استقرار چابکان"
echo.

echo [4] Push به GitHub...
git push origin main
if %ERRORLEVEL% neq 0 (
    git push origin master
)

echo.
echo [تمام] اگر remote تنظیم نشده، ابتدا:
echo   git remote add origin https://github.com/YOUR_USERNAME/latari.git
echo   git branch -M main
pause
