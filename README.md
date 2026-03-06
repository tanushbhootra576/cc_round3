# CivicPlus — Smart Civic Issue Reporting Platform

> **Empower citizens. Empower government. Fix cities faster.**
>
> A production-ready civic issue reporting platform with smart geo-clustering, real-time notifications, transparent audit trails, and role-based dashboards for citizens and government officials.

<p align="center">
  <a href="https://drive.google.com/file/d/1PGxFAuCFJuLhGEp5MuZfKBpRvgh3_2o7/view?usp=sharing">
    <img src="https://img.shields.io/badge/▶%20Demo%20Video-Watch%20Now-red?style=for-the-badge&logo=google-drive&logoColor=white" alt="Demo Video" />
  </a>
  &nbsp;
  <a href="https://drive.google.com/file/d/1SnqoXMkdEb1A9Z4SH0A2Aw6QRQzH2QV2/view?usp=sharing">
    <img src="https://img.shields.io/badge/📊%20Presentation-Open%20PPT-blue?style=for-the-badge&logo=google-drive&logoColor=white" alt="Presentation" />
  </a>
  &nbsp;
  <a href="https://github.com/tanushbhootra576/cc_round3">
    <img src="https://img.shields.io/badge/GitHub-cc__round3-black?style=for-the-badge&logo=github" alt="GitHub" />
  </a>
</p>

---

## Quick Navigation

