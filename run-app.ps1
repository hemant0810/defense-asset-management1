# DEFENSE ASSET OPS - PowerShell Launcher
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "     DEFENSE ASSET OPS - MILITARY ASSET MANAGEMENT SYSTEM LAUNCHER             " -ForegroundColor Cyan
Write-Host "===============================================================================" -ForegroundColor Cyan

# 1. Java check
if (-not $env:JAVA_HOME) {
    if (Test-Path "C:\Program Files\Java\jdk-25.0.2") {
        $env:JAVA_HOME = "C:\Program Files\Java\jdk-25.0.2"
    }
}
$javaBin = if ($env:JAVA_HOME) { "$env:JAVA_HOME\bin\java.exe" } else { "java" }

# 2. Node check
if (Test-Path "c:\vssss\.tools\node") {
    $env:PATH = "c:\vssss\.tools\node;$env:PATH"
}

# 3. JAR check
$jarPath = "c:\vssss\backend\target\asset-management-system-1.0.0.jar"
if (-not (Test-Path $jarPath)) {
    Write-Host "[INFO] Backend JAR not found. Building package using Maven..." -ForegroundColor Yellow
    $env:PATH = "c:\vssss\.tools\apache-maven-3.9.9\bin;$env:JAVA_HOME\bin;$env:PATH"
    Push-Location "c:\vssss\backend"
    & mvn package -DskipTests -o
    Pop-Location
}

Write-Host "[1/2] Starting Backend on http://localhost:8080 ..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "& '$javaBin' -jar '$jarPath' --spring.profiles.active=h2"

Write-Host "[2/2] Starting Frontend on http://localhost:5173 ..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd 'c:\vssss\frontend'; `$env:PATH = 'c:\vssss\.tools\node;' + `$env:PATH; npm run dev"

Start-Sleep -Seconds 5
Write-Host "Launching Browser at http://localhost:5173 ..." -ForegroundColor Cyan
Start-Process "http://localhost:5173"
