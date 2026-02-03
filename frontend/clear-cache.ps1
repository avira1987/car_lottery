# Clear Next.js cache
Write-Host "Clearing Next.js cache..." -ForegroundColor Yellow

if (Test-Path .next) {
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    Write-Host "Cache cleared!" -ForegroundColor Green
} else {
    Write-Host "No cache found." -ForegroundColor Gray
}

Write-Host "`nYou can now run: npm run dev" -ForegroundColor Cyan
