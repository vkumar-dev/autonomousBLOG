# Blog Loop: Startup & Monitoring Guide

## Quick Start - Visible Terminal Window

### Windows (Easiest)
1. Navigate to the project folder
2. Double-click: `scripts/start-blog-visible.bat`
3. A terminal window opens showing:
   - Blog loop starting
   - Countdown timer
   - Real-time log output

**That's it!** You can see your blog generating articles in real-time.

### WSL/Linux Terminal
```bash
cd /path/to/autonomousBLOG
bash scripts/ralph-blog-loop.sh run
```

The terminal will show live output with timestamps, article generation progress, and status updates.

---

## Checking Status

### Windows (PowerShell)
```powershell
.\scripts\check-blog-status.ps1
```

Shows:
- ✅/❌ Running status
- 📋 Recent activity
- 📊 Statistics (runs, articles, etc.)
- ⏰ Last run time
- ⏱️ Next scheduled run

### WSL/Linux
```bash
bash scripts/check-blog-status.sh
```

Same information, formatted for terminal.

---

## Knowing It's Running

### Visual Indicators

**Terminal Window Open:**
- If you see the terminal window with your startup command, it's running
- Terminal title shows: "Ralph Blog Loop - Press Ctrl+C to Stop"

**Status Check:**
```bash
# Quick check
bash scripts/check-blog-status.sh

# Or PowerShell
.\scripts\check-blog-status.ps1
```

### Real-time Monitoring

**View logs in real-time:**
```bash
# Linux/WSL
tail -f ralph-blog.log

# Windows PowerShell
wsl tail -f ralph-blog.log
```

**Watch for messages:**
- `[SUCCESS] Qwen CLI found` - Setup check passed
- `[INFO] 🚀 Starting new article generation cycle` - Cycle began
- `[INFO] Generating new article using Qwen...` - Creating content
- `[SUCCESS] Cycle complete!` - Article done
- `[INFO] Sleeping for 4 hours...` - Waiting for next run

---

## Autostart Setup

### Windows Startup Folder
1. Copy `scripts/start-blog-visible.bat` to Windows Startup folder:
   - Press `Win+R`
   - Type: `shell:startup`
   - Paste the .bat file

2. On next restart, terminal window opens automatically

### WSL/Linux (Already Configured)
Configured via crontab `@reboot`:
```bash
crontab -l  # View entries
```

---

## Common Tasks

### Start Blog Loop (Visible)
**Windows:**
```batch
scripts\start-blog-visible.bat
```

**WSL:**
```bash
bash scripts/ralph-blog-loop.sh run
```

### Check If Running
**Windows:**
```powershell
.\scripts\check-blog-status.ps1
```

**WSL:**
```bash
bash scripts/check-blog-status.sh
```

### View Live Logs
**Windows:**
```powershell
wsl tail -f ralph-blog.log
```

**WSL:**
```bash
tail -f ralph-blog.log
```

### Stop Blog Loop
**In Terminal:**
- Press `Ctrl+C`

**From PowerShell:**
```powershell
wsl pkill -f "ralph-blog-loop.sh run"
```

### Run One Article (Test)
```bash
bash scripts/ralph-blog-loop.sh once
```

---

## Monitoring Dashboard

### What to Check Regularly

**Daily Check (30 seconds):**
```powershell
.\scripts\check-blog-status.ps1
```

This shows:
- ✅ Running or ❌ Not running
- Last 5 log entries
- Total articles generated
- Next article time

### Expected Log Output

```
[INFO] =========================================
[INFO] 🤖 Ralph Blog Loop Starting...
[INFO] =========================================
[SUCCESS] Qwen CLI found
[SUCCESS] Git repository configured
[INFO] Starting main loop...
[INFO] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[INFO] 🚀 Starting new article generation cycle
[INFO] Generating new article using Qwen...
[SUCCESS] Article generation complete
[SUCCESS] Cycle complete! Next run in 240 minutes
[INFO] Sleeping for 4 hours...
[COUNTDOWN] Next article in 239 minutes...
```

---

## If Something Goes Wrong

### Blog Loop Not Running
```powershell
# Check status
.\scripts\check-blog-status.ps1

# Manual restart
.\scripts\start-blog-visible.bat
```

### Check Logs for Errors
```powershell
# View last 20 lines
wsl tail -20 ralph-blog.log

# Search for errors
wsl grep ERROR ralph-blog.log
```

### Verify Setup
```bash
# Test script
bash scripts/ralph-blog-loop.sh check

# View git config
git remote -v
git config user.name
```

### Check GitHub Deployment
```powershell
# View latest articles
git log --oneline | head -10

# Check articles folder
ls articles/
```

---

## Advanced Monitoring

### Set Up Log Rotation (Optional)
```bash
# Keep recent logs only
cd /path/to/autonomousBLOG
tail -n 10000 ralph-blog.log > ralph-blog.log.bak
echo "" > ralph-blog.log
```

### Monitor Multiple Instances
```bash
# View all blog processes
wsl ps aux | grep ralph-blog

# Monitor in real-time
wsl watch -n 1 'ps aux | grep ralph-blog'
```

### Schedule Status Checks
**PowerShell Scheduled Task:**
```powershell
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-NoProfile -File C:\path\to\check-blog-status.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At 9:00AM
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "Check Blog Status"
```

---

## Summary

**To Start:**
1. Windows: `scripts\start-blog-visible.bat`
2. WSL: `bash scripts/ralph-blog-loop.sh run`

**To Check Status:**
1. Windows: `.\scripts\check-blog-status.ps1`
2. WSL: `bash scripts/check-blog-status.sh`

**To Monitor:**
- Keep terminal window visible, OR
- Run status check script every so often, OR
- Watch logs with `tail -f ralph-blog.log`

**You'll Know It's Running:**
- ✅ Terminal window is open
- ✅ Status script shows "RUNNING"
- ✅ Log file has recent entries
- ✅ New articles appear in `articles/` folder

That's it! Your blog loop is self-contained and will continue running independently.
