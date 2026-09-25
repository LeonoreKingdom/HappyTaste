import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function getCurrentSession(headers: Headers) {
  return auth.api.getSession({ headers });
}

export async function requireMember(request: Request) {
  const session = await getCurrentSession(request.headers);
  return session?.user ? session : null;
}

export async function requireAdmin(request: Request) {
  const session = await getCurrentSession(request.headers);

  if (!session?.user) {
    return {
      session: null,
      response: NextResponse.json(
        { success: false, error: "Autentikasi diperlukan." },
        { status: 401 },
      ),
    } as const;
  }

  if (session.user.role !== "admin") {
    return {
      session: null,
      response: NextResponse.json(
        { success: false, error: "Akses admin diperlukan." },
        { status: 403 },
      ),
    } as const;
  }

  return { session, response: null } as const;
}

export async function requireAdminPage() {
  const session = await getCurrentSession(await headers());

  if (!session?.user) {
    redirect(`/akun/masuk?next=${encodeURIComponent("/admin")}`);
  }

  if (session.user.role !== "admin") {
    redirect("/");
  }

  return session;
}
