import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { admin } from "better-auth/plugins";

import { db } from "@/db";
import * as authSchema from "@/db/schema/auth";
import { memberProfiles } from "@/db/schema/member-profiles";

const MEMBER_SIGN_UP_PATH = "/sign-up/email";
const MAX_MEMBER_PHONE_LENGTH = 32;

function isMemberSignUp(context: { path: string } | null) {
  return context?.path.endsWith(MEMBER_SIGN_UP_PATH) ?? false;
}

function getMemberPhone(context: { body: unknown } | null) {
  const body = context?.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return undefined;
  }

  return (body as Record<string, unknown>).phone;
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: authSchema.user,
      session: authSchema.session,
      account: authSchema.account,
      verification: authSchema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (_user, context) => {
          if (!isMemberSignUp(context)) return;

          const phone = getMemberPhone(context);
          if (phone === undefined) return;
          if (typeof phone !== "string") {
            throw new APIError("BAD_REQUEST", {
              message: "Phone must be a string.",
            });
          }

          if (phone.trim().length > MAX_MEMBER_PHONE_LENGTH) {
            throw new APIError("BAD_REQUEST", {
              message: `Phone must be ${MAX_MEMBER_PHONE_LENGTH} characters or fewer.`,
            });
          }
        },
        after: async (user, context) => {
          if (!isMemberSignUp(context) || user.role !== "user") return;

          const phone = getMemberPhone(context);
          await db
            .insert(memberProfiles)
            .values({
              userId: user.id,
              phone: typeof phone === "string" ? phone.trim() || null : null,
            })
            .onConflictDoNothing({ target: memberProfiles.userId });
        },
      },
    },
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
  ],
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
});
