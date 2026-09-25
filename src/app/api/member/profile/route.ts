import { NextRequest, NextResponse } from "next/server";

import {
  ensureMemberProfileByUserId,
  getMemberProfileByUserId,
  updateMemberProfilePhone,
} from "@/db/queries/member-profiles";
import { auth } from "@/lib/auth";
import { requireMember } from "@/lib/auth-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MEMBER_NAME_LENGTH = 100;
const MAX_MEMBER_PHONE_LENGTH = 32;
const editableFields = new Set(["name", "phone"]);

type ProfileUpdates = {
  name?: string;
  phone?: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseProfileUpdates(body: unknown): ProfileUpdates {
  if (!isRecord(body)) {
    throw new Error("Body profil tidak valid.");
  }

  const fields = Object.keys(body);
  if (fields.length === 0 || fields.some((field) => !editableFields.has(field))) {
    throw new Error("Hanya nama dan nomor telepon yang dapat diperbarui.");
  }

  const updates: ProfileUpdates = {};

  if (Object.hasOwn(body, "name")) {
    if (typeof body.name !== "string") {
      throw new Error("Nama harus berupa teks.");
    }

    const name = body.name.trim();
    if (name.length < 2 || name.length > MAX_MEMBER_NAME_LENGTH) {
      throw new Error(`Nama harus berisi 2–${MAX_MEMBER_NAME_LENGTH} karakter.`);
    }

    updates.name = name;
  }

  if (Object.hasOwn(body, "phone")) {
    if (body.phone !== null && typeof body.phone !== "string") {
      throw new Error("Nomor telepon harus berupa teks atau null.");
    }

    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    if (phone.length > MAX_MEMBER_PHONE_LENGTH) {
      throw new Error(`Nomor telepon maksimal ${MAX_MEMBER_PHONE_LENGTH} karakter.`);
    }

    updates.phone = phone || null;
  }

  return updates;
}

async function getAuthenticatedMember(request: NextRequest) {
  const session = await requireMember(request);

  if (!session) {
    return {
      session: null,
      response: NextResponse.json(
        { success: false, error: "Login member diperlukan." },
        { status: 401 },
      ),
    } as const;
  }

  if (session.user.role !== "user") {
    return {
      session: null,
      response: NextResponse.json(
        { success: false, error: "Profil member tidak tersedia untuk akun ini." },
        { status: 403 },
      ),
    } as const;
  }

  return { session, response: null } as const;
}

function toProfileResponse(
  session: NonNullable<Awaited<ReturnType<typeof requireMember>>>,
  profile: NonNullable<Awaited<ReturnType<typeof getMemberProfileByUserId>>>,
) {
  return {
    userId: session.user.id,
    name: session.user.name,
    email: session.user.email,
    emailVerified: session.user.emailVerified,
    phone: profile.phone,
    pointsBalance: profile.pointsBalance,
    joinedAt: session.user.createdAt,
    updatedAt: profile.updatedAt,
  };
}

export async function GET(request: NextRequest) {
  const authResult = await getAuthenticatedMember(request);
  if (!authResult.session) return authResult.response;

  try {
    const profile = await getMemberProfileByUserId(authResult.session.user.id);

    return NextResponse.json({
      success: true,
      data: toProfileResponse(
        authResult.session,
        profile ?? {
          phone: null,
          pointsBalance: 0,
          createdAt: authResult.session.user.createdAt,
          updatedAt: authResult.session.user.updatedAt,
        },
      ),
    });
  } catch (error) {
    console.error("Error fetching member profile:", error);
    return NextResponse.json(
      { success: false, error: "Profil member tidak dapat dimuat." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  const authResult = await getAuthenticatedMember(request);
  if (!authResult.session) return authResult.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Body JSON tidak valid." },
      { status: 400 },
    );
  }

  let updates: ProfileUpdates;
  try {
    updates = parseProfileUpdates(body);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Data profil tidak valid.",
      },
      { status: 400 },
    );
  }

  try {
    const currentProfile = await ensureMemberProfileByUserId(authResult.session.user.id);
    if (!currentProfile) {
      return NextResponse.json(
        { success: false, error: "Profil member tidak dapat dimuat." },
        { status: 500 },
      );
    }

    if (updates.name !== undefined) {
      await auth.api.updateUser({
        body: { name: updates.name },
        headers: request.headers,
      });
    }

    const profile =
      updates.phone !== undefined
        ? await updateMemberProfilePhone(authResult.session.user.id, updates.phone)
        : currentProfile;

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Profil member tidak dapat diperbarui." },
        { status: 500 },
      );
    }

    const updatedSession =
      updates.name !== undefined
        ? await auth.api.getSession({ headers: request.headers })
        : authResult.session;

    if (!updatedSession?.user) {
      return NextResponse.json(
        { success: false, error: "Sesi login tidak lagi aktif." },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      data: toProfileResponse(updatedSession, profile),
    });
  } catch (error) {
    console.error("Error updating member profile:", error);
    return NextResponse.json(
      { success: false, error: "Profil member tidak dapat diperbarui." },
      { status: 500 },
    );
  }
}
