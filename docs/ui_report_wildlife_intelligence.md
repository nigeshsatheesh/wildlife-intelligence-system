# EcoGuard — Wildlife Intelligence System: Comprehensive UI & Design System Report

## 1. Design Philosophy & Visual Identity

**EcoGuard** adopts an **Ecological Modernism** design theme — combining clean modern SaaS dashboard principles with natural, forest-inspired aesthetics. The interface prioritizes high readability for complex multi-modal data (species telemetry, bioacoustics, spatial maps, and analytics) while maintaining visual harmony through organic greens, crisp white card surfaces, soft neutral backgrounds, and high-contrast typography.

---

## 2. Color System & Palette Matrix

The visual palette uses a structured CSS custom properties model (`index.css`), providing explicit contrast and semantic status coding across all user interfaces:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PRIMARY UI PALETTE                            │
├──────────────────┬──────────────────┬──────────────────┬───────────────┤
│ Forest Green     │ Forest Hover     │ Forest Light     │ App Background│
│ #113829          │ #0a251b          │ #e6f4ee          │ #f4f6f4       │
├──────────────────┼──────────────────┼──────────────────┼───────────────┤
│ Accent Teal      │ Accent Emerald   │ Accent Amber     │ Accent Crimson│
│ #14b8a6          │ #10b981          │ #f59e0b          │ #ef4444       │
└──────────────────┴──────────────────┴──────────────────┴───────────────┘
```

### Color Specification & Application Matrix

| Token Name | Hex Code | Visual Application & Hierarchy |
|---|---|---|
| `--forest-green` | `#113829` | Primary action buttons, active navigation item background, key metric headers, logo branding. |
| `--forest-green-hover` | `#0a251b` | Hover state for primary buttons and interactive elements. |
| `--forest-light` | `#e6f4ee` | Active tab subtle highlights, icon container backgrounds, light badge fills. |
| `--bg-app` | `#f4f6f4` | Global viewport background (off-white, low-eyestrain tone). |
| `--bg-card` | `#ffffff` | Elevated component surface background for all dashboard widgets and modals. |
| `--text-dark` | `#18221c` | Primary titles, table values, metric numbers (deep charcoal-green). |
| `--text-medium` | `#4b5563` | Subtitles, secondary text, body narrative. |
| `--text-muted` | `#8c9892` | Input placeholders, captions, timestamps, inactive navigation items. |
| `--border-light` | `#e5e9e6` | Crisp 1px borders separating cards, tables, and navigation panels. |

### Semantic Status Badges

- **Critical Concern**: Background `#fee2e2`, Text `#b91c1c` (Red) — Used for endangered species & declining population alerts.
- **Vulnerable / Moderate**: Background `#fef3c7`, Text `#d97706` (Amber) — Used for species under monitoring.
- **Healthy / Verified**: Background `#dcfce7`, Text `#15803d` (Emerald) — Used for stable species & verified sightings.
- **Neutral Tag**: Background `#f3f4f6`, Text `#4b5563` (Slate) — Used for categorizing metadata tags.

---

## 3. Typography & Micro-Textures

### Typography Hierarchy
- **Primary Interface Font**: `Plus Jakarta Sans` (Google Fonts) — Variable weights ($400, 500, 600, 700, 800$). Used for titles, navigation items, buttons, and dashboard metrics.
- **Monospace Metadata Font**: `JetBrains Mono` — Used for GPS coordinates (`11.6664 N, 76.6292 E`), confidence scores (`96.4%`), site codes (`BTR-ALPHA-01`), and JSON data payloads.

### UI Textures & Elevation Details
- **Border Radii**:
  - Small (`8px`): Badges, icon containers, inner inputs.
  - Medium (`12px`): Buttons, user cards, table containers.
  - Large (`16px`): Primary `.eco-card` containers and modal popups.
  - Extra Large (`20px`): Outer alert containers.
  - Pill (`9999px`): Search input bar, header badges, status pills.
- **Shadows**:
  - Surface Card (`--shadow-card`): `0 1px 4px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)` — Subtle elevation without heavy glare.
  - Primary Button Hover: `0 6px 20px rgba(17, 56, 41, 0.16)` — Soft forest glow on interactive press.
  - Modal Backdrop: `rgba(0, 0, 0, 0.5)` with `backdrop-filter: blur(3px)` — Delivers visual depth when launching forms or selection modals.

---

## 4. Layout Architecture & Structure

