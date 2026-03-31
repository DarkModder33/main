# PowerShell Setup: Vercel Environment Variables
# Usage: .\scripts\setup-vercel-env.ps1

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "TradeHax Vercel Environment Setup" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will add your API keys to Vercel securely." -ForegroundColor Yellow
Write-Host "Your keys will NOT be stored in Git." -ForegroundColor Yellow
Write-Host ""

# Check if logged in to Vercel
try {
    $vercelOutput = & npx vercel whoami 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Not logged into Vercel. Run:" -ForegroundColor Red
        Write-Host "   npx vercel login" -ForegroundColor Gray
        exit 1
    }
    Write-Host "✅ Logged in as: $vercelOutput" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Vercel CLI not found. Install with:" -ForegroundColor Red
    Write-Host "   npm i -g vercel" -ForegroundColor Gray
    exit 1
}

# Define required keys with descriptions
$envVars = @(
    @{
        key = "HF_API_TOKEN"
        desc = "Hugging Face API Token (https://huggingface.co/settings/tokens)"
        optional = $false
    },
    @{
        key = "OPENAI_API_KEY"
        desc = "OpenAI API Key (https://platform.openai.com/api-keys)"
        optional = $true
    },
    @{
        key = "SUPABASE_URL"
        desc = "Supabase Project URL (https://supabase.com/dashboard)"
        optional = $true
    },
    @{
        key = "SUPABASE_SERVICE_ROLE_KEY"
        desc = "Supabase Service Role Key"
        optional = $true
    },
    @{
        key = "FINNHUB_API_KEY"
        desc = "Finnhub API Key (https://finnhub.io/dashboard)"
        optional = $true
    }
)

Write-Host "📝 Environment variables to configure:" -ForegroundColor Cyan
Write-Host ""
for ($i = 0; $i -lt $envVars.Count; $i++) {
    $var = $envVars[$i]
    $required = if ($var.optional) { "[OPTIONAL]" } else { "[REQUIRED]" }
    Write-Host "$($i+1). $($var.key) $required"
    Write-Host "   $($var.desc)" -ForegroundColor DarkGray
    Write-Host ""
}

$continue = Read-Host "Proceed with Vercel setup? (y/n)"
if ($continue -ne "y" -and $continue -ne "Y") {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Setting variables in Vercel..." -ForegroundColor Cyan
Write-Host ""

$setCount = 0
$skippedCount = 0

foreach ($var in $envVars) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host "Enter: $($var.key)" -ForegroundColor White
    Write-Host "$($var.desc)" -ForegroundColor DarkGray

    # Read securely for sensitive values
    if ($var.key -like "*KEY" -or $var.key -like "*TOKEN" -or $var.key -like "*SECRET") {
        $value = Read-Host "Value (will be hidden)" -AsSecureString
        $plainValue = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($value))
    } else {
        $plainValue = Read-Host "Value"
    }

    Write-Host ""

    if (![string]::IsNullOrWhiteSpace($plainValue)) {
        try {
            # Set in Vercel for production
            $env:VERCEL_TOKEN_SILENT = $true
            & npx vercel env add $var.key "$plainValue" > $null 2>&1

            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ $($var.key) configured" -ForegroundColor Green
                $setCount++
            } else {
                Write-Host "⚠️  Failed to set $($var.key)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "⚠️  Error setting $($var.key): $_" -ForegroundColor Yellow
        }
    } else {
        if ($var.optional) {
            Write-Host "⏭️  Skipped (empty value)" -ForegroundColor Gray
            $skippedCount++
        } else {
            Write-Host "❌ REQUIRED: $($var.key) cannot be empty" -ForegroundColor Red
        }
    }
    Write-Host ""
}

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host "  Variables set: $setCount" -ForegroundColor Green
Write-Host "  Variables skipped: $skippedCount" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Verify: npx vercel env ls" -ForegroundColor Gray
Write-Host "  2. Deploy: npm run deploy:tech" -ForegroundColor Gray
Write-Host ""
Write-Host "Learn more: https://vercel.com/docs/environment-variables" -ForegroundColor DarkGray

