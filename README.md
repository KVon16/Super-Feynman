# Super Feynman

A web application for college students to systematically review and master concepts using the Feynman Technique through AI-powered conversational sessions with speech-to-text dictation support.

## Features

- **Course & Lecture Management**: Organize your study materials by courses and lectures
- **AI-Powered Concept Generation**: Automatically extract 5-15 key concepts from uploaded lecture notes using Claude AI
- **Interactive Review Sessions**: Practice explaining concepts to three different audience levels:
  - Classmate (college-level peer)
  - Middle Schooler (12-14 years old)
  - Kid (5-8 years old)
- **Speech-to-Text Support**: Use audio recording with OpenAI Whisper API for hands-free explanations
- **Intelligent Feedback**: Receive detailed AI analysis on clarity, jargon usage, and areas for improvement
- **Progress Tracking**: Track concept mastery with 4 status levels (Not Started → Reviewing → Understood → Mastered)
- **Data Persistence**: All data stored locally in SQLite database

## Technology Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives

### Backend
- **Node.js & Express.js** - REST API server
- **SQLite** - Embedded database
- **Multer** - File upload handling

### AI Services
- **Anthropic Claude API** - Concept generation, conversational review, feedback analysis
- **OpenAI Whisper API** - Speech-to-text transcription

## Prerequisites

- **Node.js** v18.x or higher (tested on v24.9.0)
- **npm** (comes with Node.js)
- **Anthropic API key** (for Claude AI features)
- **OpenAI API key** (for Whisper transcription)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Super-Feynman.git
cd Super-Feynman
```

### 2. Install Dependencies

#### Backend:
```bash
cd backend
npm install
```

#### Frontend:
```bash
cd ../frontend
npm install
```

### 3. Configure Environment Variables

#### Backend Configuration:

1. Copy the example environment file:
```bash
cd backend
cp .env.example .env
```

2. Edit `backend/.env` and add your API keys:
```env
PORT=3001
ANTHROPIC_API_KEY=your_actual_anthropic_key
OPENAI_API_KEY=your_actual_openai_key
DATABASE_PATH=./database/superfeynman.db
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

#### Frontend Configuration:

1. Copy the example environment file:
```bash
cd ../frontend
cp .env.example .env
```

2. The default values should work for local development:
```env
VITE_API_URL=http://localhost:3001
```

### 4. Initialize the Database

```bash
cd backend
npm run init-db
```

This creates the SQLite database with the following tables:
- `courses` - Course information
- `lectures` - Lecture content and metadata
- `concepts` - Extracted concepts from lectures
- `review_sessions` - Review session data and conversation history

### 5. Start the Development Servers

You'll need two terminal windows:

#### Terminal 1 - Backend Server:
```bash
cd backend
npm run dev
```
Server runs on http://localhost:3001

#### Terminal 2 - Frontend Server:
```bash
cd frontend
npm run dev
```
Frontend runs on http://localhost:5173

### 6. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## Getting API Keys

### Anthropic API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-ant-api03-`)

### OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Click "Create new secret key"
4. Name your key (e.g., "Super Feynman")
5. Copy the key (starts with `sk-proj-` or `sk-`)

**Important:** Keep your API keys secure and never commit them to version control.

## Project Structure

```
Super-Feynman/
├── backend/                    # Express.js backend
│   ├── controllers/           # Request handlers
│   ├── database/              # SQLite database and schema
│   ├── middleware/            # Express middleware
│   ├── routes/                # API route definitions
│   ├── services/              # AI service integrations
│   ├── uploads/               # Temporary file uploads
│   ├── server.js              # Main server file
│   ├── package.json           # Backend dependencies
│   └── .env.example           # Environment template
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── services/          # API client
│   │   ├── lib/               # Utilities
│   │   ├── App.tsx            # Main app component
│   │   └── main.tsx           # Entry point
│   ├── package.json           # Frontend dependencies
│   └── .env.example           # Environment template
├── dev/                        # Development documentation
└── README.md                   # This file
```

## Available Scripts

### Backend Scripts

```bash
npm start          # Run production server
npm run dev        # Run development server with nodemon
npm run init-db    # Initialize/reset database
```

### Frontend Scripts

```bash
npm run dev        # Start development server (Vite)
npm run build      # Build for production
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
```

## Usage Guide

### 1. Create a Course

- Click "+ Add Course" on the home page
- Enter a course name (e.g., "CS 101 - Data Structures")
- Click "Add"

