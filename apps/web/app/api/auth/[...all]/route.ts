// Clerk auth is handled entirely by middleware.ts — no catch-all route needed
// for the mobile API use case (JWT Bearer tokens).
export async function GET() {
  return Response.json({ ok: true })
}
