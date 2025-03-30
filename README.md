# YouTube to Blog Project

This repository contains two completely independent applications:

1. **electron-app/** - A desktop application for converting YouTube videos to blog articles using AI
2. **landing-page/** - A web application that showcases the product and provides download links for the desktop application

## Project Structure

The project is organized into two separate, independent applications:

```
├── electron-app/       # The Electron desktop application
└── landing-page/       # The product landing page website
```

Each application has its own complete set of dependencies, configuration files, and build processes. They can be developed and deployed independently of each other.

## Electron App

The Electron app is a desktop application that allows users to convert YouTube videos to blog articles using AI. It's built with Electron, React, and Tailwind CSS.

### Features
- Convert YouTube videos to blog articles
- Customize article style and tone
- Quality verification with AI (up to 5 iterations)
- Client-side processing (no backend server)
- User-provided API keys for YouTube and LLM services
- Dark mode by default
- Cross-platform (macOS, Windows, Linux)

### Development & Building

See the [electron-app/README.md](./electron-app/README.md) for detailed instructions on:
- Setting up the development environment
- Installing dependencies
- Running in development mode
- Building for production
- Testing

## Landing Page

The landing page is a separate web application that showcases the product and provides download links for the desktop application. It's built with React, Vite, and Tailwind CSS.

### Features
- Product information and features
- Download links for all platforms
- Responsive design
- Dark mode by default

### Development & Building

See the [landing-page/README.md](./landing-page/README.md) for detailed instructions on:
- Setting up the development environment
- Installing dependencies
- Running in development mode
- Building for production
- Deployment

## Technical Requirements

- Both applications follow responsive, mobile-first design principles
- Dark mode is enabled by default using Tailwind CSS v4.0.17
- Maximum supported width is 1280px
- The desktop application is unsigned - users may see security warnings during installation
- All API keys must be entered via the user interface - no hardcoded keys or .env files

## Testing

Both applications include unit tests for key components and functionality. Run tests using the npm test command in each application directory.

## Security Notes

- The application does not store API keys on disk
- All processing happens client-side
- No data is sent to external servers except for the API calls to YouTube and LLM services
