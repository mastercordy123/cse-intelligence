# CSE Sector Intelligence Terminal

A professional-grade, full-stack intelligence dashboard for monitoring and analyzing sector valuations on the Colombo Stock Exchange (CSE). This system autonomously scrapes industry group data, tracks historical P/E and P/BV ratios, and provides real-time market awareness.

## 🚀 Key Features

### 📊 Real-Time Valuation Tracking

- **Multi-Metric Analysis**: Simultaneously tracks Price-to-Earnings (P/E) and Price-to-Book Value (P/BV) ratios for all 20 GICS Industry Groups.
- **Historical Comparison**: Automatically captures and displays previous values whenever a change is detected, allowing for immediate trend analysis.
- **Trend Visualization**: Intelligent visual indicators (Rising/Falling/Steady) with semantic color-coding (Success Green / Danger Red).

### 🕷️ Professional Scraping Engine

- **Headless Browser Technology**: Built with Playwright to handle dynamic, JS-rendered content on the CSE website.
- **Robust Table Parsing**: Features self-healing table detection logic that scans for semantic headers rather than fixed indices.
- **Background Polling**: Continuous monitoring (every 5 minutes) to ensure data is always up-to-date.

### 🏛️ Market Awareness System

- **Timezone Synchronization**: Internally synchronized to `Asia/Colombo` (UTC+5:30).
- **Trading Window Logic**: Automatically identifies if the market is Open or Closed (9:30 AM – 2:30 PM, Mon-Fri).
- **Holiday Intelligence**: Integrated Sri Lankan Public/Bank Holiday calendar (including Full Moon Poya days) with visual terminal alerts.

### 🎨 Intelligence Terminal UI

- **Obsidian Dark Aesthetic**: High-contrast, glassmorphic UI designed for professional trading environments.
- **Data-Focused Typography**: Uses `JetBrains Mono` for precise numeric alignment and `Inter` for authoritative typography.
- **Responsive Dashboard**: Fully adaptive layout with live pulse indicators and terminal status feedback.

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Lucide Icons, Vanilla CSS (Modern CSS Variables).
- **Backend**: Node.js, Express, TypeScript, **tsx** (Modern TS Execution).
- **Scraping**: Playwright (Chromium).
- **Process Management**: Concurrent execution for unified development.

## 📋 Prerequisites

- **Node.js**: v20 or higher (v24 recommended).
- **NPM**: v9 or higher.

## ⚙️ Installation & Setup

1. **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd cse-scrape
    ```

2. **Install all dependencies** (from the root directory):

    ```bash
    npm install
    ```

3. **Install Playwright Browsers**:
    ```bash
    cd backend
    npx playwright install chromium
    ```

## 🚀 Usage

To start both the Backend and Frontend simultaneously, run the following command in the **root directory**:

```bash
npm run dev
```

- **Frontend Terminal**: Accessible at `http://localhost:5173`
- **Backend API**: Running at `http://localhost:3001`

### Dashboard Controls:

- **Refresh Terminal**: Triggers an immediate, manual scrape of the CSE website.
- **Trend Analysis**: Hover over the trend badges to see specific metric directions (P/E | P/BV).
- **Market Status**: Check the top-right "Market Status" card and the "Live Terminal" indicator for real-time market state.

## 📁 Project Structure

```text
cse-scrape/
├── backend/            # Express Server & Playwright Scraper
│   ├── src/
│   │   ├── index.ts           # API Entry Point
│   │   ├── scraper.service.ts # Core Scraping Logic
│   │   └── market-status.utils.ts # Market Hours & Holidays
│   └── package.json
├── frontend/           # React Dashboad
│   ├── src/
│   │   ├── App.tsx    # Dashboard UI Logic
│   │   └── App.css    # Terminal Styling
│   └── package.json
├── package.json        # Root Workspace Configuration
└── README.md
```

## ⚖️ License

Internal Professional Prototype. Use for financial analysis purposes only. Ensure compliance with [cse.lk](http://www.cse.lk) terms of service.
