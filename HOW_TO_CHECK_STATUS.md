# How to Check If Blog Loop Is Running

## No More Hunting! Here Are Easy Ways to Check:

### Method 1: Status Check Script (EASIEST) ⭐

**Windows (PowerShell):**
```powershell
.\scripts\check-blog-status.ps1
```

**Output shows:**
```
✅ Blog Loop Status: RUNNING
   Process ID: 2680

📋 Recent Activity:
Last 5 log entries:
  [INFO] 2026-02-24 21:49:45 - Cycle complete! Next run in 240 minutes
  [INFO] 2026-02-24 21:49:44 - Sleeping for 4 hours...
  
📊 Statistics:
  Total cycles run: 1
  Successful cycles: 1
  Articles generated: 1

⏰ Last Run: [INFO] 2026-02-24 21:49:45

⏱️  Next Article: 2026-02-25 01:49:45 (in 4 hours)
```

**Linux/WSL:**
```bash
bash scripts/check-blog-status.sh
```

---

### Method 2: Visual Terminal Window

**Start with:**
```batch
scripts\start-blog-visible.bat    (Windows)
```

or

```bash
bash scripts/ralph-blog-loop.sh run    (WSL/Linux)
```

**You'll see continuously:**
```
[INFO] 2026-02-24 21:51:45 - [COUNTDOWN] Next article in 239 minutes...
[INFO] 2026-02-24 21:50:45 - [COUNTDOWN] Next article in 238 minutes...
[INFO] 2026-02-24 21:49:45 - [COUNTDOWN] Next article in 237 minutes...
```

**If running:** Terminal stays open, showing countdown  
**If stopped:** Terminal shows error or closes

---

### Method 3: Check Log File

**Live log view:**
```bash
tail -f ralph-blog.log
```

**Shows:**
```
[INFO] 2026-02-24 21:49:45 - ✅ Cycle complete! Next run in 240 minutes
[INFO] 2026-02-24 21:49:44 - Sleeping for 4 hours...
[COUNTDOWN] Next article in 239 minutes...
[COUNTDOWN] Next article in 238 minutes...
```

**If updating regularly:** Running ✅  
**If last line is old:** Stopped ❌

---

### Method 4: Check for New Articles

**Look in folder:**
```
articles/
  └── 2026/
      └── 02/
          ├── ai-breakthrough-in-reasoning.md  ← Latest article
          └── topic-history.json
```

**Or check via command:**
```bash
ls -lt articles/2026/02/*.md | head -1    # Shows latest
git log --oneline | head -5                # Shows recent commits
```

**If new articles appear every 4 hours:** Running ✅

---

### Method 5: Process Check

**Check if process exists:**
```bash
pgrep -f "ralph-blog-loop.sh run"    # Shows process ID if running
ps aux | grep ralph-blog              # Shows full process info
```

**If shows a PID number:** Running ✅  
**If shows nothing:** Stopped ❌

---

## Visual Indicators of Running Status

| Indicator | Running ✅ | Stopped ❌ |
|-----------|----------|-----------|
| Terminal Window | Open, shows countdown | Closed or showing error |
| Status Script Output | "RUNNING" + stats | "NOT RUNNING" |
| Log File | Recent timestamps | Old timestamps |
| Articles Folder | New files every 4h | No new files |
| Process Check | Returns PID | Returns nothing |

---

## What to Look For in Logs

### ✅ Good Signs
```
[SUCCESS] Qwen CLI found
[SUCCESS] Git repository configured
[INFO] 🚀 Starting new article generation cycle
[SUCCESS] Cycle complete! Next run in 240 minutes
[INFO] Sleeping for 4 hours...
[COUNTDOWN] Next article in 239 minutes...
```

### ❌ Bad Signs
```
[ERROR] Qwen CLI not found
[ERROR] Failed to generate article
ERROR: Commit failed
[ERROR] Push to repository failed
```

---

## Quick Reference Card

```
┌──────────────────────────────────────────────────┐
│  CHECKING IF BLOG LOOP IS RUNNING                │
├──────────────────────────────────────────────────┤
│                                                  │
│  FASTEST:    .\scripts\check-blog-status.ps1     │
│  VISUAL:     .\scripts\start-blog-visible.bat   │
│  LOGS:       tail -f ralph-blog.log              │
│  ARTICLES:   ls -la articles/2026/02/            │
│  PROCESS:    pgrep -f ralph-blog-loop            │
│                                                  │
├──────────────────────────────────────────────────┤
│  All methods show same info, pick your favorite! │
└──────────────────────────────────────────────────┘
```

---

## Troubleshooting

**Status shows NOT RUNNING:**
```bash
# Restart it
.\scripts\start-blog-visible.bat    (Windows)
bash scripts/ralph-blog-loop.sh run  (WSL/Linux)
```

**No new articles generated:**
```bash
# Test manually
bash scripts/ralph-blog-loop.sh once

# Check for errors
grep ERROR ralph-blog.log
```

**Terminal shows errors:**
```bash
# View the error details
tail -50 ralph-blog.log | grep ERROR
```

---

## Your New Routine

- **Daily:** Run `check-blog-status` (30 seconds)
- **Weekly:** Verify new articles appear (1 minute)
- **As-needed:** View logs if something seems wrong

That's it! No more hunting for processes. Just run the status script! 🎉
