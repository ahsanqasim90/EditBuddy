import { getChatGPTUser } from "@/app/chatgpt-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ authenticated: false }, { status: 401, headers: { "Cache-Control": "no-store" } });
  return Response.json({ authenticated: true, user: { displayName: user.displayName, email: user.email } }, { headers: { "Cache-Control": "no-store" } });
}
