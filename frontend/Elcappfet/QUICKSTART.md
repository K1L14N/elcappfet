# Elcappfet - Quick Start Guide

## 🚀 Getting Started in 3 Minutes

This guide will help you run the Elcappfet application with backend integration.

## Prerequisites

- Node.js 18+ installed
- Python 3.8+ installed
- Git installed
- Expo CLI (will be installed with npm)

## Step 1: Clone and Install

```bash
# Navigate to project root
cd elcappfet

# Install frontend dependencies
cd frontend/Elcappfet
npm install

# Install backend dependencies
cd ../../backend
pip install -r requirements.txt
```

## Step 2: Configure Backend

Create a `.env` file in the `backend` directory:

```bash
# backend/.env
GOOGLE_API_KEY=your_google_genai_api_key_here
```

> **Note**: Get your Google GenAI API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Step 3: Start Backend Server

```bash
# From backend directory
python menu_parser_server.py
```

You should see:

```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

Test backend health:

```bash
curl http://localhost:8000/health
```

## Step 4: Configure Frontend

The frontend is already configured with `.env` file:

```bash
# frontend/Elcappfet/.env (already created)
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
EXPO_PUBLIC_API_TIMEOUT=30000
EXPO_PUBLIC_CACHE_DURATION=7200000
```

> **For Android Emulator**: Change `localhost` to `10.0.2.2` > **For Physical Device**: Use your computer's IP address (e.g., `http://192.168.1.100:8000`)

## Step 5: Start Frontend

```bash
# From frontend/Elcappfet directory
npm start
```

This will open Expo Dev Tools. Choose your platform:

- Press **`i`** for iOS Simulator
- Press **`a`** for Android Emulator
- Scan QR code with Expo Go app for physical device

## What to Expect

### First Launch (Without Cache)

1. **Loading State**: Skeleton screens appear (~1-2 seconds)
2. **Menu Data**: Real menu from Eldora loads
3. **Images**: Food images generate on first view (~3-5 seconds each)

### Subsequent Launches (With Cache)

1. **Instant Load**: Cached data appears immediately
2. **Images**: Cached images load instantly

### Features to Try

✅ **Day Switching**: Tap different days (Mon-Fri) in the day filter
✅ **Pull to Refresh**: Pull down to fetch fresh data
✅ **Offline Mode**: Disable network, app works with cached data
✅ **Menu Cards**: View Bistro and Vitality menus with images

## Troubleshooting

### Backend Not Connecting

**Problem**: "Unable to connect to server"

**Solution**:

1. Verify backend is running: `curl http://localhost:8000/health`
2. Check backend logs for errors
3. For Android emulator, use `http://10.0.2.2:8000` in `.env`
4. For physical device, use computer's IP: `http://192.168.1.X:8000`

### No Menu Data

**Problem**: "No menu items available"

**Solution**:

1. Check backend response: `curl http://localhost:8000/menus/weekly`
2. Verify Eldora website is accessible
3. Check backend logs for parsing errors

### Images Not Loading

**Problem**: Images show gray placeholders

**Solution**:

1. Check Google GenAI API key in `backend/.env`
2. First image generation takes 3-5 seconds
3. Check backend logs for image generation errors

### Cache Issues

**Problem**: Old data showing after update

**Solution**:

```bash
# Clear React Native cache
cd frontend/Elcappfet
npm start -- --reset-cache

# Or clear app data in device settings
```

## Development Tips

### View Console Logs

**Frontend Logs:**

- Expo Dev Tools → Metro Bundler tab → Console
- Or use React Native Debugger

**Backend Logs:**

- Terminal where `menu_parser_server.py` is running

### Development Mode Features

When `__DEV__` is true (default in development):

- Detailed API logs in console
- Environment validation on startup
- Error stack traces

### Quick Commands

```bash
# Restart Expo
npm start -- --reset-cache

# Run on specific platform
npm run ios
npm run android

# Check TypeScript errors
npx tsc --noEmit

# Lint code
npm run lint
```

## Project Structure

```
elcappfet/
├── backend/
│   ├── menu_parser_server.py    # FastAPI server
│   ├── image_generator.py       # AI image generation
│   ├── requirements.txt         # Python dependencies
│   └── .env                     # Backend config
│
└── frontend/Elcappfet/
    ├── app/
    │   └── index.tsx            # Main screen
    ├── components/              # UI components
    ├── services/                # API client
    ├── hooks/                   # Custom hooks
    ├── types/                   # TypeScript types
    ├── utils/                   # Utilities
    ├── config/                  # Configuration
    ├── .env                     # Frontend config
    └── package.json
```

## API Endpoints

### Backend Endpoints

```
GET  /                           # API info
GET  /health                     # Health check
GET  /menus/weekly              # Weekly menu
GET  /menus/today               # Today's menu
GET  /menus/{day}               # Specific day menu
GET  /images/menu/{type}/{desc} # Menu image
GET  /images/cache/stats        # Cache statistics
DEL  /images/cache              # Clear image cache
```

### Example API Calls

```bash
# Get weekly menu
curl http://localhost:8000/menus/weekly

# Get today's menu
curl http://localhost:8000/menus/today

# Get Monday's menu
curl http://localhost:8000/menus/lundi

# Check cache stats
curl http://localhost:8000/images/cache/stats
```

## Next Steps

1. **Explore the Code**: See [`IMPLEMENTATION.md`](./IMPLEMENTATION.md) for component details
2. **API Integration**: See [`API_INTEGRATION.md`](./API_INTEGRATION.md) for full API docs
3. **Development Guidelines**: See [`AGENTS.md`](../../AGENTS.md) for project standards

## Production Deployment

### Backend

1. Set production environment variables
2. Configure proper CORS origins
3. Use production-grade WSGI server (e.g., Gunicorn)
4. Set up HTTPS with SSL certificate
5. Implement rate limiting
6. Set up monitoring and logging

### Frontend

1. Update `.env` with production API URL
2. Build production bundle:
   ```bash
   npm run build
   ```
3. Submit to App Store / Play Store using EAS Build

## Support

**Documentation:**

- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Component implementation
- [API_INTEGRATION.md](./API_INTEGRATION.md) - API integration details
- [AGENTS.md](../../AGENTS.md) - Project guidelines

**Common Issues:**

- Check console logs for errors
- Verify backend is running
- Clear cache if needed
- Check network connectivity

**Need Help?**

- Review error messages in console
- Check backend logs
- Verify API endpoints with curl
- Clear cache and retry

---

Happy coding! 🎉
