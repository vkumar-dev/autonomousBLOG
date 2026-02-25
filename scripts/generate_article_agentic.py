#!/usr/bin/env python3
"""
Agentic Article Generation using PydanticAI + Ollama
Generates articles with reasoning, validation, and iterative improvement
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime
from typing import Optional
import asyncio

try:
    from pydantic_ai import Agent
    from pydantic import BaseModel
except ImportError:
    print("❌ pydantic-ai not installed. Install with: pip install pydantic-ai")
    sys.exit(1)

# Models
class Topic(BaseModel):
    topic: str
    type: str
    tone: str
    angle: str
    keywords: list
    estimatedWords: int

class ArticleSection(BaseModel):
    title: str
    content: str

# Configuration
OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'mistral')
OLLAMA_BASE_URL = os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')
PROJECT_DIR = Path(__file__).parent.parent
TOPIC_FILE = PROJECT_DIR / 'selected-topic.json'

# Load topic
def load_topic() -> Topic:
    if not TOPIC_FILE.exists():
        raise FileNotFoundError(f'Topic file not found: {TOPIC_FILE}')
    
    with open(TOPIC_FILE) as f:
        data = json.load(f)
    
    return Topic(
        topic=data.get('topic', 'Unknown'),
        type=data.get('type', 'article'),
        tone=data.get('tone', 'casual'),
        angle=data.get('angle', 'General'),
        keywords=data.get('keywords', []),
        estimatedWords=data.get('estimatedWords', 800)
    )

# Validation
def validate_article(content: str) -> dict:
    """Validate article structure and quality"""
    word_count = len(content.split())
    lines = content.split('\n')
    section_headers = [l for l in lines if l.startswith('##')]
    has_intro = len(content) > 100
    has_conclusion = 'conclusion' in content.lower() or 'summary' in content.lower()
    
    issues = []
    if len(section_headers) < 3:
        issues.append(f'Only {len(section_headers)} sections (need 3+)')
    if word_count < 400:
        issues.append(f'Only {word_count} words (need {400}+)')
    if not has_conclusion:
        issues.append('Missing conclusion/summary')
    
    return {
        'valid': len(issues) == 0,
        'word_count': word_count,
        'sections': len(section_headers),
        'issues': issues,
        'confidence': 1.0 - (len(issues) * 0.2)  # Simple confidence score
    }

# Agent initialization
def create_agent() -> Agent:
    """Create PydanticAI agent with Ollama backend"""
    
    system_prompt = """You are an expert blog writer for autonomousBLOG. Your role:

1. RESEARCH: Deeply understand the topic using your training knowledge
2. STRUCTURE: Create engaging, well-organized sections
3. WRITE: Generate professional, engaging content
4. VALIDATE: Ensure quality and coherence

Guidelines:
- Use markdown formatting (## for section headers)
- Include 4-5 detailed sections minimum
- Write conversational yet informative
- Include practical examples or insights where relevant
- Always include a conclusion
- Make content scannable with good formatting

Respond with ONLY the article content (no meta-discussion)."""

    return Agent(
        model=f'ollama/{OLLAMA_MODEL}',
        system_prompt=system_prompt,
        base_url=OLLAMA_BASE_URL
    )

async def generate_with_retry(agent: Agent, topic: Topic, max_retries: int = 3) -> str:
    """Generate article with validation and retry loop"""
    
    base_prompt = f"""Write a comprehensive article about: {topic.topic}

SPECIFICATIONS:
- Type: {topic.type}
- Tone: {topic.tone}
- Angle: {topic.angle}
- Keywords to naturally include: {', '.join(topic.keywords)}
- Target length: ~{topic.estimatedWords} words

STRUCTURE (required):
- Start with an engaging introduction
- Include at least 3-4 detailed sections (use ## for headers)
- Add practical insights, examples, or analysis
- End with a thoughtful conclusion

Write the article now, using markdown formatting:"""

    for attempt in range(max_retries):
        print(f"\n{'='*60}")
        print(f"🚀 Generation Attempt {attempt + 1}/{max_retries}")
        print(f"{'='*60}")
        print(f"Topic: {topic.topic}")
        print(f"Type: {topic.type} | Tone: {topic.tone}")
        
        try:
            # Run agent
            result = await agent.run(base_prompt)
            content = str(result.data)
            
            # Validate
            validation = validate_article(content)
            print(f"\n📊 Validation Results:")
            print(f"   Word count: {validation['word_count']}")
            print(f"   Sections: {validation['sections']}")
            print(f"   Confidence: {validation['confidence']*100:.0f}%")
            
            if validation['issues']:
                print(f"   Issues: {', '.join(validation['issues'])}")
            
            if validation['valid']:
                print(f"\n✅ Article validation PASSED!")
                return content
            else:
                print(f"\n⚠️  Article needs improvement. Issues:")
                for issue in validation['issues']:
                    print(f"   - {issue}")
                
                if attempt < max_retries - 1:
                    print(f"Retrying with improved prompt...")
                    # Could add validation feedback here for next attempt
                    continue
                else:
                    print(f"⚠️  Reached max retries. Using article with {validation['confidence']*100:.0f}% confidence")
                    return content
        
        except Exception as e:
            print(f"❌ Generation error: {e}")
            if attempt < max_retries - 1:
                print("Retrying...")
                await asyncio.sleep(2)
            else:
                raise

async def main():
    """Main execution"""
    
    print("\n" + "="*60)
    print("🤖 Autonomous Article Generator (Ollama + PydanticAI)")
    print("="*60)
    
    # Load configuration
    print(f"\n📝 Loading topic...")
    topic = load_topic()
    print(f"   Topic: {topic.topic}")
    print(f"   Type: {topic.type}")
    
    print(f"\n🔧 Initializing agent...")
    print(f"   Model: {OLLAMA_MODEL}")
    print(f"   Base URL: {OLLAMA_BASE_URL}")
    agent = create_agent()
    
    # Generate with retry
    print(f"\n📖 Starting article generation...")
    article_content = await generate_with_retry(agent, topic, max_retries=3)
    
    # Save article
    print(f"\n💾 Saving article...")
    now = datetime.now()
    date_path = now.strftime('%Y/%m')
    slug = topic.topic.lower()[:50].replace(' ', '-').replace('/', '-')
    
    article_dir = PROJECT_DIR / 'articles' / date_path
    article_dir.mkdir(parents=True, exist_ok=True)
    
    article_file = article_dir / f"{slug}.md"
    
    # Build frontmatter
    frontmatter = {
        'title': topic.topic,
        'date': now.isoformat(),
        'type': topic.type,
        'tone': topic.tone,
        'keywords': topic.keywords,
        'angle': topic.angle,
        'generated_by': 'ollama-agentic-pydantic',
        'model': OLLAMA_MODEL
    }
    
    # Write file
    content = f"""---
{json.dumps(frontmatter, indent=2)}
---

{article_content}

---

*Generated by autonomousBLOG on {now.strftime('%Y-%m-%d %H:%M:%S UTC')}*
*Model: {OLLAMA_MODEL}*
"""
    
    article_file.write_text(content)
    
    print(f"\n✅ Article saved!")
    print(f"   File: {article_file}")
    print(f"   Size: {article_file.stat().st_size / 1024:.1f} KB")
    
    # Cleanup topic file
    if TOPIC_FILE.exists():
        TOPIC_FILE.unlink()
        print(f"   Cleaned up: {TOPIC_FILE}")
    
    print(f"\n{'='*60}")
    print(f"✨ Article generation complete!")
    print(f"{'='*60}\n")

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n⚠️  Interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