- [Key Features](#key-features-summary)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Setup](#environment-setup)
- [API Endpoints](#api-endpoints-quick-reference)
- [Troubleshooting](#troubleshooting)
- [Screenshots](#screenshots)
- [Demo & Presentation](#demo--presentation)

---

## Key Features

| Feature                      | Description                                                                                               |
| ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| ** Photo Reports**           | Citizens capture infrastructure issues with GPS location, category, and description                       |
| ** AI Verification**         | Image validation and automatic issue categorization                                                       |
| ** Smart Geo-Clustering**    | Automatically groups similar reports within 100m radius into hotspots, eliminating duplicates             |
| ** Priority Scoring**        | Issues ranked by urgency: cluster size, age, upvotes, severity                                            |
| ** Interactive Map**         | Live map visualization with custom markers for each issue cluster                                         |
| ** Real-Time Notifications** | WebSocket-powered instant updates on issue status changes via Socket.IO                                   |
| ** User Profiles**           | Separate profile pages for citizens (track reported issues) and government (view managed issues)          |
| ** Government Dashboard**    | Command center to manage, prioritize, reassign, and resolve issues with bulk actions                      |
| ** Status Tracking**         | Transparent issue timeline with full audit trail of all status changes                                    |
| ** Issue Resolution**        | Government can mark issues resolved, automatically notify all affected citizens with confetti celebration |
| ** JWT Authentication**      | Stateless auth with role-based access control (citizen/government)                                        |
| ** Role-Based Access**       | Citizen and Government portals with separate views and permissions                                        |
| ** File Upload**             | Multer-powered image uploads with validation and secure storage                                           |
| ** Responsive Design**       | Mobile-first UI optimized for all devices using Tailwind CSS                                              |

---

## Tech Stack

### Frontend

- React 18 + Vite 7, Tailwind CSS 4, React Router DOM 6, Axios, Socket.IO Client, React-Leaflet, lucide-react icons
  - Cloudinary (images served from Cloudinary via backend)

### Backend

- Node.js 18+, Express 4, MongoDB + Mongoose, JWT authentication, Socket.IO, Multer file uploads, Google Gemini Vision API (optional)

---

## Screenshots

### Citizen Portal

| Screen                | Description                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Landing Page**      | Hero section showcasing platform benefits, features, and call-to-action buttons                              |
| **Report Issue**      | Mobile-first form with photo capture, GPS location, category selection                                       |
| **Citizen Dashboard** | Full reporting hub with live city map, issue stats, filters, and pagination _(see detailed breakdown below)_ |
| **Issue Detail**      | Full issue information, map location, status history, upvote functionality                                   |
| **Citizen Profile**   | User profile showing reported issues, stats, and contact information                                         |

### Government Portal

| Screen                          | Description                                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Government Dashboard**        | Command center with 4 views: All Issues, Clustered Hotspots, By Status, Analytics                            |
| **Issue Management**            | Detailed issue view with reassignment, status updates, bulk actions                                          |
| **Fiscal Command Center**       | Ward-level resource allocation and AI-guided budget planning _(see detailed breakdown below)_                |
| **City Intelligence Analytics** | KPI tracking, CHI score, resource demand forecasts, and congestion heatmaps _(see detailed breakdown below)_ |
| **Live Map**                    | Interactive map showing all issue clusters with real-time updates                                            |
| **Government Profile**          | Portal stats including total issues, resolved count, resolution rate, issue list                             |

### Gallery

<p align="center">
  <img src="client/public/screenshots/Screenshot from 2026-02-28 17-56-15.png" alt="Landing Page" width="48%" />
  &nbsp;
  <img src="client/public/screenshots/Screenshot from 2026-03-01 18-58-25.png" alt="Report Issue" width="48%" />
</p>
<p align="center"><em>Landing Page &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Report Issue Form</em></p>

<p align="center">
  <img src="client/public/screenshots/Screenshot from 2026-03-01 19-07-48.png" alt="Citizen Dashboard" width="48%" />
  &nbsp;
  <img src="client/public/screenshots/Screenshot from 2026-03-01 19-08-40.png" alt="Issue Detail" width="48%" />
</p>
<p align="center"><em>Citizen Dashboard &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Issue Detail</em></p>

---

## Detailed Feature Breakdowns

### Citizen Dashboard — My Reports Dashboard

The citizen dashboard is the primary hub for tracking submitted reports.

| Section             | Details                                                                                                                                                                                         |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Summary Stats**   | Four stat cards: _Total Reports_, _Pending_ (awaiting review), _In Progress_ (being resolved), _Resolved_ (fixed). Each card has a colour-coded left border and icon.                           |
| **City Issues Map** | Full-width interactive Leaflet map showing all city issues (not just the citizen's own). Toggle-able for screen space. Powered by `IssueMap` component.                                         |
| **Filter Bar**      | Filter by **Status** (`pending` / `in-progress` / `resolved`) and **Category** (`Pothole`, `Streetlight`, `Garbage`, `Drainage`, `Water Leakage`, `Others`). Filters reset page to 1 on change. |
| **Issue Grid**      | Paginated grid (9 per page) of `IssueCard` components. Each card shows photo thumbnail, category badge, status badge, GPS ward, upvote count, and submission date.                              |
| **Pagination**      | Previous / Next page controls with current page indicator.                                                                                                                                      |
| **Geofence Banner** | `GeofenceBanner` component auto-appears when the citizen is near a known high-alert zone.                                                                                                       |
| **Success Toast**   | Animated green toast confirmation after a new issue submission redirects here with `?success=1`.                                                                                                |
| **Quick Link**      | Prominent _+ New Report_ button navigates to the report submission form.                                                                                                                        |

**API calls made by this page:**

```
GET /api/issues/map              → all city issues for the map layer
GET /api/issues/my?page&limit&status&category  → citizen's own paginated issues
```

---

### Government Budget Dashboard — Fiscal Command Center

Route: `/gov-budget`  
Access: Government role only

The Fiscal Command Center lets government officials manage per-ward, per-sector budget allocations in real time, guided by AI spending recommendations.

#### Budget Summary Bar

A full-width dark panel at the top always shows three live figures:

| Metric                | Description                                                                  |
| --------------------- | ---------------------------------------------------------------------------- |
| **Total City Pool**   | Fixed city-wide budget ceiling (e.g. ₹15 Cr). Shown in Crores.               |
| **Allocated Funds**   | Sum of all ward × sector budgets currently saved. Updates live in edit mode. |
| **Remaining Balance** | `Pool − Allocated`. Turns **red** if allocation exceeds the pool.            |

A progress bar below the figures fills green (or red on over-allocation) proportional to utilisation.

#### Ward Cards — Sector Budget Grid

Each registered ward gets a card with:

| Element                   | Description                                                                                                                              |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Ward ID + Name + Zone** | Header with coloured zone badge                                                                                                          |
| **Ward Total**            | Sum of all sector budgets for that ward (shown in ₹k)                                                                                    |
| **Sector Columns**        | 6 infrastructure sectors per ward — **Power** (⚡), **Water** (💧), **Traffic** (🚗), **Sewage** (📊), **Waste** (🗑), **Internet** (📶) |
| **Per-Sector Budget**     | Current allocated budget in ₹. Editable input when in _Allocation Mode_.                                                                 |
| **Utilisation Bar**       | Mini progress bar showing real-time sensor-reported utilisation % for each sector.                                                       |

#### Edit / Allocation Mode

1. Click **ENTER ALLOCATION MODE** — all budget fields become editable inputs.
2. Adjust per-sector values for any ward; the _Allocated Funds_ total updates instantly.
3. Click **COMMIT CHANGES** to `PATCH /api/wards/:id` for every modified ward simultaneously.
4. Click **CANCEL** to discard and reload from the server.

#### AI Recommendations Panel

A right-side panel fetches AI-generated spending advice from `GET /api/analytics/ai-recommendations`. It suggests where to increase or reduce budgets based on current sensor load and unresolved issue density per sector.

**API calls made by this page:**

```
GET  /api/wards                          → all wards with current resource budgets & utilisation
GET  /api/analytics/ai-recommendations  → AI-guided reallocation suggestions
PATCH /api/wards/:id                     → save updated resource budgets per ward
```

---

### Government Analytics — City Intelligence Analytics

Route: `/gov-analytics`  
Access: Government role only

A decision-support dashboard combining issue KPIs, IoT sensor data, and geospatial analysis into a single command view.

#### KPI Grid (Top Row)

Four headline metrics displayed as colour-coded border cards:

| KPI                    | Description                                                   | Colour |
| ---------------------- | ------------------------------------------------------------- | ------ |
| **Resolution Rate**    | % of issues resolved this month                               | Green  |
| **Avg Response Time**  | Average days from submission to first action (target: 3 days) | Blue   |
| **Avg Severity Score** | Mean severity score out of 100 across all open issues         | Amber  |
| **Active Alerts**      | Count of live traffic / utility alerts from IoT sensors       | Red    |

#### City Resilience Index (CHI) — Dark Card

An animated circular gauge on a dark background displays:

- **CHI Score** — 0–100 composite health index computed by the Kavach AI engine, pulling from `GET /api/analytics/kavach-overview`.
- **Wards Active** — number of wards with active sensor feeds.
- **System Status** — `NOMINAL` / `DEGRADED` banner.

The gauge ring fills proportionally to the CHI score with a smooth 1-second CSS transition on load.

#### Real-Time Resource Demand Panel

Fetched from `kavachData.resourceAverages`. For each resource type (Power, Water, Traffic, Sewage, Waste, Internet):

- Labelled progress bar showing current average % load.
- Bar turns **red** above 80 % load (critical threshold).
- Min/max labels show current load vs. 100 % limit.
- Tagged **LIVE SENSOR FEED** — data updates on every manual refresh.

#### Active Traffic Hotspots

Ranked list of wards with the most active congestion/traffic alerts:

- Ward name + active alert count.
- Severity badge (`CRITICAL` = red, others = amber).
- Sourced from `data.congestionZones` (aggregated from `CityAlert` collection).

#### Ward-Level Issue Density Map

Grid showing the top 6 wards by open-issue count:

- Count badge, ward name, and average GPS coordinates (lat/lng) of all issues in that ward.
- Useful for dispatching field teams where reports are most concentrated.

**API calls made by this page:**

```
GET /api/analytics/overview          → resolution rate, response time, severity, alerts, congestion zones, zone hotspots
GET /api/analytics/kavach-overview   → CHI score, ward count, per-resource average utilisation
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** — local or [MongoDB Atlas](https://cloud.mongodb.com) free tier
- **npm** ≥ 9

### Installation

```bash
# Clone repository
git clone https://github.com/tanushbhootra576/cc_round3.git
cd cc_round3

# Backend setup
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend setup (in another terminal)
cd client
npm install
npm run dev

Note: The frontend reads the backend base URL from `client/.env` using `VITE_BACKEND_URL` (defaults to `http://localhost:5000`). See Environment Setup below.

# Create government account
curl -X POST http://localhost:5000/api/auth/create-gov \
  -H "Content-Type: application/json" \
  -d '{"name":"City Admin","email":"admin@gov.in","password":"admin@123"}'

# Open in browser
# Citizen: http://localhost:5173/register
# Government: http://localhost:5173/login
```

## Environment Setup

### `backend/.env` — Complete Reference

Create this file at `backend/.env` before starting the server. All variables marked **Required** must be set or the server will refuse to start.

| Variable                | Required                | Default                               | Description                                                                                                                                     |
| ----------------------- | ----------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `MONGO_URI`             | ✅ Required             | `mongodb://localhost:27017/civicplus` | Full MongoDB connection string. Use a [MongoDB Atlas](https://cloud.mongodb.com) URI for production.                                            |
| `JWT_SECRET`            | ✅ Required             | _(none — server exits if missing)_    | Long random string (≥ 64 chars) used to sign and verify JWT tokens. Generate with `openssl rand -hex 64`.                                       |
| `JWT_EXPIRES_IN`        | Optional                | `7d`                                  | JWT token lifetime. Accepts any [ms](https://github.com/vercel/ms) format, e.g. `1d`, `12h`, `7d`.                                              |
| `PORT`                  | Optional                | `5000`                                | Port the Express server listens on.                                                                                                             |
| `CLIENT_URL`            | ✅ Required             | `http://localhost:5173`               | Exact origin of the React frontend. Used for CORS allow-list. **Must match** the Vite dev server URL (or your production frontend URL).         |
| `CLOUDINARY_CLOUD_NAME` | ✅ Required for uploads | _(none)_                              | Your Cloudinary cloud name. Find it on the [Cloudinary Dashboard](https://cloudinary.com/console).                                              |
| `CLOUDINARY_API_KEY`    | ✅ Required for uploads | _(none)_                              | Cloudinary API key (numeric string).                                                                                                            |
| `CLOUDINARY_API_SECRET` | ✅ Required for uploads | _(none)_                              | Cloudinary API secret. **Never expose this to the client.**                                                                                     |
| `LLM_API_KEY`           | Optional                | _(none)_                              | API key for the LLM provider used by the AI decision service (`aiService.js`). Required for AI issue categorisation and budget recommendations. |
| `LLM_BASE_URL`          | Optional                | `https://api.featherless.ai/v1`       | Base URL of the OpenAI-compatible LLM API endpoint. Override to use a different provider.                                                       |
| `LLM_MODEL`             | Optional                | `google/gemma-3-27b-it`               | Model identifier passed to the LLM API. Change to any model supported by your provider.                                                         |

**Full `backend/.env` template:**

```env
# ── Database ─────────────────────────────────────────────────
MONGO_URI=mongodb://localhost:27017/civicplus

# ── Auth ─────────────────────────────────────────────────────
JWT_SECRET=replace_with_at_least_64_random_chars
JWT_EXPIRES_IN=7d

# ── Server ───────────────────────────────────────────────────
PORT=5000
CLIENT_URL=http://localhost:5173

# ── Cloudinary (image uploads) ───────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ── AI / LLM (optional) ──────────────────────────────────────
LLM_API_KEY=your_llm_api_key
LLM_BASE_URL=https://api.featherless.ai/v1
LLM_MODEL=google/gemma-3-27b-it
```

### `client/.env` — Frontend Variables

| Variable           | Required | Default                 | Description                                                                                                                                   |
| ------------------ | -------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_BACKEND_URL` | Optional | `http://localhost:5000` | Full base URL of the backend API. All Axios requests are prefixed with this value. Change to your deployed backend URL for production builds. |

**`client/.env` template:**

```env
VITE_BACKEND_URL=http://localhost:5000
```

> **Security note:** Never commit either `.env` file to version control. Both are already included in `.gitignore`. The `CLOUDINARY_API_SECRET` and `JWT_SECRET` in particular must be kept server-side only.

---

## API Endpoints (Quick Reference)

### Auth

- `POST /api/auth/register` — Create citizen account
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get profile
- `POST /api/auth/create-gov` — Create government account (admin)

### Issues

- `POST /api/issues` — Report new issue
- `GET /api/issues/my` — My reported issues (citizen)
- `GET /api/issues` — All issues (government only)
- `GET /api/issues/:id` — Single issue detail
- `PUT /api/issues/:id/status` — Update status & cascade to cluster
- `POST /api/issues/:id/upvote` — Toggle upvote
- `GET /api/issues/clusters` — All hotspot clusters (gov only)
- `GET /api/issues/stats` — System statistics (gov only)

---

## Troubleshooting

| Issue                    | Fix                                                                                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| MongoDB connection fails | Check `MONGO_URI` in `.env`                                                                                                                    |
| CORS errors              | Ensure `CLIENT_URL` matches frontend port                                                                                                      |
| Socket.IO not connecting | Verify backend/frontend use same port                                                                                                          |
| Images not uploading     | Ensure Cloudinary env vars are set in `backend/.env` and restart the backend. For legacy local uploads ensure `uploads/` exists if still used. |
| Map doesn't show tiles   | Import Leaflet CSS in `IssueMap.jsx`                                                                                                           |

---

## Core Architecture

```
Frontend (React 18)
  ├─ AuthContext (user, token)
  ├─ SocketContext (real-time updates)
  └─ pages/components (Landing, Auth, Dashboards, Issues)
        ↓ (REST API + WebSocket)
Backend (Express + Socket.IO)
  ├─ Auth routes (JWT-based)
  ├─ Issue routes (CRUD + clustering)
  └─ Real-time notifications
        ↓ (Mongoose ODM)
MongoDB
  ├─ Users collection
  └─ Issues collection (geo-indexed with 2dsphere)
```

---

## Key Features Summary

✅ **Citizens**: Report issues with photo + GPS, track status, upvote, get real-time notifications  
✅ **Government**: Manage issues, assign clusters, resolve with cascade notifications  
✅ **Smart Clustering**: Auto-groups duplicate reports within 100m radius  
✅ **Priority Scoring**: Ranks issues by cluster size, upvotes, age  
✅ **Real-Time Updates**: Socket.IO push notifications on status changes  
✅ **Transparency**: Full audit trail with SHA-256 hashes  
✅ **User Profiles**: Separate dashboards for citizens and government  
✅ **Responsive Design**: Mobile-first Tailwind CSS  
✅ **Role-Based Access**: JWT authentication with citizen/government roles

---

## Design Notes

| Topic                                            | Detail                                                                                                                                                                                                                                                                   |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **IoT as Socket.IO broadcast vs stored records** | IoT ghost reports are broadcast-only signals — not stored in MongoDB — to keep the demonstration clean. In production, sensor readings would create real issue documents via the same `POST /api/issues` flow, requiring no frontend changes beyond swapping the source. |

---

## Demo & Presentation

| Resource                  | Link                                                                                                        | Description                                            |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| 🎬 **Demo Video**         | [Watch on Google Drive](https://drive.google.com/file/d/1PGxFAuCFJuLhGEp5MuZfKBpRvgh3_2o7/view?usp=sharing) | Full walkthrough of the citizen and government portals |
| 📊 **Presentation (PPT)** | [Open on Google Drive](https://drive.google.com/file/d/1SnqoXMkdEb1A9Z4SH0A2Aw6QRQzH2QV2/view?usp=sharing)  | Project architecture, features, and design decisions   |
| 💻 **Source Code**        | [github.com/tanushbhootra576/cc_round3](https://github.com/tanushbhootra576/cc_round3)                      | Full source — backend, frontend, and seed scripts      |

---

## Support

For issues or questions, open a [GitHub Issue](https://github.com/tanushbhootra576/cc_round3/issues) or contact the team.
