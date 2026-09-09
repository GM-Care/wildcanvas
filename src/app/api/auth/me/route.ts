import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const runtime = "edge";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    // Refresh user from DB to get latest status
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        tenants: {
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    const tenant = user.tenants[0];

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        tenantId: tenant?.id || null,
        tenantSlug: tenant?.slug || null,
        tenantName: tenant?.name || null,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
