@echo off
chcp 65001 >nul 2>&1
REM Smart Run script for Latari Project
REM Automatically detects Docker and uses it if available, otherwise uses local PostgreSQL
REM This script keeps the window open after execution

echo ========================================
echo    Starting Latari Project
echo ========================================
echo.

REM Check Node.js and npm first (required for both modes)
echo [1/6] Checking Node.js and npm...
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found! Please install Node.js.
    echo   Download from: https://nodejs.org/
    pause
    exit /b 1
)
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm not found! Please install Node.js.
    pause
    exit /b 1
)
echo [OK] Node.js found
echo [OK] npm found

REM Check Docker availability
echo [2/6] Checking Docker...
set USE_DOCKER=0
docker --version >nul 2>&1
if errorlevel 1 (
    echo [INFO] Docker not found - will use local PostgreSQL
    echo   Make sure PostgreSQL is installed and running locally
    goto :noDocker
)

REM Docker found - check docker-compose
set USE_DOCKER=1
echo [OK] Docker found

set USE_DOCKER_COMPOSE_V2=0
docker-compose --version >nul 2>&1
if errorlevel 1 (
    docker compose version >nul 2>&1
    if errorlevel 1 (
        echo [WARN] Docker Compose not found - will use local PostgreSQL
        set USE_DOCKER=0
        goto :noDocker
    )
    set USE_DOCKER_COMPOSE_V2=1
    echo [OK] Docker Compose found (docker compose)
) else (
    echo [OK] Docker Compose found (docker-compose)
)

REM Start Docker services
echo [3/6] Starting Docker services (PostgreSQL and Redis)...
if %USE_DOCKER_COMPOSE_V2%==1 (
    docker compose up -d
) else (
    docker-compose up -d
)
if errorlevel 1 (
    echo [WARN] Failed to start Docker Compose - will use local PostgreSQL
    set USE_DOCKER=0
    goto :noDocker
)
echo [OK] Docker services started
echo   Waiting for database to be ready...

REM Wait for database to be ready
set /a attempt=0
set /a maxAttempts=30
set dbReady=0

:waitForDb
if %attempt% geq %maxAttempts% goto dbTimeout
timeout /t 2 /nobreak >nul
set /a attempt+=1
docker exec latari_postgres pg_isready -U latari_user >nul 2>&1
if errorlevel 1 (
    echo   Attempt %attempt%/%maxAttempts%...
    goto waitForDb
)
set dbReady=1
echo [OK] Database is ready
goto :setup

:dbTimeout
echo [WARN] Database did not become ready - will use local PostgreSQL
set USE_DOCKER=0
goto :noDocker

:noDocker
echo [INFO] Using local PostgreSQL mode
echo   Please ensure PostgreSQL is running and DATABASE_URL is correct in backend\.env

:setup
REM Check .env file
echo [4/6] Checking environment files...
if not exist "backend\.env" (
    echo [WARN] .env file not found. Copying from .env.example...
    copy "backend\.env.example" "backend\.env" >nul
    echo [OK] .env file created.
    if %USE_DOCKER%==0 (
        echo.
        echo [IMPORTANT] Please edit backend\.env and set your DATABASE_URL
        echo   Format: postgresql://username:password@localhost:port/database
        echo.
        echo   Make sure PostgreSQL is installed and running
        echo   Database exists and user has proper permissions
        echo.
        pause
    )
)

REM Check if DATABASE_URL points to Docker credentials when Docker is not available
if %USE_DOCKER%==0 (
    if exist "backend\.env" (
        findstr /C:"latari_user" "backend\.env" >nul 2>&1
        if not errorlevel 1 (
            echo [WARN] DATABASE_URL in .env appears to use Docker credentials
            echo   Please update backend\.env with your local PostgreSQL credentials
            echo.
            echo   Press any key to continue anyway...
            pause
        )
    )
)

REM Install Backend dependencies
echo [5/6] Checking Backend dependencies...
if not exist "backend\node_modules" (
    echo   Installing Backend dependencies...
    cd backend
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install Backend dependencies!
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo [OK] Backend dependencies installed
) else (
    echo [OK] Backend dependencies exist
)

REM Install Frontend dependencies
if not exist "frontend\node_modules" (
    echo   Installing Frontend dependencies...
    cd frontend
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install Frontend dependencies!
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo [OK] Frontend dependencies installed
) else (
    echo [OK] Frontend dependencies exist
)

REM Generate Prisma Client and run Migrations
echo [6/6] Setting up database (Prisma)...
cd backend
call npm run prisma:generate
if errorlevel 1 (
    echo [ERROR] Failed to generate Prisma Client!
    cd ..
    pause
    exit /b 1
)

