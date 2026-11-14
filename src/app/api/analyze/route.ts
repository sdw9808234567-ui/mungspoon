// POST /api/analyze — 재료 안전성 분석 API (서버에서 실행)
import { analyzeIngredients, cleanProfile } from "@/lib/safety/analyze";

export async function POST(req: Request) {
  // 요청 본문을 읽습니다. 형식이 깨져 있으면 400(잘못된 요청)으로 답합니다.
  const body = await req.json().catch(() => null);
  if (!body) return Response.json({ ok: false, error: "요청 형식이 올바르지 않아요." }, { status: 400 });
  const result = analyzeIngredients(body.ingredients, cleanProfile(body.profile));
  return Response.json(result, { status: result.ok ? 200 : 400 });
}