### 2. Upload a Lecture

- Click on a course to view lectures
- Click "+ Add Lecture"
- Enter a lecture name
- Upload a .txt file with your lecture notes (max 5MB)
- AI will automatically extract 5-15 key concepts

### 3. Review a Concept

- Click on a lecture to view concepts
- Click on a concept to review
- Select an audience level (classmate, middleschooler, or kid)
- Explain the concept using text or voice recording
- Have a back-and-forth conversation (5 turns)
- Receive detailed feedback and progress update

### 4. Use Voice Recording

- Click the microphone button in the review session
- Grant microphone permission when prompted
- Speak your explanation (button turns red while recording)
- Click the microphone again to stop
- Audio is transcribed automatically
- Edit the transcription if needed, then send

## Production Deployment

### Environment Configuration

1. **Backend (.env)**:
```env
NODE_ENV=production
PORT=3001
ANTHROPIC_API_KEY=your_production_key
OPENAI_API_KEY=your_production_key
DATABASE_PATH=./database/superfeynman.db
CORS_ORIGIN=https://your-frontend-domain.com
FRONTEND_URL=https://your-frontend-domain.com
```

2. **Frontend (.env)**:
```env
VITE_API_URL=https://your-backend-domain.com
```

### Building for Production

#### Backend:
```bash
cd backend
NODE_ENV=production npm start
```

#### Frontend:
```bash
cd frontend
npm run build
# Serve the dist/ folder with your preferred static file server
```

### Deployment Considerations

- **CORS**: Update `CORS_ORIGIN` to match your frontend domain
- **HTTPS**: Required for MediaRecorder API (microphone access) in production
- **Database**: SQLite file should be backed up regularly
- **API Keys**: Use production API keys with appropriate rate limits
- **File Uploads**: Configure storage for uploaded files (currently uses local filesystem)

## Browser Compatibility

- **Chrome** (recommended): Full support for all features
- **Firefox**: Full support for all features
- **Safari**: Requires Safari 14.1+ for audio recording (MediaRecorder API)
- **Edge**: Full support for all features

## Troubleshooting

### Backend won't start

- **Check Node.js version**: Run `node --version` (need v18+)
- **Database permission**: Ensure `backend/database/` directory is writable
- **Port conflict**: Make sure port 3001 is not in use

### Frontend can't connect to backend

- **Check backend is running**: Visit http://localhost:3001/health
- **CORS errors**: Verify `CORS_ORIGIN` in backend `.env` matches frontend URL
- **API URL**: Verify `VITE_API_URL` in frontend `.env` is correct

### Concept generation fails

- **API key**: Verify `ANTHROPIC_API_KEY` is valid
- **Rate limits**: Check your Anthropic account usage
- **Network**: Ensure server has internet access

### Audio recording not working

- **Browser support**: Check browser compatibility above
- **Permissions**: Allow microphone access when prompted
- **HTTPS**: MediaRecorder requires HTTPS in production (localhost is exempt)
- **OpenAI key**: Verify `OPENAI_API_KEY` is valid for Whisper API

### Database errors

- **Initialize**: Run `npm run init-db` in backend directory
- **Permissions**: Ensure database file is writable
- **Corruption**: Delete `superfeynman.db` and re-initialize

## Development Notes

- **Audio format**: Frontend auto-detects browser support (webm for Chrome/Firefox, mp4 for Safari)
- **File uploads**: Temporary files in `backend/uploads/` are cleaned up after processing
- **Database**: Located at `backend/database/superfeynman.db`
- **Concept extraction**: Takes 5-15 seconds depending on lecture length
- **Review sessions**: Auto-end after 5 user messages

## Known Limitations

- Delete buttons on cards use hover effects (may not work well on touch devices)
- No explicit responsive breakpoints (relies on vertical stacking)
- iOS Safari not extensively tested (requires physical device)
- Max lecture file size: 5MB
- Max audio file size: 25MB

## Future Enhancements

- User authentication and multi-user support
- Export/import functionality for courses
- Spaced repetition scheduling
- Mobile app version
- Cloud database integration
- Collaborative study sessions

## License

MIT

## Contributing

This project was developed as an MVP for a hackathon. Contributions, issues, and feature requests are welcome!

## Acknowledgments

- Built with [Claude Code](https://claude.com/claude-code)
- AI powered by [Anthropic Claude](https://www.anthropic.com)
- Speech-to-text by [OpenAI Whisper](https://openai.com/research/whisper)
