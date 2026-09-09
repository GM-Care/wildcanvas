# WildCanvas: Multi-Tenant Digital Photography Platform

> An enterprise-grade, multi-tenant digital photo e-commerce marketplace powered by Next.js 15, React 19, TypeScript, Tailwind CSS, Prisma ORM, and Cloudflare R2 zero-egress object storage.

---

## 🌟 Key Architecture & Capabilities

### 1. Multi-Tenancy Engine
- **Independent Photographer Storefronts**: Every verified creator gets a dedicated, branded storefront (`/s/[tenantSlug]`) with custom banners, avatars, brand color palettes, bios, equipment telemetry, and dedicated catalogs.
- **Creator Studio (`/studio`)**:
  - Direct photo uploader with automated browser/server EXIF extraction (Camera body, Lens, Focal Length, Aperture, Shutter Speed, ISO, Megapixels).
  - Multi-tier license pricing matrix configurator (Personal Web, Editorial, Commercial Advertising, Exclusive Buyout).
  - Storefront design customizer (Brand color picker, custom watermark text, payout email).
  - Catalog manager with views, download counts, and sales performance tracking.

### 2. Cloudflare R2 Zero-Egress Storage Architecture
- **Dual-Tier Asset Delivery**:
  - **Tier 1 (Public Edge CDN)**: Web-optimized WebP previews delivered via Cloudflare’s 330+ edge locations with dynamic semi-transparent SVG watermarking overlays to prevent uncredited commercial reproduction.
  - **Tier 2 (Private Encrypted Master Vault)**: Original high-resolution RAW (.CR3, .NEF, .ARW, .3FR), 16-bit TIFFs, and uncompressed master files are kept in a private Cloudflare R2 bucket. Accessible exclusively via time-expiring HMAC signed download tokens.
- **Direct Client-to-R2 Presigned Uploads**: Browser uploads heavy 50MB+ RAW files directly to Cloudflare R2 endpoints using `@aws-sdk/s3-request-presigner`, eliminating API server payload bottlenecks and bandwidth costs.
- **Zero Bandwidth Egress Fees**: Eliminates traditional \$0.09/GB AWS S3 egress penalties.
- **Zero-Config Local Fallback Mode**: If Cloudflare R2 environment variables are not yet provided, WildCanvas seamlessly emulates R2 presigned URLs, cryptographic tokens, and asset streaming so the platform runs immediately out-of-the-box.

### 3. Digital Rights Management & Anti-Theft Protection
- **Anti-Theft Overlay Shield**: Transparent DOM shield blocks right-click context menu downloading, image dragging, and raw URL scraping on all preview assets.
- **Cryptographic Download Grants**: Every checkout creates an authorized `DownloadGrant` with a unique token hash, 30-day expiration, and configurable maximum download limit (e.g. 5 downloads).

### 4. Role-Based Portals & Access Control
- **Super Admin Console (`/admin`)**:
  - Global GMV, Platform Commission Revenue (15%), and Creator Payouts (85%).
  - Active tenant governance: 1-click status toggling (ACTIVE / SUSPENDED), platform take-rate customization (10% to 20%), and photo moderation.
  - Cloudflare R2 storage bucket connection and telemetry.
- **Buyer Account Vault (`/account/downloads`)**:
  - Dedicated asset vault displaying purchased licenses, remaining download tokens, validity expiration dates, and 1-click direct download buttons.
- **1-Click Demo Persona Switcher**: Top navigation bar includes an instant persona emulator to test the platform as Super Admin, Tenant Creator, or Buyer with zero typing.

---

## 🚀 Pre-Configured Demo Accounts

| Role | Email | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@wildcanvas.com` | `password123` | [`/admin`](http://localhost:3000/admin) |
| **Creator Tenant 1 (Apex Safari Studios)** | `creator@wildcanvas.com` | `password123` | [`/studio`](http://localhost:3000/studio) & [`/s/apex-safari`](http://localhost:3000/s/apex-safari) |
| **Creator Tenant 2 (Luminary Arch Lens)** | `luminary@wildcanvas.com` | `password123` | [`/studio`](http://localhost:3000/studio) & [`/s/luminary-arch`](http://localhost:3000/s/luminary-arch) |
| **Creator Tenant 3 (Nordic Horizon)** | `astrid@wildcanvas.com` | `password123` | [`/studio`](http://localhost:3000/studio) & [`/s/nordic-horizon`](http://localhost:3000/s/nordic-horizon) |
| **Art Buyer / Collector** | `buyer@example.com` | `password123` | [`/account/downloads`](http://localhost:3000/account/downloads) |

---

## 🛠️ Environment Configuration (`.env`)

```ini
# Database (SQLite default for zero-setup, interchangeable with PostgreSQL or Cloudflare D1)
DATABASE_URL="file:./dev.db"

# Session & Auth Secret
JWT_SECRET="wildcanvas-super-secret-key-change-in-production-2026"
COOKIE_NAME="wildcanvas_session"

# Cloudflare R2 Object Storage Configuration
# (Leave empty for automatic local simulation, or populate with live credentials)
CLOUDFLARE_R2_ACCOUNT_ID="your_cloudflare_account_id"
CLOUDFLARE_R2_ACCESS_KEY_ID="your_r2_access_key_id"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your_r2_secret_access_key"
CLOUDFLARE_R2_BUCKET_NAME="wildcanvas-storage"
CLOUDFLARE_R2_PUBLIC_DOMAIN="https://pub-xxxx.r2.dev"

# Platform Settings
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_PLATFORM_NAME="WildCanvas"
NEXT_PUBLIC_DEFAULT_COMMISSION_PERCENT="15"
```

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Synchronize database schema
npx prisma db push

# 3. Seed demo creators, photos, and orders
npx tsx prisma/seed.ts

# 4. Start development server
npx next dev -p 3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
