import { StoragePlanId } from "@/types";

export interface StoragePlan {
  id: StoragePlanId;
  name: string;
  badge?: string;
  description: string;
  storageGB: number;
  limitBytes: number;
  priceMonthlyINR: number; // in Rupees
  priceYearlyINR: number; // in Rupees
  commissionRate: number; // e.g. 0.15 = 15%
  maxUploadMB: number;
  features: string[];
  popular?: boolean;
}

export const STORAGE_PLANS: StoragePlan[] = [
  {
    id: "STARTER_FREE",
    name: "Starter Free",
    description: "Ideal for individual photographers launching their online portfolio and initial catalog.",
    storageGB: 5,
    limitBytes: 5 * 1024 * 1024 * 1024,
    priceMonthlyINR: 0,
    priceYearlyINR: 0,
    commissionRate: 0.15,
    maxUploadMB: 50,
    features: [
      "5 GB Cloudflare R2 Object Storage",
      "Up to ~60 RAW master files or ~1,000 JPEGs",
      "Standard 15% marketplace commission",
      "Standard edge delivery & preview CDN",
      "Razorpay instant payment checkout",
    ],
  },
  {
    id: "PRO_CREATOR",
    name: "Pro Creator",
    badge: "Most Popular",
    popular: true,
    description: "For active commercial photographers, wildlife expeditioners, and architecture shooters.",
    storageGB: 50,
    limitBytes: 50 * 1024 * 1024 * 1024,
    priceMonthlyINR: 499,
    priceYearlyINR: 4990,
    commissionRate: 0.12,
    maxUploadMB: 150,
    features: [
      "50 GB Cloudflare R2 Object Storage (10x Space)",
      "Up to ~600 uncompressed RAWs or ~10,000 JPEGs",
      "Reduced 12% commission (Keep 88% of earnings)",
      "Priority Cloudflare Edge CDN routing",
      "Custom storefront watermark logo",
      "High-speed multi-file batch uploader",
    ],
  },
  {
    id: "STUDIO_MASTER",
    name: "Studio Master",
    badge: "Power Studio",
    description: "For high-volume production studios and professional multi-camera artists.",
    storageGB: 250,
    limitBytes: 250 * 1024 * 1024 * 1024,
    priceMonthlyINR: 1299,
    priceYearlyINR: 12990,
    commissionRate: 0.09,
    maxUploadMB: 500,
    features: [
      "250 GB Cloudflare R2 Object Storage (50x Space)",
      "Up to ~3,000 uncompressed 50MP RAW master files",
      "Discounted 9% commission (Keep 91% of earnings)",
      "Zero-egress master vault download presigning",
      "Custom domain & white-label storefront ready",
      "Priority 24/7 technical creator support",
    ],
  },
  {
    id: "AGENCY_ENTERPRISE",
    name: "Agency Enterprise",
    badge: "Unlimited Scale",
    description: "For photography collectives, national media agencies, and archive curators.",
    storageGB: 1024,
    limitBytes: 1024 * 1024 * 1024 * 1024,
    priceMonthlyINR: 2999,
    priceYearlyINR: 29990,
    commissionRate: 0.06,
    maxUploadMB: 2000,
    features: [
      "1 Terabyte (1,024 GB) Cloudflare R2 Storage",
      "Up to ~12,000+ 16-bit TIFF & uncompressed RAWs",
      "Lowest 6% commission (Keep 94% of earnings)",
      "Same-day settlement payouts to verified bank",
      "Multi-seat studio team management",
      "Dedicated account manager & SLA",
    ],
  },
];

export function getPlanById(id?: string): StoragePlan {
  return STORAGE_PLANS.find((p) => p.id === id) || STORAGE_PLANS[0];
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (!bytes || bytes === 0) return "0 GB";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
