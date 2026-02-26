#!/usr/bin/env python3
"""
Simple Article Generation using Ollama HTTP API
No async, no heavy dependencies
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
OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'mistral')
PROJECT_DIR = Path(__file__).parent.parent
TOPIC_FILE = PROJECT_DIR / 'selected-topic.json'

def load_topic():
    """Load topic from JSON"""
    if not TOPIC_FILE.exists():
        raise FileNotFoundError(f'Topic file not found: {TOPIC_FILE}')
    
    with open(TOPIC_FILE) as f:
        return json.load(f)

def check_ollama():
    """Check if Ollama is running"""
    try:
        url = f"{OLLAMA_BASE_URL}/api/tags"
        with urllib.request.urlopen(url, timeout=5) as response:
            data = json.loads(response.read())
            models = data.get('models', [])
            return len(models) > 0, models
    except Exception as e:
        return False, []

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
        
        with urllib.request.urlopen(req, timeout=600) as response:
            result = response.read().decode('utf-8')
            response_data = json.loads(result)
            return response_data.get('response', '')
    
    except urllib.error.HTTPError as e:
        print(f"❌ HTTP Error {e.code}: {e.reason}")
        print(f"   URL: {url}")
        print(f"   Make sure model is loaded: ollama run {model}")
        raise
    except Exception as e:
        print(f"❌ Error calling Ollama: {e}")
        raise

def validate_article(content: str) -> dict:
    """Validate article structure"""
    if not content or len(content) < 100:
        return {'valid': False, 'word_count': 0, 'sections': 0, 'issues': ['Content too short']}
    
    word_count = len(content.split())
    lines = content.split('\n')
    section_headers = [l for l in lines if l.startswith('##')]
    has_conclusion = 'conclusion' in content.lower() or 'summary' in content.lower()
    
    issues = []
    if len(section_headers) < 2:
        issues.append(f'Only {len(section_headers)} sections (need 2+)')
    if word_count < 200:
        issues.append(f'Only {word_count} words (need 200+)')
    if not has_conclusion:
        issues.append('Missing conclusion')
    
    return {
        'valid': len(issues) == 0,
        'word_count': word_count,
        'sections': len(section_headers),
        'issues': issues
    }

def main():
    """Main execution"""
    
    print("\n" + "="*60)
    print("🤖 Autonomous Article Generation (Ollama Direct API)")
    print("="*60)
    
    try:
        # Check Ollama
        print(f"\n🔍 Checking Ollama service at {OLLAMA_BASE_URL}...")
        running, models = check_ollama()
        
        if not running:
            print(f"❌ No models found in Ollama")
            print(f"   Start Ollama: ollama serve")
            print(f"   Pull model: ollama pull mistral")
            sys.exit(1)
        
        print(f"✅ Ollama running with {len(models)} model(s)")
        for m in models:
            print(f"   - {m.get('name', 'unknown')}")
        
        # Load topic
        print(f"\n📝 Loading topic...")
        topic = load_topic()
        print(f"   Topic: {topic['topic']}")
        print(f"   Type: {topic['type']}")
        
        # Build prompt
        prompt = f"""Write a comprehensive article about: {topic['topic']}

Type: {topic['type']}
Tone: {topic['tone']}
Target length: ~{topic['estimatedWords']} words

Requirements:
- Engaging introduction
- 2-3 detailed sections with ## headers
- Practical insights
- Conclusion

Write the article in Markdown:"""

        # Generate with retry
        article = None
        for attempt in range(3):
            print(f"\n✍️  Attempt {attempt + 1}/3...")
            
            try:
                article = call_ollama(prompt, OLLAMA_MODEL)
                
                # Validate
                validation = validate_article(article)
                print(f"   Words: {validation['word_count']}, Sections: {validation['sections']}")
                
                if validation['valid']:
                    print(f"✅ Article valid!")
                    break
                else:
                    print(f"⚠️  Issues: {validation['issues']}")
                    if attempt < 2:
                        time.sleep(1)
                        continue
            
            except Exception as e:
                print(f"❌ Error: {str(e)[:100]}")
                if attempt < 2:
                    time.sleep(2)
                    continue
                raise
        
        if not article:
            raise Exception("Failed to generate article")
        
        # Save article
        print(f"\n💾 Saving article...")
        now = datetime.now()
        date_path = now.strftime('%Y/%m')
        slug = topic['topic'].lower()[:50].replace(' ', '-').replace('/', '-').replace('&', 'and')
        
        article_dir = PROJECT_DIR / 'articles' / date_path
        article_dir.mkdir(parents=True, exist_ok=True)
        
        article_file = article_dir / f"{slug}.md"
        
        # Build frontmatter
        frontmatter = f"""---
title: "{topic['topic']}"
date: "{now.isoformat()}"
type: "{topic['type']}"
tone: "{topic['tone']}"
generated_by: "ollama-agentic"
model: "{OLLAMA_MODEL}"
---

{article}

---

*Generated by autonomousBLOG on {now.strftime('%Y-%m-%d %H:%M:%S UTC')}*
*Model: {OLLAMA_MODEL}*
"""
        
        article_file.write_text(frontmatter)
        
        print(f"✅ Saved: {article_file}")
        print(f"   Size: {article_file.stat().st_size / 1024:.1f} KB")
        
        # Cleanup
        if TOPIC_FILE.exists():
            TOPIC_FILE.unlink()
            print(f"   Cleaned up topic file")
        
        print(f"\n✨ Complete!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
