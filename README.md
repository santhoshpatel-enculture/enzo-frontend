# Enzo Frontend

Premium mobile-first employee portal and AI assistant for the Enculture platform.

## Tech Stack
- **Framework:** React 19 + TypeScript + Vite
- **PWA:** vite-plugin-pwa (offline shell, install prompt, auto-updates)
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **State Management:** Zustand
- **Router:** React Router v7
- **Org chart:** @xyflow/react

## Quick Start

### 1. Setup
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file in the frontend root:
```env
VITE_API_URL=http://localhost:8000/api
# Optional: show default password hint on login (defaults to on in dev)
VITE_SHOW_DEMO_HINT=true
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### PWA (mobile & tablet)

The app is installable as a Progressive Web App. In dev, the service worker is enabled; use **Preview** for production-like behavior:

```bash
npm run build && npm run preview
```

On Chrome/Edge (Android or desktop), use **Install app** from the in-app banner or the browser menu. On iOS Safari, use **Share → Add to Home Screen**.

Regenerate icons after changing `public/favicon.svg`:

```bash
npm run generate-pwa-assets
```

## Deploy on Vercel

Create a Vercel project with **Root Directory** = `Enzo-frontend`. Set `VITE_API_URL` to your deployed backend (`https://…vercel.app/api`). See [../DEPLOYMENT.md](../DEPLOYMENT.md).

## Routes

| Path | Description |
|------|-------------|
| `/login` | Email + password sign-in |
| `/change-password` | Update password (required when `mustChangePassword`) |
| `/home` | Dashboard summary and quick links |
| `/actions` | Assigned insight actions |
| `/team` | Manager and direct reports |
| `/org-chart` | Org hierarchy graph |
| `/programs` | Anonymous program participation (metadata only) |
| `/chat` | Enzo AI assistant |
| `/profile` | User profile |
| `/settings` | Preferences (persisted via API) |

## Session

JWT is held in memory for API calls and mirrored in `sessionStorage` ([`src/lib/authSession.ts`](src/lib/authSession.ts)) so a tab reload keeps the session until logout or 401.

## Design System

Glassmorphism and theme tokens are defined in [`src/index.css`](src/index.css).
