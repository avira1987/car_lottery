@echo off
chcp 65001 >nul 2>&1
REM Script to unlock PostgreSQL database by closing connections

echo ========================================
echo    Database Unlock Helper
echo ========================================
echo.

echo This script will help unlock the database by:
echo   1. Closing active connections to latari_db
echo   2. Releasing any locks
echo.

set /p PG_USER="PostgreSQL Username (default: postgres): "
if "%PG_USER%"=="" set PG_USER=postgres

set /p PG_PASSWORD="PostgreSQL Password (default: 123456): "
if "%PG_PASSWORD%"=="" set PG_PASSWORD=123456

set /p PG_DB="Database Name (default: latari_db): "
if "%PG_DB%"=="" set PG_DB=latari_db

set PGPASSWORD=%PG_PASSWORD%

echo.
echo Attempting to unlock database...
echo.

REM Terminate all connections to the database
psql -U %PG_USER% -h localhost -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '%PG_DB%' AND pid <> pg_backend_pid();" 2>nul

if errorlevel 1 (
    echo [WARN] Could not terminate connections automatically
    echo.
    echo Manual steps:
    echo   1. Close all pgAdmin windows
    echo   2. Close all psql sessions
    echo   3. Close any other database tools
    echo   4. Wait 10 seconds
    echo   5. Try running run.bat again
    echo.
) else (
    echo [OK] Connections terminated
    echo.
    echo You can now run: run.bat
    echo.
)

pause
