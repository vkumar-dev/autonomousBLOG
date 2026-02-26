# Internet Search Capability for Article Generation

## Current Status: ❌ NO

**The model does NOT currently have internet search capability.**

---

## What the Model Currently Has Access To

### 1. **Training Data Only**
- Ollama model (Mistral, Neural Chat, etc.) uses its training data
- Knowledge cutoff date: Depends on model (usually 2023-2024)
- **No real-time information**
- **No live web access**

### 2. **Input Data Provided**
The model only receives:
```json
{
  "topic": "Digital Privacy Updates",
  "type": "news",
  "tone": "formal",
  "angle": "Latest developments",
  "keywords": ["tech-policy", "news", "update"],
  "estimatedWords": 800
}
```

**That's it.** No external data sources, APIs, or web searches.

### 3. **Fallback Templates**
When Ollama fails, uses hardcoded templates with generic content:
```
## Background
## Key Developments  
## Implications
## Conclusion
```

---

## Why No Internet Search Currently?

1. **GitHub Actions environment limitations**
   - No persistent server
   - 5-10 minute execution window per step
   - Can't maintain connections

2. **Adds complexity**
   - Requires API keys (Google, Bing, DuckDuckGo, etc.)
   - More dependencies
   - Error handling for APIs

3. **Current design is simple**
   - Pure local LLM (Ollama)
   - No external dependencies
   - Fast execution

---

## How to Add Internet Search (Options)

### Option 1: DuckDuckGo Search (Simplest, Free)

**Add this to the Python script:**

```python
import requests

def search_web(query: str, max_results: int = 3) -> list:
    """Search DuckDuckGo for information"""
    try:
        url = "https://api.search.brave.com/res/v1/web/search"
        # OR use free DuckDuckGo:
        url = "https://duckduckgo.com/api"
        
        headers = {"User-Agent": "Mozilla/5.0"}
        params = {"q": query, "format": "json"}
        
        response = requests.get(url, headers=headers, params=params, timeout=5)
        if response.status_code == 200:
            data = response.json()
            results = data.get('results', [])[:max_results]
            return [
                {"title": r.get('title'), "url": r.get('url')}
                for r in results
            ]
    except Exception as e:
        print(f"Search failed: {e}")
    
    return []

# In article generation:
search_results = search_web(topic['topic'])
context = "\n".join([f"- {r['title']}: {r['url']}" for r in search_results])

prompt = f"""Based on recent information:
{context}

Write an article about: {topic['topic']}..."""
```

**Pros:**
- ✅ Free
- ✅ No API key needed
- ✅ Simple implementation
- ✅ Fast

**Cons:**
- ⚠️ May get rate-limited
- ⚠️ No guaranteed results
- ⚠️ Lower quality than paid APIs

---

### Option 2: Google Custom Search (Free Tier)

**Setup:**
```bash
# 1. Get API key from https://console.cloud.google.com
# 2. Create Custom Search Engine at https://programmablesearchengine.google.com
# 3. Add to GitHub secrets
```

**Code:**
```python
import requests

def search_google(query: str) -> list:
    """Search Google Custom Search API"""
    api_key = os.getenv('GOOGLE_API_KEY')
    search_engine_id = os.getenv('GOOGLE_SEARCH_ENGINE_ID')
    
    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "q": query,
        "key": api_key,
        "cx": search_engine_id,
        "num": 5
    }
    
    response = requests.get(url, params=params)
    if response.status_code == 200:
        items = response.json().get('items', [])
        return [
            {"title": item['title'], "snippet": item['snippet'], "url": item['link']}
            for item in items
        ]
    return []
```

**Pros:**
- ✅ Reliable
- ✅ Good quality results
- ✅ 100 free searches/day
- ✅ Can cache results

**Cons:**
- ⚠️ Free tier limited to 100/day
- ⚠️ Requires setup
- ⚠️ Requires API credentials

---

### Option 3: Brave Search API (Recommended)

**Setup:**
```bash
# 1. Get free API key at https://api.search.brave.com
# 2. Add to GitHub secrets as BRAVE_API_KEY
```

