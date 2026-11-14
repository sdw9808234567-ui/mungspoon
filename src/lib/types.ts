// ─────────────────────────────────────────────────────────────
// 화면(브라우저)과 서버가 함께 쓰는 '자료 모양(타입)' 정의
// ─────────────────────────────────────────────────────────────
import type { Category, Source } from "./safety/db";

/** 강아지 프로필 */
export type DogProfile = {
  name: string;
  weightKg: string; // 입력칸 그대로 보관 (빈 값 허용)
  age: string;
  allergies: string[]; // 알레르기
  forbidden: string[]; // 먹으면 안 되는 재료
  healthNotes: string; // 건강 관련 주의사항
};

export const EMPTY_PROFILE: DogProfile = {
  name: "",
  weightKg: "",
  age: "",
  allergies: [],
  forbidden: [],
  healthNotes: "",
};

/** 재료 한 건의 분석 결과 */
export type AnalysisItem = {
  input: string; // 사용자가 입력/선택한 글자
  name: string; // 판정에 사용한 재료 이름
  category: Category;
  categoryLabel: string;
  summary: string;
  cautions: string[];
  cooking: string;
  avoidAdditives: string[];
  allergyNote: string;
  sources: Source[];
  verification: "verified" | "partial" | "none";
  verificationNote?: string;
  /** 프로필(알레르기·금지 재료)과 겹쳐서 막힌 경우 그 이유 */
  profileConflict?: string;
  /** 레시피에 사용할 수 있는 재료인지 */
  usable: boolean;
};

/** 분석 전체 결과 */
export type AnalysisResult = {
  ok: boolean;
  error?: string;
  items: AnalysisItem[];
  /** 레시피 생성 가능 여부 */
  canGenerate: boolean;
  /** 생성 불가 이유 (위험 재료 포함 등) */
  blockReason?: string;
  /** 레시피에 실제로 쓸 수 있는 재료 이름 */
  usableNames: string[];
  /** 분석 보류로 제외된 재료 이름 */
  heldNames: string[];
};

/** 간식 종류 */
export type TreatType = "bread" | "cookie" | "muffin" | "cake" | "pudding" | "donut" | "bite" | "soft";

export const TREAT_TYPES: { id: TreatType; label: string; hint: string }[] = [
  { id: "cookie", label: "쿠키", hint: "오븐·에어프라이어" },
  { id: "bread", label: "강아지 빵", hint: "찜기" },
  { id: "muffin", label: "머핀", hint: "오븐" },
  { id: "cake", label: "케이크", hint: "오븐" },
  { id: "pudding", label: "푸딩", hint: "찜기" },
  { id: "donut", label: "도넛", hint: "오븐(튀기지 않아요)" },
  { id: "bite", label: "한입 간식", hint: "오븐" },
  { id: "soft", label: "말랑한 간식", hint: "찜기" },
];

/** 레시피 재료 한 줄 */
export type RecipeIngredient = {
  name: string;
  grams: number;
  owned: boolean; // false면 '추가로 필요한 재료'
};

/** 완성된 레시피 */
export type Recipe = {
  id: string;
  createdAt: string;
  name: string;
  type: TreatType;
  typeLabel: string;
  ingredients: RecipeIngredient[];
  steps: string[];
  method: string; // 조리 기구 (오븐/찜기 등)
  tempC: number | null; // 조리 온도 (찜은 null)
  tempNote: string;
  timeMin: string; // 조리 시간 (예: "15~20")
  doneness: string; // 익힘 확인 방법
  storage: string; // 보관 방법
  shelfLife: string; // 보관 기간
  feedingCautions: string[]; // 급여 시 주의사항
  calories: {
    totalKcal: number;
    totalGrams: number;
    rows: { name: string; grams: number; kcalPer100g: number; kcal: number }[];
    note: string;
  };
  notices: string[]; // 제외된 재료, 기기별 차이 등 안내
  /** 레시피를 만든 방식: demo(규칙 기반) / ai / demo-fallback(AI 실패로 규칙 기반 대체) */
  source: "demo" | "ai" | "demo-fallback";
};

/** 직접 만든 간식 기록 */
export type MakeLog = {
  id: string;
  recipeId: string;
  recipeName: string;
  date: string;
  memo: string;
  photo?: string; // 줄여서 저장한 사진(data URL)
};
