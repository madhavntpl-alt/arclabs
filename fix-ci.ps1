# fix-ci.ps1 - Run this in PowerShell as Administrator
# Fixes all CI issues for ARC LABS Monitoring Platform

Write-Host "=== ARC LABS CI Fix Script ===" -ForegroundColor Cyan
Write-Host "This script will install all required tools and fix CI issues" -ForegroundColor Yellow

# Check if running as Admin
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Warning "Please run PowerShell as Administrator"
    exit 1
}

# Install Chocolatey if not present
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Chocolatey..." -ForegroundColor Cyan
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    refreshenv
}

# Install required tools
Write-Host "Installing required tools..." -ForegroundColor Cyan

# Install Node.js (via nvm-windows)
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Node.js via nvm..." -ForegroundColor Cyan
    choco install nvm -y
    refreshenv
    nvm install 20
    nvm use 20
}

# Install pnpm
if (!(Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "Installing pnpm..." -ForegroundColor Cyan
    npm install -g pnpm
}

# Install Python + Poetry
if (!(Get-Command poetry -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Python + Poetry..." -ForegroundColor Cyan
    choco install python -y --version=3.11
    refreshenv
    pip install pipx
    pipx ensurepath
    refreshenv
    pipx install poetry
    $env:PATH += ";$env:USERPROFILE\.local\bin"
}

# Install PlatformIO
if (-not (Get-Command pio -ErrorAction SilentlyContinue)) {
    Write-Host "Installing PlatformIO..." -ForegroundColor Cyan
    pipx install platformio
    refreshenv
}

# Install act for local CI testing
if (-not (Get-Command act -ErrorAction SilentlyContinue)) {
    Write-Host "Installing act..." -ForegroundColor Cyan
    choco install act -y
    refreshenv
}

# Install Trivy
if (-not (Get-Command trivy -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Trivy..." -ForegroundColor Cyan
    choco install trivy -y
    refreshenv
}

Write-Host "`n=== All tools installed! ===`n" -ForegroundColor Green
Write-Host "Please RESTART PowerShell and run the next script" -ForegroundColor Yellow