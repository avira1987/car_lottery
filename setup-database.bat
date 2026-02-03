@echo off
chcp 65001 >nul 2>&1
REM Helper script to setup DATABASE_URL for local PostgreSQL

echo ========================================
echo    Database Setup Helper
echo ========================================
echo.
echo This script helps you configure DATABASE_URL for local PostgreSQL
echo.

REM Check if .env exists
if not exist "backend\.env" (
    echo [ERROR] backend\.env file not found!
    echo   Please run run.bat first to create the .env file
    pause
    exit /b 1
)

echo Current DATABASE_URL:
findstr /C:"DATABASE_URL" "backend\.env"
echo.
echo.

echo Please enter your PostgreSQL settings:
echo.

set /p DB_USER="PostgreSQL Username (default: postgres): "
if "%DB_USER%"=="" set DB_USER=postgres

set /p DB_PASSWORD="PostgreSQL Password: "
if "%DB_PASSWORD%"=="" (
    echo [ERROR] Password is required!
    pause
    exit /b 1
)

set /p DB_NAME="Database Name (default: latari_db): "
if "%DB_NAME%"=="" set DB_NAME=latari_db

set /p DB_PORT="PostgreSQL Port (default: 5432): "
if "%DB_PORT%"=="" set DB_PORT=5432

set DB_URL=postgresql://%DB_USER%:%DB_PASSWORD%@localhost:%DB_PORT%/%DB_NAME%

echo.
echo New DATABASE_URL will be:
echo   %DB_URL%
echo.
set /p CONFIRM="Is this correct? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
echo Updating backend\.env...

REM Create backup
copy "backend\.env" "backend\.env.backup" >nul 2>&1

REM Update DATABASE_URL using PowerShell
powershell -Command "(Get-Content 'backend\.env') -replace 'DATABASE_URL=\".*\"', 'DATABASE_URL=\"%DB_URL%\"' | Set-Content 'backend\.env'"

echo [OK] DATABASE_URL updated!
echo.
echo Backup saved to: backend\.env.backup
echo.
echo You can now run: run.bat
echo.
pause
