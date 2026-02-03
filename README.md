# James PWA n8n 💬

An AI-powered conversational agent designed for iOS with a native app experience. James is a Progressive Web App (PWA) that can be pinned to your home screen for seamless voice and text conversations.

## Features

- **🎤 Voice Conversations**: Record and send voice messages with real-time transcription
- **📱 iOS PWA**: Install on your home screen for a native app experience
- **🤖 AI Agent**: Powered by n8n workflows for intelligent responses
- **💬 Dual Mode**: Both voice and text communication support
- **😊 Quick Emotions**: One-tap emotion buttons for instant responses
- **🎨 Modern UI**: Clean interface with shadcn/ui components
- **📊 Session Tracking**: Persistent chat sessions with message history
- **🔄 Auto-Update**: PWA with automatic background updates

## iOS Home Screen Experience

James is designed specifically for iOS users who want a native app experience:

1. **Install to Home Screen**: Add James to your iOS home screen for instant access
2. **Full-Screen Mode**: Runs in full-screen mode without browser chrome
3. **Safe Area Support**: Properly handles iPhone notch and home indicator
4. **Portrait Optimized**: Perfect for one-handed use on iPhone
5. **Offline Ready**: Works offline and syncs when reconnected

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

### Install on iOS

1. Open Safari on your iOS device
2. Navigate to your app URL
3. Tap the Share button
4. Select "Add to Home Screen"
5. James will launch in full-screen mode like a native app

### Build for Production

```bash
npm run build
```

## Audio Conversations

James supports voice-first conversations:

1. **Tap the Microphone**: Start recording your voice
2. **Speak Naturally**: Say what you want to communicate
3. **Tap to Stop**: End recording and send to James
4. **Receive Response**: James processes your voice and responds

Voice messages are sent to n8n workflows for transcription and AI processing, with responses delivered as text.

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **vite-plugin-pwa** - PWA support
- **shadcn/ui** - Components
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **TanStack Query** - Data fetching
- **n8n** - AI workflow automation

## Architecture

```
User Interface (React PWA)
    ↓
Voice Recording (Web Audio API)
    ↓
n8n Webhook Integration
    ↓
AI Processing (OpenAI/Custom Models)
    ↓
Response Delivery
```

## License

MIT
