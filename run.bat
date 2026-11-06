@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
    echo Node.js was not found. Install Node.js, then run this file again.
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo npm was not found. Install Node.js with npm, then run this file again.
    pause
    exit /b 1
)

if not defined PORT set "PORT=3000"

if not exist "server\node_modules\express\package.json" (
    echo Installing project dependencies...
    pushd "server"
    call npm.cmd install
    if errorlevel 1 (
        echo Dependency installation failed.
        popd
        pause
        exit /b 1
    )
    popd
)

powershell -NoProfile -Command "$client = New-Object System.Net.Sockets.TcpClient; try { $client.Connect('127.0.0.1', [int]$env:PORT); exit 0 } catch { exit 1 } finally { $client.Dispose() }"
if not errorlevel 1 (
    echo Smart Ambulance Dispatch is already running at http://localhost:%PORT%
    exit /b 0
)

echo Starting Smart Ambulance Dispatch at http://localhost:%PORT%
echo Press Ctrl+C to stop the server.
node "server\server.js"
if errorlevel 1 (
    echo The server exited with an error.
    pause
    exit /b 1
)
