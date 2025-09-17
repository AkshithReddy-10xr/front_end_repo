# RAG News Chatbot Frontend

A modern React-based chat interface for the RAG-powered news chatbot. Built with React 19, SCSS, and Socket.IO for real-time communication.

## 🚀 Features

- **Modern Chat Interface**: Clean, responsive chat UI inspired by modern messaging apps
- **Real-time Communication**: WebSocket integration for live message streaming
- **Session Management**: Persistent chat sessions with history
- **Responsive Design**: Mobile-first design that works on all devices
- **Dark Theme**: Modern dark theme optimized for readability
- **Message Streaming**: Real-time message streaming with typing indicators
- **Error Handling**: Graceful error handling with retry mechanisms
- **Export Functionality**: Export chat sessions as JSON
- **Accessibility**: Full keyboard navigation and screen reader support
- **Progressive Enhancement**: Works offline with graceful degradation

## 🛠 Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Framework** | React 19 | Modern React with latest features |
| **Styling** | SCSS | Modular, maintainable styling |
| **State Management** | React Hooks | Built-in state management |
| **HTTP Client** | Axios | API communication |
| **WebSocket** | Socket.IO Client | Real-time communication |
| **Build Tool** | Create React App | Development and build tooling |
| **Testing** | Jest + Testing Library | Unit and integration testing |

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Running RAG Chatbot Backend

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <your-frontend-repo-url>
   cd rag-chatbot-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory:
   ```env
   # Backend API Configuration
   REACT_APP_API_BASE_URL=https://your-backend-api.com
   REACT_APP_WS_URL=https://your-backend-api.com
   
   # App Configuration
   REACT_APP_APP_NAME=RAG News Chatbot
   
   # Optional - Development
   GENERATE_SOURCEMAP=false
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm start
```
Runs the app in development mode at `http://localhost:3000`

### Production Build
```bash
npm run build
```
Builds the app for production to the `build` folder

### Testing
```bash
npm test
```
Launches the test runner in interactive watch mode

## 🎨 UI Components

### ChatInterface
The main chat container with sidebar navigation and message area.

**Features:**
- Session management (new, clear, export)
- Responsive sidebar with mobile toggle
- Message history display
- Input area with auto-resize

### MessageList  
Displays conversation messages with proper styling and interactions.

**Features:**
- Message bubbles for user/assistant/system messages
- Typing indicators with animated dots
- Timestamp display (optional)
- Source citations for RAG responses
- Auto-scroll with manual override

### MessageBubble
Individual message component with type-specific styling.

**Message Types:**
- **User**: Blue bubble, right-aligned
- **Assistant**: Gray bubble, left-aligned with AI avatar
- **System**: Centered, informational styling
- **Error**: Red styling with retry button

### InputBox
Smart input component with validation and auto-resize.

**Features:**
- Auto-expanding textarea
- Character count with warnings
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- Input validation and sanitization
- Paste handling with length limits

## 🔌 Real-time Features

### WebSocket Integration
```javascript
// Connection management
websocketService.connect(sessionId);
websocketService.on('message_chunk', handleStreamingMessage);
websocketService.on('typing', handleTypingIndicator);
```

### Message Streaming
Real-time message streaming with chunk-based updates:
- Progressive message building
- Typing indicators
- Connection status monitoring
- Automatic reconnection

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 576px
- **Tablet**: 576px - 768px  
- **Desktop**: 768px - 992px
- **Large**: > 992px

### Mobile Features
- Collapsible sidebar with overlay
- Touch-optimized interactions
- Optimized input handling
- Reduced UI elements for space

## 🎨 Theming

### Dark Theme Variables
```scss
// Primary colors
$primary-color: #007bff;
$success-color: #00d4aa;
$error-color: #ff6b6b;

// Dark theme backgrounds
$body-bg: #0f0f0f;
$surface-bg: #1a1a1a;
$card-bg: #2d2d2d;

// Typography
$font-family-base: 'Inter', system-ui, sans-serif;
```

### Customization
Colors and spacing can be customized in `src/styles/variables.scss`

## 🔄 State Management

### Custom Hooks

#### useChat
Manages chat functionality and message state:
```javascript
const {
  messages,
  isLoading,
  sendMessage,
  clearMessages,
  retryMessage
} = useChat(sessionId);
```

#### useSession  
Handles session management and persistence:
```javascript
const {
  currentSessionId,
  createNewSession,
  clearCurrentSession,
  exportSessionData
} = useSession();
```

## 📁 Project Structure

```
src/
├── components/
│   ├── Chat/
│   │   ├── ChatInterface.jsx    # Main chat container
│   │   ├── MessageList.jsx      # Message display component
│   │   ├── MessageBubble.jsx    # Individual message
│   │   ├── InputBox.jsx         # Message input
│   │   └── SessionControls.jsx  # Session management
│   └── UI/
│       ├── ErrorBoundary.jsx    # Error handling
│       └── LoadingSpinner.jsx   # Loading states
├── hooks/
│   ├── useChat.js              # Chat state management  
│   └── useSession.js           # Session management
├── services/
│   ├── api.js                  # HTTP API client
│   └── websocket.js            # WebSocket client
├── styles/
│   ├── variables.scss          # Design tokens
│   └── components/             # Component styles
├── utils/
│   └── constants.js            # App constants
└── App.js                      # Main app component
```

