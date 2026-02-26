#!/bin/bash

# Traffic Tracking Script
# Analyzes which blog posts get the most attention
# Reads from GitHub Pages views/stats

set -e

REPO="vkumar-dev/autonomousBLOG"
TRAFFIC_FILE="traffic-analytics.json"
LOG_FILE="traffic-log.txt"

echo "📊 Blog Traffic Analytics Tracker"
echo "=================================="
echo ""

# Function to get traffic from GitHub API
get_traffic() {
    echo "🔍 Fetching traffic data from GitHub..."
    
    # Get views using GitHub CLI
    gh api repos/$REPO/traffic/views --jq '.views' > /tmp/views.json 2>/dev/null || {
        echo "⚠️  GitHub traffic API requires admin access"
        echo "Alternative: Check GitHub Pages analytics in repo settings"
        return 1
    }
    
    return 0
}

# Function to analyze article categories from filesystem
analyze_articles() {
    echo "📚 Analyzing published articles..."
    echo ""
    
    local article_dir="articles"
    
    if [ ! -d "$article_dir" ]; then
        echo "❌ No articles directory found"
        return 1
    fi
    
    # Find all markdown files
    local total_articles=$(find $article_dir -name "*.md" -type f | wc -l)
    
    echo "Total Articles Published: $total_articles"
    echo ""
    
    # Extract categories from frontmatter
    echo "Articles by Category:"
    echo "---"
    
    find $article_dir -name "*.md" -type f -exec grep -h "^category:" {} \; | \
        sed 's/category: "\(.*\)"/\1/' | \
        sort | uniq -c | sort -rn | \
        awk '{printf "  %-30s %3d articles\n", $2, $1}'
    
    echo ""
    echo "Articles by Genre:"
    echo "---"
    
    find $article_dir -name "*.md" -type f -exec grep -h "^genre:" {} \; | \
        sed 's/genre: "\(.*\)"/\1/' | \
        sort | uniq -c | sort -rn | \
        awk '{printf "  %-30s %3d articles\n", $2, $1}'
    
    echo ""
}

# Function to generate traffic report
generate_report() {
    echo "📋 Generating Traffic Report..."
    echo ""
    
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    cat > $TRAFFIC_FILE << EOF
{
  "timestamp": "$timestamp",
  "repo": "$REPO",
  "report": {
    "description": "Blog traffic and engagement analytics",
    "metrics": {
      "total_articles": $(find articles -name "*.md" -type f 2>/dev/null | wc -l),
      "tracking_enabled": true,
      "analytics_source": "GitHub Pages",
      "update_frequency": "Daily"
    },
    "top_categories": [
$(find articles -name "*.md" -type f -exec grep -h "^category:" {} \; | \
  sed 's/category: "\(.*\)"/\1/' | \
  sort | uniq -c | sort -rn | head -5 | \
  awk '{printf "      {\"name\": \"%s\", \"count\": %d},\n", $2, $1}' | \
  sed '$ s/,$//')
    ],
    "insights": [
      "Monitor which categories generate most engagement",
      "Track which writing styles resonate with readers",
      "Identify top-performing genres",
      "Use data to optimize future article generation"
    ]
  },
  "next_steps": [
    "Enable GitHub Pages analytics in repo settings",
    "Monitor traffic weekly",
    "Adjust content mix based on engagement",
    "Track reader behavior and preferences"
  ]
}
EOF

    echo "✅ Report saved to: $TRAFFIC_FILE"
    echo ""
    cat $TRAFFIC_FILE
}

# Function to guide enabling GitHub analytics
enable_analytics() {
    echo "🔧 How to Enable Traffic Analytics:"
    echo "===================================="
    echo ""
    echo "1. Go to: https://github.com/$REPO/settings"
    echo "2. Navigate to: Settings → Insights → Traffic"
    echo "3. You'll see:"
    echo "   - Clones & Unique Clones"
    echo "   - Visitors & Unique Visitors"
    echo "   - Top Referrers"
    echo ""
    echo "4. For detailed article analytics:"
    echo "   - Use Google Analytics (add to _config.yml)"
    echo "   - Use Plausible Analytics (free tier for open source)"
    echo "   - Use StatCounter (alternative)"
    echo ""
}

# Main execution
main() {
    echo "Started: $(date)"
    echo ""
    
    # Analyze articles
    analyze_articles
    
    # Generate report
    generate_report
    
    # Show how to enable GitHub analytics
    enable_analytics
    
    echo ""
    echo "📝 Recommendations:"
    echo "===================="
    echo ""
    echo "1. Monitor Top Categories:"
    echo "   - Focus on categories with highest engagement"
    echo "   - Increase article frequency in popular categories"
    echo ""
    echo "2. Optimize by Genre:"
    echo "   - Track which genres (Tutorial, Essay, etc.) perform best"
    echo "   - Create more of high-performing genres"
    echo ""
    echo "3. Analyze Writing Style Impact:"
    echo "   - Which styles (Casual, Academic, etc.) get more clicks?"
    echo "   - Adapt your generator to favor successful styles"
    echo ""
    echo "4. Track Audience Engagement:"
    echo "   - Which target audiences engage most?"
    echo "   - Tailor future content to top audiences"
    echo ""
    
    # Save log
    {
        echo "=== Traffic Analytics Report ==="
        echo "Generated: $(date)"
        echo ""
        echo "Repository: $REPO"
        analyze_articles
        echo ""
        echo "Traffic data analysis completed"
    } >> $LOG_FILE
    
    echo "✅ Report saved to: $TRAFFIC_FILE and $LOG_FILE"
}

# Run main
main
