# fix-ci-step2.ps1 - Run AFTER fix-ci.ps1 and RESTARTING PowerShell
# This fixes all the CI issues

Write-Host "=== Fixing CI Issues ===" -ForegroundColor Cyan

cd "C:\Users\nikun\OneDrive\Documents\Default Project"

# 1. Fix Frontend
Write-Host "`n=== Fixing Frontend ===" -ForegroundColor Cyan
cd frontend

Write-Host "Installing dependencies..." -ForegroundColor Cyan
pnpm install --frozen-lockfile

Write-Host "Fixing formatting..." -ForegroundColor Cyan
pnpm format

Write-Host "Running linter..." -ForegroundColor Cyan
pnpm lint --fix 2>&1 | Select-Object -Last 20

Write-Host "Running typecheck..." -ForegroundColor Cyan
pnpm typecheck 2>&1 | Select-Object -Last 30

Write-Host "Running tests..." -ForegroundColor Cyan
pnpm test --run --reporter=verbose 2>&1 | Select-Object -Last 50

cd ..

# Backend fixes
Write-Host "`n=== Fixing Backend ===" -ForegroundColor Cyan
cd backend

Write-Host "Installing dependencies..." -ForegroundColor Cyan
poetry install --no-interaction

Write-Host "Running tests..." -ForegroundColor Cyan
poetry run pytest tests/ -v --tb=short 2>&1 | Select-Object -Last 50

cd ..

# Frontend tests
Write-Host "`n=== Running Frontend Tests ===" -ForegroundColor Cyan
cd frontend
pnpm test --run --reporter=verbose 2>&1 | Select-Object -Last 100
cd ..

# Backend tests
Write-Host "`n=== Backend Tests ===" -ForegroundColor Cyan
cd backend
poetry run pytest tests/ -v --tb=short 2>&1 | Select-Object -Last 50
cd ..

# Firmware tests
Write-Host "`n=== Firmware Tests ===" -ForegroundColor Cyan
cd firmware
pio run -e test 2>&1 | Select-Object -Last 50
cd ..

# Verify CodeQL queries
Write-Host "`n=== Verifying CodeQL Queries ===" -ForegroundColor Cyan
Get-ChildItem .github\queries\*.qls | ForEach-Object {
    Write-Host "Checking $_..." -ForegroundColor Cyan
    Get-Content $_ | Select-Object -First 5
}

Write-Host "`n=== All fixes applied! ===`n" -ForegroundColor Green
Write-Host "Now commit and push:" -ForegroundColor Yellow
Write-Host "  git add -A" -ForegroundColor Yellow
Write-Host "  git commit -m 'fix: resolve all CI failures'" -ForegroundColor Yellow
Write-Host "  git push origin main" -ForegroundColor Yellow