## 🔐 Security Features

### Input Validation
- Message length limits
- XSS prevention through sanitization
- CSRF protection via headers

### Session Security  
- Session ID validation
- Secure session storage
- Automatic session cleanup

### Error Handling
- Graceful error boundaries
- User-friendly error messages
- Automatic retry mechanisms

## 📈 Performance Optimizations

### React Performance
- Memoized components with `React.memo`
- Optimized re-renders with `useCallback`
- Efficient state updates
- Component lazy loading

### Network Optimization
- Request debouncing
- Connection pooling
- Automatic reconnection
- Fallback mechanisms

### UI Performance
- Virtual scrolling for large message lists
- Optimized animations
- Reduced bundle size
- Progressive loading

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test -- --coverage

# Run tests in watch mode
npm run test:watch
```

### Test Structure
```
src/
├── __tests__/
│   ├── components/
│   ├── hooks/
│   └── services/
└── setupTests.js
```

## 🚀 Deployment

### Vercel Deployment

1. **Connect repository** to Vercel
2. **Set environment variables**:
   ```env
   REACT_APP_API_BASE_URL=https://your-backend-api.com
   REACT_APP_WS_URL=https://your-backend-api.com
   ```
3. **Deploy** - Vercel handles the build automatically

### Netlify Deployment

1. **Build the project**: `npm run build`
2. **Deploy the `build` folder** to Netlify
3. **Configure redirects** for SPA routing

### Environment Variables
Set these in your deployment platform:
- `REACT_APP_API_BASE_URL` - Backend API URL
- `REACT_APP_WS_URL` - WebSocket server URL
- `REACT_APP_APP_NAME` - Application name

## 🔧 Configuration

### API Configuration
```javascript
// src/utils/constants.js
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL,
  WS_URL: process.env.REACT_APP_WS_URL,
  TIMEOUT: 30000,
};
```

### Feature Flags
```javascript
export const FEATURES = {
  WEBSOCKET_ENABLED: false,
  STREAMING_ENABLED: false,
  VOICE_INPUT: false,
  FILE_UPLOAD: false,
};
```

## 🔍 Troubleshooting

### Common Issues

1. **API Connection Errors**
   ```
   Error: Network error - please check your connection
   Solution: Verify REACT_APP_API_BASE_URL is correct
   ```

2. **WebSocket Connection Issues**
   ```
   Warning: WebSocket connection failed, using HTTP fallback
   Solution: Check REACT_APP_WS_URL and CORS settings
   ```

3. **Build Errors**
   ```
   Error: Module not found
   Solution: Clear node_modules and reinstall dependencies
   ```

### Debug Mode
Set `NODE_ENV=development` for detailed error messages and React DevTools.

## 📊 Monitoring

### Performance Monitoring
- Built-in React DevTools support
- Web Vitals reporting
- Error boundary logging
- Connection status tracking

### User Analytics
Integration points for analytics services:
- Message send/receive events
- Session duration tracking
- Error occurrence monitoring
- Feature usage statistics

## ♿ Accessibility

### WCAG Compliance
- **Level AA** compliance target
- Keyboard navigation support
- Screen reader compatibility
- High contrast ratios
- Focus management

### Accessibility Features
- **ARIA labels** on interactive elements
- **Semantic HTML** structure
- **Keyboard shortcuts** for power users
- **Focus indicators** for navigation
- **Alt text** for images and icons

## 🎯 Browser Support

### Supported Browsers
- **Chrome**: Latest 2 versions
- **Firefox**: Latest 2 versions  
- **Safari**: Latest 2 versions
- **Edge**: Latest 2 versions

### Polyfills Included
- Promise support
- Fetch API
- WebSocket fallbacks
- CSS custom properties

## 🔄 Updates & Maintenance

### Dependency Updates
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Security audits
npm audit
```

### Performance Audits
```bash
# Lighthouse audit
npm run build && npx lighthouse http://localhost:3000

# Bundle analysis
npm run build && npx webpack-bundle-analyzer build/static/js/*.js
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Add** tests for new features
5. **Submit** a pull request

### Code Standards
- **ESLint** for code quality
- **Prettier** for formatting
- **Semantic** commit messages
- **Component** documentation

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For issues and questions:
- Check browser console for errors
- Verify environment variables
- Test API connectivity
- Review network requests

## 🚀 Future Enhancements

### Planned Features
- **Voice Input**: Speech-to-text integration
- **File Upload**: Document analysis capability  
- **Multi-language**: Internationalization support
- **Themes**: Light/dark theme toggle
- **Export Options**: PDF, Word document export
- **Search**: Message history search
- **Offline Mode**: Service worker integration

### Performance Improvements
- **Code Splitting**: Route-based splitting
- **Caching**: Better caching strategies
- **Lazy Loading**: Component lazy loading
- **PWA Features**: Progressive web app capabilities