echo   Running database migrations...
call npm run prisma:migrate >migration_output.txt 2>&1
set MIGRATION_ERROR=%errorlevel%
findstr /C:"Already in sync" migration_output.txt >nul
set MIGRATION_IN_SYNC=%errorlevel%
type migration_output.txt
del migration_output.txt >nul 2>&1
if %MIGRATION_IN_SYNC%==0 (
    REM "Already in sync" - this is success, ignore exit code
    echo [OK] Database migrations completed successfully (already in sync)
    goto :migration_success
)
if %MIGRATION_ERROR% neq 0 (
    REM Migration failed and not "Already in sync"
    if %USE_DOCKER%==0 (
        echo.
        echo [ERROR] Migration failed!
        echo.
        echo Common issues and solutions:
        echo   1. Check DATABASE_URL in backend\.env
        echo      Current: 
        findstr /C:"DATABASE_URL" "backend\.env" 2>nul
        echo.
        echo   2. Make sure PostgreSQL is running:
        echo      - Check Windows Services (services.msc)
        echo      - Look for PostgreSQL service and start it if stopped
        echo.
        echo   3. Verify database exists:
        echo      - Open pgAdmin
        echo      - Connect to PostgreSQL server
        echo      - Check if 'latari_db' database exists
        echo      - If not, create it: Right-click Databases -^> Create -^> Database
        echo.
        echo   4. Test connection manually:
        echo      psql -U postgres -d latari_db
        echo      (Enter password when prompted)
        echo      If connection works, the issue is with Prisma migration
        echo.
        echo   5. Verify credentials:
        echo      - Username: postgres (or your PostgreSQL username)
        echo      - Password: Check backend\.env DATABASE_URL
        echo      - Database: latari_db
        echo      - Port: 5432 (or your PostgreSQL port)
        echo.
        echo TIP: You can use setup-postgres.bat for automatic setup
        echo      Run: setup-postgres.bat
        echo.
        echo      Or use setup-database.bat to configure DATABASE_URL interactively
        echo      Run: setup-database.bat
        echo.
        echo For detailed instructions, see: SETUP-WITHOUT-DOCKER.md
        echo.
        cd ..
        pause
        exit /b 1
    ) else (
        echo [WARN] Migration error (may have already been run)
        echo   Continuing anyway...
        goto :migration_success
    )
) else (
    REM Exit code is 0, migration successful
    echo [OK] Database migrations completed successfully
)
:migration_success
cd ..

REM Note: Database connection will be tested when services start
if %USE_DOCKER%==0 (
    echo [INFO] Using local PostgreSQL - ensure it's running
)

echo.
echo ========================================
echo    Starting Services
echo ========================================
echo.

REM Check if backend directory exists
if not exist "backend" (
    echo [ERROR] Backend directory not found!
    pause
    exit /b 1
)

REM Check if frontend directory exists
if not exist "frontend" (
    echo [ERROR] Frontend directory not found!
    pause
    exit /b 1
)

REM Start Backend
echo [START] Starting Backend on port 3001...
start "Latari Backend" cmd /k "cd /d %~dp0backend && npm run start:dev"
if errorlevel 1 (
    echo [ERROR] Failed to start Backend!
    pause
    exit /b 1
)

REM Wait a bit for Backend to start
echo   Waiting for Backend to initialize...
ping 127.0.0.1 -n 4 >nul

REM Start Frontend
echo [START] Starting Frontend on port 3000...
start "Latari Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
if errorlevel 1 (
    echo [ERROR] Failed to start Frontend!
    pause
    exit /b 1
)

REM Wait a moment for services to start
ping 127.0.0.1 -n 3 >nul

echo.
echo ========================================
echo    [SUCCESS] Project started successfully!
echo ========================================
echo.
echo Backend is starting on port 3001
echo Frontend is starting on port 3000
echo.
echo URLs:
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:3001
echo.
if %USE_DOCKER%==1 (
    echo Mode: Docker (PostgreSQL + Redis)
    echo.
    echo To stop Docker services, run:
    if %USE_DOCKER_COMPOSE_V2%==1 (
        echo   docker compose down
    ) else (
        echo   docker-compose down
    )
) else (
    echo Mode: Local PostgreSQL
    echo   Make sure PostgreSQL is running locally
)
echo.
echo ========================================
echo    Services are running in separate windows
echo ========================================
echo.
echo The Backend and Frontend are running in separate Command Prompt windows.
echo You can see their logs in those windows.
echo.
echo To stop services:
echo   1. Close the Backend window (Ctrl+C or close window)
echo   2. Close the Frontend window (Ctrl+C or close window)
echo.
if %USE_DOCKER%==1 (
    echo To stop Docker services:
    if %USE_DOCKER_COMPOSE_V2%==1 (
        echo   docker compose down
    ) else (
        echo   docker-compose down
    )
    echo.
)
echo ========================================
echo    Press any key to close this window
echo    (Services will continue running in separate windows)
echo ========================================
pause >nul
