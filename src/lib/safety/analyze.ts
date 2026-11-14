// ─────────────────────────────────────────────────────────────
// 서버 측 재료 검증 + 안전성 판정
//
// 흐름:  입력 글자 → ①금지 재료 검사 → ②가공·첨가물 검사
//        → ③DB에 있는 재료인지 확인 → ④프로필(알레르기)과 비교
//
// ★ 이 함수는 AI를 전혀 사용하지 않습니다. DB에 적힌 대로만 판정합니다.
// ─────────────────────────────────────────────────────────────
import type { AnalysisItem, AnalysisResult, DogProfile } from "../types";
import {
  CATEGORY_LABEL,
  SOURCES,
  findBanned,
  findIngredient,
  findProcessedWord,
  normalize,
  type Ingredient,
} from "./db";

/** 한 번에 분석할 수 있는 재료 수 / 글자 수 제한 (이상한 요청 방지) */
const MAX_ITEMS = 20;
const MAX_LEN = 30;

/**
 * 프로필의 알레르기·금지 재료와 이 재료가 겹치는지 검사
 * 예) 알레르기 '닭' ↔ 닭가슴살(태그: 닭, 닭고기, 가금류)
 */
export function profileConflict(ing: Ingredient, profile?: DogProfile | null): string | undefined {
  if (!profile) return undefined;
  const tags = [ing.name, ...ing.aliases, ...ing.allergenTags].map(normalize);
  const hit = (words: string[]) =>
    words
      .map((w) => w.trim())
      .filter(Boolean)
      .find((w) => {
        const n = normalize(w);
        // 서로 포함 관계면 같은 재료로 봅니다 (닭 ⊂ 닭가슴살, 유제품 = 유제품)
        return tags.some((t) => t.includes(n) || n.includes(t));
      });
  const allergy = hit(profile.allergies ?? []);
  if (allergy) return `프로필에 '${allergy}' 알레르기가 등록되어 있어요.`;
  const forbidden = hit(profile.forbidden ?? []);
  if (forbidden) return `프로필에 '${forbidden}'을(를) 먹으면 안 되는 재료로 등록했어요.`;
  return undefined;
}

/**
 * 화면에서 넘어온 프로필을 안전한 모양으로 정리
 * (브라우저에서 온 값은 무엇이든 들어올 수 있으므로 서버에서 한 번 걸러 줍니다)
 */
export function cleanProfile(raw: unknown): DogProfile | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const text = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
  const list = (v: unknown) =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").map((x) => x.slice(0, 20)).slice(0, 20) : [];
  return {
    name: text(r.name, 20),
    weightKg: text(r.weightKg, 10),
    age: text(r.age, 10),
    allergies: list(r.allergies),
    forbidden: list(r.forbidden),
    healthNotes: text(r.healthNotes, 200),
  };
}

