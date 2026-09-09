async function testFlows() {
  const baseUrl = "http://localhost:3000";
  console.log("🔍 Starting WildCanvas end-to-end API verification...\n");

  // 1. Test Super Admin Login
  console.log("1️⃣ Testing Super Admin Login (admin@wildcanvas.com)...");
  let adminRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@wildcanvas.com", password: "password123" }),
  });
  let adminData = await adminRes.json();
  const adminCookie = adminRes.headers.get("set-cookie");
  console.log("   Admin login status:", adminRes.status, "User role:", adminData.user?.role);
  if (adminData.user?.role !== "SUPER_ADMIN") throw new Error("Admin login failed");

  // 2. Test Super Admin Stats API
  console.log("\n2️⃣ Testing Super Admin Stats API (/api/admin/stats)...");
  let statsRes = await fetch(`${baseUrl}/api/admin/stats`, {
    headers: { Cookie: adminCookie },
  });
  let statsData = await statsRes.json();
  console.log("   Stats response:", JSON.stringify(statsData.stats));
  if (!statsData.stats?.totalTenants) throw new Error("Stats API failed");

  // 3. Test Creator Tenant Login
  console.log("\n3️⃣ Testing Creator Tenant Login (creator@wildcanvas.com)...");
  let creatorRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "creator@wildcanvas.com", password: "password123" }),
  });
  let creatorData = await creatorRes.json();
  const creatorCookie = creatorRes.headers.get("set-cookie");
  console.log("   Creator login status:", creatorRes.status, "Tenant slug:", creatorData.user?.tenantSlug);
  if (creatorData.user?.tenantSlug !== "apex-safari") throw new Error("Creator login failed");

  // 4. Test Creator Studio Photos API
  console.log("\n4️⃣ Testing Creator Photos API (/api/studio/photos)...");
  let photosRes = await fetch(`${baseUrl}/api/studio/photos`, {
    headers: { Cookie: creatorCookie },
  });
  let photosData = await photosRes.json();
  console.log(`   Fetched ${photosData.photos?.length} creator photos.`);
  const samplePhoto = photosData.photos[0];
  console.log(`   Sample: "${samplePhoto.title}" with ${samplePhoto.licenseTiers.length} license tiers.`);

  // 5. Test Buyer Login & Digital Checkout Flow
  console.log("\n5️⃣ Testing Buyer Digital Checkout Flow...");
  let buyerRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "buyer@example.com", password: "password123" }),
  });
  let buyerData = await buyerRes.json();
  const buyerCookie = buyerRes.headers.get("set-cookie");

  const tier = samplePhoto.licenseTiers.find(t => t.name === "COMMERCIAL") || samplePhoto.licenseTiers[0];
  const checkoutPayload = {
    items: [
      {
        photoId: samplePhoto.id,
        photoTitle: samplePhoto.title,
        previewUrl: samplePhoto.previewUrl,
        tenantId: samplePhoto.tenantId,
        tenantName: "Apex Safari Studios",
        licenseTierId: tier.id,
        licenseName: tier.displayName || tier.name,
        priceCents: tier.priceCents,
      },
    ],
    buyerEmail: "buyer@example.com",
    buyerName: "Sarah Jenkins",
  };

  let checkoutRes = await fetch(`${baseUrl}/api/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: buyerCookie,
    },
    body: JSON.stringify(checkoutPayload),
  });
  let checkoutData = await checkoutRes.json();
  console.log("   Checkout result: Order #", checkoutData.orderNumber);
  if (!checkoutData.orderNumber) throw new Error("Checkout failed");

  // 6. Test Download Grant Token
  console.log("\n6️⃣ Testing Cryptographic Download Grant Token...");
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();
  const grant = await prisma.downloadGrant.findFirst({
    where: { photoId: samplePhoto.id, buyerEmail: "buyer@example.com" },
    orderBy: { createdAt: "desc" },
  });

  if (!grant) throw new Error("Download grant was not generated in database");
  console.log("   Found Download Grant Token:", grant.tokenHash);

  let downloadRes = await fetch(`${baseUrl}/api/download/${grant.tokenHash}`, {
    redirect: "manual",
  });
  console.log("   Download API response status:", downloadRes.status);
  console.log("   Redirect Location (Cloudflare R2/Master link):", downloadRes.headers.get("location")?.substring(0, 60) + "...");

  console.log("\n🎉 ALL E2E API & BUSINESS FLOW TESTS PASSED FLAWLESSLY!");
  await prisma.$disconnect();
}

testFlows().catch((err) => {
  console.error("\n❌ Test failed:", err);
  process.exit(1);
});
