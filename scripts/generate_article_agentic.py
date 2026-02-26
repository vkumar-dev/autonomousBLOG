#!/usr/bin/env python3
"""
Random Blog Article Generation
Generates unique evergreen content from random category combinations
No duplicate checking needed - each article is unique by design
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
    
    style_lower = topic.get('writingStyle', '').lower()
    method = topic.get('storytellingMethod', 'Chronological Timeline')
    category = topic.get('category', 'Knowledge')
    
    sections = {
        'Introduction': f"## Introduction\n\nExploring {topic['topic']} offers fascinating insights into {topic['category']}. This article examines the subject through {method.lower()}, providing {topic['depthLevel'].lower()} for {topic['targetAudience'].lower()}.",
        
        'Foundations': f"## Foundations\n\nUnderstanding {category} requires examining core principles:\n\n1. **Core Concept**: The fundamental nature and definition\n2. **Historical Context**: How it emerged and evolved\n3. **Key Principles**: Essential elements and frameworks",
        
        'Exploration': f"## Deep Exploration\n\nLooking deeper into {topic['topic']}:\n\n- **Perspective**: From a {topic['perspective'].lower()} viewpoint\n- **Applications**: Practical uses and implications\n- **Connections**: Links to other fields and ideas",
        
        'Analysis': f"## Analysis & Insights\n\n{category} reveals important patterns:\n\n1. **Patterns**: Recurring themes and trends\n2. **Significance**: Why this matters\n3. **Future**: Implications and possibilities",
        
        'Conclusion': f"## Conclusion\n\nThis exploration of {topic['topic']} demonstrates the depth and relevance of {category}. Whether approaching it as {topic['targetAudience'].lower()} or specialist, the insights gained contribute to broader understanding. The intersection of theory and practice continues to evolve, offering new perspectives and possibilities for ongoing discovery."
    }
    
    article_sections = [
        f"# {topic['topic']}\n",
        sections['Introduction'],
        sections['Foundations'],
        sections['Exploration'],
        sections['Analysis'],
        sections['Conclusion']
    ]
    
    return "\n\n".join(article_sections)

def main():
    """Main execution"""
    
    print("\n" + "="*60)
    print("🤖 Random Blog Article Generator (Evergreen Content)")
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
        print(f"\n📝 Loading random topic...")
        topic = load_topic()
        print(f"   Topic: {topic['topic']}")
        print(f"   Category: {topic['category']}")
        print(f"   Genre: {topic['genre']}")
        print(f"   Style: {topic['writingStyle']}")
        
        # Generate article
        article = None
        
        if use_ollama:
            # Try Ollama
            prompt = f"""Write a comprehensive {topic['genre'].lower()} article.

TOPIC: {topic['topic']}
CATEGORY: {topic['category']}
TARGET AUDIENCE: {topic['targetAudience']}
WRITING STYLE: {topic['writingStyle']}
STORYTELLING METHOD: {topic['storytellingMethod']}
PERSPECTIVE: {topic['perspective']}
DEPTH: {topic['depthLevel']}
TARGET WORDS: ~{topic['estimatedWords']}

Write in Markdown format with:
- Engaging title section
- 4-5 detailed sections (use ## for headers)
- Clear examples or explanations
- Thoughtful conclusion

Remember: This is evergreen content, not time-dependent news.
Make it timeless, informative, and valuable."""

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
category: "{topic['category']}"
genre: "{topic['genre']}"
style: "{topic['writingStyle']}"
method: "{topic['storytellingMethod']}"
perspective: "{topic['perspective']}"
depth: "{topic['depthLevel']}"
audience: "{topic['targetAudience']}"
type: "evergreen"
---

{article}

---

*Generated by autonomousBLOG on {now.strftime('%Y-%m-%d %H:%M:%S UTC')}*
*Category: {topic['category']} | Genre: {topic['genre']}*
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
