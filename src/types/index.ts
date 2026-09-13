export type Role = "SUPER_ADMIN" | "TENANT_ADMIN" | "BUYER";

export type TenantStatus = "ACTIVE" | "PENDING_REVIEW" | "SUSPENDED";

export type PhotoStatus = "PUBLISHED" | "DRAFT" | "ARCHIVED";

export type OrderStatus = "PENDING" | "COMPLETED" | "REFUNDED";

export interface ExifData {
  camera?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: number | string;
  megapixels?: number | string;
  takenAt?: string;
  location?: string;
}

export interface LicenseTierDto {
  id: string;
  name: string; // PERSONAL_WEB, EDITORIAL, COMMERCIAL, EXTENDED_EXCLUSIVE
  displayName: string;
  description: string;
  priceCents: number;
  currency: string;
  maxResolutionWidth?: number | null;
  allowedUsage: string;
}

export interface PhotoDto {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  title: string;
  slug: string;
  description?: string | null;
  category: string;
  tags: string[];
  aspectRatio: number;
  width: number;
  height: number;
  format: string;
  fileSizeBytes: number;
  exif: ExifData;
  previewUrl: string;
  originalUrl?: string;
  status: PhotoStatus;
  featured: boolean;
  viewCount: number;
  downloadCount: number;
  licenseTiers: LicenseTierDto[];
  createdAt: string;
}

export type KycStatus = "UNVERIFIED" | "PENDING_APPROVAL" | "VERIFIED" | "REJECTED";

export type EntityType = "INDIVIDUAL" | "PROPRIETORSHIP" | "PARTNERSHIP" | "PRIVATE_LIMITED" | "LLP";

export type StoragePlanId = "STARTER_FREE" | "PRO_CREATOR" | "STUDIO_MASTER" | "AGENCY_ENTERPRISE";

export interface TenantDto {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  brandColor: string;
  watermarkText?: string | null;
  payoutEmail?: string | null;
  status: TenantStatus;
  commissionRate: number;
  photoCount?: number;
  totalSalesCents?: number;

  // Merchant Avatar & Pending Brand Changes
  avatarUrl?: string | null;
  pendingName?: string | null;
  pendingLogoUrl?: string | null;
  pendingAvatarUrl?: string | null;

  // Mandatory India KYC Details
  kycStatus?: KycStatus;
  legalName?: string | null;
  entityType?: EntityType | string | null;
  panNumber?: string | null;
  gstin?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  ifscCode?: string | null;
  accountHolderName?: string | null;
  kycDocUrl?: string | null;
  kycSubmittedAt?: string | null;
  kycReviewedAt?: string | null;
  kycRejectReason?: string | null;

  // Cloudflare R2 Storage Quotas
  storagePlan?: StoragePlanId;
  storageLimitBytes?: number;
  storageUsedBytes?: number;
}

export interface CartItem {
  photoId: string;
  photoTitle: string;
  previewUrl: string;
  tenantId: string;
  tenantName: string;
  licenseTierId: string;
  licenseName: string;
  priceCents: number;
}

export interface DownloadGrantDto {
  id: string;
  photoId: string;
  photoTitle: string;
  photoPreviewUrl: string;
  tenantName: string;
  licenseName: string;
  tokenHash: string;
  downloadUrl: string;
  expiresAt: string;
  maxDownloads: number;
  downloadCount: number;
  createdAt: string;
  orderNumber: string;
}
