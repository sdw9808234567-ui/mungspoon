// ─────────────────────────────────────────────────────────────
// 데모(규칙 기반) 레시피 생성기 — AI 없이도 동작합니다.
//
// ★ 솔직한 안내: 여기의 배합은 "일반적인 무첨가 간식의 기본 비율"을
//   규칙으로 만든 것이며, 모든 조합을 실제로 구워 본 레시피는 아닙니다.
//   반죽 농도는 재료의 수분에 따라 달라지므로 화면에 조절 안내를 함께 보여 줍니다.
// ─────────────────────────────────────────────────────────────
import type { DogProfile, TreatType } from "../types";
import { profileConflict } from "../safety/analyze";
import { INGREDIENTS, findIngredient, type Ingredient } from "../safety/db";

/** 생성기가 만들어 내는 '초안' (열량·주의사항은 나중에 서버가 붙입니다) */
export type RecipeDraft = {
  name: string;
  ingredients: { name: string; grams: number }[];
  steps: string[];
  method: string;
  tempC: number | null;
  timeMin: string;
  doneness: string;
  storage: string;
  shelfLife: string;
};

/** 간식 종류별 기본 배합표 (단위: g) */
type Spec = {
  label: string;
  base: number; // 으깬 재료(단호박·고구마 등) 총량
  flour: number; // 쌀가루 (0이면 사용 안 함)
  egg: number; // 계란 (0이면 선택 사항)
  eggRequired: boolean;
  water: number; // 물
  method: string;
  tempC: number | null;
  timeMin: string;
  shape: string; // 모양 잡는 방법
  cook: string; // 익히는 방법
  doneness: string;
};

const SPECS: Record<TreatType, Spec> = {
  cookie: {
    label: "쿠키", base: 100, flour: 80, egg: 0, eggRequired: false, water: 0,
    method: "오븐 또는 에어프라이어", tempC: 170, timeMin: "15~20",
    shape: "반죽을 0.5cm 두께로 밀어 쿠키 틀로 찍거나, 한입 크기로 동글납작하게 빚어 종이호일 위에 간격을 두고 올린다.",
    cook: "170℃로 예열한 오븐에서 15~20분 굽는다. 10분쯤 지나면 한 번 뒤집어 준다.",
    doneness: "가장 두꺼운 쿠키를 반으로 쪼갰을 때 속에 젖은 반죽이 없고, 겉이 단단하게 말라 있으면 다 익은 거예요.",
  },
  bread: {
    label: "강아지 빵", base: 120, flour: 100, egg: 50, eggRequired: true, water: 0,
    method: "찜기", tempC: null, timeMin: "20~25",
    shape: "실리콘 틀이나 종이컵에 반죽을 70%만 채우고 바닥에 두어 번 탁탁 쳐서 공기를 뺀다.",
    cook: "김이 오른 찜기에 넣고 뚜껑에 면포를 감싸 물방울이 떨어지지 않게 한 뒤, 중불에서 20~25분 찐다.",
    doneness: "가운데를 꼬치로 깊이 찔렀다 뺐을 때 반죽이 묻어나오지 않으면 다 익은 거예요.",
  },
  muffin: {
    label: "머핀", base: 100, flour: 70, egg: 50, eggRequired: true, water: 0,
    method: "오븐 또는 에어프라이어", tempC: 170, timeMin: "20~25",
    shape: "머핀 틀에 종이컵을 깔고 반죽을 70%만 채운다.",
    cook: "170℃로 예열한 오븐에서 20~25분 굽는다.",
    doneness: "가운데를 꼬치로 깊이 찔렀다 뺐을 때 반죽이 묻어나오지 않으면 다 익은 거예요.",
  },
  cake: {
    label: "케이크", base: 150, flour: 60, egg: 100, eggRequired: true, water: 0,
    method: "오븐", tempC: 170, timeMin: "25~30",
    shape: "지름 10~12cm 원형 틀에 종이호일을 깔고 반죽을 부은 뒤 바닥에 두어 번 쳐서 공기를 뺀다.",
    cook: "170℃로 예열한 오븐에서 25~30분 굽는다. 윗면이 빨리 색이 나면 호일을 덮는다.",
    doneness: "가운데를 꼬치로 바닥까지 찔렀다 뺐을 때 반죽이 묻어나오지 않으면 다 익은 거예요.",
  },
  pudding: {
    label: "푸딩", base: 80, flour: 0, egg: 100, eggRequired: true, water: 100,
    method: "찜기", tempC: null, timeMin: "12~15",
    shape: "섞은 재료를 체에 한 번 걸러 내열 컵에 나누어 담고, 윗면 거품을 걷어 낸 뒤 호일로 덮는다.",
    cook: "김이 오른 찜기에 넣고 약불에서 12~15분 찐다. 센 불은 구멍이 생기니 피한다.",
    doneness: "컵을 살짝 흔들었을 때 가운데가 출렁이지 않고 탱글하게 굳어 있고, 꼬치로 찔렀을 때 맑은 물만 나오면 다 익은 거예요.",
  },
  donut: {
    label: "도넛", base: 150, flour: 90, egg: 50, eggRequired: true, water: 0,
    method: "오븐 (기름에 튀기지 않아요)", tempC: 170, timeMin: "15~18",
    shape: "실리콘 도넛 틀에 반죽을 80%만 채운다. 틀이 없으면 가래떡처럼 밀어 고리 모양으로 이어 붙인다.",
    cook: "170℃로 예열한 오븐에서 15~18분 굽는다.",
    doneness: "가장 두꺼운 부분을 꼬치로 찔렀다 뺐을 때 반죽이 묻어나오지 않으면 다 익은 거예요.",
  },
  bite: {
    label: "한입 간식", base: 100, flour: 40, egg: 0, eggRequired: false, water: 0,
    method: "오븐 또는 에어프라이어", tempC: 160, timeMin: "18~22",
    shape: "반죽을 1.5cm 크기로 작게 떼어 동글게 빚은 뒤 종이호일 위에 간격을 두고 올린다.",
    cook: "160℃로 예열한 오븐에서 18~22분 굽는다. 중간에 한 번 굴려 준다.",
    doneness: "하나를 반으로 갈랐을 때 속까지 색이 고르고 젖은 반죽이 없으면 다 익은 거예요.",
  },
  soft: {
    label: "말랑한 간식", base: 150, flour: 30, egg: 0, eggRequired: false, water: 0,
    method: "찜기", tempC: null, timeMin: "10~12",
    shape: "반죽을 2cm 크기로 떼어 동글납작하게 빚고, 찜기에 면포를 깐 뒤 서로 붙지 않게 올린다.",
    cook: "김이 오른 찜기에서 중불로 10~12분 찐다.",
    doneness: "하나를 반으로 갈랐을 때 가루 뭉침이 없고 속까지 말랑하게 익어 있으면 다 익은 거예요.",
  },
};