/** 재료 한 건 판정 */
function analyzeOne(input: string, profile?: DogProfile | null): AnalysisItem {
  const text = input.trim();

  // ① 금지 재료: 하나라도 걸리면 무조건 3등급
  const banned = findBanned(text);
  if (banned) {
    return {
      input: text,
      name: banned.name,
      category: 3,
      categoryLabel: CATEGORY_LABEL[3],
      summary: banned.reason,
      cautions: ["이미 먹었다면 먹은 양과 시간을 적어 두고 바로 동물병원에 연락하세요."],
      cooking: "어떤 방법으로 조리해도 사용할 수 없어요.",
      avoidAdditives: [],
      allergyNote: "",
      sources: banned.sources.map((k) => SOURCES[k]),
      verification: "verified",
      usable: false,
    };
  }

  // ② DB에 있는 재료인지 (이름이 정확히 일치해야 함)
  //    정확히 일치하면 '꿀고구마'처럼 이름에 가공 의심 단어가 있어도 원재료로 인정합니다.
  const ing = findIngredient(text);

  // ③ 가공 상태·첨가물 의심: 안전하다고 말할 수 없으므로 보류
  const processed = ing ? undefined : findProcessedWord(text);
  if (processed) {
    return {
      input: text,
      name: text,
      category: 4,
      categoryLabel: CATEGORY_LABEL[4],
      summary: `가공·첨가물 확인이 필요해 분석을 보류했어요. ${processed.why}`,
      cautions: ["제품 뒷면 성분표를 확인하고, 첨가물이 없는 원재료로 바꿔 주세요."],
      cooking: "레시피에서는 제외돼요.",
      avoidAdditives: [],
      allergyNote: "",
      sources: [],
      verification: "none",
      usable: false,
    };
  }

  // ④ DB에 없는 재료: 미확인 → 보류
  if (!ing) {
    return {
      input: text,
      name: text,
      category: 4,
      categoryLabel: CATEGORY_LABEL[4],
      summary: "멍스푼 안전성 데이터베이스에 아직 없는 재료예요. 근거 없이 안전하다고 판정하지 않아요.",
      cautions: ["급여 전 수의사에게 확인해 주세요."],
      cooking: "레시피에서는 제외돼요.",
      avoidAdditives: [],
      allergyNote: "",
      sources: [],
      verification: "none",
      usable: false,
    };
  }

  // ⑤ 프로필과 겹치면 '이 아이에게는 사용 금지'
  const conflict = profileConflict(ing, profile);
  return {
    input: text,
    name: ing.name,
    category: conflict ? 3 : ing.category,
    categoryLabel: conflict ? "이 아이에게는 사용 금지 (프로필)" : CATEGORY_LABEL[ing.category],
    summary: conflict ?? ing.summary,
    cautions: ing.cautions,
    cooking: ing.cooking,
    avoidAdditives: ing.avoidAdditives,
    allergyNote: ing.allergyNote,
    sources: ing.sources.map((k) => SOURCES[k]),
    verification: ing.verification,
    verificationNote: ing.verificationNote,
    profileConflict: conflict,
    usable: !conflict,
  };
}

/** 여러 재료를 한꺼번에 분석하고, 레시피를 만들어도 되는지 결정 */
export function analyzeIngredients(rawInputs: unknown, profile?: DogProfile | null): AnalysisResult {
  const empty = { items: [], canGenerate: false, usableNames: [], heldNames: [] };

  // 입력값 검증 (배열·문자열인지, 개수·길이가 적당한지)
  if (!Array.isArray(rawInputs)) return { ok: false, error: "재료 목록이 올바르지 않아요.", ...empty };
  const inputs = rawInputs.filter((x): x is string => typeof x === "string").map((s) => s.trim()).filter(Boolean);
  if (inputs.length === 0) return { ok: false, error: "재료를 하나 이상 선택해 주세요.", ...empty };
  if (inputs.length > MAX_ITEMS) return { ok: false, error: `재료는 한 번에 ${MAX_ITEMS}개까지 분석할 수 있어요.`, ...empty };
  if (inputs.some((s) => s.length > MAX_LEN)) return { ok: false, error: `재료 이름은 ${MAX_LEN}자 이내로 적어 주세요.`, ...empty };

  // 같은 재료 중복 제거 후 하나씩 판정
  const unique = [...new Map(inputs.map((s) => [normalize(s), s])).values()];
  const items = unique.map((s) => analyzeOne(s, profile));

  const blockers = items.filter((i) => i.category === 3); // 금지 재료 + 프로필 금지
  const usable = items.filter((i) => i.usable);
  const held = items.filter((i) => i.category === 4);

  let canGenerate = true;
  let blockReason: string | undefined;
  if (blockers.length > 0) {
    // ★ 위험 재료가 하나라도 있으면 레시피 생성 중단
    canGenerate = false;
    blockReason = `사용할 수 없는 재료(${blockers.map((b) => b.input).join(", ")})가 포함되어 있어 레시피를 만들지 않아요. 해당 재료를 빼고 다시 분석해 주세요.`;
  } else if (usable.length === 0) {
    canGenerate = false;
    blockReason = "안전성이 확인된 재료가 없어 레시피를 만들 수 없어요.";
  }

  return {
    ok: true,
    items,
    canGenerate,
    blockReason,
    // 같은 재료를 다른 이름으로 두 번 넣은 경우(계란+달걀)를 대비해 이름 기준으로 한 번 더 중복 제거
    usableNames: [...new Set(usable.map((i) => i.name))],
    heldNames: held.map((i) => i.input),
  };
}
