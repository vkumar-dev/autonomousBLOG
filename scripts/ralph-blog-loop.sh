#!/bin/bash

# Ralph Blog Loop - Autonomous Blog Publisher
# Runs every 4 hours, generates AI blog articles, commits and pushes

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PRD_FILE="$PROJECT_DIR/BLOG_GENERATION_PRD.md"
ARTICLES_DIR="$PROJECT_DIR/articles"
INTERVAL_SECONDS=14400  # 4 hours

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Function to generate article using Qwen
generate_article() {
    log_info "Generating new article using Qwen..."
    
    cd "$PROJECT_DIR"
    
    # Check if PRD file exists
    if [ ! -f "$PRD_FILE" ]; then
        log_error "PRD file not found: $PRD_FILE"
        return 1
    fi
    
    # Run Qwen with the PRD
    # The -y flag auto-confirms, -p reads from stdin/pipe
    cat "$PRD_FILE" | qwen -y -p
    
    log_success "Article generation complete"
    return 0
}

# Function to commit and push changes
commit_and_push() {
    log_info "Checking for new articles to commit..."
    
    cd "$PROJECT_DIR"
    
    # Configure git user if not set (for automated runs)
    git config user.name "Ralph Blog Bot" 2>/dev/null || true
    git config user.email "ralph-blog-bot@autonomousblog.local" 2>/dev/null || true
    
    # Check for changes
    if ! git diff --quiet || ! git diff --cached --quiet; then
        # Get the new article filename
        NEW_ARTICLES=$(git status --porcelain | grep "^??" | grep "articles/" | awk '{print $2}')
        
        if [ -n "$NEW_ARTICLES" ]; then
            # Add new articles
            git add articles/
            
            # Create commit message with article names
            ARTICLE_NAMES=$(echo "$NEW_ARTICLES" | xargs -n1 basename | tr '\n' ', ' | sed 's/,$//')
            COMMIT_MSG="🤖 [AUTO] New article(s) published: $ARTICLE_NAMES"
            
            git commit -m "$COMMIT_MSG"
            
            log_success "Committed: $COMMIT_MSG"
            
            # Push to remote
            log_info "Pushing to remote repository..."
            if git push origin main 2>/dev/null; then
                log_success "Successfully pushed to remote"
            elif git push origin master 2>/dev/null; then
                log_success "Successfully pushed to remote (master branch)"
            else
                log_warning "Push failed - may need authentication or remote not configured"
                return 1
            fi
        else
            # Other changes exist but no new articles
            git add -A
            git commit -m "🤖 [AUTO] Minor updates and changes"
            git push origin main 2>/dev/null || git push origin master 2>/dev/null || log_warning "Push failed"
        fi
    else
        log_info "No changes to commit"
    fi
    
    return 0
}

# Function to check if Qwen is available
check_qwen() {
    if command -v qwen &> /dev/null; then
        log_success "Qwen CLI found"
        return 0
    else
        log_error "Qwen CLI not found in PATH"
        log_info "Please ensure Qwen CLI is installed and accessible"
        return 1
    fi
}

# Function to check git configuration
check_git() {
    cd "$PROJECT_DIR"
    
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Not a git repository. Initialize with: git init"
        return 1
    fi
    
    # Check if remote is configured
    if ! git remote -v | grep -q "origin"; then
        log_warning "No remote 'origin' configured. Push will fail until configured."
        log_info "Add remote with: git remote add origin <your-repo-url>"
    fi
    
    log_success "Git repository configured"
    return 0
}

# Main loop function
run_loop() {
    log_info "========================================="
    log_info "🤖 Ralph Blog Loop Starting..."
    log_info "========================================="
    log_info "Project directory: $PROJECT_DIR"
    log_info "Articles directory: $ARTICLES_DIR"
    log_info "Interval: $((INTERVAL_SECONDS / 3600)) hours"
    log_info "PRD file: $PRD_FILE"
    log_info "========================================="
    
    # Pre-flight checks
    if ! check_qwen; then
        log_error "Pre-flight check failed: Qwen CLI not available"
        exit 1
    fi
    
    if ! check_git; then
        log_error "Pre-flight check failed: Git not configured"
        exit 1
    fi
    
    # Ensure articles directory exists
    mkdir -p "$ARTICLES_DIR"
    
    log_info "Starting main loop..."
    log_info "Press Ctrl+C to stop"
    log_info "========================================="
    
    # Main loop
    while true; do
        echo ""
        log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        log_info "🚀 Starting new article generation cycle"
        log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        
        # Generate article
        if generate_article; then
            # Commit and push
            commit_and_push
            log_success "Cycle complete! Next run in $((INTERVAL_SECONDS / 60)) minutes"
        else
            log_error "Article generation failed"
        fi
        
        # Countdown display
        log_info "Sleeping for $((INTERVAL_SECONDS / 3600)) hours..."
        for i in $(seq $((INTERVAL_SECONDS / 60)) -1 1); do
            printf "\r${BLUE}[COUNTDOWN]${NC} Next article in %d minutes... " $i
            sleep 60
        done
        echo ""
    done
}

# Handle script arguments
case "${1:-run}" in
    run)
        run_loop
        ;;
    once)
        # Run once without looping (for testing)
        log_info "Running single generation cycle..."
        generate_article && commit_and_push
        ;;
    check)
        # Run pre-flight checks only
        check_qwen && check_git
        ;;
    help|--help|-h)
        echo "Ralph Blog Loop - Autonomous Blog Publisher"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  run    - Start the continuous loop (default)"
        echo "  once   - Run a single generation cycle"
        echo "  check  - Run pre-flight checks only"
        echo "  help   - Show this help message"
        echo ""
        echo "The loop generates a new article every 4 hours,"
        echo "commits it to git, and pushes to the remote."
        ;;
    *)
        log_error "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac
