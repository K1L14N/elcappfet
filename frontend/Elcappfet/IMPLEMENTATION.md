# Elcappfet UI Implementation

## Overview

This implementation closely follows the Figma design mockup for the Elcappfet mobile application - a weekly menu viewer for the office cafeteria.

## Components Created

### 1. Badge Component (`components/Badge.tsx`)

A reusable badge component with two variants:

- **Category Badge**: Used for menu item categories (Soup, Salad, Main Course) with a dark semi-transparent background
- **Dietary Badge**: Used for dietary tags (Vegetarian, Gluten-Free, High Protein) with a border outline style

**Props:**

- `label`: string - The text to display
- `variant`: 'category' | 'dietary' - The badge style variant
- `style`: ViewStyle - Optional custom styles

### 2. MenuCard Component (`components/MenuCard.tsx`)

A card component displaying menu item details including:

- Image with overlay category badge
- Item name and price in a header row
- Description text
- Dietary tags (when available)

**Props:**

- `item`: MenuItem - The menu item data

**MenuItem Interface:**

```typescript
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  dietaryTags?: string[];
}
```

### 3. DayFilter Component (`components/DayFilter.tsx`)

A horizontal scrollable day selector with:

- 7 day buttons (Mon-Sun)
- Selected state with white background and shadow
- Unselected state with gray text

**Props:**

- `selectedDay`: number - Index of selected day (0-6)
- `onDaySelect`: (dayIndex: number) => void - Callback when day is selected

### 4. Header Component (`components/Header.tsx`)

Fixed header displaying:

- App title "Elcappfet"
- Subtitle "Office Cafeteria Menu"
- Operating hours with clock icon
- Location with location icon

### 5. Footer Component (`components/Footer.tsx`)

Footer section with:

- "Fresh ingredients • Made to order" text
- Contact information

## Main Screen (`app/index.tsx`)

The main screen implements the complete weekly menu layout with:

- SafeAreaView for proper device spacing
- Header component at top
- ScrollView for menu content
- DayFilter for day selection
- Day title and item count
- List of MenuCard components
- Empty state when no items available
- Footer at bottom

## Design Specifications

### Color Palette

- **Background**: `#0a0a0a` (neutral-950)
- **Card Background**: `#0a0a0a` (neutral-950)
- **Borders**: `#262626` (neutral-800)
- **Primary Text**: `#fafafa` (neutral-50)
- **Secondary Text**: `#a1a1a1` (neutral-400)

### Typography

- **App Title**: 30px, line height 36px, letter spacing -0.75px
- **Section Title**: 20px, line height 28px
- **Card Title**: 18px, line height 28px
- **Body Text**: 14px, line height 22.75px
- **Small Text**: 12px, line height 16px

### Spacing

- **Component Gap**: 16px between components
- **Section Gap**: 24px between sections
- **Card Padding**: 16px
- **Badge Padding**: 9px horizontal, 3px vertical

### Borders & Radius

- **Card Border Radius**: 14px
- **Badge Border Radius**: 8px
- **Button Border Radius**: 10px
- **Border Width**: 1px

## Mock Data

The implementation includes mock data for Monday and Tuesday to demonstrate the UI:

- 3 items on Monday (Soup, Salad, Main Course)
- 1 item on Tuesday (Risotto)
- Empty states for other days

## Features Implemented

1. ✅ Responsive day filter with visual feedback
2. ✅ Menu cards with images, prices, and dietary tags
3. ✅ Category badges on menu item images
4. ✅ Empty state for days without menu items
5. ✅ Smooth scrolling for long menu lists
6. ✅ Dark theme matching Figma design
7. ✅ Proper spacing and typography
8. ✅ Reusable component architecture

## Component Hierarchy

```
App (index.tsx)
├── SafeAreaView
│   ├── Header
│   └── ScrollView
│       ├── Content Container
│       │   ├── DayFilter
│       │   ├── Day Header
│       │   │   ├── Day Title
│       │   │   └── Item Count
│       │   └── Menu List
│       │       └── MenuCard (multiple)
│       │           ├── Image Container
│       │           │   ├── Image
│       │           │   └── Badge (category)
│       │           └── Content Container
│       │               ├── Header Row
│       │               │   ├── Title
│       │               │   └── Price
│       │               ├── Description
│       │               └── Badge (dietary, multiple)
│       └── Footer
```

## Best Practices Applied

### DRY (Don't Repeat Yourself)

