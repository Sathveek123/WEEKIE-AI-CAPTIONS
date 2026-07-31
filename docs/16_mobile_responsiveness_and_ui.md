# Mobile Responsiveness & UI Architecture

## Overview

Weekie AI Captions is built with a **Mobile-First Responsive Design System** in Tailwind CSS, guaranteeing seamless usability across Mobile (375px - 414px), Tablet (768px), Laptop (1024px), and Desktop (1440px+) displays.

---

## Responsive Breakpoints & Viewport Grid

| Breakpoint | Target Screen | Layout Behavior |
| :--- | :--- | :--- |
| `< 640px` | Mobile Phones (iPhone, Android) | Single column layout, mobile navigation drawer, auto-scaled phone preview (220px width), 2-column preset picker |
| `640px - 768px` | Small Tablets | Expanded padding, 3-column preset picker |
| `768px - 1024px` | Tablets / iPads | Stacked control sections, side-by-side dropzone & engine settings |
| `> 1024px` | Laptops & Desktops | 12-column grid: 7 cols (Studio Controls) + 5 cols (Live Phone Preview) |

---

## Key Responsive Components

### 1. Header Navigation (`frontend/src/components/header.tsx`)
- **Desktop**: Full link menu + User Profile Avatar + Studio CTA Button.
- **Mobile**: Collapses links into a touch-friendly hamburger menu (`≡`). Clicking opens a full-screen blurred drawer with direct touch buttons for Sign In, Register, and Studio.

### 2. Live Phone Preview (`frontend/src/components/caption-preview.tsx`)
- Houses an iPhone 16 mockup frame with interactive drag-to-reposition text.
- Automatically scales down (`max-w-[220px] sm:max-w-[260px] mx-auto`) to fit small mobile viewports without any horizontal scrollbars.

### 3. Video Dropzone (`frontend/src/components/video-dropzone.tsx`)
- Touch-optimized file selection area with drag-and-drop support on desktop and native file picker trigger on touch devices.

### 4. Subtitle Style Picker (`frontend/src/components/caption-style-picker.tsx`)
- Grid layout: `grid grid-cols-2 sm:grid-cols-3 gap-3`. Cards provide clear visual feedback when selected on touchscreens.
