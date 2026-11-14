// ─────────────────────────────────────────────────────────────
// 멍스푼 재료 안전성 데이터베이스 (서버 전용으로 사용)
//
// ★ 이 파일이 멍스푼 안전 판정의 "기준"입니다.
//   AI는 이 파일의 판정을 바꿀 수 없고, 여기에 없는 재료는
//   자동으로 "정보 부족으로 분석 보류"가 됩니다.
//
// ★ 판정 근거는 아래 SOURCES(출처)에 연결되어 있습니다.
//   - verified : 출처 본문을 직접 열어 해당 내용을 확인함
//   - partial  : 비슷한 재료(예: 호박→단호박, 쌀→쌀가루) 기준이거나
//                출처의 요약만 확인함 → 화면에 "부분 확인"으로 표시
//
// 확인일: 2026-11-14
// ─────────────────────────────────────────────────────────────

/** 안전성 분류 (기획서의 4단계) */
export type Category =
  | 1 // 일반적인 조건에서 사용 가능
  | 2 // 조건과 양에 주의
  | 3 // 사용 금지
  | 4; // 정보 부족으로 분석 보류

export const CATEGORY_LABEL: Record<Category, string> = {
  1: "일반적인 조건에서 사용 가능",
  2: "조건과 양에 주의",
  3: "사용 금지",
  4: "정보 부족으로 분석 보류",
};

/** 출처 한 건 */
export type Source = { name: string; url: string };

/** 출처 목록 — 재료 데이터에서 key로 참조합니다 */
export const SOURCES = {
  ASPCA: {
    name: "ASPCA 동물독극물관리센터 — 반려동물에게 주면 안 되는 사람 음식",
    url: "https://www.aspca.org/pet-care/aspca-poison-control/people-foods-avoid-feeding-your-pets",
  },
  AKC_FV: {
    name: "AKC(미국켄넬클럽) — 강아지가 먹어도 되는/안 되는 과일·채소",
    url: "https://www.akc.org/expert-advice/nutrition/fruits-vegetables-dogs-can-and-cant-eat/",
  },
  AKC_HF: {
    name: "AKC(미국켄넬클럽) — 강아지가 먹어도 되는/안 되는 사람 음식",
    url: "https://www.akc.org/expert-advice/nutrition/human-foods-dogs-can-and-cant-eat/",
  },
  AKC_SWEETPOTATO: {
    name: "AKC — 강아지와 고구마",
    url: "https://www.akc.org/expert-advice/nutrition/can-dogs-eat-sweet-potatoes/",
  },
  PETMD_SWEETPOTATO: {
    name: "PetMD — 강아지와 고구마 (수의사 검수)",
    url: "https://www.petmd.com/dog/nutrition/can-dogs-eat-sweet-potatoes",
  },
  AKC_TOFU: {
    name: "AKC — 강아지와 두부",
    url: "https://www.akc.org/expert-advice/nutrition/can-dogs-eat-tofu/",
  },
  AKC_RICE: {
    name: "AKC — 강아지와 쌀",
    url: "https://www.akc.org/expert-advice/nutrition/can-dogs-eat-rice/",
  },
  AKC_CHICKEN: {
    name: "AKC — 강아지와 닭고기",
    url: "https://www.akc.org/expert-advice/nutrition/can-dogs-eat-chicken/",
  },
} satisfies Record<string, Source>;

export type SourceKey = keyof typeof SOURCES;

/** 레시피에서 재료가 맡는 역할 (데모 레시피 생성기가 사용) */
export type Role = "base" | "flour" | "egg" | "protein" | "mixin" | "dairy";

/** 사용 가능한(1·2등급) 재료 한 건 */
export type Ingredient = {
  id: string;
  name: string; // 화면에 보이는 대표 이름
  aliases: string[]; // 같은 재료로 인정하는 다른 이름
  category: 1 | 2;
  summary: string; // 한 줄 판정 요약
  cautions: string[]; // 사용 시 주의사항
  cooking: string; // 적절한 조리 방법
  avoidAdditives: string[]; // 피해야 하는 첨가물·가공 형태
  allergyNote: string; // 알레르기 주의사항
  allergenTags: string[]; // 프로필의 알레르기 글자와 비교할 단어
  sources: SourceKey[];
  verification: "verified" | "partial";
  verificationNote?: string; // partial인 이유
  role: Role;
  prep: string; // 레시피 '재료 손질' 문장
  kcalPer100g: number; // 열량 계산용 (아래 KCAL_NOTE 참고)
};

