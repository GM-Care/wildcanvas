import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding WildCanvas Multi-Tenant Platform database...");

  // Clean existing records
  await prisma.downloadGrant.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.licenseTier.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = await bcrypt.hash("password123", 10);

  // 1. Create Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      name: "Alexander Vance (Super Admin)",
      email: "admin@wildcanvas.com",
      passwordHash: defaultPasswordHash,
      role: "SUPER_ADMIN",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    },
  });

  // 2. Create Tenant Creator 1: Apex Safari Studios
  const apexOwner = await prisma.user.create({
    data: {
      name: "Liam Vance",
      email: "creator@wildcanvas.com",
      passwordHash: defaultPasswordHash,
      role: "TENANT_ADMIN",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    },
  });

  const apexTenant = await prisma.tenant.create({
    data: {
      name: "Apex Safari Studios",
      slug: "apex-safari",
      bio: "National Geographic expedition contributor specializing in East African wildlife, predator behavior, and high-speed motion captures.",
      brandColor: "#f59e0b",
      watermarkText: "© APEX SAFARI STUDIOS",
      payoutEmail: "payouts@apexsafari.com",
      status: "ACTIVE",
      commissionRate: 0.15,
      ownerId: apexOwner.id,
      logoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1600&q=80",
    },
  });

  // 3. Create Tenant Creator 2: Luminary Arch Lens
  const luminaryOwner = await prisma.user.create({
    data: {
      name: "Maya Lin",
      email: "luminary@wildcanvas.com",
      passwordHash: defaultPasswordHash,
      role: "TENANT_ADMIN",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    },
  });

  const luminaryTenant = await prisma.tenant.create({
    data: {
      name: "Luminary Architectural Lens",
      slug: "luminary-arch",
      bio: "Documenting architectural geometry, brutalist concrete forms, parametric design, and minimalist daylight interactions across Tokyo, London, and Berlin.",
      brandColor: "#38bdf8",
      watermarkText: "© LUMINARY ARCH LENS",
      payoutEmail: "accounts@luminaryarch.design",
      status: "ACTIVE",
      commissionRate: 0.12,
      ownerId: luminaryOwner.id,
      logoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
    },
  });

  // 4. Create Tenant Creator 3: Nordic Horizon
  const nordicOwner = await prisma.user.create({
    data: {
      name: "Astrid Lindqvist",
      email: "astrid@wildcanvas.com",
      passwordHash: defaultPasswordHash,
      role: "TENANT_ADMIN",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
    },
  });

  const nordicTenant = await prisma.tenant.create({
    data: {
      name: "Nordic Horizon",
      slug: "nordic-horizon",
      bio: "Chasing glacial auroras, remote Scandinavian archipelagos, and raw Arctic weather on medium-format digital sensors.",
      brandColor: "#34d399",
      watermarkText: "© NORDIC HORIZON",
      payoutEmail: "astrid@nordichorizon.se",
      status: "ACTIVE",
      commissionRate: 0.15,
      ownerId: nordicOwner.id,
      logoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1600&q=80",
    },
  });

  // 5. Create Buyer User
  const buyerUser = await prisma.user.create({
    data: {
      name: "Sarah Jenkins",
      email: "buyer@example.com",
      passwordHash: defaultPasswordHash,
      role: "BUYER",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    },
  });

  // 6. Create Photos for Apex Safari Studios
  const apexPhotos = [
    {
      title: "Cheetah at Full Stride in the Serengeti",
      slug: "cheetah-full-stride-serengeti",
      description: "A male cheetah executing a high-speed banking turn during a morning hunt across golden plains.",
      category: "Wildlife",
      tags: JSON.stringify(["cheetah", "speed", "serengeti", "africa", "motion", "action"]),
      aspectRatio: 1.5,
      width: 8256,
      height: 5504,
      previewUrl: "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=1600&q=85",
      originalUrl: "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=3840&q=95",
      previewKey: "previews/apex-safari/cheetah-wm.webp",
      originalKey: "originals/apex-safari/cheetah-master.nef",
      featured: true,
      exif: JSON.stringify({
        camera: "Nikon Z9",
        lens: "NIKKOR Z 400mm f/2.8 TC VR S",
        focalLength: "400mm",
        aperture: "f/2.8",
        shutterSpeed: "1/4000s",
        iso: 320,
        megapixels: "45.7 MP",
        takenAt: "2026-03-12T06:45:00Z",
        location: "Serengeti National Park, Tanzania",
      }),
      pricing: [
        { name: "PERSONAL_WEB", displayName: "Personal & Social Web", price: 1900, usage: "Personal blogs, social media, screensaver (2048px)" },
        { name: "EDITORIAL", displayName: "Editorial Publication", price: 5500, usage: "Newspapers, print magazines, online journalism" },
        { name: "COMMERCIAL", displayName: "Commercial Advertising", price: 16500, usage: "Global marketing campaigns, packaging, corporate" },
        { name: "EXTENDED_EXCLUSIVE", displayName: "Exclusive Buyout", price: 38000, usage: "Full ownership transfer, unlimited print runs" },
      ],
    },
    {
      title: "Elephant Matriarch Dust Bath at Twilight",
      slug: "elephant-matriarch-dust-bath",
      description: "An experienced herd matriarch showering in fine volcanic dust against an amber Amboseli sunset.",
      category: "Wildlife",
      tags: JSON.stringify(["elephant", "amboseli", "dust", "sunset", "silhouette", "kenya"]),
      aspectRatio: 1.5,
      width: 8192,
      height: 5464,
      previewUrl: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=1600&q=85",
      originalUrl: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=3840&q=95",
      previewKey: "previews/apex-safari/elephant-wm.webp",
      originalKey: "originals/apex-safari/elephant-master.cr3",
      featured: true,
      exif: JSON.stringify({
        camera: "Canon EOS R5",
        lens: "RF 600mm f/4L IS USM",
        focalLength: "600mm",
        aperture: "f/4.0",
        shutterSpeed: "1/1600s",
        iso: 640,
        megapixels: "45.0 MP",
        takenAt: "2026-02-18T18:10:00Z",
        location: "Amboseli National Park, Kenya",
      }),
      pricing: [
        { name: "PERSONAL_WEB", displayName: "Personal & Social Web", price: 1500, usage: "Personal display, digital frames" },
        { name: "EDITORIAL", displayName: "Editorial Publication", price: 4500, usage: "Books, magazines, documentary" },
        { name: "COMMERCIAL", displayName: "Commercial Advertising", price: 14500, usage: "Advertising, brand collateral" },
      ],
    },
    {
      title: "Pride of Lions in the Golden Hour Grass",
      slug: "pride-lions-golden-hour",
      description: "Young pride resting in tall savanna rye grass during late afternoon golden sunlight.",
      category: "Wildlife",
      tags: JSON.stringify(["lion", "pride", "golden hour", "safari", "cats"]),
      aspectRatio: 1.5,
      width: 9504,
      height: 6336,
      previewUrl: "https://images.unsplash.com/photo-1614027164847-1b28caa144b6?auto=format&fit=crop&w=1600&q=85",
      originalUrl: "https://images.unsplash.com/photo-1614027164847-1b28caa144b6?auto=format&fit=crop&w=3840&q=95",
      previewKey: "previews/apex-safari/lions-wm.webp",
      originalKey: "originals/apex-safari/lions-master.arw",
      featured: false,
      exif: JSON.stringify({
        camera: "Sony A1",
        lens: "FE 200-600mm f/5.6-6.3 G OSS",
        focalLength: "500mm",
        aperture: "f/6.3",
        shutterSpeed: "1/1000s",
        iso: 400,
        megapixels: "50.1 MP",
        takenAt: "2026-01-20T17:30:00Z",
        location: "Maasai Mara, Kenya",
      }),
      pricing: [
        { name: "PERSONAL_WEB", displayName: "Personal & Social Web", price: 2000, usage: "Personal display" },
        { name: "COMMERCIAL", displayName: "Commercial Advertising", price: 15000, usage: "Commercial media" },
      ],
    },
  ];

  // 7. Create Photos for Luminary Architectural Lens
  const luminaryPhotos = [
    {
      title: "Concrete Spiral Cantilever Staircase",
      slug: "concrete-spiral-cantilever",
      description: "Seamless poured concrete staircase with sweeping shadow geometries inside a contemporary art gallery.",
      category: "Architecture",
      tags: JSON.stringify(["architecture", "minimalist", "concrete", "spiral", "monochrome", "interior"]),
      aspectRatio: 1.5,
      width: 11656,
      height: 8742,
      previewUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=85",
      originalUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=3840&q=95",
      previewKey: "previews/luminary-arch/spiral-wm.webp",
      originalKey: "originals/luminary-arch/spiral-master.3fr",
      featured: true,
      exif: JSON.stringify({
        camera: "Hasselblad X2D 100C",
        lens: "XCD 2,5/38V",
        focalLength: "38mm",
        aperture: "f/8.0",
        shutterSpeed: "1/30s",
        iso: 64,
        megapixels: "100.0 MP",
        takenAt: "2026-04-05T14:15:00Z",
        location: "Berlin, Germany",
      }),
      pricing: [
        { name: "PERSONAL_WEB", displayName: "Personal & Social Web", price: 2500, usage: "Design inspiration, personal print" },
        { name: "EDITORIAL", displayName: "Editorial Publication", price: 6500, usage: "Architectural journals, monographs" },
        { name: "COMMERCIAL", displayName: "Commercial Advertising", price: 22000, usage: "Developer billboards, agency pitch decks" },
        { name: "EXTENDED_EXCLUSIVE", displayName: "Exclusive Buyout", price: 45000, usage: "Exclusive worldwide rights" },
      ],
    },
    {
      title: "Parametric Facade and Cloud Reflections",
      slug: "parametric-facade-reflections",
      description: "Curvilinear glass panels mirroring afternoon cumulus clouds on an energy-neutral tower.",
      category: "Architecture",
      tags: JSON.stringify(["skyscraper", "facade", "glass", "urban", "modern"]),
      aspectRatio: 1.33,
      width: 8256,
      height: 6192,
      previewUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85",
      originalUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=3840&q=95",
      previewKey: "previews/luminary-arch/facade-wm.webp",
      originalKey: "originals/luminary-arch/facade-master.nef",
      featured: false,
      exif: JSON.stringify({
        camera: "Nikon Z7 II",
        lens: "PC NIKKOR 19mm f/4E ED Tilt-Shift",
        focalLength: "19mm",
        aperture: "f/11.0",
        shutterSpeed: "1/125s",
        iso: 64,
        megapixels: "45.7 MP",
        takenAt: "2026-03-28T11:20:00Z",
        location: "London, UK",
      }),
      pricing: [
        { name: "PERSONAL_WEB", displayName: "Personal & Social Web", price: 1800, usage: "Web design, blog" },
        { name: "COMMERCIAL", displayName: "Commercial Advertising", price: 14000, usage: "Real estate & marketing" },
      ],
    },
  ];

  // 8. Create Photos for Nordic Horizon
  const nordicPhotos = [
    {
      title: "Emerald Aurora Borealis above Senja Fjord",
      slug: "emerald-aurora-senja-fjord",
      description: "Vibrant solar storm ribbons reflecting over still arctic fjord waters surrounded by jagged snow peaks.",
      category: "Landscape",
      tags: JSON.stringify(["aurora", "northern lights", "norway", "senja", "winter", "fjord", "night"]),
      aspectRatio: 1.5,
      width: 9504,
      height: 6336,
      previewUrl: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1600&q=85",
      originalUrl: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=3840&q=95",
      previewKey: "previews/nordic-horizon/aurora-wm.webp",
      originalKey: "originals/nordic-horizon/aurora-master.arw",
      featured: true,
      exif: JSON.stringify({
        camera: "Sony A7R V",
        lens: "FE 14mm f/1.8 GM",
        focalLength: "14mm",
        aperture: "f/1.8",
        shutterSpeed: "3.2s",
        iso: 1600,
        megapixels: "61.0 MP",
        takenAt: "2026-01-14T23:42:00Z",
        location: "Senja Island, Norway",
      }),
      pricing: [
        { name: "PERSONAL_WEB", displayName: "Personal & Social Web", price: 2200, usage: "Wall art, desktop wallpaper" },
        { name: "EDITORIAL", displayName: "Editorial Publication", price: 6000, usage: "Travel guides, National Geographic" },
        { name: "COMMERCIAL", displayName: "Commercial Advertising", price: 19500, usage: "Tourism campaigns, billboard" },
      ],
    },
    {
      title: "Glacial Lagoon Ice Crystals at Sunrise",
      slug: "glacial-lagoon-ice-sunrise",
      description: "Diamond-clear ancient ice shards stranded on black volcanic sand as sunrise paints the sky in lavender.",
      category: "Landscape",
      tags: JSON.stringify(["glacier", "ice", "iceland", "black sand", "sunrise", "arctic"]),
      aspectRatio: 1.5,
      width: 8192,
      height: 5464,
      previewUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85",
      originalUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=3840&q=95",
      previewKey: "previews/nordic-horizon/ice-wm.webp",
      originalKey: "originals/nordic-horizon/ice-master.cr3",
      featured: false,
      exif: JSON.stringify({
        camera: "Canon EOS R5",
        lens: "RF 24-70mm f/2.8L IS USM",
        focalLength: "35mm",
        aperture: "f/11.0",
        shutterSpeed: "1/4s",
        iso: 100,
        megapixels: "45.0 MP",
        takenAt: "2026-02-02T08:15:00Z",
        location: "Jökulsárlón, Iceland",
      }),
      pricing: [
        { name: "PERSONAL_WEB", displayName: "Personal & Social Web", price: 1600, usage: "Personal display" },
        { name: "COMMERCIAL", displayName: "Commercial Advertising", price: 13500, usage: "Commercial promotional media" },
      ],
    },
  ];

  // Helper to insert photos & license tiers
  const createdPhotos: any[] = [];

  for (const p of apexPhotos) {
    const photo = await prisma.photo.create({
      data: {
        tenantId: apexTenant.id,
        title: p.title,
        slug: p.slug,
        description: p.description,
        category: p.category,
        tags: p.tags,
        aspectRatio: p.aspectRatio,
        width: p.width,
        height: p.height,
        previewUrl: p.previewUrl,
        originalUrl: p.originalUrl,
        previewKey: p.previewKey,
        originalKey: p.originalKey,
        exif: p.exif,
        featured: p.featured,
        status: "PUBLISHED",
        licenseTiers: {
          create: p.pricing.map((tier) => ({
            name: tier.name,
            displayName: tier.displayName,
            description: tier.usage,
            priceCents: tier.price,
            allowedUsage: tier.usage,
          })),
        },
      },
      include: { licenseTiers: true },
    });
    createdPhotos.push(photo);
  }

  for (const p of luminaryPhotos) {
    const photo = await prisma.photo.create({
      data: {
        tenantId: luminaryTenant.id,
        title: p.title,
        slug: p.slug,
        description: p.description,
        category: p.category,
        tags: p.tags,
        aspectRatio: p.aspectRatio,
        width: p.width,
        height: p.height,
        previewUrl: p.previewUrl,
        originalUrl: p.originalUrl,
        previewKey: p.previewKey,
        originalKey: p.originalKey,
        exif: p.exif,
        featured: p.featured,
        status: "PUBLISHED",
        licenseTiers: {
          create: p.pricing.map((tier) => ({
            name: tier.name,
            displayName: tier.displayName,
            description: tier.usage,
            priceCents: tier.price,
            allowedUsage: tier.usage,
          })),
        },
      },
      include: { licenseTiers: true },
    });
    createdPhotos.push(photo);
  }

  for (const p of nordicPhotos) {
    const photo = await prisma.photo.create({
      data: {
        tenantId: nordicTenant.id,
        title: p.title,
        slug: p.slug,
        description: p.description,
        category: p.category,
        tags: p.tags,
        aspectRatio: p.aspectRatio,
        width: p.width,
        height: p.height,
        previewUrl: p.previewUrl,
        originalUrl: p.originalUrl,
        previewKey: p.previewKey,
        originalKey: p.originalKey,
        exif: p.exif,
        featured: p.featured,
        status: "PUBLISHED",
        licenseTiers: {
          create: p.pricing.map((tier) => ({
            name: tier.name,
            displayName: tier.displayName,
            description: tier.usage,
            priceCents: tier.price,
            allowedUsage: tier.usage,
          })),
        },
      },
      include: { licenseTiers: true },
    });
    createdPhotos.push(photo);
  }

  // 9. Create a Sample Completed Order & Download Grant for the Buyer
  const samplePhoto = createdPhotos[0]; // Cheetah
  const sampleTier = samplePhoto.licenseTiers[2]; // Commercial ($165.00)

  const order = await prisma.order.create({
    data: {
      orderNumber: "ORD-2026-9481",
      buyerId: buyerUser.id,
      buyerEmail: buyerUser.email,
      buyerName: buyerUser.name,
      totalAmountCents: sampleTier.priceCents,
      status: "COMPLETED",
      platformFeeCents: Math.round(sampleTier.priceCents * 0.15),
      tenantPayoutCents: Math.round(sampleTier.priceCents * 0.85),
      items: {
        create: [
          {
            photoId: samplePhoto.id,
            licenseTierId: sampleTier.id,
            tenantId: apexTenant.id,
            priceCents: sampleTier.priceCents,
            licenseName: sampleTier.displayName,
            photoTitle: samplePhoto.title,
            downloadGrant: {
              create: {
                photoId: samplePhoto.id,
                buyerId: buyerUser.id,
                buyerEmail: buyerUser.email,
                tokenHash: "grant_token_cheetah_master_verified_2026",
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
                maxDownloads: 5,
                downloadCount: 1,
                lastDownloadedAt: new Date(),
              },
            },
          },
        ],
      },
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log(`Created:
  - Super Admin: admin@wildcanvas.com (password123)
  - Tenants:
    * Apex Safari Studios: creator@wildcanvas.com (password123) -> /s/apex-safari
    * Luminary Arch Lens: luminary@wildcanvas.com (password123) -> /s/luminary-arch
    * Nordic Horizon: astrid@wildcanvas.com (password123) -> /s/nordic-horizon
  - Buyer: buyer@example.com (password123) with 1 completed high-res purchase`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
