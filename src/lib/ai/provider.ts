// ─────────────────────────────────────────────────────────────
// AI 연결부 (서버 전용)
//
// ★ 구조를 분리해 둔 이유: 나중에 AI 회사를 바꾸고 싶으면
//   이 파일에 '새 provider 함수' 하나만 추가하면 됩니다.
//   안전성 검사·결과 검증 코드는 건드릴 필요가 없습니다.
//
// ★ API 키는 process.env(서버 환경변수)에서만 읽습니다.
//   이 파일은 서버에서만 실행되므로 브라우저로 키가 나가지 않습니다.
// ─────────────────────────────────────────────────────────────
import "server-only";
import type { DogProfile, TreatType } from "../types";
import { findIngredient } from "../safety/db";
import { SPEC_LABEL, type RecipeDraft } from "../recipe/demo";

/** AI에게 넘겨 줄 정보 */
export type AiRequest = {
  usableNames: string[]; // 안전성 분석을 통과한 재료만!
  type: TreatType;
  profile?: DogProfile | null;
};

/** 모든 AI provider가 지켜야 하는 모양: 요청을 받아 '초안'을 돌려준다 */
export type AiProvider = (req: AiRequest) => Promise<RecipeDraft>;

/** 현재 설정된 AI 방식 이름 ('demo'면 AI를 쓰지 않음) */
export function providerName(): string {
  return (process.env.AI_PROVIDER ?? "demo").toLowerCase();
}

/** AI에게 보낼 지시문 만들기 — DB의 조리 조건을 그대로 넣어 줍니다 */
function buildPrompt(req: AiRequest): string {
  const rules = req.usableNames
    .map((n) => findIngredient(n))
    .filter((i) => !!i)
    .map((i) => `- ${i!.name}: ${i!.cooking}. 주의: ${i!.cautions.join(" ")}`)
    .join("\n");
  const p = req.profile;
  return [
    `강아지 수제간식 '${SPEC_LABEL[req.type]}' 레시피 1개를 만들어라.`,
    `사용 가능한 재료(이 목록과 '물' 외에는 절대 쓰지 마라. 부족하면 '쌀가루', '계란'만 추가 가능):`,
    rules,
    `금지: 설탕, 소금, 버터, 기름, 꿀, 우유, 밀가루, 베이킹파우더 및 목록에 없는 모든 재료.`,
    p ? `강아지 참고 정보 — 알레르기: ${p.allergies.join(", ") || "없음"} / 금지 재료: ${p.forbidden.join(", ") || "없음"} / 건강 메모: ${p.healthNotes || "없음"}` : "",
    `급여량은 단정하지 마라. 재료 이름은 위 목록의 이름을 그대로 써라.`,
    `아래 JSON 형식으로만 답하라(설명 금지):`,
    `{"name":"간식 이름","ingredients":[{"name":"재료","grams":숫자}],"steps":["1단계","2단계"],"method":"오븐|찜기 등","tempC":숫자 또는 null,"timeMin":"15~20","doneness":"익힘 확인 방법","storage":"보관 방법","shelfLife":"보관 기간"}`,
  ].filter(Boolean).join("\n");
}

/** Anthropic(Claude) API 연결 */
const anthropic: AiProvider = async (req) => {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY 환경변수가 없어요.");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: process.env.AI_MODEL ?? "claude-haiku-5-5",
      max_tokens: 1500,
      messages: [{ role: "user", content: buildPrompt(req) }],
    }),
    signal: AbortSignal.timeout(25_000), // 25초 안에 답이 없으면 실패 처리
  });
  if (!res.ok) throw new Error(`AI 응답 오류 (HTTP ${res.status})`);
  const data = await res.json();
  const text: string = data?.content?.[0]?.text ?? "";
  // 답변에서 { ... } 부분만 꺼내 JSON으로 읽습니다
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("AI 답변에서 레시피를 찾지 못했어요.");
  return JSON.parse(match[0]) as RecipeDraft;
};

/** 등록된 provider 목록 — 새 AI를 붙일 때 여기에 한 줄 추가 */
const PROVIDERS: Record<string, AiProvider> = { anthropic };

/** 설정된 provider 가져오기 (demo거나 모르는 이름이면 null) */
export function getProvider(): AiProvider | null {
  return PROVIDERS[providerName()] ?? null;
}
