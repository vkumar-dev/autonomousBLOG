#!/usr/bin/env python3
"""
Simple Article Generation using Ollama HTTP API or fallback templates
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
    
    except Exception as e:
        raise Exception(f"Ollama failed: {str(e)[:100]}")

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
        issues.append(f'Only {len(section_headers)} sections')
    if word_count < 200:
        issues.append(f'Only {word_count} words')
    if not has_conclusion:
        issues.append('No conclusion')
    
    return {
        'valid': len(issues) == 0,
        'word_count': word_count,
        'sections': len(section_headers),
        'issues': issues
    }

def generate_template_article(topic):
    """Fallback: Generate article from template"""
    print("📄 Using template generation...")
    
    sections = {
        'news': [
            f"## Background\n\nUnderstanding {topic['topic']} requires context. The landscape continues to evolve with new developments.",
            f"## Key Developments\n\nSeveral important factors are at play:\n\n1. **Progress**: Significant advances have occurred\n2. **Adoption**: Growing recognition across sectors\n3. **Impact**: Meaningful changes are emerging",
            f"## Implications\n\nThis development has multiple implications:\n\n- **Near-term**: Immediate effects on current practices\n- **Medium-term**: Evolving changes in strategies\n- **Long-term**: Potential transformation of the field",
            f"## Conclusion\n\nAs {topic['topic']} continues to develop, stakeholders will need to adapt accordingly."
        ],
        'article': [
            f"## Overview\n\n{topic['topic']} is a compelling area worthy of exploration and understanding.",
            f"## Key Concepts\n\nSeveral core aspects define this topic:\n\n1. **Foundation**: Basic principles and concepts\n2. **Development**: Evolution and progress over time\n3. **Current State**: Where we stand in 2026",
            f"## Practical Considerations\n\nThere are important practical aspects to consider when examining this subject.",
            f"## Conclusion\n\nThis area continues to evolve and deserves ongoing attention."
        ],
        'fun': [
            f"## What's So Interesting?\n\n{topic['topic']} is far more fascinating than most realize at first glance.",
            f"## Fun Facts\n\nHere are some intriguing details:\n\n1. **Surprising element**: Often overlooked aspects\n2. **Historical connection**: Interesting background and origins\n3. **Current trend**: What's happening right now",
            f"## The Bigger Picture\n\nThis connects to larger themes and patterns in our world.",
            f"## Final Thoughts\n\nKeeping these insights in mind will enhance your understanding of this topic."
        ]
    }
    
    article_type = topic.get('type', 'article')
    article_sections = sections.get(article_type, sections['article'])
    
    return f"# {topic['topic']}\n\n" + "\n\n".join(article_sections)

def main():
    """Main execution"""
    
    print("\n" + "="*60)
    print("🤖 Autonomous Article Generation (Ollama + Fallback)")
    print("="*60)
    
    try:
        # Check Ollama
        print(f"\n🔍 Checking Ollama...")
        running, models = check_ollama()
        
        if running:
            print(f"✅ Ollama running with {len(models)} model(s)")
            use_ollama = True
        else:
            print(f"⚠️  Ollama not available, will use fallback")
            use_ollama = False
        
        # Load topic
        print(f"\n📝 Loading topic...")
        topic = load_topic()
        print(f"   Topic: {topic['topic']}")
        print(f"   Type: {topic['type']}")
        
        # Generate article
        article = None
        
        if use_ollama:
            # Try Ollama
            prompt = f"""Write a comprehensive article about: {topic['topic']}

Type: {topic['type']}
Tone: {topic['tone']}
Target length: ~{topic['estimatedWords']} words

Write in Markdown with 3-4 sections (use ##) including conclusion."""

            for attempt in range(2):
                print(f"\n✍️  Ollama attempt {attempt + 1}/2...")
                try:
                    article = call_ollama(prompt, OLLAMA_MODEL)
                    validation = validate_article(article)
                    print(f"   Words: {validation['word_count']}, Sections: {validation['sections']}")
                    if validation['valid']:
                        print(f"✅ Valid!")
                        break
                    elif attempt < 1:
                        print(f"⚠️  Invalid, retrying...")
                        time.sleep(1)
                except Exception as e:
                    print(f"❌ {str(e)[:80]}")
                    if attempt >= 1:
                        article = None
                        break
        
        # Fallback if Ollama failed
        if not article:
            print(f"\n🔄 Falling back to template...")
            article = generate_template_article(topic)
        
        # Save article
        print(f"\n💾 Saving article...")
        now = datetime.now()
        date_path = now.strftime('%Y/%m')
        slug = topic['topic'].lower()[:40].replace(' ', '-').replace('/', '-').replace('&', 'and')
        
        article_dir = PROJECT_DIR / 'articles' / date_path
        article_dir.mkdir(parents=True, exist_ok=True)
        
        article_file = article_dir / f"{slug}.md"
        
        frontmatter = f"""---
title: "{topic['topic']}"
date: "{now.isoformat()}"
type: "{topic['type']}"
tone: "{topic['tone']}"
---

{article}

---

*Generated by autonomousBLOG on {now.strftime('%Y-%m-%d %H:%M:%S UTC')}*
"""
        
        article_file.write_text(frontmatter)
        
        print(f"✅ Saved: {article_file}")
        print(f"   Size: {article_file.stat().st_size / 1024:.1f} KB")
        
        # Cleanup
        if TOPIC_FILE.exists():
            TOPIC_FILE.unlink()
        
        print(f"\n✨ Complete!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