/**
 * 열량 값 안내
 * - 생(조리 전) 재료 100g 기준의 일반적인 식품성분표 근사값입니다.
 * - 품종·제품·조리법에 따라 실제 값은 달라집니다.
 * - 정식 서비스 전에는 농촌진흥청 국가표준식품성분표로 다시 맞추는 것을 권장합니다.
 */
export const KCAL_NOTE =
  "생(조리 전) 재료 100g 기준의 일반적인 식품성분표 근사값으로 계산했어요. 품종·제품·조리법에 따라 실제 열량은 달라질 수 있어요.";

export const INGREDIENTS: Ingredient[] = [
  {
    id: "kabocha",
    name: "단호박",
    aliases: ["단호박", "호박", "밤호박", "미니단호박"],
    category: 1,
    summary: "익혀서 껍질·씨를 뺀 속살은 간식 재료로 쓸 수 있어요.",
    cautions: ["씨와 껍질은 빼고 속살만 사용해요.", "섬유질이 많아 한 번에 많이 주면 변이 묽어질 수 있어요."],
    cooking: "찌거나 구워서 완전히 익힌 뒤 으깨서 사용",
    avoidAdditives: ["설탕·시럽이 들어간 호박 통조림/파이 필링", "소금, 버터, 향신료"],
    allergyNote: "처음 먹는 아이는 소량으로 시작해 가려움·구토·설사가 없는지 살펴보세요.",
    allergenTags: ["단호박", "호박"],
    sources: ["AKC_FV"],
    verification: "partial",
    verificationNote: "출처는 '호박(pumpkin)' 기준이에요. 단호박 품종만 따로 다룬 자료는 아직 확인하지 못했어요.",
    role: "base",
    prep: "단호박은 씨와 껍질을 제거하고 찜기에 15~20분 쪄서 곱게 으깬다.",
    kcalPer100g: 60,
  },
  {
    id: "sweetpotato",
    name: "고구마",
    aliases: ["고구마", "호박고구마", "밤고구마", "꿀고구마"],
    category: 1,
    summary: "껍질을 벗겨 완전히 익힌 고구마는 간식 재료로 쓸 수 있어요.",
    cautions: [
      "생고구마와 껍질은 소화가 어렵고 목에 걸릴 수 있어 사용하지 않아요.",
      "당과 열량이 있어 당뇨·비만 관리 중인 아이는 수의사와 먼저 상의하세요.",
    ],
    cooking: "껍질을 벗기고 찌거나 삶아 부드럽게 으깨서 사용",
    avoidAdditives: ["설탕·꿀을 바른 맛탕/고구마말랭이 가공품", "버터, 소금, 기름에 튀긴 것"],
    allergyNote: "처음 먹는 아이는 소량으로 시작해 반응을 살펴보세요.",
    allergenTags: ["고구마"],
    sources: ["AKC_SWEETPOTATO", "PETMD_SWEETPOTATO"],
    verification: "verified",
    role: "base",
    prep: "고구마는 껍질을 벗기고 20~25분 쪄서 젓가락이 쑥 들어가면 곱게 으깬다.",
    kcalPer100g: 86,
  },
  {
    id: "banana",
    name: "바나나",
    aliases: ["바나나"],
    category: 2,
    summary: "먹을 수 있지만 당이 많아 소량만 간식으로 사용해요.",
    cautions: ["당분이 많아 주식이 아닌 간식으로 조금만 사용해요.", "껍질은 사용하지 않아요."],
    cooking: "껍질을 벗겨 포크로 으깨서 사용",
    avoidAdditives: ["바나나칩(기름·설탕 첨가)", "바나나맛 가공식품"],
    allergyNote: "처음 먹는 아이는 소량으로 시작해 반응을 살펴보세요.",
    allergenTags: ["바나나"],
    sources: ["AKC_FV"],
    verification: "verified",
    role: "base",
    prep: "바나나는 껍질을 벗겨 포크로 덩어리 없이 으깬다.",
    kcalPer100g: 89,
  },
  {
    id: "apple",
    name: "사과",
    aliases: ["사과"],
    category: 1,
    summary: "씨와 심을 완전히 뺀 과육은 간식 재료로 쓸 수 있어요.",
    cautions: ["씨와 심(가운데 딱딱한 부분)은 반드시 제거해요.", "목에 걸리지 않게 잘게 다져요."],
    cooking: "씨·심 제거 후 잘게 다지거나 갈아서 사용",
    avoidAdditives: ["설탕에 졸인 사과잼/사과파이 필링", "시나몬 슈가, 사과주스"],
    allergyNote: "처음 먹는 아이는 소량으로 시작해 반응을 살펴보세요.",
    allergenTags: ["사과"],
    sources: ["AKC_FV"],
    verification: "verified",
    role: "mixin",
    prep: "사과는 씨와 심을 완전히 제거하고 0.5cm 이하로 잘게 다진다.",
    kcalPer100g: 52,
  },
  {
    id: "egg",
    name: "계란",
    aliases: ["계란", "달걀"],
    category: 1,
    summary: "완전히 익힌 계란은 간식 재료로 쓸 수 있어요.",
    cautions: [
      "날계란·덜 익은 계란은 주지 않아요(세균 위험, 흰자는 비오틴 흡수 방해).",
      "반죽에 넣은 계란도 속까지 완전히 익혀야 해요.",
    ],
    cooking: "반죽에 섞어 속까지 완전히 익히기 (노른자·흰자 모두)",
    avoidAdditives: ["소금, 버터, 기름, 케첩 등 양념"],
    allergyNote: "계란은 알레르기를 일으킬 수 있는 단백질 식품이에요. 처음이라면 소량으로 확인하세요.",
    allergenTags: ["계란", "달걀", "난류", "알류"],
    sources: ["AKC_HF", "ASPCA"],
    verification: "verified",
    role: "egg",
    prep: "계란은 껍질 조각이 들어가지 않게 깨서 곱게 풀어 둔다.",
    kcalPer100g: 143,
  },
  {
    id: "riceflour",
    name: "쌀가루",
    aliases: ["쌀가루", "박력쌀가루", "멥쌀가루", "습식쌀가루", "건식쌀가루"],
    category: 1,
    summary: "다른 것이 섞이지 않은 100% 쌀가루를 완전히 익혀 사용해요.",
    cautions: [
      "익히지 않은 반죽은 주지 않아요.",
      "탄수화물 위주라 당뇨·체중 관리 중인 아이는 수의사와 먼저 상의하세요.",
    ],
    cooking: "반죽에 섞어 굽거나 쪄서 완전히 익히기",
    avoidAdditives: ["설탕·소금·베이킹파우더가 섞인 베이킹 믹스", "찹쌀도넛 믹스 등 가공 프리믹스"],
    allergyNote: "드물지만 곡물에 반응하는 아이가 있어요. 처음이라면 소량으로 확인하세요.",
    allergenTags: ["쌀", "쌀가루", "곡물"],
    sources: ["AKC_RICE"],
    verification: "partial",
    verificationNote: "출처는 '익힌 쌀' 기준이에요. 쌀가루 제품만 따로 다룬 자료는 아직 확인하지 못했어요.",
    role: "flour",
    prep: "쌀가루는 체에 한 번 쳐서 덩어리를 풀어 둔다.",
    kcalPer100g: 366,
  },
  {
    id: "chicken",
    name: "닭가슴살",
    aliases: ["닭가슴살", "닭안심", "닭고기"],
    category: 1,
    summary: "뼈·껍질 없이 양념하지 않고 완전히 익힌 닭가슴살을 사용해요.",
    cautions: [
      "생닭·덜 익은 닭은 주지 않아요(살모넬라 등 세균 위험).",
      "익힌 닭뼈는 날카롭게 부서져 위험하니 절대 넣지 않아요.",
    ],
    cooking: "끓는 물에 속까지 완전히 삶아(분홍빛이 없을 때까지) 잘게 찢거나 다져서 사용",
    avoidAdditives: ["양념·훈제·염지된 닭가슴살 제품", "마늘·양파가 들어간 육수/소스", "소금, 후추"],
    allergyNote: "닭고기는 강아지 식이 알레르기에서 자주 언급되는 단백질이에요. 닭 알레르기가 있으면 사용하지 마세요.",
    allergenTags: ["닭", "닭고기", "닭가슴살", "가금류", "치킨"],
    sources: ["AKC_CHICKEN", "ASPCA"],
    verification: "partial",
    verificationNote: "뼈 제거·생고기 위험은 출처 본문에서 확인했고, 그 밖의 조리 조건은 출처 요약 기준이에요.",
    role: "protein",
    prep: "닭가슴살은 끓는 물에 15분 이상 삶아 속까지 완전히 익힌 뒤 식혀서 잘게 다진다.",
    kcalPer100g: 120,
  },
  {
    id: "carrot",
    name: "당근",
    aliases: ["당근"],
    category: 1,
    summary: "간식 재료로 쓸 수 있어요. 잘게 다지거나 익혀서 사용해요.",
    cautions: ["큰 조각은 목에 걸릴 수 있어 잘게 다지거나 갈아요."],
    cooking: "잘게 다지거나 강판에 갈아서, 또는 쪄서 으깨 사용",
    avoidAdditives: ["소금·설탕에 절인 당근", "당근주스(가당)"],
    allergyNote: "처음 먹는 아이는 소량으로 시작해 반응을 살펴보세요.",
    allergenTags: ["당근"],
    sources: ["AKC_FV"],
    verification: "verified",
    role: "mixin",
    prep: "당근은 껍질을 벗겨 강판에 곱게 갈거나 아주 잘게 다진다.",
    kcalPer100g: 41,
  },
  {
    id: "broccoli",
    name: "브로콜리",
    aliases: ["브로콜리"],
    category: 2,
    summary: "익혀서 아주 조금만 사용해요.",
    cautions: [
      "꽃송이의 이소티오시아네이트 성분이 일부 아이에게 위장 자극을 줄 수 있어 소량만 사용해요.",
      "질긴 줄기는 식도에 걸릴 수 있어 사용하지 않아요.",
    ],
    cooking: "꽃송이만 데치거나 쪄서 완전히 익힌 뒤 잘게 다져 사용",
    avoidAdditives: ["소금, 기름, 마요네즈·드레싱"],
    allergyNote: "처음 먹는 아이는 소량으로 시작해 구토·설사가 없는지 살펴보세요.",
    allergenTags: ["브로콜리"],
    sources: ["AKC_FV"],
    verification: "verified",
    role: "mixin",
    prep: "브로콜리는 꽃송이만 떼어 2~3분 데친 뒤 물기를 빼고 아주 잘게 다진다.",
    kcalPer100g: 34,
  },
  {
    id: "yogurt",
    name: "무가당 플레인 요거트",
    aliases: [
      "무가당 플레인 요거트",
      "플레인 요거트",
      "무가당 요거트",
      "요거트",
      "요구르트",
      "그릭요거트",
      "무가당 그릭요거트",
    ],
    category: 2,
    summary: "유제품을 소화할 수 있는 아이에게만, 무가당 플레인만 소량 사용해요.",
    cautions: [
      "강아지는 유당 분해 효소가 적어 설사·배탈이 날 수 있어요.",
      "성분표에서 설탕·감미료(특히 자일리톨)·코코아가 없는지 꼭 확인해요.",
    ],
    cooking: "반죽에 소량 섞거나, 완성된 간식 위에 얇게 올려 사용",
    avoidAdditives: ["자일리톨 등 인공감미료", "설탕, 과일 시럽, 초코·코코아", "향료가 들어간 요거트"],
    allergyNote: "유제품에 민감하거나 알레르기가 있으면 사용하지 마세요.",
    allergenTags: ["유제품", "우유", "요거트", "요구르트", "유당"],
    sources: ["AKC_HF", "ASPCA"],
    verification: "verified",
    role: "dairy",
    prep: "요거트는 성분표에 '무가당·무감미료'인지 다시 확인하고 계량해 둔다.",
    kcalPer100g: 61,
  },
  {
    id: "tofu",
    name: "두부",
    aliases: ["두부", "순두부", "연두부", "부침두부", "찌개두부"],
    category: 2,
    summary: "독성은 없지만 가끔 소량만 사용해요.",
    cautions: [
      "많이 먹으면 가스가 차거나 배가 불편할 수 있어요.",
      "신장 결석 병력이 있는 아이는 수의사와 먼저 상의하세요.",
    ],
    cooking: "끓는 물에 한 번 데쳐 물기를 꼭 짠 뒤 으깨서 사용",
    avoidAdditives: ["간장·양념 두부, 유부, 튀긴 두부", "소금, 기름"],
    allergyNote: "콩(대두)에 알레르기가 있으면 사용하지 마세요.",
    allergenTags: ["두부", "콩", "대두"],
    sources: ["AKC_TOFU"],
    verification: "partial",
    verificationNote: "출처의 요약(독성 없음·소량 권장) 기준이에요. 조리 조건은 일반적인 무염 조리 원칙을 따랐어요.",
    role: "base",
    prep: "두부는 끓는 물에 1분 데친 뒤 면포로 물기를 꼭 짜서 곱게 으깬다.",
    kcalPer100g: 84,
  },
  {
    id: "blueberry",
    name: "블루베리",
    aliases: ["블루베리", "냉동블루베리", "냉동 블루베리"],
    category: 1,
    summary: "생과 또는 무가당 냉동 블루베리는 간식 재료로 쓸 수 있어요.",
    cautions: ["작은 아이는 통째로 삼키다 걸릴 수 있어 반으로 자르거나 으깨요."],
    cooking: "깨끗이 씻어 반으로 자르거나 으깨서 사용",
    avoidAdditives: ["블루베리잼, 설탕 절임, 블루베리 시럽", "건블루베리(가당)"],
    allergyNote: "처음 먹는 아이는 소량으로 시작해 반응을 살펴보세요.",
    allergenTags: ["블루베리", "베리"],
    sources: ["AKC_FV"],
    verification: "verified",
    role: "mixin",
    prep: "블루베리는 깨끗이 씻어 물기를 닦고 반으로 자른다.",
    kcalPer100g: 57,
  },
];

