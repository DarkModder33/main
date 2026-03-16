# PowerShell Script: Sync .env.unified to Vercel Environment (Production)
# Requires: Vercel CLI (vercel login), PowerShell 5+, and .env.unified in project root

$envFile = "C:\tradez\main\.env.unified"
$projectDir = "C:\tradez\main\web"

# Read .env.unified and parse key-value pairs
$lines = Get-Content $envFile | Where-Object { $_ -notmatch '^\s*#' -and $_ -match '=' }

# Set each variable in Vercel (production scope)
foreach ($line in $lines) {
    $parts = $line -split '=', 2
    $key = $parts[0].Trim()
    $value = $parts[1].Trim('"')
    if ($key -and $value -ne $null) {
        Write-Host "Setting $key in Vercel..." -ForegroundColor Cyan
        Push-Location $projectDir
        vercel env add $key production <# Simulate input #>
        Pop-Location
    }
}

Write-Host "\nAll variables from .env.unified have been processed.\n" -ForegroundColor Green
Write-Host "IMPORTANT: For secrets, you may be prompted to paste values manually.\nIf a variable already exists, Vercel will ask to overwrite or skip.\n" -ForegroundColor Yellow
Write-Host "You can also use 'vercel env pull' to verify current Vercel environment."

