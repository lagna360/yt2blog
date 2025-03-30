# YouTube to Blog - Electron App

This is the desktop application for converting YouTube videos to blog articles using AI. The application is built with Electron, React, Vite, and Tailwind CSS.

## Features

- Convert YouTube videos to blog articles using AI
- Customize article style and tone with natural language instructions
- Quality verification with AI (up to 5 iterations for quality improvement)
- Client-side processing (no backend server)
- User-provided API keys for YouTube and LLM services
- Dark mode by default
- Cross-platform (macOS, Windows, Linux)
- Responsive, mobile-first design

## Prerequisites

- Node.js 16+ and npm installed
- Internet connection for API calls to YouTube and LLM services
- API keys for YouTube Data API and your preferred LLM service

## Development

```bash
# Clone the repository (if you haven't already)
git clone <repository-url>
cd electron-app

# Install dependencies
npm install

# Run in development mode
npm run electron:dev
```

## Testing

```bash
# Run unit tests
npm test

# Run tests with coverage report
npm run test:coverage
```

## Building

```bash
# Build for all platforms
npm run electron:build

# Build for specific platforms
npm run electron:build:mac
npm run electron:build:win
npm run electron:build:linux
```

## Application Flow

1. **User Input**: Enter YouTube URLs, natural language instruction, and API keys
2. **Video Content Scraping**: Fetch and extract content from YouTube videos
3. **Content Processing**: Generate an article using the LLM based on instructions
4. **Verification Loop**: Review the article for quality and improve if needed
5. **Output**: Display the final article with options to copy or export

## Technical Requirements

- The application is built with React and Vite
- Styling is done with Tailwind CSS v4.0.17
- Dark mode is enabled by default
- Maximum supported width is 1280px
- The application follows responsive, mobile-first design principles
- All API keys must be entered via the user interface - no hardcoded keys or .env files

## Security Notes

- The application is unsigned. Users may see security warnings during installation - this is normal
- API keys are handled client-side only and are not stored persistently
- No data is sent to external servers except for the API calls to YouTube and LLM services

## Project Structure

```
├── electron/          # Electron main process code
├── public/            # Static assets
├── src/               # React application code
│   ├── components/    # UI components
│   ├── context/       # React context providers
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API services
│   └── utils/         # Utility functions
├── assets/            # Build resources for Electron
├── tests/             # Test files
└── REQUIREMENTS.md    # Detailed project requirements
```

## Troubleshooting

- **Port Already in Use**: The application will automatically terminate any process using the default port
- **API Key Issues**: Ensure you have valid API keys with the correct permissions
- **Video Unavailable**: Some videos may have restricted transcripts or be unavailable in certain regions