**Code:**
```python
import requests

def search_brave(query: str) -> list:
    """Search using Brave Search API"""
    api_key = os.getenv('BRAVE_API_KEY')
    
    url = "https://api.search.brave.com/res/v1/web/search"
    headers = {"Accept": "application/json", "X-Subscription-Token": api_key}
    params = {"q": query, "count": 5}
    
    response = requests.get(url, headers=headers, params=params, timeout=10)
    if response.status_code == 200:
        results = response.json().get('web', [])
        return [
            {"title": r['title'], "description": r['description'], "url": r['url']}
            for r in results
        ]
    return []
```

**Pros:**
- ✅ Privacy-focused
- ✅ No tracking
- ✅ Good results
- ✅ Generous free tier
- ✅ Easy setup

**Cons:**
- ⚠️ Less known than Google
- ⚠️ Requires API key

---

### Option 4: Perplexity-style RAG (Most Powerful)

**Combines search + LLM reasoning:**

```python
def generate_with_search(topic: str):
    """Generate article with web search + LLM"""
    
    # 1. Search web
    search_results = search_brave(topic)
    summaries = [r['description'] for r in search_results]
    
    # 2. Create context
    context = f"""
Recent information about {topic}:

{chr(10).join(f'- {s}' for s in summaries)}
"""
    
    # 3. Generate article with context
    prompt = f"""
{context}

Based on the above information, write a comprehensive article about {topic}...
"""
    
    article = call_ollama(prompt)
    return article
```

**Pros:**
- ✅ Real-time information
- ✅ LLM reasoning on fresh data
- ✅ Higher quality articles
- ✅ Most accurate

**Cons:**
- ⚠️ More complex
- ⚠️ Slower (2 API calls)
- ⚠️ May need multiple APIs
- ⚠️ Costs money

---

## Recommendation

**For your use case:** Use **Option 3 (Brave Search API)**

**Why:**
- ✅ Free API key
- ✅ Good results quality
- ✅ Privacy-focused (aligns with your blog)
- ✅ Simple to implement
- ✅ No GitHub secrets complexity
- ✅ Can be added in 30 minutes

---

## Implementation Steps

If you want to add internet search to your blog:

### Step 1: Get Brave API Key
```bash
# 1. Visit https://api.search.brave.com
# 2. Sign up (free)
# 3. Copy API key
# 4. Add to GitHub secrets as BRAVE_API_KEY
```

### Step 2: Update Python Script
Add this to `scripts/generate_article_agentic.py`:

```python
import requests

def search_web(query: str) -> str:
    """Get fresh web information"""
    api_key = os.getenv('BRAVE_API_KEY')
    if not api_key:
        return ""
    
    try:
        url = "https://api.search.brave.com/res/v1/web/search"
        headers = {"Accept": "application/json", "X-Subscription-Token": api_key}
        params = {"q": query, "count": 3}
        
        response = requests.get(url, headers=headers, params=params, timeout=5)
        if response.status_code == 200:
            results = response.json().get('web', [])
            summaries = [f"- {r['title']}: {r['description']}" for r in results]
            return "\n".join(summaries)
    except Exception as e:
        print(f"Search failed: {e}")
    
    return ""

# Use in article generation:
context = search_web(topic['topic'])
if context:
    prompt = f"""Based on this recent information:
{context}

Write an article about: {topic['topic']}..."""
```

### Step 3: Add to Workflow
```yaml
- name: Generate article with web search
  env:
    BRAVE_API_KEY: ${{ secrets.BRAVE_API_KEY }}
  run: python scripts/generate_article_agentic.py
```

### Step 4: Test
```bash
# Add to GitHub secrets, push, and watch workflow
```

---

## Comparison: With vs Without Search

| Aspect | Without Search | With Search |
|--------|---|---|
| **Article Quality** | 6/10 (generic) | 9/10 (current) |
| **Accuracy** | Knowledge cutoff | Up-to-date |
| **Speed** | 2-4 min | 3-5 min |
| **Dependencies** | None | 1 API |
| **Cost** | Free | Free |
| **Setup** | Done ✅ | 30 min |
| **Complexity** | Simple | Moderate |

---

## Decision

**Current system works great for:**
- General knowledge articles
- Evergreen content
- Template-based generation

**Add search if you want:**
- Current events coverage
- News articles
- Trending topics
- Real-time information

---

## Summary

**Right now:** ❌ No internet search  
**What it has:** Ollama training data + topic info + templates  
**To add search:** Use Brave API (recommended, 30 minutes)  
**Current quality:** Good for evergreen content, not breaking news

**Want to add it? I can implement it in the next workflow update.**