/** 사용 금지(3등급) 재료 */
export type Banned = {
  id: string;
  name: string;
  /** 입력 글자 안에 이 단어가 '포함'되어 있으면 차단 */
  contains: string[];
  /** 입력 글자가 이 단어와 '정확히 같을 때'만 차단 (예: '파' → 파프리카 오탐 방지) */
  exact?: string[];
  reason: string;
  sources: SourceKey[];
};

export const BANNED: Banned[] = [
  {
    id: "grape",
    name: "포도·건포도",
    contains: ["포도", "건포도", "샤인머스캣", "머스캣", "거봉", "레이즌"],
    reason: "포도와 건포도는 품종·나이·성별과 관계없이 강아지에게 급성 신장 손상을 일으킬 수 있어요.",
    sources: ["AKC_FV", "ASPCA"],
  },
  {
    id: "xylitol",
    name: "자일리톨",
    contains: ["자일리톨", "xylitol", "무설탕껌", "무설탕 껌"],
    reason: "자일리톨은 급격한 저혈당과 간 손상을 일으킬 수 있어요. 소량도 위험해요.",
    sources: ["AKC_HF", "ASPCA"],
  },
  {
    id: "chocolate",
    name: "초콜릿·코코아·카페인",
    contains: ["초콜릿", "초콜렛", "초코", "코코아", "카카오", "커피", "카페인", "녹차", "홍차", "말차"],
    reason: "초콜릿·커피·차의 메틸잔틴(테오브로민·카페인)은 구토, 부정맥, 발작을 일으킬 수 있어요.",
    sources: ["AKC_HF", "ASPCA"],
  },
  {
    id: "allium",
    name: "양파·마늘·파·부추",
    contains: ["양파", "마늘", "대파", "쪽파", "실파", "부추", "샬롯", "리크", "차이브", "달래"],
    exact: ["파"],
    reason:
      "양파·마늘·파·부추류는 적혈구를 파괴해 빈혈을 일으킬 수 있어요. 익히거나 가루로 만들어도 위험하고, 아키타·시바견은 더 민감하다고 알려져 있어요.",
    sources: ["AKC_FV", "AKC_HF", "ASPCA"],
  },
  {
    id: "macadamia",
    name: "마카다미아",
    contains: ["마카다미아", "마카다미아넛"],
    reason: "마카다미아는 구토, 무기력, 보행 이상, 떨림, 고열을 일으킬 수 있어요.",
    sources: ["AKC_HF", "ASPCA"],
  },
  {
    id: "alcohol",
    name: "술·알코올",
    // '술'·'럼'은 '기술', '처럼' 같은 말에 섞여 오탐이 나므로 정확 일치로만 검사합니다
    contains: ["알코올", "맥주", "소주", "와인", "막걸리", "럼주", "리큐르", "위스키"],
    exact: ["술", "럼"],
    reason: "알코올은 구토, 호흡 곤란, 혼수 등을 일으킬 수 있어요.",
    sources: ["ASPCA"],
  },
  {
    id: "yeastdough",
    name: "생 이스트 반죽",
    contains: ["이스트", "효모", "생반죽", "발효반죽"],
    reason: "익히지 않은 이스트 반죽은 위에서 부풀어 오르고 알코올을 만들어 위험해요.",
    sources: ["AKC_HF", "ASPCA"],
  },
  {
    id: "avocado",
    name: "아보카도",
    contains: ["아보카도"],
    reason: "아보카도의 퍼신 성분과 높은 지방은 구토·설사, 췌장염 위험이 있어 주지 않아요.",
    sources: ["AKC_FV"],
  },
  {
    id: "bone",
    name: "뼈",
    contains: ["닭뼈", "뼈다귀", "족발뼈", "갈비뼈"],
    exact: ["뼈"],
    reason: "뼈는 부서지며 목에 걸리거나 소화기관을 찌르고 막을 수 있어요.",
    sources: ["AKC_HF", "ASPCA"],
  },
];

