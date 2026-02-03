@echo off
chcp 65001 >nul 2>&1
REM Script to fix database connection issues

echo ========================================
echo    Database Connection Fixer
echo ========================================
echo.

REM Check if PostgreSQL is running
echo [1/4] Checking PostgreSQL service...
sc query postgresql-x64-* 2>nul | find "RUNNING" >nul
if errorlevel 1 (
    echo [WARN] PostgreSQL service might not be running
    echo   Checking for other PostgreSQL services...
    sc query type= service | findstr /I postgres >nul
    if errorlevel 1 (
        echo [ERROR] PostgreSQL service not found!
        echo   Please make sure PostgreSQL is installed and running
        echo.
        echo   To start PostgreSQL:
        echo   1. Open Services (Win+R, type: services.msc)
        echo   2. Find PostgreSQL service
        echo   3. Right-click and select Start
        echo.
        pause
        exit /b 1
    ) else (
        echo [INFO] PostgreSQL service found but status unknown
        echo   Please check if it's running in Services
    )
) else (
    echo [OK] PostgreSQL service is running
)

REM Test connection
echo [2/4] Testing database connection...
where psql >nul 2>&1
if errorlevel 1 (
    echo [WARN] psql command not found in PATH
    echo   This is OK if you use pgAdmin instead
) else (
    echo   Attempting to connect...
    echo   (This will prompt for password)
    psql -U postgres -c "SELECT version();" >nul 2>&1
    if errorlevel 1 (
        echo [WARN] Connection test failed
        echo   This might be due to wrong password or PostgreSQL not running
    ) else (
        echo [OK] Connection test successful
    )
)

REM Check if database exists
echo [3/4] Checking if database exists...
where psql >nul 2>&1
if not errorlevel 1 (
    psql -U postgres -lqt 2>nul | findstr /C:"latari_db" >nul
    if errorlevel 1 (
        echo [WARN] Database 'latari_db' does not exist
        echo.
        echo   To create the database, run:
        echo   psql -U postgres
        echo   Then type: CREATE DATABASE latari_db;
        echo   Then type: \q
        echo.
        set /p CREATE_DB="Do you want to create the database now? (Y/N): "
        if /i "%CREATE_DB%"=="Y" (
            echo.
            echo Creating database...
            echo   (You will be prompted for PostgreSQL password)
            psql -U postgres -c "CREATE DATABASE latari_db;" 2>nul
            if errorlevel 1 (
                echo [ERROR] Failed to create database
                echo   Please create it manually using pgAdmin or psql
            ) else (
                echo [OK] Database created successfully
            )
        )
    ) else (
        echo [OK] Database 'latari_db' exists
    )
)

REM Check .env file
echo [4/4] Checking .env configuration...
if not exist "backend\.env" (
    echo [ERROR] backend\.env file not found!
    echo   Please run run.bat first
    pause
    exit /b 1
)

echo.
echo Current DATABASE_URL:
findstr /C:"DATABASE_URL" "backend\.env"
echo.

echo ========================================
echo    Troubleshooting Steps
echo ========================================
echo.
echo If you're getting authentication errors:
echo.
echo 1. Verify PostgreSQL password:
echo    - Open pgAdmin
echo    - Connect to PostgreSQL server
echo    - Check the password you set during installation
echo.
echo 2. Update backend\.env with correct password:
echo    DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/latari_db"
echo.
echo 3. Make sure database exists:
echo    - Use pgAdmin: Right-click Databases -^> Create -^> Database
echo    - Name it: latari_db
echo    - Or use psql: CREATE DATABASE latari_db;
echo.
echo 4. Test connection manually:
echo    psql -U postgres -d latari_db
echo    (Enter your password when prompted)
echo.
echo 5. If password is wrong, reset it:
echo    psql -U postgres
echo    ALTER USER postgres WITH PASSWORD 'newpassword';
echo    \q
echo    Then update backend\.env with the new password
echo.
echo ========================================
echo.
echo You can also use setup-database.bat to configure DATABASE_URL interactively
echo.
pause
