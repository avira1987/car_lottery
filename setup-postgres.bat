@echo off
chcp 65001 >nul 2>&1
REM Complete PostgreSQL setup script

echo ========================================
echo    PostgreSQL Setup Helper
echo ========================================
echo.

echo This script will help you:
echo   1. Check PostgreSQL installation
echo   2. Create the database
echo   3. Test the connection
echo   4. Update backend\.env
echo.

pause

REM Step 1: Check PostgreSQL installation
echo [Step 1/4] Checking PostgreSQL installation...
where psql >nul 2>&1
if errorlevel 1 (
    echo [ERROR] PostgreSQL command-line tools not found in PATH
    echo.
    echo PostgreSQL might be installed but not in PATH
    echo Common installation paths:
    echo   C:\Program Files\PostgreSQL\15\bin\psql.exe
    echo   C:\Program Files\PostgreSQL\14\bin\psql.exe
    echo   C:\Program Files\PostgreSQL\13\bin\psql.exe
    echo.
    echo Please add PostgreSQL bin directory to your PATH, or:
    echo   1. Find your PostgreSQL installation directory
    echo   2. Use full path to psql.exe
    echo   3. Or use pgAdmin instead
    echo.
    pause
    goto :manual_setup
) else (
    echo [OK] PostgreSQL command-line tools found
)

REM Step 2: Get PostgreSQL settings
echo [Step 2/4] PostgreSQL Configuration
echo.
set /p PG_USER="PostgreSQL Username (default: postgres): "
if "%PG_USER%"=="" set PG_USER=postgres

set /p PG_PASSWORD="PostgreSQL Password: "
if "%PG_PASSWORD%"=="" (
    echo [ERROR] Password is required!
    pause
    exit /b 1
)

set /p PG_DB="Database Name (default: latari_db): "
if "%PG_DB%"=="" set PG_DB=latari_db

set /p PG_PORT="PostgreSQL Port (default: 5432): "
if "%PG_PORT%"=="" set PG_PORT=5432

REM Step 3: Test connection and create database
echo [Step 3/4] Testing connection and creating database...
echo.

REM Set PGPASSWORD environment variable for non-interactive connection
set PGPASSWORD=%PG_PASSWORD%

REM Test connection
psql -U %PG_USER% -h localhost -p %PG_PORT% -c "SELECT version();" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Cannot connect to PostgreSQL!
    echo.
    echo Possible issues:
    echo   1. PostgreSQL service is not running
    echo   2. Wrong username or password
    echo   3. Wrong port number
    echo   4. PostgreSQL not installed
    echo.
    echo Solutions:
    echo   1. Check PostgreSQL service in Windows Services (services.msc)
    echo   2. Verify username and password
    echo   3. Check port number (usually 5432)
    echo   4. Install PostgreSQL from: https://www.postgresql.org/download/windows/
    echo.
    pause
    goto :manual_setup
)

echo [OK] Connection successful!

REM Check if database exists
psql -U %PG_USER% -h localhost -p %PG_PORT% -lqt 2>nul | findstr /C:"%PG_DB%" >nul
if errorlevel 1 (
    echo   Creating database '%PG_DB%'...
    psql -U %PG_USER% -h localhost -p %PG_PORT% -c "CREATE DATABASE %PG_DB%;" 2>nul
    if errorlevel 1 (
        echo [ERROR] Failed to create database
        echo   Please create it manually using pgAdmin or psql
        pause
        goto :manual_setup
    ) else (
        echo [OK] Database '%PG_DB%' created successfully
    )
) else (
    echo [OK] Database '%PG_DB%' already exists
)

REM Step 4: Update .env file
echo [Step 4/4] Updating backend\.env...
if not exist "backend\.env" (
    echo [WARN] backend\.env not found, creating from example...
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env" >nul
    ) else (
        echo [ERROR] backend\.env.example not found!
        pause
        exit /b 1
    )
)

REM Create backup
copy "backend\.env" "backend\.env.backup" >nul 2>&1

REM Update DATABASE_URL
set DB_URL=postgresql://%PG_USER%:%PG_PASSWORD%@localhost:%PG_PORT%/%PG_DB%

powershell -Command "(Get-Content 'backend\.env') -replace 'DATABASE_URL=\".*\"', 'DATABASE_URL=\"%DB_URL%\"' | Set-Content 'backend\.env'"

echo [OK] backend\.env updated successfully!
echo.
echo New DATABASE_URL: %DB_URL%
echo.
echo Backup saved to: backend\.env.backup
echo.
echo ========================================
echo    Setup Complete!
echo ========================================
echo.
echo You can now run: run.bat
echo.
pause
exit /b 0

:manual_setup
echo.
echo ========================================
echo    Manual Setup Instructions
echo ========================================
echo.
echo Option 1: Using pgAdmin (Recommended)
echo   1. Open pgAdmin
echo   2. Connect to PostgreSQL server
echo   3. Right-click on "Databases" -^> Create -^> Database
echo   4. Name: latari_db
echo   5. Click Save
echo   6. Update backend\.env with your credentials
echo.
echo Option 2: Using Command Line
echo   1. Open Command Prompt as Administrator
echo   2. Navigate to PostgreSQL bin directory:
echo      cd "C:\Program Files\PostgreSQL\15\bin"
echo   3. Run: psql -U postgres
echo   4. Enter your password
echo   5. Type: CREATE DATABASE latari_db;
echo   6. Type: \q
echo   7. Update backend\.env with your credentials
echo.
echo Option 3: Use setup-database.bat
echo   This will help you configure DATABASE_URL interactively
echo.
pause