/**
 * 가공 상태·첨가물 의심 단어
 * 재료 이름에 이 단어가 있으면 '분석 보류(4등급)'로 돌리고 레시피에서 제외합니다.
 * (예: '양념 닭가슴살', '가당 요거트', '바나나맛 우유')
 */
export const PROCESSED_WORDS: { word: string; why: string }[] = [
  { word: "무설탕", why: "'무설탕' 제품에는 자일리톨 등 대체 감미료가 들어 있을 수 있어요. 성분표 확인이 필요해요." },
  { word: "제로", why: "'제로' 제품에는 자일리톨 등 대체 감미료가 들어 있을 수 있어요." },
  { word: "가당", why: "설탕이 첨가된 제품이에요." },
  { word: "설탕", why: "설탕이 첨가된 재료예요." },
  { word: "시럽", why: "시럽(당류)이 첨가된 재료예요." },
  { word: "꿀", why: "당류가 많아 멍스푼 레시피에서는 사용하지 않아요." },
  { word: "잼", why: "설탕이 많이 들어간 가공식품이에요." },
  { word: "양념", why: "양념에는 소금·마늘·양파가 들어 있을 수 있어요." },
  { word: "소스", why: "소스에는 소금·마늘·양파가 들어 있을 수 있어요." },
  { word: "간장", why: "염분이 많아요." },
  { word: "소금", why: "염분은 강아지 간식에 넣지 않아요." },
  { word: "훈제", why: "훈제·염지 제품은 염분과 첨가물이 많아요." },
  { word: "통조림", why: "통조림은 소금·설탕·보존료가 들어 있을 수 있어요." },
  { word: "튀김", why: "기름에 튀긴 음식은 사용하지 않아요." },
  { word: "튀긴", why: "기름에 튀긴 음식은 사용하지 않아요." },
  { word: "버터", why: "지방이 많아 멍스푼 레시피에서는 사용하지 않아요." },
  { word: "믹스", why: "프리믹스에는 설탕·소금·팽창제가 섞여 있어요." },
  { word: "맛", why: "'○○맛' 가공식품은 향료·당류가 들어 있어요." },
  { word: "칩", why: "칩 형태 가공식품은 기름·소금·설탕이 들어 있을 수 있어요." },
  { word: "주스", why: "주스는 당류가 농축되어 있고 다른 과일이 섞였을 수 있어요." },
];

