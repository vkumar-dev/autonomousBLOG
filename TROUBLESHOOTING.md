# Troubleshooting Guide

## Common Issues & Solutions

### Issue 1: Ollama Won't Start in GitHub Actions

**Symptom:**
```
❌ Ollama failed to start
```

**Causes:**
- Service startup takes too long
- Port 11434 already in use
- Network issues

**Solutions:**

1. **Increase startup timeout** (already set to 60 seconds, but you can increase):
   - Edit `.github/workflows/autonomous-generate-ollama.yml`
   - Find `for i in {1..60}`
   - Change 60 to 120 for 120 seconds

2. **Use smaller model** (faster startup):
   - In workflow, change model pull line:
     ```yaml
     ollama pull tinyllama  # Super fast, 637MB
     ```

3. **Check logs**:
   - In GitHub Actions, look at "Start Ollama service" step
   - Check `/tmp/ollama.log` output
   - Look for error messages

---

### Issue 2: Model Download Too Slow / Times Out

**Symptom:**
```
timeout: sending signal TERM to command
⏰ Model download exceeded time limit
```

**Causes:**
- Model is large (4-5GB)
- GitHub Actions runner has slow download speed
- Network interruption

**Solutions:**

1. **Use smaller model** (fastest):
   ```yaml
   ollama pull tinyllama  # 637MB, ~1 min
   # OR
   ollama pull openchat:latest  # 3.9GB, ~5 min
   ```

2. **Increase timeout**:
   - In workflow, change timeout:
     ```yaml
     timeout-minutes: 45  # Increase from 30
     ```

3. **Use model caching** (advanced):
   - Not recommended due to large size
   - GitHub Actions cache has 5GB limit

---

### Issue 3: Article Generation Timeout

**Symptom:**
```
⏳ Generation timeout
Generated for X minutes, no completion
```

**Causes:**
- Model is slow on GitHub's hardware
- Prompt is too complex
- Ollama process crashed

**Solutions:**

1. **Use faster model**:
   ```yaml
   ollama pull openchat:latest  # Faster than neural-chat
   ```

2. **Simplify prompt** (edit `scripts/generate_article_agentic.py`):
   - Reduce word count target
   - Fewer requirements
   - Shorter sections

3. **Increase timeout**:
   ```yaml
   timeout-minutes: 45  # 30 min default
   ```

---

### Issue 4: Connection Refused (localhost:11434)

**Symptom:**
```
❌ [Errno 111] Connection refused
Make sure Ollama is running: ollama serve
```

**Causes:**
- Ollama process didn't start
- Process crashed after starting
- Wrong URL/port

**Solutions:**

1. **Check Ollama is running**:
   ```bash
   pgrep ollama
   # If empty, Ollama not running
   ```

2. **Check port 11434 is accessible**:
   ```bash
   curl http://localhost:11434/api/tags
   # Should return JSON list of models
   ```

3. **Restart Ollama**:
   ```bash
   pkill ollama
   sleep 2
   ollama serve &
   sleep 5
   ```

4. **Check error logs**:
   ```bash
   cat /tmp/ollama.log
   # Look for error messages
   ```

---

### Issue 5: "Model not found" Error

**Symptom:**
```
❌ Error: model 'neural-chat' not found
Model 'neural-chat:latest' not found
```

**Causes:**
- Model didn't download successfully
- Wrong model name
- Typo in model name

**Solutions:**

1. **List available models**:
   ```bash
   ollama list
   # See what's actually installed
   ```

2. **Force re-download**:
   ```bash
   ollama rm neural-chat:latest  # Remove old
   ollama pull neural-chat:latest  # Fresh download
   ```

3. **Use fallback model**:
   - Script has automatic fallback:
     ```python
     neural-chat → mistral → tinyllama
     ```
   - First available model will be used

---

### Issue 6: Python Script Fails Locally

**Symptom:**
```
FileNotFoundError: Topic file not found: selected-topic.json
AttributeError: ...
```

**Solutions:**

1. **Create test topic file**:
   ```bash
   cat > selected-topic.json << 'EOF'
   {
     "topic": "Test Topic",
     "type": "article",
     "tone": "casual",
     "angle": "Exploration",
     "keywords": ["test"],
     "estimatedWords": 800
   }
   EOF
   ```

2. **Start Ollama**:
   ```bash
   ollama serve &
   sleep 5
   ollama pull neural-chat:latest
   ```

3. **Run script**:
   ```bash
   python3 scripts/generate_article_agentic.py
   ```

4. **Check Python version**:
   ```bash
   python3 --version
   # Need 3.7+
   ```

---

### Issue 7: Article Quality Is Poor