The interface uses a **Persistent Left Sidebar + Top Header Bar + Main Viewport** grid:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Logo Header     │ Search Bar...                 [Role Badge] [Bell] [+ Log] │
├─────────────────┼───────────────────────────────────────────────────────────┤
│                 │ MAIN CONTENT VIEWPORT (max-width: 1380px)                 │
│ MONITORING      │                                                           │
│  - Dashboard    │ ┌──────────────────────┐ ┌──────────────────────────────┐ │
│  - Surveys      │ │ Stat Card 1          │ │ Stat Card 2                  │ │
│  - Camera Traps │ └──────────────────────┘ └──────────────────────────────┘ │
│                 │                                                           │
│ AI ANALYSIS     │ ┌───────────────────────────────────────────────────────┐ │
│  - Image        │ │ Main Data Widget / Chart / Sighting Grid              │ │
│  - Bioacoustics │ │                                                       │ │
│  - Population   │ │                                                       │ │
│  - Biodiversity │ └───────────────────────────────────────────────────────┘ │
│                 │                                                           │
│ User Profile    │                                                           │
└─────────────────┴───────────────────────────────────────────────────────────┘
```

### Component Breakdown
1. **Sidebar (`Sidebar.jsx`)**:
   - Fixed width (`240px`), full height (`100vh`), light background with right border (`1px solid #e5e9e6`).
   - Top logo featuring `/logo.png` paired with bold branding text.
   - Categorized navigation links with Lucide stroke icons (`LayoutDashboard`, `Compass`, `Camera`, `Volume2`, `HeartPulse`, `Leaf`, `Bell`, `FileText`).
   - Bottom profile card displaying user initials avatar, full name, role title, and a popup settings menu with logout trigger.
2. **Top Header Bar (`App.jsx`)**:
   - Global rounded search bar (`380px`) with magnifying glass icon.
   - Live **Role Switcher Badge**: Clickable pill enabling instant live switching between *Researcher*, *Conservation Officer*, *Forest Department Officer*, and *Admin* personas.
   - Bell Notification icon with red indicator badge.
   - **`+ Log Sighting` Call to Action**: Launches modal to select Image vs Audio logging.
3. **Main Viewport**:
   - Off-set by `margin-left: 240px`, constrained to max width `1380px` with fluid responsive padding (`1.5rem 2.25rem`).

---

## 5. Screen & Viewport Designs

### 1. Modality Selection Modal
When clicking `+ Log Sighting`, a glassmorphism modal opens displaying two side-by-side interactive cards:
- **Image Sighting Card**: Camera icon in green circle, title "Image Sighting", subtitle "Camera trap photo & AI classification".
- **Audio Sighting Card**: Microphone icon in green circle, title "Audio Sighting", subtitle "Bioacoustic audio & YAMNet detection".
- Hovering over either card smoothly transitions border color to `--forest-green` and shifts background fill to `--forest-light` (`#e8f3ee`).

### 2. Sighting & Audio Upload Forms (`SightingLogForm.jsx` & `RecordingLogForm.jsx`)
- **Drag-and-Drop Dropzone**: Dashed border container (`2px dashed #cbd5e1`) that activates on hover with preview thumbnails for photos or file metadata for audio.
- **AI Classification Live Preview**: Displays immediate ML feedback box with class label, confidence percentage bar, and species documentation match.
- **Form Controls**: Grid layout for location fields (Latitude, Longitude), site selection dropdown, individual count counter, and notes textarea.

### 3. Role-Based Dashboards
- **Researcher Dashboard**: Focuses on species richness charts, observation timelines, and recent field recordings with inline audio player controls.
- **Conservation Officer Dashboard**: Highlights high-threat species cards with left accent borders (`border-left: 3px solid #ef4444`) and recommended field action checklists.
- **Forest Department Dashboard**: Grid of physical monitoring stations, operational status indicators (Active / Inactive), and camera trap battery/health status.
- **Admin Dashboard**: System telemetry cards (Users, Sites, Sightings, Microservices), user role administration table, and DB connection indicator (`Mongo Atlas: Connected`).

### 4. Interactive Data Views
- **Species Catalog (`SpeciesListPage.jsx`)**: Grid of species cards featuring image thumbnails, taxonomic scientific names, IUCN status badges, and GBIF occurrence map embeds.
- **Biodiversity Page (`BiodiversityPage.jsx`)**: Displays Shannon Diversity Index ($H'$) cards with progress meters and per-site evenness comparisons.
- **Bioacoustics List (`RecordingsListPage.jsx`)**: Audio player UI with timeline waveform, YAMNet event tags (Bird Call, Mammal Vocalization), and species prediction match confidence.

---

## 6. Micro-Interactions & Responsive Behavior

- **Hover States**: All navigation items, buttons, and cards incorporate smooth CSS cubic-bezier transitions (`transition: all 0.15s ease`). Buttons elevate by `translateY(-1px)` with expanded drop shadow on hover.
- **Responsive Adaptability**:
  - Flexbox layouts wrap automatically (`flex-wrap: wrap`) on smaller screen viewports.
  - Table containers feature horizontal scroll wrappers (`overflow-x: auto`) to prevent layout clipping on mobile and tablet displays.
  - Main container includes explicit `min-width: 0` flex constraints preventing content overflow.
- **Custom Scrollbar Styling**: Customized WebKit scrollbars (`6px` width, neutral slate thumb `#cbd5e1`) integrated into sidebar and card viewports for seamless visual consistency.