/** 재료 이름 비교용 정리: 공백 제거 + 소문자 */
export function normalize(text: string): string {
  return text.replace(/\s+/g, "").toLowerCase();
}

/** 이름(또는 별칭)이 '정확히' 일치하는 사용 가능 재료 찾기 */
export function findIngredient(text: string): Ingredient | undefined {
  const n = normalize(text);
  return INGREDIENTS.find((i) => [i.name, ...i.aliases].some((a) => normalize(a) === n));
}

/** 금지 재료 찾기 (포함 검사 + 정확 일치 검사) */
export function findBanned(text: string): Banned | undefined {
  const n = normalize(text);
  return BANNED.find(
    (b) => b.contains.some((w) => n.includes(normalize(w))) || (b.exact ?? []).some((w) => n === normalize(w)),
  );
}

/** 가공·첨가물 의심 단어 찾기 ('무가당'은 안전한 표현이므로 먼저 지우고 검사) */
export function findProcessedWord(text: string) {
  const n = normalize(text).replace(/무가당/g, "");
  return PROCESSED_WORDS.find((p) => n.includes(normalize(p.word)));
}

/** 화면의 '초기 재료 목록'에 보여 줄 이름들 */
export const STARTER_NAMES = INGREDIENTS.map((i) => i.name);
