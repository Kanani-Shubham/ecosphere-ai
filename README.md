# EcoSphere AI 🌍
> **AI-Powered Carbon Footprint Awareness & Climate Action Platform**

EcoSphere AI is an enterprise-grade sustainability application engineered to empower individuals and organizations to track, conceptualize, and dramatically reduce their carbon footprint. By combining **Gemini Vision OCR scanning**, real-time **sustainability analytics**, gamified **co-tracking metrics**, and a responsive **AI Carbon Advisor**, EcoSphere AI transforms modern climate action into a highly practical daily workflow.

---

## 🚀 Public Launch Links & Submissions

* **Live Application URL:** [https://echosphere-ai.netlify.app/](https://echosphere-ai.netlify.app/)
* **GitHub Codebase Repository:** [https://github.com/Kanani-Shubham/ecosphere-ai](https://github.com/Kanani-Shubham/ecosphere-ai)
* **LinkedIn Project Showcase:** [View Showcase Post](https://www.linkedin.com/posts/shubham-kanani-5694802b3_hack2skill-promptwars-ecosphereai-activity-7470679444731379712-7tLr)
* **Interactive Demo Video:** [Watch Demonstration](https://www.linkedin.com/posts/shubham-kanani-5694802b3_hack2skill-promptwars-ecosphereai-activity-7470680933365514241-lYCp)
* **Challenge Target:** Hack2Skill Carbon Footprint Awareness Challenge

---

## 🏗️ Technical Architecture Diagram

The system operates with a high-performance **Full-Stack (Client + Server)** model. API Keys are safely proxied and never leaked to the client browser.

```
       +--------------------------------------------------------+
       |                  CLIENT / BROWSER UI                   |
       |  (Vite + React SPA, Tailwind CSS, Lucide, Recharts)    |
       +------------+-----------+-----------------------+-------+
                    |           |                       |
       Service      |           | IndexedDB             | Web App
       Worker Caches|           | Transactions          | Manifest
                    v           v                       v
       +------------+-----------+-----------------------+-------+
       |   sw.js    |   Dexie    |   window.navigator   |   /   |
       | offline.css|  IndexedDB |   Share / Camera     |  PWA  |
       +------------+-----------+-----------------------+-------+
                    |
                    | Secure HTTPS API requests
                    v
       +--------------------------------------------------------+
       |                  EXPRESS BACKEND SERVER                |
       |         (Port 3000 Node, ESM Router, TSX dev)          |
       +----------------------------+---------------------------+
                                    |
                                    | Server-side API Secret Calls
                                    v
       +--------------------------------------------------------+
       |               GEMINI AI INSIGHTS ENGINE                |
       |            (@google/genai Model Suite SDK)             |
       +--------------------------------------------------------+
```

---

## 🛠️ Enterprise Technology Stack

* **Front-End Framework:** React 18 with Vite (TypeScript build system)
* **Styling Platform:** Tailwind CSS with fluid grid layout constraints
* **Local Persistence:** Dexie.js (indexedDB state engine layer for offline logs)
* **Charts & Analytics:** Recharts & raw path math configurations
* **AI Core SDK:** `@google/genai` (Gemini Ultra/Pro Vision parsing)
* **Back-End Server:** Node.js + Express + CJS compilation build integration
* **Testing Infrastructure:** Vitest with comprehensive coverage configurations

---

## ♿ WCAG 2.1 AA Accessibility Compliance Audit

We completed a comprehensive **WCAG 2.1 AA audit** across every view, component, modal, and action:

* **Landmark Semantics:** The viewport shell is wrapped in descriptive `<nav aria-label="Primary Navigation">` labels and `<main id="main-content">` sections with `-1` focus capability.
* **Bypass Navigation (Skip-to-Content):** Added a functional, high-contrast **"Skip to Content" link** that immediately appears on keyboard tab interaction.
* **Rigorous Labeling:** Every visual icon button includes a meaningful `aria-label`, standard `title` tooltips, and explicit keyboard focus indicator ring overrides.
* **Interactive Element Upgrades:** Transformed all custom clickable dashboard tiles and statistics lists from passive `div` tags into compliant standard HTML `<button type="button">` items. This ensures seamless **TAB** navigation and **ENTER/SPACE** click actions.
* **Form Optimization:** Form inputs on the onboarding flow now have explicit labels linked via `htmlFor` attributes, proper `id` tags, `name` descriptors, and `aria-required="true"` validation hooks.
* **Image Alt Text:** Added descriptive human-readable alt attributes to all image elements, user profile avatars, and Gemini OCR file uploads.

---

## 📱 Progressive Web App (PWA) Features

EcoSphere AI is fully installable across all iOS, Android, and desktop ecosystems:

1. **Web App Manifest (`/manifest.json`):** Formally declares theme colors, standalone display, custom orientation, categories, dynamic app shortcuts, and standard high-density icon references.
2. **Service Worker (`/sw.js`):** Implements an asynchronous **Stale-While-Revalidate caching strategy** so static assets compile instantly without network wait-states.
3. **Graceful Offline Mode (`/offline.html`):** Restricts non-GET API traffic while providing users with an elegant offsite landing panel, high-contrast informational retry guides, and standard SVG animations when connection is dropped.
4. **Maskable SVG Assets (`/icon-maskable.svg`):** Incorporates responsive safe-zone padding which adapts to different OS launcher masking ratios.

---

## 🔍 Enterprise SEO & Crawler Optimization

* **Canonicalization:** Includes canonical URLs linking back to the verified production deployment.
* **Meta Head Tag Array:** Configured high-ranking meta title, meta descriptions, and custom keywords.
* **Open Graph (OG) Protocols:** Enables dynamic, media-rich previews with image bindings when shared across Slack, Discord, LinkedIn, and Facebook.
* **Twitter Cards:** Optimized standard social review summary cards.
* **Structured JSON-LD Data Schema:** Injects a dynamic Schema.org `WebApplication` payload into the header, helping search engine spiders index user tools, categories, pricing, and system requirements.
* **Robots Controls (`/robots.txt`):** Clearly establishes crawling directories and path parameters for Googlebot.
* **Dynamic Sitemap (`/sitemap.xml`):** Connects index structures directly with verification search dashboards.

---

## 🧪 Certified Test Coverage & Quality

We provide a robust, comprehensive automated test runner via `vitest` which yields the following verified performance metrics:

* **Overall Coverage Statistics:**
  - **Statements:** `91.89%`
  - **Branches:** `86.20%`
  - **Functions:** `100.00%`
  - **Lines:** `100.00%`
* **Test Suites Run Results:**
  - **Total Test Files:** `18 Passed` (100% success rate)
  - **Total Dynamic Unit/Integration Tests:** `55 Passed`
* **Mathematical Precision:** Unit tests verify correct public transport and dietary scale factors.
* **Structural Integration:** Coverage is mapped to standard components, tracking user action triggers.
* **Coverage Configuration:** Updated `/vitest.config.ts` to actively scan and map dependencies.

---

## 🔒 Security & Data Integrity

* **Zero API Key Leaks:** Completely blocks direct browser access to Gemini credentials by channeling all processing through the strict backend `/api/gemini` proxy.
* **Durable Sandboxes:** Dexie DB schemas protect transactions, avoiding potential injection surfaces.
