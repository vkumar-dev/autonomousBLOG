#!/usr/bin/env python3
"""
Agentic Article Generation using Ollama directly via API
Simple, reliable, no heavy dependencies
"""

import json
import os
import sys
import time
from pathlib import Path
from datetime import datetime
import urllib.request
import urllib.error

# Configuration
OLLAMA_BASE_URL = os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')
OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'neural-chat')
PROJECT_DIR = Path(__file__).parent.parent
TOPIC_FILE = PROJECT_DIR / 'selected-topic.json'

def load_topic():
    """Load topic from JSON"""
    if not TOPIC_FILE.exists():
        raise FileNotFoundError(f'Topic file not found: {TOPIC_FILE}')
    
    with open(TOPIC_FILE) as f:
        return json.load(f)

def call_ollama(prompt: str, model: str = OLLAMA_MODEL) -> str:
    """Call Ollama API directly"""
    
    url = f"{OLLAMA_BASE_URL}/api/generate"
    
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "temperature": 0.7,
        "top_p": 0.9
    }
    
    headers = {"Content-Type": "application/json"}
    
    try:
        print(f"📡 Calling Ollama ({model})...")
        
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers=headers, method='POST')
        
        with urllib.request.urlopen(req, timeout=300) as response:
            response_data = json.loads(response.read().decode('utf-8'))
            return response_data.get('response', '')
    
    except urllib.error.URLError as e:
        print(f"❌ Connection error: {e}")
        print(f"   Make sure Ollama is running: ollama serve")
        raise
    except Exception as e:
        print(f"❌ Error calling Ollama: {e}")
        raise

def validate_article(content: str) -> dict:
    """Validate article structure"""
    word_count = len(content.split())
    lines = content.split('\n')
    section_headers = [l for l in lines if l.startswith('##')]
    has_conclusion = 'conclusion' in content.lower() or 'summary' in content.lower()
    
    issues = []
    if len(section_headers) < 2:
        issues.append(f'Only {len(section_headers)} sections (need 2+)')
    if word_count < 300:
        issues.append(f'Only {word_count} words (need 300+)')
    if not has_conclusion:
        issues.append('Missing conclusion/summary')
    
    return {
        'valid': len(issues) == 0,
        'word_count': word_count,
        'sections': len(section_headers),
        'issues': issues
    }

async def generate_article_agentic():
    """Generate article with Ollama"""
    
    topic = load_topic()
    
    print(f"\n{'='*60}")
    print(f"🤖 Generating Article with Ollama")
    print(f"{'='*60}")
    print(f"Topic: {topic['topic']}")
    print(f"Type: {topic['type']}")
    print(f"Model: {OLLAMA_MODEL}")
    
    # Build prompt
    prompt = f"""Write a comprehensive article about: {topic['topic']}

Type: {topic['type']}
Tone: {topic['tone']}
Angle: {topic['angle']}
Keywords: {', '.join(topic['keywords'])}
Target length: ~{topic['estimatedWords']} words

Requirements:
- Engaging introduction
- 3-4 detailed sections with ## headers
- Practical insights and examples
- Thoughtful conclusion
- Professional but conversational tone

Write the article in Markdown format:
"""

    # Generation loop with retry
    for attempt in range(3):
        print(f"\n🚀 Attempt {attempt + 1}/3...")
        
        try:
            # Generate article
            article = call_ollama(prompt, OLLAMA_MODEL)
            
            # Validate
            validation = validate_article(article)
            print(f"\n📊 Validation:")
            print(f"   Words: {validation['word_count']}")
            print(f"   Sections: {validation['sections']}")
            
            if validation['issues']:
                print(f"   Issues: {validation['issues']}")
            
            if validation['valid']:
                print(f"✅ Article valid!")
                return article
            else:
                print(f"⚠️  Retrying...")
                time.sleep(1)
                continue
        
        except Exception as e:
            print(f"❌ Error: {e}")
            if attempt < 2:
                print("Retrying...")
                time.sleep(2)
            else:
                raise
    
    print(f"⚠️  Returning best attempt")
    return article

def save_article(content: str, topic: dict):
    """Save article to file"""
    
    now = datetime.now()
    date_path = now.strftime('%Y/%m')
    slug = topic['topic'].lower()[:50].replace(' ', '-').replace('/', '-')
    
    article_dir = PROJECT_DIR / 'articles' / date_path
    article_dir.mkdir(parents=True, exist_ok=True)
    
    article_file = article_dir / f"{slug}.md"
    
    # Build frontmatter
    frontmatter = f"""---
title: "{topic['topic']}"
date: "{now.isoformat()}"
type: "{topic['type']}"
tone: "{topic['tone']}"
keywords: {json.dumps(topic['keywords'])}
angle: "{topic['angle']}"
generated_by: "ollama-agentic"
model: "{OLLAMA_MODEL}"
---

{content}

---

*Generated by autonomousBLOG on {now.strftime('%Y-%m-%d %H:%M:%S UTC')}*
*Model: {OLLAMA_MODEL}*
"""
    
    article_file.write_text(frontmatter)
    
    print(f"\n✅ Saved: {article_file}")
    print(f"   Size: {article_file.stat().st_size / 1024:.1f} KB")
    
    # Cleanup
    if TOPIC_FILE.exists():
        TOPIC_FILE.unlink()
    
    return article_file

def main():
    """Main execution"""
    
    print("\n" + "="*60)
    print("🤖 Autonomous Article Generation (Ollama + Direct API)")
    print("="*60)
    
    try:
        # Check Ollama is available
        print(f"\n🔍 Checking Ollama service...")
        try:
            with urllib.request.urlopen(f"{OLLAMA_BASE_URL}/api/tags", timeout=5) as resp:
                models = json.loads(resp.read())
                print(f"✅ Ollama running with {len(models.get('models', []))} models")
        except Exception as e:
            print(f"❌ Cannot connect to Ollama at {OLLAMA_BASE_URL}")
            print(f"   Start Ollama with: ollama serve")
            sys.exit(1)
        
        # Load topic
        print(f"\n📝 Loading topic...")
        topic = load_topic()
        print(f"   Topic: {topic['topic']}")
        
        # Generate (sync version)
        print(f"\n✍️  Generating article...")
        
        # Since we're not using async, call directly
        article = asyncio_wrapper(generate_article_agentic())
        
        # Save
        print(f"\n💾 Saving article...")
        save_article(article, topic)
        
        print(f"\n✨ Complete!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

def asyncio_wrapper(coro):
    """Simple async wrapper for sync context"""
    import asyncio
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    return loop.run_until_complete(coro)

if __name__ == '__main__':
    main()
