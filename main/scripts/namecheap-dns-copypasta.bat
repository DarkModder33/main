@echo off
setlocal

REM Wrapper for PowerShell Namecheap DNS helper
REM Usage:
REM   namecheap-dns-copypasta.bat print
REM   namecheap-dns-copypasta.bat verify
REM   namecheap-dns-copypasta.bat api

set "SCRIPT_DIR=%~dp0"
set "PS_SCRIPT=%SCRIPT_DIR%namecheap-dns-copypasta.ps1"
set "CMD=%~1"

if "%CMD%"=="" set "CMD=print"

if not exist "%PS_SCRIPT%" (
  echo ERROR: Missing script: "%PS_SCRIPT%"
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%" -Command %CMD%
exit /b %ERRORLEVEL%

