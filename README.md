<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# StreamBitch

A Progressive Web App (PWA) for monitoring Chaturbate model streams with a modern, responsive dashboard.

## Features

- 📱 **Progressive Web App** - Install and use offline
- 🎯 **Stream Monitoring** - Monitor multiple streams simultaneously
- ⏱️ **Time Tracking** - Clock in/out functionality for session tracking
- 📝 **Notes** - Add notes to each stream
- 🎨 **Group Management** - Organize streams into groups
- 💾 **Local Storage** - All data saved locally in your browser

## Run Locally

**Prerequisites:** Node.js 18+ and npm

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd streambitch
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` and add your Gemini API key (if needed for future features).

   **⚠️ Important:** Never commit your `.env.local` file or expose your API keys in client-side code.

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and sign in
3. Click "New Project" and import your GitHub repository
4. Vercel will auto-detect Vite settings
5. Add environment variables (if needed):
   - Go to Project Settings → Environment Variables
   - Add `GEMINI_API_KEY` (if needed for future features)
   - **Important:** Never expose API keys in client-side code
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow the prompts to link your project

## Deploy to GitHub Pages

1. Update `vite.config.ts` to set the correct `base` path:
   ```typescript
   export default defineConfig({
     base: '/your-repo-name/',
     // ... rest of config
   })
   ```

2. Install `gh-pages`:
   ```bash
   npm install --save-dev gh-pages
   ```

3. Add deploy script to `package.json`:
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

## Security Notes

- **API Keys:** The Gemini API key is configured but not currently used in client-side code. If you add features that require it, use a backend API endpoint to keep the key secure.
- **Environment Variables:** Never commit `.env.local` or any files containing API keys to version control.
- **Client-Side Security:** All API calls that require authentication should be made through a backend proxy to prevent exposing credentials.

## PWA Features

This app is a Progressive Web App, which means:

- ✅ Installable on mobile and desktop devices
- ✅ Works offline (cached resources)
- ✅ Fast loading with service worker caching
- ✅ App-like experience with standalone display mode

To install:
- **Desktop:** Look for the install icon in your browser's address bar
- **Mobile:** Use "Add to Home Screen" from your browser menu

## Project Structure

```
streambitch/
├── components/          # React components
├── public/             # Static assets and PWA files
├── App.tsx             # Main app component
├── index.html          # HTML entry point
├── index.tsx           # React entry point
├── vite.config.ts      # Vite configuration
├── vercel.json         # Vercel deployment config
└── package.json        # Dependencies and scripts
```

## License

MIT
