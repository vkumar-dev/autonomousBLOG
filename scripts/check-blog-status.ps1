# Blog Loop Status Checker (PowerShell)
# Shows if blog loop is running and recent activity
# Run from PowerShell: .\scripts\check-blog-status.ps1

$ProjectDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$LogFile = Join-Path $ProjectDir "ralph-blog.log"
$ArticlesDir = Join-Path $ProjectDir "articles"

# Display header
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Ralph Blog Loop - Status Report                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if running via WSL
$IsRunning = $false
try {
    $Output = wsl pgrep -f "ralph-blog-loop.sh run" 2>$null
    if ($Output) {
        $IsRunning = $true
        $PID = $Output.Split("`n")[0]
    }
} catch {
    # Try alternative check
}

if ($IsRunning) {
    Write-Host "✅ Blog Loop Status: RUNNING" -ForegroundColor Green
    Write-Host "   Process ID: $PID" -ForegroundColor Green
} else {
    Write-Host "❌ Blog Loop Status: NOT RUNNING" -ForegroundColor Red
    Write-Host ""
    Write-Host "To start the blog loop:" -ForegroundColor Yellow
    Write-Host "  • Visual window: Run .\scripts\start-blog-visible.bat" -ForegroundColor Yellow
    Write-Host "  • WSL terminal: wsl bash scripts/ralph-blog-loop.sh run" -ForegroundColor Yellow
}

Write-Host ""

# Check log file
if (-not (Test-Path $LogFile)) {
    Write-Host "⚠️  No log file found yet" -ForegroundColor Yellow
    Write-Host "   First run hasn't occurred"
} else {
    Write-Host "📋 Recent Activity:" -ForegroundColor Cyan
    Write-Host ""
    
    # Show last 5 entries
    Write-Host "Last 5 log entries:"
    Get-Content $LogFile -Tail 5 | ForEach-Object { Write-Host "  $_" }
    Write-Host ""
    
    # Extract stats
    $LogContent = Get-Content $LogFile
    $TotalRuns = @($LogContent | Select-String "Starting new article generation cycle").Count
    $SuccessfulRuns = @($LogContent | Select-String "Cycle complete").Count
    $ArticleCount = @(Get-ChildItem -Path $ArticlesDir -Recurse -Filter "*.md" -ErrorAction SilentlyContinue).Count
    
    Write-Host "📊 Statistics:" -ForegroundColor Cyan
    Write-Host "  Total cycles run: $TotalRuns"
    Write-Host "  Successful cycles: $SuccessfulRuns"
    Write-Host "  Articles generated: $ArticleCount"
    Write-Host ""
    
    # Last run
    $LastRun = $LogContent | Select-String "Starting new article generation cycle" | Select-Object -Last 1
    if ($LastRun) {
        Write-Host "⏰ Last Run: " -ForegroundColor Cyan -NoNewline
        Write-Host $LastRun.Line
    }
    Write-Host ""
}

# Next run
$NextRun = (Get-Date).AddHours(4)
$NextRunStr = $NextRun.ToString("yyyy-MM-dd HH:mm:ss")
Write-Host "⏱️  Next Article: $NextRunStr (in 4 hours)" -ForegroundColor Cyan
Write-Host ""

# Quick commands
Write-Host "📌 Quick Commands:" -ForegroundColor Cyan
Write-Host "  • View logs live:  wsl tail -f ralph-blog.log"
Write-Host "  • Check status:    .\scripts\check-blog-status.ps1"
Write-Host "  • Run once (test): wsl bash scripts/ralph-blog-loop.sh once"
Write-Host "  • View git log:    git log --oneline | head -20"
Write-Host ""

Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
