# Kinder PMS

**Kinder PMS – Preschool Management System.**

Nền tảng SaaS quản lý trường mầm non. Monorepo Next.js 15 + Supabase, hiện tại gồm:

- Trang marketing (trang chủ, bảng giá, FAQ, pháp lý)
- Xác thực người dùng (đăng ký, đăng nhập, MFA, đổi mật khẩu)
- Schema Supabase tối giản (`accounts` + auth)

Các phân hệ nghiệp vụ (học sinh, lớp, học phí, …) sẽ được phát triển lại từ đầu trên nền tảng này.

## Tech stack

- [Next.js 15](https://nextjs.org/) (App Router, Turbopack)
- [Supabase](https://supabase.com/) (Auth + PostgreSQL)
- [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [Turborepo](https://turbo.build/) monorepo
- TypeScript, React Query, i18n (vi/en), Playwright e2e

## Cấu trúc chính

```
apps/web/          # Ứng dụng Next.js
  app/(marketing)/ # Trang công khai
  app/auth/        # Luồng đăng nhập/đăng ký
  supabase/        # Migration & cấu hình DB local
packages/          # @kit/auth, @kit/supabase, @kit/ui, …
```

## Bắt đầu (local)

### Yêu cầu

- Node.js 20+
- pnpm 10+
- Docker (cho Supabase local)

### Cài đặt

```bash
pnpm install
```

### Supabase local

```bash
pnpm supabase:web:start
pnpm supabase:web:reset   # áp dụng migration + seed
cd apps/web && npx supabase migration up # áp dụng migration local
```

Copy `apps/web/.env.example` → `apps/web/.env.local` và điền keys từ `pnpm supabase:web:status`.

### Chạy dev

```bash
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000).

## Scripts hữu ích

| Lệnh                          | Mô tả                        |
| ----------------------------- | ---------------------------- |
| `pnpm dev`                    | Chạy toàn bộ monorepo        |
| `pnpm --filter web typecheck` | Kiểm tra TypeScript          |
| `pnpm supabase:web:reset`     | Reset DB local               |
| `pnpm supabase:web:typegen`   | Sinh lại `database.types.ts` |

## Triển khai production

Xem [docs/PRODUCTION.md](docs/PRODUCTION.md).

## Phát triển tiếp theo

Khi thêm module mới (ví dụ quản lý học sinh):

1. Tạo migration trong `apps/web/supabase/migrations/`
2. Chạy `pnpm supabase:web:reset` và `pnpm supabase:web:typegen`
3. Thêm route dưới `apps/web/app/` và logic trong `apps/web/lib/`
4. Cập nhật `paths.config.ts` và middleware nếu cần bảo vệ route

## License

Xem [LICENSE](LICENSE).
