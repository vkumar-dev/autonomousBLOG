# Ralph Blog Loop - Setup Guide

🤖 Autonomous blog publisher that runs every 4 hours.

## Quick Start

### 1. Make the Script Executable

```bash
chmod +x scripts/ralph-blog-loop.sh
```

### 2. Run Pre-flight Checks

```bash
./scripts/ralph-blog-loop.sh check
```

### 3. Test a Single Run

```bash
./scripts/ralph-blog-loop.sh once
```

### 4. Start the Continuous Loop

```bash
./scripts/ralph-blog-loop.sh run
```

## Windows Startup Setup

### Option A: Using the Batch File

1. **Copy the batch file to Startup folder:**
   ```
   Press Win+R
   Type: shell:startup
   Press Enter
   Copy: scripts\start-ralph-blog.bat
   ```

2. **Ensure Git Bash is installed** (required for the batch file)
   - Download from: https://git-scm.com/downloads

3. **Restart your computer** - the loop will start automatically

### Option B: Using Task Scheduler

1. Open Task Scheduler
2. Create Basic Task → "Ralph Blog Loop"
3. Trigger: "When I log on"
4. Action: "Start a program"
5. Program: `C:\Program Files\Git\bin\bash.exe`
6. Arguments: `-c "cd /d/autonomousBLOG && bash scripts/ralph-blog-loop.sh run"`
7. Start in: `C:\path\to\autonomousBLOG`

### Option C: Using WSL (Windows Subsystem for Linux)

```bash
# Add to ~/.bashrc or create a systemd service
echo "cd /path/to/autonomousBLOG && bash scripts/ralph-blog-loop.sh run &" >> ~/.bashrc
```

## Linux/Mac Startup Setup

### Option A: Using systemd (Linux)

Create `/etc/systemd/system/ralph-blog.service`:

```ini
[Unit]
Description=Ralph Blog Loop
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/autonomousBLOG
ExecStart=/path/to/autonomousBLOG/scripts/ralph-blog-loop.sh run
Restart=always

[Install]
WantedBy=multi-user.target
```

Then enable and start:
```bash
sudo systemctl enable ralph-blog
sudo systemctl start ralph-blog
```

### Option B: Using cron

```bash
# Edit crontab
crontab -e

# Add this line to run every 4 hours
0 */4 * * * cd /path/to/autonomousBLOG && ./scripts/ralph-blog-loop.sh once
```

### Option C: Using nohup

```bash
nohup ./scripts/ralph-blog-loop.sh run > ralph-blog.log 2>&1 &
```

## Configuration

### Change the Interval

Edit `scripts/ralph-blog-loop.sh`:
```bash
INTERVAL_SECONDS=14400  # Change this (14400 = 4 hours)
```

### Customize Git User

The script sets a default bot user. To use your own:
```bash
git config user.name "Your Name"
git config user.email "your@email.com"
```

### Modify Content Generation

Edit `BLOG_GENERATION_PRD.md` to change:
- Content priorities
- Writing style
- Article format requirements

## Troubleshooting

### Qwen CLI Not Found

```bash
# Verify Qwen is installed
which qwen

# If not found, install Qwen CLI
```

### Git Push Fails

1. **Check remote is configured:**
   ```bash
   git remote -v
   ```

2. **Add remote if missing:**
   ```bash
   git remote add origin https://github.com/username/autonomousBLOG.git
   ```

3. **Set up authentication:**
   - Use SSH keys, or
   - Use GitHub Personal Access Token

### Articles Not Generating

1. Check the PRD file exists: `ls BLOG_GENERATION_PRD.md`
2. Test Qwen manually: `cat BLOG_GENERATION_PRD.md | qwen -y -p`
3. Check Qwen version: `qwen --version`

## Script Commands

| Command | Description |
|---------|-------------|
| `./scripts/ralph-blog-loop.sh run` | Start continuous loop (default) |
| `./scripts/ralph-blog-loop.sh once` | Run single generation cycle |
| `./scripts/ralph-blog-loop.sh check` | Run pre-flight checks |
| `./scripts/ralph-blog-loop.sh help` | Show help message |

## File Structure

```
autonomousBLOG/
├── BLOG_GENERATION_PRD.md    # Product requirements for article generation
├── scripts/
│   ├── ralph-blog-loop.sh    # Main loop script (Linux/Mac/WSL)
│   └── start-ralph-blog.bat  # Windows startup script
└── articles/                  # Generated articles stored here
```

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│  Ralph Blog Loop (Every 4 Hours)                        │
├─────────────────────────────────────────────────────────┤
│  1. Read PRD file                                       │
│  2. Pipe PRD to Qwen CLI                                │
│  3. Qwen generates HTML article                         │
│  4. Article saved to articles/ directory                │
│  5. Git commit with auto-generated message              │
│  6. Push to remote repository                           │
│  7. Sleep for 4 hours                                   │
│  8. Repeat                                              │
└─────────────────────────────────────────────────────────┘
```

## Best Practices

1. **Run in a screen/tmux session** (Linux/Mac):
   ```bash
   tmux new -s ralph-blog
   ./scripts/ralph-blog-loop.sh run
   # Detach with Ctrl+B, D
   ```

2. **Monitor the logs:**
   ```bash
   tail -f ralph-blog.log  # If using nohup
   ```

3. **Check generated articles:**
   ```bash
   ls -la articles/
   ```

4. **Stop gracefully:**
   - Press `Ctrl+C` in the terminal running the loop

## Support

For issues or questions, check:
- Main README.md
- GitHub Issues
- Qwen CLI documentation
