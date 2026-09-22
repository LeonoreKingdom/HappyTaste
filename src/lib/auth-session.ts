import { auth } from "@/lib/auth";

export async function getCurrentSession(headers: Headers) {
  return auth.api.getSession({ headers });
}

export async function requireMember(request: Request) {
  const session = await getCurrentSession(request.headers);
  return session?.user ? session : null;
}
