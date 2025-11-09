# Super Feynman Pitch Deck

**Best Use of Claude Track** - CBC Hackathon 2024

## Quick Start

### View the Presentation

```bash
npm run dev
```

Then open: http://localhost:3031/

### Presentation Modes

- **Slide Show:** http://localhost:3031/
- **Presenter Mode:** http://localhost:3031/presenter/ (shows speaker notes)
- **Overview:** http://localhost:3031/overview/
- **Export:** http://localhost:3031/export/

### Export to PDF

```bash
npm run export
```

This creates `slides-export.pdf` in the project root.

## Structure

```
Super-Feynman-Slides/
├── slides.md              # Main presentation (12 slides)
├── SPEAKER_NOTES.md       # Detailed talking points & Q&A prep
├── public/
│   └── screenshots/       # App screenshots from .playwright-mcp
├── components/            # Custom Vue components (if needed)
└── README.md             # This file
```

## Presentation Outline (7 minutes)

### Section 1: Problem & Solution (3 slides, ~2.5 min)
1. **Title Slide** - Introduction + track badge
2. **The Problem** - Students struggle with true understanding
3. **The Solution** - Super Feynman's AI-powered practice system

### Section 2: Tech Stack (1 slide, ~1 min)
4. **Tech Stack** - Application vs Development stack (highlighting the innovation)

### Section 3: Best Use of Claude (3 slides, ~3 min)
5. **Claude Powers Learning** - 3 use cases with prompt examples
6. **Development Workflow** - Traditional vs Skill Activation System
7. **Skill Activation Diagram** - How it actually works

### Section 4: Demo (2 slides, ~0.5 min)
8. **Live Demo** - Placeholder for actual demo
9. **Demo Highlights** - Summary of what was shown

### Section 5: Conclusion (3 slides, ~1 min)
10. **Impact & Future** - What was built + roadmap
11. **Why "Best Use of Claude"?** - Dual innovation (product + process)
12. **Thank You** - Contact info + questions

## Key Messages

### Primary Message
**Dual Innovation:** Not just using Claude IN the app, but using Claude to BUILD the app

### Three Talking Points
1. **Product Innovation:** Deep Claude integration (concept extraction, conversations, feedback)
2. **Process Innovation:** Custom skill activation system with automated code review
3. **Community Contribution:** Reusable patterns that other teams can adopt

### Memorable Quote
> "I didn't just use Claude in my app — I used Claude to build my app better, faster, and with higher quality"

## Demo Preparation

### Before Presentation:
- [ ] Backend running on localhost:3001
- [ ] Frontend running on localhost:5173
- [ ] Database seeded with sample data
- [ ] Sample lecture notes file ready (binary_search_trees.txt)
- [ ] Microphone tested (if using voice feature)

### Demo Flow (if doing live demo):
1. Show home → courses
2. Add lecture → upload notes
3. Watch concept extraction
4. Start review session
5. Have conversation with Claude
6. End session → show feedback
7. Show progress update

### Backup:
- Screen recording in case live demo fails
- Screenshots already in `public/screenshots/`

## Speaker Notes

See [SPEAKER_NOTES.md](./SPEAKER_NOTES.md) for:
- Detailed talking points for each slide
- Timing guidance (7-minute target)
- Anticipated Q&A with answers
- Pre-presentation checklist

## Customization

Before presenting, update:
- **Slide 1:** GitHub URL (currently placeholder)
- **Slide 12:** Contact email (currently placeholder)
- **All slides:** Review speaker notes for personal style

## Keyboard Shortcuts (During Presentation)

- `Space` / `→` - Next slide/animation
- `←` - Previous slide
- `O` - Toggle presenter mode (shows speaker notes)
- `G` - Go to specific slide number
- `D` - Toggle dark mode
- `F` - Toggle fullscreen
- `C` - Toggle drawing mode

## Tips for Delivery

1. **Practice the opening hook** - First 30 seconds are crucial
2. **Emphasize the dual innovation** - This is the differentiator
3. **Use the Mermaid diagram** on Slide 7 - Visual explanations stick
4. **Manage time** - 7 minutes goes fast, practice with timer
5. **Prepare for questions** - See SPEAKER_NOTES.md for common Q&A

## Troubleshooting

### Slides won't load
- Check that you're in the `Super-Feynman-Slides` directory
- Run `npm install` if dependencies are missing
- Try clearing browser cache

### Mermaid diagram not showing
- Mermaid is built into Slidev, should work automatically
- If issues, check browser console for errors

### Images not loading
- Screenshots are in `public/screenshots/`
- Referenced as `/screenshots/filename.png` in slides
- Check that files were copied correctly

## Credits

- Built with [Slidev](https://sli.dev/)
- Theme: Seriph
- Developed with Claude Code
- Screenshots from Playwright MCP

Good luck with your presentation! 🎯
