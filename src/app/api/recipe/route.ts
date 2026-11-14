// POST /api/recipe — 레시피 생성 API (서버에서 실행)
// 화면에서 "분석 통과"라고 보내도 믿지 않고, 서버가 처음부터 다시 검증합니다.
import { generateRecipe } from "@/lib/recipe/generate";
import { cleanProfile } from "@/lib/safety/analyze";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return Response.json({ ok: false, error: "요청 형식이 올바르지 않아요." }, { status: 400 });
  try {
    const result = await generateRecipe(body.ingredients, body.type, cleanProfile(body.profile));
    // 위험 재료 등으로 막힌 경우 422(처리할 수 없는 내용)로 답합니다.
    return Response.json(result, { status: result.ok ? 200 : 422 });
  } catch (e) {
    console.error("[멍스푼] 레시피 생성 중 오류:", e);
    return Response.json({ ok: false, error: "서버에서 문제가 생겼어요. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }
}