- Reusable Badge component for both category and dietary tags
- MenuCard component for all menu items
- Centralized color and spacing values in StyleSheet

### SOLID Principles

- **Single Responsibility**: Each component has one clear purpose
- **Open/Closed**: Components accept props for extension
- **Interface Segregation**: Clean prop interfaces
- **Dependency Inversion**: Components depend on abstractions (interfaces)

### React Native Best Practices

- TypeScript for type safety
- Functional components with hooks
- StyleSheet for performance
- Proper key props in lists
- SafeAreaView for device compatibility
- StatusBar configuration

## Next Steps

To connect this UI to the backend API:

1. Replace mock data with API calls to the menu parser server
2. Add loading states during data fetch
3. Add error handling and retry logic
4. Implement pull-to-refresh functionality
5. Add image caching strategy
6. Implement navigation to detail screens (if needed)
7. Add animations for day transitions
8. Implement offline mode with cached data

## Running the Application

```bash
cd frontend/Elcappfet
npm start
```

Then:

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app for physical device

## File Structure

```
frontend/Elcappfet/
├── app/
│   ├── _layout.tsx          # Root layout configuration
│   └── index.tsx            # Main weekly menu screen
├── components/
│   ├── Badge.tsx            # Reusable badge component
│   ├── MenuCard.tsx         # Menu item card component
│   ├── DayFilter.tsx        # Day selection filter
│   ├── Header.tsx           # App header component
│   ├── Footer.tsx           # App footer component
│   └── index.ts             # Component exports
└── IMPLEMENTATION.md        # This file
```

## API Integration (Latest Update)

### Backend Connection

The application is now fully connected to Tonton's Python FastAPI backend:

- **Backend URL**: `http://localhost:8000` (configurable via `.env`)
- **Main Endpoint**: `GET /menus/weekly` for weekly menu data
- **Image Endpoint**: `GET /images/menu/{type}/{description}` for AI-generated food images

### New Architecture Components

1. **API Service** (`services/api.ts`)

   - HTTP client with timeout handling
   - Error management with custom error types
   - Automatic JSON parsing

2. **Data Transformation** (`utils/dataTransform.ts`)

   - Converts French backend data to English frontend format
   - Maps day names (lundi → Monday, etc.)
   - Parses CHF prices
   - Generates image URLs
   - Detects dietary tags

3. **useMenu Hook** (`hooks/useMenu.ts`)

   - Custom React hook for menu state management
   - Two-level caching (memory + AsyncStorage)
   - Automatic data fetching
   - Pull-to-refresh support
   - Error handling with fallback to cache

4. **UI State Components**
   - `LoadingState`: Skeleton screens with pulse animation
   - `ErrorState`: Error display with retry functionality

### Features Implemented

✅ Real-time menu data from backend API
✅ AI-generated food images via Google GenAI
✅ Two-level caching (2-hour validity)
✅ Pull-to-refresh functionality
✅ Offline mode with cached data
✅ Loading states with skeleton screens
✅ Error handling with retry
✅ Weekday-only display (Monday-Friday)
✅ CHF currency display
✅ Automatic dietary tag detection

### Data Flow

```
User Opens App → useMenu Hook → Check Cache → API Fetch → Transform Data → Display
                                     ↓                            ↓
                              AsyncStorage ←─────────────────────┘
```

### Testing

To test the integration:

1. **Start Backend**:

   ```bash
   cd backend
   python menu_parser_server.py
   ```

2. **Start Frontend**:

   ```bash
   cd frontend/Elcappfet
   npm start
   ```

3. **Expected Behavior**:
   - Loading skeleton appears briefly
   - Real menu data loads for selected day
   - Images generate on first view (3-5s)
   - Pull down to refresh updates data
   - Works offline with cached data

### Configuration

Environment variables in `.env`:

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
EXPO_PUBLIC_API_TIMEOUT=30000
EXPO_PUBLIC_CACHE_DURATION=7200000
```

For detailed API integration documentation, see [`API_INTEGRATION.md`](./API_INTEGRATION.md).

## Notes

- The UI is optimized for mobile viewports (375-414px width)
- All measurements and colors match the Figma specification
- Components follow the Elcappfet project's AGENTS.md guidelines for Nana (React Native specialist)
- Backend integration follows RESTful API standards from Tonton (Python specialist)
- Real menu data from Eldora restaurant via backend parsing
- AI-generated food images using Google GenAI
