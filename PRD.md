# James PWA n8n - Product Requirements Document (PRD)

> **Version:** 1.0  
> **Last Updated:** February 2026  
> **Status:** Active Development

---

## Executive Summary

**James** is an AI-powered conversational agent designed as a Progressive Web App (PWA) optimized for iOS devices. James provides a native app experience through home screen pinning, enabling seamless voice and text conversations with AI agents powered by n8n workflows.

### Target Users

- iOS users seeking a native app experience without App Store deployment
- Users who prefer voice-first communication over text
- Individuals needing quick AI assistance on-the-go
- n8n workflow users wanting mobile access to their AI agents

### Unique Value Proposition

- **Native iOS Experience**: PWA with home screen pinning for app-like feel
- **Voice-First Design**: Optimized for voice conversations with quick text fallback
- **n8n Integration**: Leverages existing n8n workflows for AI processing
- **No App Store**: Instant deployment and updates without Apple approval

---

## 1. Product Vision

James aims to bridge the gap between web apps and native iOS experiences by providing a fully functional AI conversational agent that can be installed directly to the home screen, offering the convenience of native apps with the flexibility of web technologies.

### Success Metrics

- **User Engagement**: Daily active users (DAU) and session duration
- **Voice Usage**: Percentage of conversations using voice vs. text
- **PWA Install Rate**: Conversion from web visitor to home screen install
- **Response Time**: Average latency from voice recording to AI response
- **Session Quality**: User satisfaction with conversation quality

---

## 2. Core Features

### 2.1 Voice Conversations

**Priority:** P0 (Critical)

**Description:** Users can record voice messages that are transcribed and processed by AI agents.

**Requirements:**
- One-tap voice recording with visual feedback
- Real-time recording indicator with duration display
- Automatic transcription via n8n workflows
- Voice message history with timestamps
- Playback of recorded audio

**User Stories:**
- As a user, I want to record voice messages so I can communicate naturally
- As a user, I want to see recording duration so I know how long I've been speaking
- As a user, I want to review my voice messages before sending

**Technical Notes:**
- Web Audio API for recording
- Blob storage for audio chunks
- MimeType detection (webm/mp3)
- n8n webhook for transcription

---

### 2.2 iOS PWA Experience

**Priority:** P0 (Critical)

**Description:** James must provide a native iOS app experience when pinned to the home screen.

**Requirements:**
- Full-screen mode without browser chrome
- Safe area support for iPhone notch and home indicator
- Proper viewport handling for orientation changes
- Home screen icon with proper sizing
- Splash screen for launch
- Offline support with service worker

**User Stories:**
- As an iOS user, I want to add James to my home screen so it feels like a native app
- As a user, I want James to run in full-screen mode so it doesn't look like a website
- As a user, I want James to work offline when I have no internet connection

**Technical Notes:**
- vite-plugin-pwa configuration
- manifest.json with iOS-specific settings
- Safe area CSS (safe-area-inset-top/bottom)
- Viewport height calculation for mobile browsers
- Service worker for offline caching

---

### 2.3 AI Agent Integration

**Priority:** P0 (Critical)

**Description:** James connects to n8n workflows for AI processing and responses.

**Requirements:**
- Webhook integration with n8n
- Session management for conversation context
- Support for both text and audio message types
- Error handling for webhook failures
- Typing indicators during AI processing

**User Stories:**
- As a user, I want James to remember our conversation so we can continue talking
- As a user, I want to know when James is thinking so I don't send multiple messages
- As a user, I want error messages if James can't process my request

**Technical Notes:**
- n8n webhook endpoint: `https://agent.froste.eu/webhook/...`
- Session ID generation for conversation tracking
- FormData for audio uploads
- JSON for text messages
- Retry logic for failed requests

---

### 2.4 Quick Emotion Responses

**Priority:** P1 (High)

**Description:** One-tap emotion buttons for instant sentiment-based responses.

**Requirements:**
- Happy button (😊) for positive responses
- Sad button (😔) for negative responses
- Instant message sending without typing
- Visual feedback on button press

**User Stories:**
- As a user, I want to quickly express how I'm feeling without typing
- As a user, I want James to understand my emotional state from quick taps

**Technical Notes:**
- Pre-defined message templates
- onClick handlers with immediate dispatch
- Disabled state during recording

---

### 2.5 Chat Interface

**Priority:** P1 (High)

**Description:** Modern, responsive chat interface optimized for mobile.

**Requirements:**
- Message bubbles with user/AI distinction
- Auto-scroll to latest message
- Typing indicator animation
- Timestamp display
- Text input with send button
- Voice recording button with toggle

**User Stories:**
- As a user, I want to see my messages and James's responses clearly separated
- As a user, I want the chat to automatically scroll to new messages
- As a user, I want to know when James is typing a response

**Technical Notes:**
- React state management
- Scroll-to-bottom ref
- Conditional rendering for typing state
- Safe area handling for input area

---

## 3. Technical Architecture

### 3.1 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 | UI framework |
| **Language** | TypeScript | Type safety |
| **Build Tool** | Vite | Fast development server |
| **PWA** | vite-plugin-pwa | Progressive Web App support |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Components** | shadcn/ui | Pre-built UI components |
| **Routing** | React Router | Navigation |
| **State** | React Hooks | State management |
| **Audio** | Web Audio API | Voice recording |
| **Backend** | n8n | AI workflow automation |

