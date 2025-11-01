# 🌊 Inner Tides

> Silence isn't empty—it's where thinking, recovery, and tiny acts of care happen.

**Inner Tides** is an interactive wellness experience that transforms moments of silence into living art. By listening to your quiet moments, it creates beautiful visualizations with orca-inspired animations, captures your words as floating bubbles, and generates AI-powered memory images that help you reflect on your inner state.

## ✨ Features

### 🎤 Real-Time Audio Visualization
- **Microphone Monitoring**: Continuous audio level analysis using Web Audio API
- **Silence Detection**: Automatically detects 3 seconds of silence
- **Emotional Color Mapping**: Audio frequencies map to dynamic color palettes
  - Low frequencies → Blue tones
  - Mid frequencies → Green tones
  - High frequencies → Red tones

### 🐋 Interactive Orca Animations
- **2D + 3D Rendering**: Combines p5.js and Three.js for layered visuals
- **Organic Movement**: Orcas swim using Perlin noise for natural behavior
- **Ripple Effects**: Beautiful water ripples follow each orca
- **Persistent Memory**: Orcas remain on screen throughout your session
- **Click Interactions**: Click any orca to see captured words and metadata

### 💬 Live Word Cloud
- **Speech Recognition**: Real-time speech-to-text using Web Speech API
- **Smart Filtering**: Removes common stop words, focuses on meaningful content
- **Floating Bubbles**: Words appear as animated bubbles that rise and fade
- **Emotion Colors**: Bubble colors reflect your emotional state
- **Live Captions**: Real-time transcript display at the bottom of the screen

### 🎨 AI-Generated Memory Images
- **Stable Diffusion XL**: Generates unique artistic images for each silence
- **Contextual Prompts**: "A person [your activity] with [your feeling] emotion in animation style"
- **Graceful Fallback**: Beautiful SVG placeholders when API is unavailable
- **Local Storage**: Images stored as data URLs for instant access

### 📔 Memory Timeline
- **Chronological Journal**: All silence moments organized by date
- **Rich Metadata**: Activity, feeling, timestamp, word count
- **Visual Tags**: Color-coded by emotion (happy, calm, peaceful, nervous, excited, thoughtful)
- **Export/Import**: Download memories as JSON
- **Statistics Dashboard**: Total memories, days recorded, average words captured

