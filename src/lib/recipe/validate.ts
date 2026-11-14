// ─────────────────────────────────────────────────────────────
// 결과 검증 — 레시피(데모든 AI든)를 사용자에게 보여 주기 "직전"에
// 한 번 더 안전성 DB로 검사합니다.
//
// AI가 엉뚱한 재료(예: 꿀, 버터, 건포도)를 몰래 넣어도 여기서 걸러집니다.
// ─────────────────────────────────────────────────────────────
import type { DogProfile } from "../types";
import { profileConflict } from "../safety/analyze";
import { findBanned, findIngredient } from "../safety/db";
import type { RecipeDraft } from "./demo";

/** DB 재료가 아니어도 허용하는 것: 물뿐입니다 */
const ALWAYS_OK = new Set(["물"]);

/**
 * @returns 문제 목록 (빈 배열이면 통과)
 */
export function validateDraft(draft: RecipeDraft, usableNames: string[], profile?: DogProfile | null): string[] {
  const problems: string[] = [];
  const usable = new Set(usableNames);

  // 1) 기본 모양 검사
  if (!draft || typeof draft.name !== "string" || !draft.name.trim()) problems.push("간식 이름이 없어요.");
  if (!Array.isArray(draft?.ingredients) || draft.ingredients.length === 0) problems.push("재료 목록이 비어 있어요.");
  if (!Array.isArray(draft?.steps) || draft.steps.length < 2) problems.push("만드는 방법이 너무 짧아요.");
  if (problems.length) return problems;

  // 2) 재료 하나하나 검사
  let usedOwned = 0;
  for (const item of draft.ingredients) {
    const name = String(item?.name ?? "").trim();
    const grams = Number(item?.grams);
    if (!Number.isFinite(grams) || grams <= 0 || grams > 1000) problems.push(`'${name}'의 계량(g)이 올바르지 않아요.`);
    if (ALWAYS_OK.has(name)) continue;
    if (findBanned(name)) { problems.push(`금지 재료 '${name}'이(가) 들어 있어요.`); continue; }
    const ing = findIngredient(name);
    if (!ing) { problems.push(`안전성 DB에 없는 재료 '${name}'이(가) 들어 있어요.`); continue; }
    if (ing.name !== name) problems.push(`재료 이름 '${name}'은(는) DB의 대표 이름('${ing.name}')으로 적어야 해요.`);
    if (profileConflict(ing, profile)) problems.push(`프로필상 먹으면 안 되는 '${name}'이(가) 들어 있어요.`);
    if (usable.has(ing.name)) usedOwned++;
  }
  if (usedOwned === 0) problems.push("사용자가 가진 재료가 하나도 쓰이지 않았어요.");

  // 3) 이름·만드는 방법 글자 전체에서 금지 재료/첨가물 단어 검색
  const allText = [draft.name, ...draft.steps, draft.doneness, draft.storage, draft.shelfLife].join(" ");
  // 문장을 단어로 쪼개 검사합니다 (조사 '을/를' 등이 붙어도 포함 검사라 잡힙니다)
  for (const word of allText.split(/[\s,.()·~/]+/).filter(Boolean)) {
    const banned = findBanned(word);
    // '파'처럼 정확 일치만 보는 항목은 문장 속에서 오탐이 없도록 포함 검사 항목만 봅니다
    if (banned && banned.contains.some((w) => word.includes(w))) problems.push(`만드는 방법에 금지 재료(${banned.name})가 언급돼요.`);
  }
  for (const bad of ["설탕", "소금", "버터", "꿀", "시럽", "베이킹파우더", "베이킹소다", "식용유", "올리브유", "우유", "치즈", "밀가루"]) {
    if (allText.includes(bad)) problems.push(`DB에서 확인되지 않은 '${bad}'이(가) 만드는 방법에 언급돼요.`);
  }

  // 4) 온도·시간 범위
  if (draft.tempC !== null && (!Number.isFinite(Number(draft.tempC)) || draft.tempC < 100 || draft.tempC > 200)) {
    problems.push("조리 온도가 일반적인 범위(100~200℃)를 벗어났어요.");
  }
  if (typeof draft.timeMin !== "string" || !/\d/.test(draft.timeMin)) problems.push("조리 시간이 없어요.");

  return [...new Set(problems)];
}
