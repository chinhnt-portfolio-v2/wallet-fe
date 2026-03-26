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
npm run dev
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
| `/transactions` | Danh sách giao dịch |
| `/add` | Thêm giao dịch mới |
| `/debts` | Nhóm nợ BNPL / vay nợ |
| `/debts/:id` | Chi tiết nhóm nợ + thanh toán |
| `/wallets` | Quản lý ví |

## Design System

- **Style:** Fintech Minimalist
- **Colors:** Navy `#0F172A`, Sky Accent `#0EA5E9`, Emerald `#10B981`, Rose `#F43F5E`
- **Font:** Inter + JetBrains Mono
- **Dark mode:** supported (class-based)
