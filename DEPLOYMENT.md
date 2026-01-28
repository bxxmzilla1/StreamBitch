# Deployment Guide

## Pre-Deployment Checklist

- [x] API keys removed from client-side code
- [x] `.env.local` added to `.gitignore`
- [x] PWA manifest created
- [x] Service worker configured
- [x] Vercel configuration added
- [x] README updated with deployment instructions

## Important Notes

### API Key Security
- The Gemini API key has been removed from `vite.config.ts` to prevent client-side exposure
- If you need to use the API key in the future, create a backend API endpoint to proxy requests
- Never expose API keys in client-side JavaScript code

### Icon Files
If you have icon files (`icon16.png`, `icon48.png`, `icon128.png`, `icon.svg`) in the root directory, move them to the `public/` folder for the PWA to work correctly.

## GitHub Setup

1. Initialize git repository (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: PWA setup with Vercel deployment"
   ```

2. Create a new repository on GitHub

3. Link and push:
   ```bash
   git remote add origin <your-github-repo-url>
   git branch -M main
   git push -u origin main
   ```

## Vercel Deployment

### Automatic Deployment (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the Vite configuration
5. Click "Deploy"

### Environment Variables (if needed)

If you add backend features that require the Gemini API key:

1. Go to Project Settings → Environment Variables
2. Add `GEMINI_API_KEY` with your key
3. Redeploy the project

**Remember:** Environment variables in Vercel are server-side only and won't be exposed to clients.

## Testing PWA Features

After deployment:

1. Open your deployed site
2. Open browser DevTools → Application → Service Workers
3. Verify the service worker is registered
4. Check "Offline" checkbox to test offline functionality
5. Use "Add to Home Screen" to test installation

## Troubleshooting

### Service Worker Not Registering
- Ensure you're using HTTPS (required for service workers)
- Check browser console for errors
- Clear browser cache and reload

### Icons Not Showing
- Verify icon files are in the `public/` folder
- Check that icon paths in `manifest.json` match actual file locations
- Ensure icons are accessible (not blocked by CORS)

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Check that `vite-plugin-pwa` is in `devDependencies`
- Verify Node.js version is 18+
