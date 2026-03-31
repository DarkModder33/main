param(
    [Parameter(Mandatory=$true)]
    [string]$Domain
)

# Map domain to env file
$envFile = ".env.local.$($Domain.Split('.')[-1])"
if (!(Test-Path $envFile)) {
    Write-Error "Environment file $envFile not found."
    exit 1
}

# Copy env file
Copy-Item -Path $envFile -Destination .env.local -Force
Write-Host "Copied $envFile to .env.local"

# Install dependencies (optional, uncomment if needed)
# npm install

# Build
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed."
    exit 1
}

# Deploy
$npxResult = npx vercel --prod
Write-Host $npxResult

Write-Host "Deployment complete. Check your Vercel dashboard to assign $Domain to the latest deployment if not automatic."