**Symptom:**
```
Generated article is generic, lacks structure
Sections are thin or repetitive
```

**Solutions:**

1. **Use better model**:
   ```yaml
   ollama pull mistral        # Better reasoning
   ollama pull neural-chat    # Better instructions
   ollama pull zephyr         # Best quality
   ```

2. **Improve system prompt** (edit `scripts/generate_article_agentic.py`):
   - Find the `prompt = f"""Write a comprehensive...`
   - Add more specific instructions
   - Give examples of desired output
   - Increase validation standards

3. **Lower validation threshold** temporarily:
   - In `generate_article_agentic.py`, find `validate_article()`
   - Adjust word count requirements
   - Adjust section requirements

---

### Issue 8: GitHub Actions Workflow Not Running

**Symptom:**
```
Workflow doesn't appear in Actions tab
OR
No runs showing despite schedule
```

**Solutions:**

1. **Check workflow is enabled**:
   - GitHub repo → Actions tab
   - Click "Workflows" in sidebar
   - Should see "Autonomous Article Generation (Ollama)"
   - Click it → "Enable workflow"

2. **Check action permissions**:
   - Settings → Actions → General
   - "Actions permissions" → "Allow all..."

3. **Trigger manually** (to test):
   - Actions tab
   - Click "Autonomous Article Generation (Ollama)"
   - "Run workflow" button
   - Select "main" branch
   - "Run workflow"

4. **Check cron syntax**:
   - `0 */4 * * *` = every 4 hours ✓
   - GitHub uses UTC time
   - Check if time makes sense for your timezone

---

### Issue 9: Articles Not Appearing on Blog

**Symptom:**
```
Workflow succeeds, article saved
But article doesn't show on site
```

**Solutions:**

1. **Check file was committed**:
   ```bash
   git log --oneline
   # Should see recent commits with [skip ci]
   ```

2. **Check article index built**:
   - Look for `articles-list.json` updated
   - Check `build-article-index.js` ran in workflow

3. **Clear browser cache**:
   - Hard refresh: Ctrl+Shift+R (Win) or Cmd+Shift+R (Mac)
   - Or open in incognito window

4. **Wait for GitHub Pages update**:
   - After push, Pages needs 1-2 minutes
   - Check Actions → Deploy to GitHub Pages
   - Should show green checkmark

5. **Check GitHub Pages enabled**:
   - Settings → Pages
   - Should say "Your site is live"
   - Source should be "Deploy from a branch"

---

### Issue 10: Recursive Trigger Loop

**Symptom:**
```
Workflow runs again and again
[skip ci] doesn't work
```

**Solutions:**

1. **Verify commit message has [skip ci]**:
   ```bash
   git log --oneline -5
   # Should see: 🤖 Auto-generated article... [skip ci]
   ```

2. **If missing, fix workflow**:
   - Edit `.github/workflows/autonomous-generate-ollama.yml`
   - Find "Commit and push article" step
   - Ensure commit message includes `[skip ci]`
   ```yaml
   git commit -m "🤖 Auto-generated article: ... [skip ci]"
   ```

3. **If still looping, disable workflow**:
   - Actions tab → Click workflow
   - "..." menu → Disable workflow
   - Push fix to fix the issue
   - Re-enable workflow

---

## Debugging Steps

### For Workflow Failures:

1. **View detailed logs**:
   - GitHub repo → Actions tab
   - Click failing workflow run
   - Click the failed step
   - Expand the step to see full output

2. **Check each step**:
   - ✅ Checkout repository
   - ✅ Setup Python
   - ✅ Setup Node.js
   - ✅ Install Ollama
   - ✅ Start Ollama service
   - ✅ Pull model
   - ✅ Generate article
   - ✅ Commit and push

3. **Common error patterns**:
   - "Command not found" → Installation issue
   - "Connection refused" → Service not running
   - "Timeout" → Model too large or slow
   - "Permission denied" → Git config issue

### For Local Testing:

```bash
# 1. Check Ollama
ollama serve &
sleep 5
ollama list

# 2. Create test topic
echo '{"topic": "Test", "type": "article", "tone": "casual", 
"angle": "test", "keywords": ["test"], "estimatedWords": 600}' > selected-topic.json

# 3. Run generator with debug output
python3 -u scripts/generate_article_agentic.py

# 4. Check output
ls articles/*/*/
```

---

## Still Stuck?

1. **Check workflow logs** (most helpful)
2. **Read error messages carefully** (usually explains issue)
3. **Try simpler model** (tinyllama is fastest)
4. **Increase timeouts** (more generous limits)
5. **Test locally first** (before pushing to GitHub)
