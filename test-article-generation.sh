#!/bin/bash

# Test script for article generation

set -e

echo "🧪 Testing Article Generation Pipeline"
echo "========================================"

# Check Ollama
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama not found. Install with: brew install ollama (macOS) or curl -fsSL https://ollama.ai/install.sh | sh (Linux)"
    exit 1
fi

echo "✅ Ollama found"

# Start Ollama if not running
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "🚀 Starting Ollama..."
    nohup ollama serve > /tmp/ollama.log 2>&1 &
    sleep 5
fi

echo "✅ Ollama running"

# Pull a model
echo "📥 Ensuring model available (neural-chat)..."
ollama pull neural-chat:latest 2>&1 | tail -5

echo "✅ Model ready"

# Create test topic
echo "📝 Creating test topic..."
cat > selected-topic.json << 'EOF'
{
  "topic": "The Future of AI Models",
  "type": "article",
  "tone": "casual",
  "angle": "Exploring upcoming trends",
  "keywords": ["AI", "models", "future", "technology"],
  "estimatedWords": 800
}
EOF

echo "✅ Test topic created"

# Run generator
echo "🚀 Running generator..."
python3 scripts/generate_article_agentic.py

# Check output
if ls articles/*/*/the-future-of-ai-models.md 2>/dev/null; then
    echo ""
    echo "✅ SUCCESS! Article generated:"
    ls -lh articles/*/*/the-future-of-ai-models.md
    echo ""
    echo "📄 Article content:"
    head -30 articles/*/*/the-future-of-ai-models.md
else
    echo "❌ Article file not found"
    exit 1
fi