### 3.2 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    James PWA (iOS)                           │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  React Frontend (TypeScript + Vite)                     ││
│  │  - Chat Interface                                      ││
│  │  - Voice Recording                                     ││
│  │  - Session Management                                   ││
│  │  - PWA Service Worker                                  ││
│  └─────────────────────────────────────────────────────────┘│
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Web Audio API (Voice Recording)                        ││
│  │  - Audio Context                                       ││
│  │  - MediaRecorder                                       ││
│  │  - Blob Storage                                        ││
│  └─────────────────────────────────────────────────────────┘│
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  n8n Webhook Integration                               ││
│  │  - POST /webhook/{id}                                   ││
│  │  - Audio Upload (FormData)                              ││
│  │  - Text Messages (JSON)                                 ││
│  │  - Session Tracking                                     ││
│  └─────────────────────────────────────────────────────────┘│
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  AI Processing (n8n Workflows)                          ││
│  │  - OpenAI / Custom Models                               ││
│  │  - Transcription (Whisper)                              ││
│  │  - Response Generation                                  ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Data Flow

**Voice Message Flow:**
1. User taps microphone button
2. Web Audio API starts recording
3. User stops recording
4. Audio chunks stored in Blob
5. FormData created with audio file
6. POST to n8n webhook
7. n8n processes audio (transcription + AI)
8. Response returned as text
9. Displayed in chat interface

**Text Message Flow:**
1. User types message
2. JSON payload created
3. POST to n8n webhook
4. n8n processes with AI
5. Response returned
6. Displayed in chat interface

---

## 4. User Experience

### 4.1 Onboarding

**First-Time User Experience:**

1. **Welcome Screen**
   - "Hello! I'm James. How are you today?"
   - Install prompt for home screen
   - Voice recording tutorial

2. **Permissions**
   - Microphone access request
   - Explanation of voice usage

3. **Quick Start**
   - One-tap voice recording demo
   - Text input fallback option

### 4.2 Daily Use

**Typical Session:**
1. User opens James from home screen
2. Taps microphone button
3. Records voice message
4. James processes and responds
5. User continues conversation
6. Session auto-saved

### 4.3 Error States

**Graceful Degradation:**
- Webhook failure: "Sorry, I'm having trouble connecting right now."
- Microphone denied: Fall back to text input
- Offline mode: Show cached messages, queue for sync
- Recording error: "Please try recording again"

---

## 5. Roadmap

### Phase 1: MVP (Current)

- ✅ Voice recording and playback
- ✅ n8n webhook integration
- ✅ iOS PWA support
- ✅ Chat interface
- ✅ Session management
- ✅ Quick emotion buttons

### Phase 2: Enhanced Experience (Q1 2026)

- 🔄 Voice message playback
- 🔄 Conversation history export
- 🔄 Settings page (theme, preferences)
- 🔄 Push notifications for new messages
- 🔄 Multi-language support

### Phase 3: Advanced Features (Q2 2026)

- 📝 Conversation summaries
- 🔍 Search within conversations
- 🤖 Multiple AI agent selection
- 📊 Usage analytics dashboard
- 🌐 Desktop PWA support

---

## 6. Success Criteria

### Technical

- [ ] PWA score > 90 on Lighthouse
- [ ] Voice recording latency < 500ms
- [ ] Webhook response time < 3 seconds
- [ ] Offline mode works for 24 hours
- [ ] iOS 14+ compatibility

### User Experience

- [ ] Install-to-home-screen conversion > 20%
- [ ] Voice usage > 60% of conversations
- [ ] Session duration > 5 minutes
- [ ] User satisfaction > 4.5/5

### Business

- [ ] 100+ daily active users
- [ ] 50% of users return within 7 days
- [ ] < 5% error rate on voice messages
- [ ] 95% uptime for webhook endpoint

---

## 7. Risks & Mitigations

### Risk 1: iOS PWA Limitations

**Risk:** iOS PWA has limitations compared to native apps

**Mitigation:**
- Focus on core voice/text features
- Provide clear installation instructions
- Test on multiple iOS versions
- Document known limitations

### Risk 2: Webhook Latency

**Risk:** n8n webhook may have high latency

**Mitigation:**
- Implement loading indicators
- Add timeout handling
- Provide retry logic
- Cache common responses

### Risk 3: Voice Recording Quality

**Risk:** Poor audio quality on some devices

**Mitigation:**
- Test on multiple iOS devices
- Implement audio quality checks
- Provide text fallback
- Add recording quality indicator

### Risk 4: Service Worker Compatibility

**Risk:** Service worker may not work on all iOS versions

**Mitigation:**
- Graceful degradation for older iOS
- Clear messaging about offline limitations
- Progressive enhancement approach

---

## 8. Dependencies

### External Services

- **n8n**: AI workflow automation (self-hosted or cloud)
- **OpenAI API**: AI model for responses (via n8n)
- **Whisper API**: Audio transcription (via n8n)

### Libraries

- `react`, `react-dom`: UI framework
- `vite`, `vite-plugin-pwa`: Build tooling
- `lucide-react`: Icons
- `shadcn/ui`: UI components
- `tailwindcss`: Styling
- `react-router-dom`: Routing

---

## 9. Appendix

### A. Environment Variables

```env
# n8n Webhook
VITE_N8N_WEBHOOK_URL=https://agent.froste.eu/webhook/...

# Optional: API Keys (if needed)
# VITE_OPENAI_API_KEY=sk-...
# VITE_WHISPER_API_KEY=sk-...
```

### B. Installation Instructions

```bash
# Clone the repository
git clone https://github.com/magnusfroste/james-pwa-n8n.git
cd james-pwa-n8n

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### C. iOS Installation

1. Open Safari on your iOS device
2. Navigate to your app URL
3. Tap the Share button (square with arrow)
4. Select "Add to Home Screen"
5. James will launch in full-screen mode

---

**Document History:**

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Feb 2026 | Initial PRD creation | Magnus Froste |

---

**License:** MIT - See LICENSE file for details