/** 받침에 맞춰 '을/를'을 붙이기: 요거트 → 요거트를, 당근 → 당근을 */
function eulReul(word: string): string {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  if (code < 0 || code > 11171) return `${word}을(를)`; // 한글이 아니면 둘 다 표기
  return word + (code % 28 === 0 ? "를" : "을");
}

/** 5g 단위로 반올림 (계량하기 쉽게) */
const round5 = (n: number) => Math.max(5, Math.round(n / 5) * 5);

/** DB에서 id로 재료 꺼내기 */
const byId = (id: string) => INGREDIENTS.find((i) => i.id === id)!;

export class RecipeError extends Error {}

/**
 * 데모 레시피 만들기
 * @param usableNames 안전성 분석을 통과한 재료 이름들
 * @param type 간식 종류
 * @param profile 강아지 프로필 (추가 재료가 알레르기와 겹치지 않게 확인)
 */
export function buildDemoRecipe(usableNames: string[], type: TreatType, profile?: DogProfile | null): RecipeDraft {
  const spec = SPECS[type];
  const owned = usableNames.map((n) => findIngredient(n)).filter((i): i is Ingredient => !!i);
  const has = (id: string) => owned.some((i) => i.id === id);
  const ofRole = (role: Ingredient["role"]) => owned.filter((i) => i.role === role);

  // 추가 재료(보유하지 않은 계란·쌀가루)를 넣어도 되는지: 프로필과 겹치면 안 됨
  const canAdd = (id: string) => !profileConflict(byId(id), profile);

  const list: { name: string; grams: number }[] = [];
  const prep: string[] = [];
  const add = (ing: Ingredient, grams: number) => {
    list.push({ name: ing.name, grams: round5(grams) });
    prep.push(ing.prep);
  };

  // ── 1) 으깬 재료(베이스) 정하기 ──────────────────────────
  // 우선순위: 베이스 역할 재료 → (없으면) 과일·채소 → (없으면) 닭가슴살 → 요거트
  let bases = ofRole("base");
  let mixins = ofRole("mixin");
  let proteins = ofRole("protein");
  let dairies = ofRole("dairy");
  // ※ '조건과 양에 주의' 재료(브로콜리 등)는 양이 많아지면 안 되므로 몸통으로 올리지 않습니다
  const safeMixins = mixins.filter((m) => m.category === 1);
  if (bases.length === 0 && safeMixins.length > 0) { bases = safeMixins; mixins = mixins.filter((m) => m.category !== 1); }
  if (bases.length === 0 && proteins.length > 0) { bases = proteins; proteins = []; }
  if (bases.length === 0 && dairies.length > 0 && type !== "pudding") { bases = dairies; dairies = []; }
  if (bases.length === 0 && type !== "pudding") {
    throw new RecipeError(
      "반죽의 몸통이 될 재료가 없어요. 단호박·고구마·바나나·두부 같은 으깰 수 있는 재료를 하나 더 선택해 주세요.",
    );
  }
  bases.forEach((b) => add(b, spec.base / bases.length));

  // ── 2) 닭가슴살·과일·채소·요거트 (베이스로 쓰이지 않은 것) ──
  proteins.forEach((p) => add(p, 60));
  mixins.forEach((m) => add(m, m.category === 2 ? 15 : 25)); // 주의 재료(브로콜리)는 더 적게
  dairies.forEach((d) => add(d, 30));

  // ── 3) 계란 ──────────────────────────────────────────────
  let eggGrams = 0;
  if (spec.eggRequired || has("egg")) {
    if (!has("egg") && !canAdd("egg")) {
      throw new RecipeError(`${spec.label}에는 계란이 꼭 필요한데, 프로필에 계란을 먹으면 안 된다고 되어 있어요. 쿠키·한입 간식·말랑한 간식을 선택해 주세요.`);
    }
    eggGrams = spec.egg || 50; // 선택 사항인 종류에서 계란을 갖고 있으면 1개(약 50g) 사용
    add(byId("egg"), eggGrams);
  }

  // ── 4) 쌀가루 ────────────────────────────────────────────
  if (spec.flour > 0) {
    if (!has("riceflour") && !canAdd("riceflour")) {
      throw new RecipeError(`${spec.label}에는 쌀가루가 필요한데, 프로필에 쌀을 먹으면 안 된다고 되어 있어요. 푸딩을 선택해 주세요.`);
    }
    // 계란이 추가로 들어가면 반죽이 질어지므로 쌀가루를 20g 늘립니다
    const extra = !spec.eggRequired && eggGrams > 0 ? 20 : 0;
    add(byId("riceflour"), spec.flour + extra);
  }

  // ── 5) 물 ────────────────────────────────────────────────
  if (spec.water > 0) list.push({ name: "물", grams: spec.water });

  // ── 6) 만드는 방법 문장 조립 ─────────────────────────────
  const names = list.filter((l) => l.name !== "물" && l.name !== "쌀가루" && l.name !== "계란").map((l) => l.name);
  const steps: string[] = [
    ...new Set(prep), // 재료 손질 (중복 문장 제거)
    spec.flour > 0
      ? `볼에 ${eulReul([...names, ...(eggGrams ? ["풀어 둔 계란"] : [])].join(", "))} 넣고 고루 섞은 뒤, 쌀가루를 2~3번에 나누어 넣으며 날가루가 보이지 않을 때까지 섞는다.`
      : `볼에 풀어 둔 계란과 물을 넣고 거품이 나지 않게 저은 뒤, ${eulReul(names.join(", ") || "준비한 재료")} 넣어 고루 섞는다.`,
    ...(spec.flour > 0
      ? ["반죽이 손에 심하게 달라붙으면 쌀가루를 5g씩, 갈라지고 뻑뻑하면 물을 5g씩 더해 농도를 맞춘다. (재료의 수분에 따라 달라져요)"]
      : []),
    spec.shape,
    spec.cook,
    "식힘망에서 완전히 식힌 뒤 급여한다. 뜨거운 간식은 입안을 델 수 있다.",
  ];

  // ── 7) 이름 짓기: 가장 양이 많은 재료 1~2개 + 종류 ────────
  const main = [...list]
    .filter((l) => !["물", "쌀가루", "계란"].includes(l.name))
    .sort((a, b) => b.grams - a.grams)
    .slice(0, 2)
    .map((l) => l.name.replace("무가당 플레인 ", ""));
  const name = `${main.join(" ") || "계란"} ${spec.label}`;

  return {
    name,
    ingredients: list,
    steps,
    method: spec.method,
    tempC: spec.tempC,
    timeMin: spec.timeMin,
    doneness: proteins.length || bases.some((b) => b.id === "chicken")
      ? `${spec.doneness} 닭가슴살은 반죽에 넣기 전에 이미 속까지 익어 분홍빛이 없어야 해요.`
      : spec.doneness,
    storage: "완전히 식힌 뒤 밀폐용기에 담아 냉장 보관해요. 오래 두려면 한 번 먹을 양씩 나누어 냉동해요.",
    shelfLife: "냉장 2~3일, 냉동 2주 이내 (방부제가 없는 가정용 수제간식의 일반적인 기준이에요)",
  };
}

export const SPEC_LABEL = Object.fromEntries(Object.entries(SPECS).map(([k, v]) => [k, v.label])) as Record<TreatType, string>;
