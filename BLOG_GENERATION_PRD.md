# Blog Generation PRD - AI News & Fun Content

## Mission
Generate engaging, fun-to-read AI blog articles as HTML webpage artifacts every 4 hours.

## Content Priority (in order)

### 1. Breaking AI News (Highest Priority)
- Latest AI developments, releases, research papers
- Major company announcements (OpenAI, Google, Anthropic, Meta, etc.)
- New tools, models, or frameworks
- AI regulations, policy changes
- Industry trends and market movements

### 2. Historical AI Events (Fallback)
- "On This Day in AI History" - what happened 1, 2, 3, or N years ago
- Connect past events to present-day applications
- Include statistics showing growth/evolution
- Make historical connections fun and surprising

### 3. Fun AI Content (Last Resort)
- Weird/funny AI fails or successes
- AI-generated art oddities
- Surprising AI use cases
- "AI tried to..." style content
- Memes and culture around AI

## Article Requirements

### HTML Artifact Format
- **Filename**: `YYYYMMDD-HHMMSS-short_summary.html`
- Full HTML webpage with embedded CSS
- Responsive design
- Visually appealing with modern styling
- Include metadata (title, date, author, tags)

### Content Style
- **Tone**: Fun, engaging, conversational but informative
- **Length**: 500-800 words
- **Structure**:
  - Catchy headline
  - Engaging intro with hook
  - 2-4 main sections with clear headers
  - Statistics/data where relevant
  - Fun conclusion with forward-looking statement

### Visual Elements
- Use CSS gradients, animations, or effects
- Include pull quotes or highlighted sections
- Add visual hierarchy with colors and spacing
- Make it feel like a polished web article

## Technical Instructions

You are the Qwen CLI assistant. When this PRD is piped to you:

1. **Research**: Check for recent AI news (if capable) or use knowledge for historical/fun content
2. **Write**: Create a complete HTML file with:
   - Proper HTML5 structure
   - Embedded CSS in `<style>` tags
   - Engaging, well-written content
   - Fun facts, statistics, or interesting tidbits
3. **Save**: Output the filename you're creating
4. **Exit**: Complete cleanly so the script can commit

## Output
- Create ONE HTML file in the `articles/` directory
- Filename format: `YYYYMMDD-HHMMSS-short_summary.html`
- Content must be original, engaging, and fun to read

## Quality Standards
✅ Factually accurate (no made-up statistics or quotes)
✅ Engaging and fun to read
✅ Visually appealing HTML artifact
✅ Proper grammar and spelling
✅ Mobile-responsive design
✅ Unique content (not duplicated from previous articles)
