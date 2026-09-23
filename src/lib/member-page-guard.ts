import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth-session";

type SearchParamValue = string | string[] | undefined;

export function createMemberReturnPath(
  pathname: string,
  searchParams?: Record<string, SearchParamValue>,
) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (Array.isArray(value)) {
      value.forEach((entry) => query.append(key, entry));
    } else if (value !== undefined) {
      query.append(key, value);
    }
  }

  const search = query.toString();
  return search ? `${pathname}?${search}` : pathname;
}

export async function requireMemberPage(returnTo: string) {
  const session = await getCurrentSession(await headers());

  if (!session?.user) {
    const localPath = new URL(returnTo, "http://happytaste.internal");
    const safePath =
      localPath.origin === "http://happytaste.internal" && localPath.pathname !== "/akun/masuk"
        ? `${localPath.pathname}${localPath.search}${localPath.hash}`
        : "/";

    redirect(`/akun/masuk?next=${encodeURIComponent(safePath)}`);
  }

  return session;
}
