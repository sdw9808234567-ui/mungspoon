// ─────────────────────────────────────────────────────────────
// 레시피 생성 총괄 (서버 전용)
//
//  사용자 입력 → ①서버 측 재료 검증 → ②안전성 판정 → ③레시피 생성
//             → ④결과 검증 → ⑤열량·주의사항 붙이기 → 사용자에게 표시
// ─────────────────────────────────────────────────────────────
import "server-only";
import { randomUUID } from "crypto";
import { getProvider, providerName } from "../ai/provider";
import { analyzeIngredients } from "../safety/analyze";
import { KCAL_NOTE, findIngredient } from "../safety/db";
import { TREAT_TYPES, type AnalysisResult, type DogProfile, type Recipe, type TreatType } from "../types";
import { RecipeError, SPEC_LABEL, buildDemoRecipe, type RecipeDraft } from "./demo";
import { validateDraft } from "./validate";

export type GenerateResult =
  | { ok: true; recipe: Recipe; analysis: AnalysisResult }
  | { ok: false; error: string; analysis?: AnalysisResult };

/** 열량 계산: 재료별 (g ÷ 100 × 100g당 kcal)을 모두 더합니다 */
function calcCalories(draft: RecipeDraft): Recipe["calories"] {
  const rows = draft.ingredients
    .filter((i) => i.name !== "물") // 물은 0kcal
    .map((i) => {
      const per = findIngredient(i.name)?.kcalPer100g ?? 0;
      return { name: i.name, grams: i.grams, kcalPer100g: per, kcal: Math.round((i.grams / 100) * per) };
    });
  return {
    totalKcal: rows.reduce((s, r) => s + r.kcal, 0),
    totalGrams: draft.ingredients.reduce((s, r) => s + r.grams, 0),
    rows,
    note: KCAL_NOTE + " 완성된 간식 '전체'의 열량이며, 굽거나 찌면서 수분이 날아가 완성 무게는 재료 합계보다 가벼워져요.",
  };
}

export async function generateRecipe(rawIngredients: unknown, rawType: unknown, profile?: DogProfile | null): Promise<GenerateResult> {
  // ①② 서버에서 다시 한번 재료 검증·판정 (화면에서 보낸 분석 결과는 믿지 않습니다)
  const analysis = analyzeIngredients(rawIngredients, profile);
  if (!analysis.ok) return { ok: false, error: analysis.error ?? "재료를 확인해 주세요.", analysis };
  if (!analysis.canGenerate) return { ok: false, error: analysis.blockReason ?? "레시피를 만들 수 없어요.", analysis };

  const type = TREAT_TYPES.find((t) => t.id === rawType)?.id as TreatType | undefined;
  if (!type) return { ok: false, error: "간식 종류를 선택해 주세요.", analysis };

  const usable = analysis.usableNames;
  const notices: string[] = [];
  let source: Recipe["source"] = "demo";
  let draft: RecipeDraft | null = null;

  // ③ 레시피 생성: AI가 설정되어 있으면 AI → 실패하거나 검증에 걸리면 데모 생성기로 대체
  const ai = getProvider();
  if (ai) {
    try {
      const aiDraft = await ai({ usableNames: usable, type, profile });
      const problems = validateDraft(aiDraft, usable, profile); // ④ 결과 검증
      if (problems.length === 0) {
        draft = aiDraft;
        source = "ai";
      } else {
        console.warn("[멍스푼] AI 레시피가 검증에서 탈락:", problems);
        notices.push("AI가 만든 레시피가 안전성 검증을 통과하지 못해, 멍스푼 기본 레시피로 대신 보여 드려요.");
        source = "demo-fallback";
      }
    } catch (e) {
      console.warn("[멍스푼] AI 호출 실패:", e);
      notices.push("AI 연결에 실패해 멍스푼 기본 레시피로 대신 보여 드려요. 잠시 후 다시 시도하면 AI 레시피를 받을 수 있어요.");
      source = "demo-fallback";
    }
  } else if (providerName() !== "demo") {
    notices.push(`AI 설정(${providerName()})을 찾지 못해 멍스푼 기본 레시피로 보여 드려요.`);
    source = "demo-fallback";
  }

  if (!draft) {
    try {
      draft = buildDemoRecipe(usable, type, profile);
    } catch (e) {
      if (e instanceof RecipeError) return { ok: false, error: e.message, analysis };
      throw e;
    }
    // ④ 데모 레시피도 똑같이 결과 검증을 거칩니다
    const problems = validateDraft(draft, usable, profile);
    if (problems.length) {
      console.error("[멍스푼] 데모 레시피 검증 실패:", problems);
      return { ok: false, error: "레시피를 안전하게 만들지 못했어요. 재료를 바꿔 다시 시도해 주세요.", analysis };
    }
  }

  // ⑤ 안내문·주의사항·열량 붙이기 (모두 DB 기준 — AI가 쓴 글이 아닙니다)
  if (analysis.heldNames.length) {
    notices.push(`분석 보류로 레시피에서 제외한 재료: ${analysis.heldNames.join(", ")}`);
  }
  const unused = usable.filter((n) => !draft!.ingredients.some((i) => i.name === n));
  if (unused.length) notices.push(`이번 레시피에 쓰이지 않은 재료: ${unused.join(", ")}`);
  notices.push("조리 온도와 시간은 기기(오븐·에어프라이어·찜기)와 재료 상태에 따라 달라져요. 익힘 확인 방법으로 꼭 확인해 주세요.");

  const feeding = new Set<string>([
    "간식은 주식이 아니에요. 처음에는 아주 작은 한 조각만 주고 하루 정도 구토·설사·가려움이 없는지 살펴보세요.",
    "알맞은 급여량은 체중만으로 정할 수 없어요. 나이·활동량·건강 상태에 따라 다르니 수의사와 상의해 주세요.",
    "목에 걸리지 않게 아이 입 크기에 맞춰 잘라 주세요.",
  ]);
  for (const item of draft.ingredients) {
    const ing = findIngredient(item.name);
    if (ing?.category === 2) feeding.add(`${ing.name}: ${ing.cautions[0]}`);
  }
  if (profile?.healthNotes?.trim()) {
    feeding.add(`프로필에 건강 메모(“${profile.healthNotes.trim().slice(0, 60)}”)가 있어요. 이 레시피가 괜찮은지 급여 전에 수의사에게 확인해 주세요.`);
  }

  const recipe: Recipe = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    name: draft.name.trim(),
    type,
    typeLabel: SPEC_LABEL[type],
    ingredients: draft.ingredients.map((i) => ({ name: i.name, grams: Math.round(i.grams), owned: i.name === "물" || usable.includes(i.name) })),
    steps: draft.steps,
    method: draft.method,
    tempC: draft.tempC,
    tempNote: draft.tempC === null ? "찜 조리 (김이 오른 뒤부터 시간을 재요)" : `${draft.tempC}℃ (예열 후)`,
    timeMin: draft.timeMin,
    doneness: draft.doneness,
    storage: draft.storage,
    shelfLife: draft.shelfLife,
    feedingCautions: [...feeding],
    calories: calcCalories(draft),
    notices,
    source,
  };
  return { ok: true, recipe, analysis };
}