### 🎵 Ambient Soundscapes
- **Orca Echoes**: Three unique ocean soundtracks
- **Triggered by Silence**: Plays automatically when silence is detected
- **Atmospheric Audio**: Creates an immersive, calming experience

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (with npm or pnpm)
- **Modern Browser** with support for:
  - Web Audio API
  - Web Speech API (Chrome, Edge, Safari)
  - localStorage
  - Microphone permissions

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/inner-tides.git
   cd inner-tides
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Configure AI Image Generation** (Optional but recommended)

   To enable AI-generated memory images:

   a. Sign up for a free account at [Hugging Face](https://huggingface.co/)

   b. Generate an API token at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
      - Click "New token"
      - Give it a name (e.g., "inner-tides")
      - **Important**: Enable "Make calls to serverless Inference API" permission
      - Click "Generate token"

   c. Create `.env.local` file:
      ```bash
      cp .env.local.example .env.local
      ```

   d. Add your token to `.env.local`:
      ```env
      NEXT_PUBLIC_HF_API_TOKEN=hf_your_token_here
      ```

   **Note**: Without the API token, the app uses colorful SVG placeholders instead.

4. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## 📖 How to Use

### 1. Home Page (`/`)
- Learn about Inner Tides
- Navigate to the Experience or Memory pages

### 2. Visualize Page (`/visualize`)
This is the main experience:

1. **Grant Permissions**: Allow microphone access when prompted
2. **Click "Start Listening"**: Begin the session
3. **Speak or Stay Silent**:
   - Your words appear as floating bubbles
   - Audio levels create dynamic colors
   - After 3 seconds of silence, an orca appears!
4. **Fill the Survey**: When silence is detected:
   - Describe what you were doing
   - Select how you're feeling (6 options)
   - AI generates a unique image
   - Your memory is saved
5. **Explore Orcas**: Click any orca to see its captured words

### 3. Memory Page (`/memory`)
- View all your silence memories in a beautiful timeline
- Click any memory bubble to see:
  - AI-generated image
  - What you were doing
  - How you were feeling
  - Words captured
  - Timestamp
- **Export**: Download all memories as JSON
- **Clear**: Delete all stored data

## 🏗️ Architecture

### Tech Stack

#### Frontend Framework
- **Next.js 16.0.0** - React framework with App Router
- **React 19** - UI library with latest features
- **TypeScript 5** - Type-safe development

#### Visualization
- **p5.js** - 2D creative coding (orcas, ripples, word bubbles)
- **Three.js + React Three Fiber** - 3D orca models
- **@react-three/drei** - Three.js utilities

#### Audio & Speech
- **Web Audio API** - Microphone input and frequency analysis
- **Web Speech API** - Real-time speech recognition

#### AI & ML
- **Hugging Face Inference API** - Image generation
- **Stable Diffusion XL** - AI model for artistic images
- **@xenova/transformers** - Transformers.js for ML

#### UI Components
- **Shadcn UI** - 57+ accessible components
- **Radix UI** - Headless UI primitives
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library

#### Data & Storage
- **localStorage API** - Client-side persistence
- **React Hook Form + Zod** - Form validation

### Project Structure

```
inner-tides/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Home page
│   ├── visualize/           # Main experience page
│   ├── memory/              # Memory timeline page
│   └── layout.tsx           # Root layout
│
├── components/              # React components
│   ├── visualization-canvas.tsx  # Main orchestrator
│   ├── p5-wrapper.tsx           # p5.js canvas
│   ├── orcas-3d-layer.tsx       # Three.js layer
│   ├── word-bubble-layer.tsx    # Floating words
│   ├── silence-survey.tsx       # Survey popup
│   ├── memory-timeline.tsx      # Timeline view
│   └── ui/                      # Shadcn components
│
├── hooks/                   # Custom React hooks
│   └── useSpeechRecognition.ts
│
├── utils/                   # Utility functions
│   ├── imageGeneration.ts   # AI image generation
│   ├── surveyStorage.ts     # localStorage management
│   ├── orcaAudio.ts        # Audio playback
│   └── wordExtractor.ts    # Speech processing
│
├── public/                  # Static assets
│   ├── models/orca.glb     # 3D orca model
│   └── orca-soundtracks/   # Audio files
│
└── .env.local              # Environment variables
```

### Key Components

1. **`visualization-canvas.tsx`** - Main orchestrator that:
   - Manages microphone input
   - Analyzes audio frequencies
   - Detects silence (3-second threshold)
   - Coordinates speech recognition
   - Triggers orca creation
   - Controls soundtrack playback

2. **`p5-wrapper.tsx`** - p5.js canvas that:
   - Renders orcas with organic swimming behavior
   - Creates ripple effects
   - Manages orca lifecycle
   - Handles click events

3. **`word-bubble-layer.tsx`** - Word visualization that:
   - Creates floating bubbles for new words
   - Animates upward motion with waves
   - Fades out after lifecycle
   - Applies emotion-based colors

4. **`silence-survey.tsx`** - Survey modal that:
   - Collects user activity and feeling
   - Triggers AI image generation
   - Saves to localStorage
   - Stops microphone during input

5. **`memory-timeline.tsx`** - Timeline display that:
   - Groups memories by date
   - Shows color-coded cards
   - Calculates statistics
   - Handles export/clear operations

## 🎨 Design System

### Color Palette
- **Background**: `#FBFBFA` (Notion-inspired off-white)
- **Text**: Gray scale (`gray-900`, `gray-600`, `gray-500`)
- **Accents**: Emotion-based pastels
  - Happy: Yellow (`yellow-50`, `yellow-200`)
  - Calm: Blue (`blue-50`, `blue-200`)
  - Peaceful: Green (`green-50`, `green-200`)
  - Nervous: Purple (`purple-50`, `purple-200`)
  - Excited: Red (`red-50`, `red-200`)
  - Thoughtful: Indigo (`indigo-50`, `indigo-200`)

### Typography
- **Font**: Geist Sans (Variable)
- **Weights**: Regular (400), Medium (500), Semibold (600), Bold (700)

## 🌐 Browser Compatibility

| Browser | Speech Recognition | Audio API | 3D Graphics |
|---------|-------------------|-----------|-------------|
| Chrome 90+ | ✅ | ✅ | ✅ |
| Edge 90+ | ✅ | ✅ | ✅ |
| Safari 14+ | ✅ | ✅ | ✅ |
| Firefox 90+ | ❌ | ✅ | ✅ |

**Note**: Firefox doesn't support Web Speech API. The app will work but without speech recognition features.

## 🔒 Privacy & Data

- **All data stored locally** in your browser's localStorage
- **No server-side storage** of personal information
- **Microphone access** only during active sessions
- **AI image generation** sends only text prompts (activity + feeling)
- **Export anytime** - You own your data

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Orca Sounds**: Ocean soundscape recordings
- **3D Model**: Orca .glb model
- **AI Models**: Hugging Face Stable Diffusion XL
- **Inspiration**: The quiet moments that make us human

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Made with 🐋 and silence**
