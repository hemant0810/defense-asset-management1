@echo off
setlocal enabledelayedexpansion
title DEFENSE ASSET OPS - Launch Orchestrator

echo ===============================================================================
echo      DEFENSE ASSET OPS - MILITARY ASSET MANAGEMENT SYSTEM LAUNCHER
echo ===============================================================================
echo.

:: 1. Setup Java Environment
if defined JAVA_HOME (
    set "JAVA_BIN=%JAVA_HOME%\bin\java.exe"
) else (
    if exist "C:\Program Files\Java\jdk-25.0.2\bin\java.exe" (
        set "JAVA_HOME=C:\Program Files\Java\jdk-25.0.2"
        set "JAVA_BIN=C:\Program Files\Java\jdk-25.0.2\bin\java.exe"
    ) else (
        set "JAVA_BIN=java"
    )
)

:: 2. Setup Node Environment
if exist "c:\vssss\.tools\node\node.exe" (
    set "PATH=c:\vssss\.tools\node;%PATH%"
)

:: 3. Check / Build Backend JAR if missing
if not exist "backend\target\asset-management-system-1.0.0.jar" (
    echo [INFO] Backend JAR not found. Building package using Maven...
    set "PATH=c:\vssss\.tools\apache-maven-3.9.9\bin;%JAVA_HOME%\bin;%PATH%"
    cd backend
    call mvn package -DskipTests -o
    cd ..
)

echo.
echo [1/3] Launching Spring Boot Backend Service on http://localhost:8080 ...
:: Default profile uses standalone embedded mode (H2 with MySQL syntax mode) for guaranteed instant startup
:: To switch to external MySQL, pass --spring.profiles.active=default
start "Asset Management Backend [Port 8080]" cmd /k "title Backend (Port 8080) && "%JAVA_BIN%" -jar backend\target\asset-management-system-1.0.0.jar --spring.profiles.active=h2"

echo.
echo [2/3] Launching Vite Frontend Dev Server on http://localhost:5173 ...
start "Asset Management Frontend [Port 5173]" cmd /k "title Frontend (Port 5173) && cd frontend && npm run dev"

echo.
echo [3/3] Waiting for services to initialize...
timeout /t 5 >nul

echo.
echo ===============================================================================
echo SYSTEM READY:
echo - Frontend:  http://localhost:5173
echo - Backend:   http://localhost:8080
echo - Database:  Embedded H2 Console at http://localhost:8080/h2-console
echo.
echo DEFAULT CREDENTIALS:
echo 1. ADMIN:              admin / admin123
echo 2. BASE COMMANDER:     commander_alpha / commander123
echo 3. LOGISTICS OFFICER:  logistics_officer / logistics123
echo ===============================================================================
echo.
echo Opening browser...
start http://localhost:5173
echo.
echo Press any key to exit this launcher window (services will stay running in background).
pause >nul
