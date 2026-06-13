# Wallet App — Frontend

Quản lý tài chính cá nhân: thu/chi, ví, nợ BNPL, báo cáo.

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- TanStack Query (React Query)
- Zustand (state)
- React Router v6
- Sonner (toasts)
- Recharts (charts)

## Setup

```bash
npm install
cp .env.example .env.local
VITE_API_BASE_URL=http://localhost:8080 npm run dev
```

Or set `VITE_API_BASE_URL` in `.env.local`:
```
VITE_API_BASE_URL=http://localhost:8080
```

## Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `/api/v1` |

## Pages

| Route | Description |
|---|---|
| `/login` | Login |
| `/` | Dashboard — Net Worth, Nợ, Giao dịch gần đây |
| `/transactions` | Danh sách giao dịch + filter tabs |
| `/add` | Thêm giao dịch mới (Quick + Advanced) |
| `/debts` | Nhóm nợ BNPL / vay nợ |
| `/debts/new` | Tạo nhóm nợ mới |
| `/debts/:id` | Chi tiết nhóm nợ + thanh toán |
| `/wallets` | Quản lý ví (CRUD) |
| `/profile` | Cài đặt + đăng xuất |

## Development Commands

```bash
# Dev server (port 3000)
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Build
npm run build

# Unit/Component tests
npm run test

# E2E tests (requires local backend at :8080, frontend at :3000)
BASE_URL=http://localhost:3000 VITE_API_BASE_URL=http://localhost:8080 \
  TEST_EMAIL=test@example.com TEST_PASSWORD='Test1234!' npx playwright test

# E2E with seed data
node e2e/setup/seed-test-data.mjs  # Populates test DB first
# Then run playwright test (above)

# Capture UI screenshots (animations disabled)
node e2e/setup/capture-ui-screenshots.mjs
```

## Design System

- **Style:** Dark Editorial + Acid Lime Accents
- **Colors:** Navy `#0F172A`, Sky Accent `#0EA5E9`, Emerald `#10B981`, Rose `#F43F5E`
- **Fonts:** Inter (UI) + JetBrains Mono (code) + Lora (Vietnamese diacritics display)
- **Dark mode:** CSS custom properties (no `dark:` classes)
